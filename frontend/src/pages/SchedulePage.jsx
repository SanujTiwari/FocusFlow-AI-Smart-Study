import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Calendar, Sparkles, Clock, BookOpen, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    loadWeek();
  }, [currentDate]);

  const loadWeek = async () => {
    setLoading(true);
    try {
      const res = await scheduleAPI.getWeekly(weekStart.toISOString().split('T')[0]);
      setWeekSchedule(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.toISOString().split('T')[0]);
  };

  const handleComplete = async (id) => {
    try {
      await scheduleAPI.markComplete(id);
      toast.success('Done! ✅');
      loadWeek();
    } catch {
      toast.error('Failed to complete task');
    }
  };

  const handleSkip = async (id) => {
    try {
      await scheduleAPI.markSkipped(id);
      toast('Task skipped', { icon: '⏭️' });
      loadWeek();
    } catch {
      toast.error('Failed to skip task');
    }
  };

  const getTasksForDay = (dateStr) => weekSchedule.filter((s) => s.date === dateStr);
  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDayTasks = getTasksForDay(selectedDay);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">Weekly Planner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review your AI-generated timetable and complete focus sessions</p>
        </div>
        <button onClick={goToToday} className="btn-secondary text-xs font-bold self-start sm:self-auto">
          Go to Today
        </button>
      </div>

      {/* Week Navigator */}
      <div className="glass-card p-6 shadow-glow-primary border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevWeek}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-950 dark:text-white font-display flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
              Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={nextWeek}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2.5">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayTasks = getTasksForDay(dateStr);
            const completed = dayTasks.filter((t) => t.status === 'COMPLETED' && t.taskType !== 'BREAK').length;
            const total = dayTasks.filter((t) => t.taskType !== 'BREAK').length;
            const completionPercent = total > 0 ? (completed / total) * 100 : 0;
            const isSelected = dateStr === selectedDay;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className={`p-3.5 rounded-2xl text-center transition-all relative flex flex-col items-center justify-between min-h-[105px] border ${
                  isSelected
                    ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-xl shadow-primary-500/25 border-transparent scale-105'
                    : isToday
                    ? 'bg-primary-50/70 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800/60 hover:bg-primary-100/40'
                    : 'bg-white/45 dark:bg-slate-900/40 border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-900/60 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/85' : 'text-gray-400'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-xl font-extrabold mt-1.5 font-display">{day.getDate()}</p>
                </div>

                {/* completion meter */}
                {total > 0 ? (
                  <div className="w-full mt-2">
                    <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-white' : 'bg-primary-500'}`}
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-bold block mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {completed}/{total}
                    </span>
                  </div>
                ) : (
                  <div className="h-1 mt-2">
                    <span className={`text-[9px] italic block ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                      Free
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Listing for Selected Day */}
      <div className="glass-card p-6 shadow-lg border-white/20 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedDayTasks.length > 0 && (
            <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
              {selectedDayTasks.length} Session{selectedDayTasks.length > 1 ? 's' : ''} Scheduled
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : selectedDayTasks.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-bold mb-1">No study sessions scheduled for this day</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Go to Dashboard or change dates to generate AI schedule.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {selectedDayTasks.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-850 dark:text-emerald-400'
                      : item.status === 'MISSED'
                      ? 'bg-red-500/5 border-red-500/20 opacity-60 text-red-850 dark:text-red-400'
                      : 'bg-white/50 dark:bg-slate-900/40 border-gray-150 dark:border-white/5 hover:border-primary-500/30 hover:scale-[1.01]'
                  }`}
                >
                  {/* Left Color strip bar */}
                  <div className="w-1.5 h-12 rounded-full hidden sm:block flex-shrink-0" style={{ backgroundColor: item.subjectColor }} />

                  {/* Time slots */}
                  <div className="flex items-center gap-2 flex-shrink-0 min-w-[100px] border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-white/5 pb-2 sm:pb-0 sm:pr-4">
                    <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white font-mono">{item.startTime?.slice(0, 5)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{item.endTime?.slice(0, 5)}</p>
                    </div>
                  </div>

                  {/* Subject Name and Topic Detail */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-gray-900 dark:text-white truncate text-base">{item.subjectName}</span>
                      {item.isRevision && (
                        <span className="badge bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                          Revision
                        </span>
                      )}
                      {item.taskType === 'BREAK' && (
                        <span className="badge bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                          Break
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{item.taskDescription}</p>
                  </div>

                  {/* Actions / Status badges */}
                  <div className="flex-shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
                    {item.status === 'COMPLETED' ? (
                      <span className="badge-completed">Done</span>
                    ) : item.status === 'MISSED' ? (
                      <span className="badge-missed">Missed</span>
                    ) : item.taskType === 'BREAK' ? (
                      <span className="text-xs uppercase font-extrabold tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/15">
                        Relax
                      </span>
                    ) : (
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 hover:scale-105 transition-all text-xs font-bold"
                          title="Mark Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Done
                        </button>
                        <button
                          onClick={() => handleSkip(item.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-650 hover:text-white border border-red-500/20 hover:scale-105 transition-all text-xs font-bold"
                          title="Skip Task"
                        >
                          <XCircle className="w-4 h-4" /> Skip
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
