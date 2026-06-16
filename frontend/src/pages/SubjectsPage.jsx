import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, BookOpen, X, CheckSquare, Square, ChevronDown, ChevronUp, Sparkles, PlusCircle } from 'lucide-react';
import { subjectAPI } from '../services/api';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = { EASY: 'emerald', MEDIUM: 'amber', HARD: 'red' };
const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    subjectName: '',
    difficulty: 'MEDIUM',
    examDate: '',
    colorCode: '#6366f1',
    syllabus: []
  });
  const [newChapterName, setNewChapterName] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectAPI.getAll();
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      subjectName: '',
      difficulty: 'MEDIUM',
      examDate: '',
      colorCode: PRESET_COLORS[0],
      syllabus: []
    });
    setShowModal(true);
  };

  const openEdit = (sub) => {
    setEditing(sub.id);
    setForm({
      subjectName: sub.subjectName,
      difficulty: sub.difficulty,
      examDate: sub.examDate ? sub.examDate.split('T')[0] : '',
      colorCode: sub.colorCode || PRESET_COLORS[0],
      syllabus: sub.syllabus || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await subjectAPI.update(editing, form);
        toast.success('Subject updated! 📝');
      } else {
        await subjectAPI.create(form);
        toast.success('Subject added! 📚');
      }
      setShowModal(false);
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectAPI.delete(id);
      toast.success('Subject deleted');
      if (expandedId === id) setExpandedId(null);
      loadSubjects();
    } catch {
      toast.error('Failed to delete subject');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setNewChapterName('');
  };

  // Syllabus operations
  const handleAddChapter = async (subject) => {
    if (!newChapterName.trim()) return;
    const updatedSyllabus = [
      ...(subject.syllabus || []),
      { id: Date.now().toString(), name: newChapterName.trim(), completed: false }
    ];
    try {
      await subjectAPI.update(subject.id, { ...subject, syllabus: updatedSyllabus });
      setNewChapterName('');
      loadSubjects();
      toast.success('Chapter added! 📚');
    } catch {
      toast.error('Failed to add chapter');
    }
  };

  const handleToggleChapter = async (subject, chapterId) => {
    const updatedSyllabus = (subject.syllabus || []).map((ch) =>
      ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
    );
    try {
      await subjectAPI.update(subject.id, { ...subject, syllabus: updatedSyllabus });
      loadSubjects();
    } catch {
      toast.error('Failed to update chapter');
    }
  };

  const handleDeleteChapter = async (subject, chapterId) => {
    const updatedSyllabus = (subject.syllabus || []).filter((ch) => ch.id !== chapterId);
    try {
      await subjectAPI.update(subject.id, { ...subject, syllabus: updatedSyllabus });
      loadSubjects();
      toast.success('Chapter removed');
    } catch {
      toast.error('Failed to remove chapter');
    }
  };

  const calculateProgress = (syllabus = []) => {
    if (syllabus.length === 0) return 0;
    const completed = syllabus.filter(ch => ch.completed).length;
    return Math.round((completed / syllabus.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">My Subjects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage exam schedule and track topic coverage</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="glass-card p-12 text-center border border-dashed border-gray-300 dark:border-white/10 rounded-2xl">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No subjects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Add your subjects to start tracking chapters and building personalized AI study timetables.
          </p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {subjects.map((sub, i) => {
            const isExpanded = expandedId === sub.id;
            const prepPercent = calculateProgress(sub.syllabus);
            const shadowGlowClass = sub.difficulty === 'HARD' ? 'shadow-glow-purple' : sub.difficulty === 'MEDIUM' ? 'shadow-glow-amber' : 'shadow-glow-emerald';

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-6 cursor-pointer border ${isExpanded ? 'border-primary-500 dark:border-primary-500/50' : 'border-white/20 dark:border-white/5'} ${shadowGlowClass} group relative overflow-hidden`}
                onClick={() => toggleExpand(sub.id)}
              >
                {/* Visual Top Glow matching subject color */}
                <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: sub.colorCode }} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Subject Title and Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.colorCode }} />
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display truncate">{sub.subjectName}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`badge bg-${DIFFICULTY_COLORS[sub.difficulty]}-100/70 dark:bg-${DIFFICULTY_COLORS[sub.difficulty]}-900/20 text-${DIFFICULTY_COLORS[sub.difficulty]}-600 dark:text-${DIFFICULTY_COLORS[sub.difficulty]}-400 font-bold uppercase`}>
                          {sub.difficulty}
                        </span>
                        <span>•</span>
                        <span className="font-semibold">
                          Exam: {new Date(sub.examDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className={`font-bold ${sub.daysUntilExam <= 3 ? 'text-red-500' : sub.daysUntilExam <= 7 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {sub.daysUntilExam === 0 ? 'Today!' : `${sub.daysUntilExam}d left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Syllabus Prep Rate */}
                  <div className="flex items-center gap-6 self-start md:self-auto">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Prep Level</p>
                      <p className="text-xl font-extrabold text-gray-900 dark:text-white font-mono mt-0.5">{prepPercent}%</p>
                    </div>
                    {/* Progress Circle Visual */}
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-gray-200 dark:text-white/10" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="transition-all duration-700" strokeWidth="3.5" strokeDasharray={`${prepPercent}, 100`} strokeLinecap="round" stroke={sub.colorCode} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(sub);
                        }}
                        className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:scale-105 transition-all"
                        title="Edit Subject"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(sub.id, e)}
                        className="p-2.5 rounded-xl bg-red-100/70 hover:bg-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 hover:scale-105 transition-all"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-gray-400 p-1.5 rounded-lg">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Syllabus List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t border-gray-150 dark:border-white/5 cursor-default"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="max-w-2xl">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary-500" /> Syllabus Tracker
                        </h4>

                        {/* Chapter List */}
                        {(!sub.syllabus || sub.syllabus.length === 0) ? (
                          <p className="text-sm text-gray-500 italic py-2">No chapters listed yet. Add one below!</p>
                        ) : (
                          <div className="space-y-2.5 mb-5 max-h-60 overflow-y-auto pr-2">
                            {sub.syllabus.map((chapter) => (
                              <div
                                key={chapter.id}
                                className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-950/25 border border-gray-200/50 dark:border-white/5 rounded-xl hover:border-gray-300 dark:hover:border-white/10 transition-colors"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleChapter(sub, chapter.id)}
                                  className="flex items-center gap-3 text-left min-w-0"
                                >
                                  {chapter.completed ? (
                                    <CheckSquare className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                                  ) : (
                                    <Square className="w-5 h-5 flex-shrink-0 text-gray-400 hover:text-primary-500 transition-colors" />
                                  )}
                                  <span className={`text-sm font-medium truncate ${chapter.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-750 dark:text-gray-300'}`}>
                                    {chapter.name}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChapter(sub, chapter.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Chapter Form */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Chapter 1: Introduction"
                            value={newChapterName}
                            onChange={(e) => setNewChapterName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddChapter(sub);
                              }
                            }}
                            className="input-field py-2 text-sm max-w-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddChapter(sub)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/15 text-white dark:text-gray-200 rounded-xl font-bold flex items-center gap-2 text-sm transition-all"
                          >
                            <PlusCircle className="w-4 h-4" /> Add
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal dialog for Add / Edit */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-surface-900 border border-white/20 dark:border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">
                  {editing ? 'Edit Subject' : 'Add Subject'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400 mb-2">Subject Name</label>
                  <input
                    value={form.subjectName}
                    onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Organic Chemistry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400 mb-2">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, difficulty: d })}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                          form.difficulty === d
                            ? d === 'EASY'
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : d === 'MEDIUM'
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                              : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400 mb-2">Color Palette Indicator</label>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, colorCode: color })}
                        className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center border ${
                          form.colorCode === color ? 'scale-125 border-gray-400 dark:border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {form.colorCode === color && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400 mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={form.examDate}
                    onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="w-full btn-primary font-bold mt-3">
                  {editing ? 'Update Subject' : 'Add Subject'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
