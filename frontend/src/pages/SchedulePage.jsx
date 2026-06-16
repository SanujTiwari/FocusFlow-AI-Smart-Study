import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { scheduleAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => { loadWeek(); }, [currentDate]);

  const loadWeek = async () => {
    setLoading(true);
    try {
      const res = await scheduleAPI.getWeekly(weekStart.toISOString().split('T')[0]);
      setWeekSchedule(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDay(new Date().toISOString().split('T')[0]); };

  const handleComplete = async (id) => { try { await scheduleAPI.markComplete(id); toast.success('Done! ✅'); loadWeek(); } catch { toast.error('Failed'); } };
  const handleSkip = async (id) => { try { await scheduleAPI.markSkipped(id); toast('Skipped', { icon: '⏭️' }); loadWeek(); } catch { toast.error('Failed'); } };

  const getTasksForDay = (dateStr) => weekSchedule.filter(s => s.date === dateStr);
  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDayTasks = getTasksForDay(selectedDay);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h1>
        <button onClick={goToToday} className="btn-secondary text-sm">Today</button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"><ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"><ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayTasks = getTasksForDay(dateStr);
            const completed = dayTasks.filter(t => t.status === 'COMPLETED' && t.taskType !== 'BREAK').length;
            const total = dayTasks.filter(t => t.taskType !== 'BREAK').length;
            const isSelected = dateStr === selectedDay;
            const isToday = dateStr === todayStr;
            return (
              <button key={dateStr} onClick={() => setSelectedDay(dateStr)}
                className={`p-3 rounded-xl text-center transition-all ${isSelected ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : isToday ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}>
                <p className="text-xs font-medium opacity-70">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p className="text-lg font-bold mt-1">{day.getDate()}</p>
                {total > 0 && <div className="mt-1 flex justify-center gap-0.5">{Array.from({ length: Math.min(total, 5) }).map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full ${i < completed ? (isSelected ? 'bg-white' : 'bg-emerald-500') : (isSelected ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600')}`} />))}</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : selectedDayTasks.length === 0 ? (
          <div className="text-center py-12"><Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" /><p className="text-gray-500">No tasks for this day</p></div>
        ) : (
          <div className="space-y-3">
            {selectedDayTasks.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${item.status === 'COMPLETED' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30' : item.status === 'MISSED' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 opacity-60' : 'bg-white/30 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: item.subjectColor }} />
                <div className="text-center flex-shrink-0 w-20">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.startTime?.slice(0, 5)}</p>
                  <p className="text-xs text-gray-400">{item.endTime?.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{item.subjectName}{item.isRevision && <span className="ml-2 badge bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs">Revision</span>}</p>
                  <p className="text-sm text-gray-500 truncate">{item.taskDescription}</p>
                </div>
                <div className="flex-shrink-0">
                  {item.status === 'COMPLETED' ? <span className="badge-completed">Done</span> : item.status === 'MISSED' ? <span className="badge-missed">Missed</span> : item.taskType === 'BREAK' ? <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-600">Break</span> : (
                    <div className="flex gap-2">
                      <button onClick={() => handleComplete(item.id)} className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                      <button onClick={() => handleSkip(item.id)} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"><XCircle className="w-4 h-4" /></button>
                    </div>)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
