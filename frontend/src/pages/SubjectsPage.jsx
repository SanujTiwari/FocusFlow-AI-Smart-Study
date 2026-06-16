import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, BookOpen, X } from 'lucide-react';
import { subjectAPI } from '../services/api';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = { EASY: 'emerald', MEDIUM: 'amber', HARD: 'red' };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ subjectName: '', difficulty: 'MEDIUM', examDate: '', colorCode: '' });

  useEffect(() => { loadSubjects(); }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try { const res = await subjectAPI.getAll(); setSubjects(res.data); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ subjectName: '', difficulty: 'MEDIUM', examDate: '', colorCode: '' }); setShowModal(true); };
  const openEdit = (sub) => { setEditing(sub.id); setForm({ subjectName: sub.subjectName, difficulty: sub.difficulty, examDate: sub.examDate, colorCode: sub.colorCode || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await subjectAPI.update(editing, form); toast.success('Subject updated!'); }
      else { await subjectAPI.create(form); toast.success('Subject added! 📚'); }
      setShowModal(false); loadSubjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await subjectAPI.delete(id); toast.success('Subject deleted'); loadSubjects(); } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subjects</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Subject</button>
      </div>

      {subjects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No subjects yet</h3>
          <p className="text-gray-500 mb-6">Add your first subject to start generating study schedules</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus className="w-5 h-5" /> Add Subject</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub, i) => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-6 hover:shadow-glow transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: sub.colorCode }} />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{sub.subjectName}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(sub)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><Edit3 className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={() => handleDelete(sub.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Difficulty</span>
                  <span className={`badge bg-${DIFFICULTY_COLORS[sub.difficulty]}-100 dark:bg-${DIFFICULTY_COLORS[sub.difficulty]}-900/30 text-${DIFFICULTY_COLORS[sub.difficulty]}-600 dark:text-${DIFFICULTY_COLORS[sub.difficulty]}-400`}>{sub.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Exam Date</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{new Date(sub.examDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Days Left</span>
                  <span className={`text-sm font-bold ${sub.daysUntilExam <= 3 ? 'text-red-500' : sub.daysUntilExam <= 7 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {sub.daysUntilExam === 0 ? 'Today!' : `${sub.daysUntilExam} days`}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editing ? 'Edit Subject' : 'Add Subject'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Name</label>
                  <input value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} className="input-field" placeholder="e.g. Mathematics" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                      <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${form.difficulty === d ? (d === 'EASY' ? 'bg-emerald-500 text-white' : d === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exam Date</label>
                  <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} className="input-field" required />
                </div>
                <button type="submit" className="w-full btn-primary">{editing ? 'Update Subject' : 'Add Subject'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
