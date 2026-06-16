import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle2, XCircle, Clock, Flame,
  BookOpen, Sparkles, RefreshCw, ArrowRight, AlertTriangle
} from 'lucide-react';
import { scheduleAPI, subjectAPI, analyticsAPI } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import PomodoroTimer from '../components/PomodoroTimer';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [missedCount, setMissedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [scheduleRes, subjectsRes, analyticsRes, missedRes] = await Promise.allSettled([
        scheduleAPI.getByDate(today),
        subjectAPI.getAll(),
        analyticsAPI.getOverview(),
        scheduleAPI.getMissedCount(),
      ]);

      if (scheduleRes.status === 'fulfilled') setTodaySchedule(scheduleRes.value.data);
      if (subjectsRes.status === 'fulfilled') setSubjects(subjectsRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (missedRes.status === 'fulfilled') setMissedCount(missedRes.value.data.missedCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (subjects.length === 0) {
      toast.error('Add subjects first before generating a schedule!');
      navigate('/subjects');
      return;
    }
    setGenerating(true);
    try {
      await scheduleAPI.generate({ startDate: today, numberOfDays: 7 });
      toast.success('Schedule generated! 🎉');
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const handleReschedule = async () => {
    setRescheduling(true);
    try {
      await scheduleAPI.reschedule();
      toast.success('Missed tasks rescheduled! 🔄');
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setRescheduling(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await scheduleAPI.markComplete(id);
      toast.success('Task completed! ✅');
      loadDashboard();
    } catch (err) {
      toast.error('Failed to mark complete');
    }
  };

  const handleSkip = async (id) => {
    try {
      await scheduleAPI.markSkipped(id);
      toast('Task skipped', { icon: '⏭️' });
      loadDashboard();
    } catch (err) {
      toast.error('Failed to skip task');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const completedToday = todaySchedule.filter(s => s.status === 'COMPLETED' && s.taskType !== 'BREAK').length;
  const totalToday = todaySchedule.filter(s => s.taskType !== 'BREAK').length;
  const progressPercent = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {generating ? 'Generating...' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      {/* Missed Tasks Alert */}
      {missedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              You have {missedCount} missed task{missedCount > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={handleReschedule}
            disabled={rescheduling}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${rescheduling ? 'animate-spin' : ''}`} />
            Reschedule
          </button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalToday}</span>
          <span className="text-sm text-gray-500">Today's Tasks</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday}</span>
          <span className="text-sm text-gray-500">Completed</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.currentStreak || 0}</span>
          <span className="text-sm text-gray-500">Day Streak 🔥</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{subjects.length}</span>
          <span className="text-sm text-gray-500">Subjects</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Today's Schedule
            </h2>
            {totalToday > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-500">{Math.round(progressPercent)}%</span>
              </div>
            )}
          </div>

          {todaySchedule.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No schedule for today</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Generate an AI-powered study plan to get started!</p>
              <button onClick={handleGenerate} className="btn-primary inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Schedule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30'
                      : item.status === 'MISSED'
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 opacity-60'
                      : 'bg-white/50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-800/30'
                  }`}
                >
                  {/* Color Bar */}
                  <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: item.subjectColor }} />

                  {/* Time */}
                  <div className="text-center flex-shrink-0 w-20">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.startTime?.slice(0, 5)}</p>
                    <p className="text-xs text-gray-400">{item.endTime?.slice(0, 5)}</p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.subjectName}
                      {item.isRevision && <span className="ml-2 text-xs badge bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">Revision</span>}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{item.taskDescription}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {item.status === 'COMPLETED' ? (
                      <span className="badge-completed">Done</span>
                    ) : item.status === 'MISSED' ? (
                      <span className="badge-missed">Missed</span>
                    ) : item.taskType === 'BREAK' ? (
                      <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Break</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-800/30 transition-colors"
                          title="Mark Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSkip(item.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                          title="Skip"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pomodoro Timer */}
          <PomodoroTimer />

          {/* Upcoming Exams */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Upcoming Exams
            </h3>
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No subjects added yet</p>
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sub.colorCode }} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{sub.subjectName}</span>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${
                      sub.daysUntilExam <= 3 ? 'text-red-500' : sub.daysUntilExam <= 7 ? 'text-amber-500' : 'text-gray-500'
                    }`}>
                      {sub.daysUntilExam === 0 ? 'Today!' : `${sub.daysUntilExam}d`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/subjects')}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
