import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle2, XCircle, Clock, Flame,
  BookOpen, Sparkles, RefreshCw, ArrowRight, AlertTriangle, Quote, Lightbulb
} from 'lucide-react';
import { scheduleAPI, subjectAPI, analyticsAPI } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import PomodoroTimer from '../components/PomodoroTimer';

const STUDY_QUOTES = [
  { quote: "Focus is a muscle, and you are building it session by session.", author: "FocusFlow AI" },
  { quote: "Your future self will thank you for the effort you put in today.", author: "Anonymous" },
  { quote: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" }
];

const STUDY_TIPS = [
  "Use the Pomodoro technique: study intensely for 25 minutes, then take a 5-minute stretch break to rest your mind.",
  "Try Active Recall: write down everything you remember about a chapter without looking at your notes.",
  "Studies show that mild dehydration impairs cognitive speed. Keep a water bottle on your desk!",
  "Minimize context switching. Put your phone in another room or turn on 'Do Not Disturb' while studying.",
  "Commit to just 5 minutes of study. Often, starting is the hardest part, and you'll easily keep going once you begin.",
  "Space out your revision. Reviewing a topic at 1-day, 3-day, and 7-day intervals solidifies it in long-term memory."
];

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

  // Focus Hub states
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboard();
    // Pick random indices initially
    setQuoteIndex(Math.floor(Math.random() * STUDY_QUOTES.length));
    setTipIndex(Math.floor(Math.random() * STUDY_TIPS.length));
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

  const rollFocusHub = () => {
    setQuoteIndex((prev) => (prev + 1) % STUDY_QUOTES.length);
    setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    toast('Focus Hub refreshed! ✨', { icon: '🔄', duration: 1500 });
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
      toast.success('AI Schedule generated! 🎉');
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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
            {getGreeting()}, <span className="gradient-text-vibrant">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '4s' }} />
            {generating ? 'Regenerating...' : 'Generate AI Plan'}
          </button>
        </div>
      </div>

      {/* Missed Tasks Warning Banner */}
      {missedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4.5 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 dark:border-amber-800/30 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-amber-800 dark:text-amber-400">Schedule Adaptation Available</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-0.5">
                You have {missedCount} study block{missedCount > 1 ? 's' : ''} flagged as missed. Let FocusFlow adjust your schedule.
              </p>
            </div>
          </div>
          <button
            onClick={handleReschedule}
            disabled={rescheduling}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 hover:scale-105 active:scale-95 text-white rounded-xl font-bold transition-all text-xs shadow-md shadow-amber-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rescheduling ? 'animate-spin' : ''}`} />
            Reschedule
          </button>
        </motion.div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card shadow-glow-primary border-slate-100 dark:border-white/5 bg-white/60 dark:bg-slate-900/40"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-500" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono">{totalToday}</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Tasks</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card shadow-glow-emerald border-slate-100 dark:border-white/5 bg-white/60 dark:bg-slate-900/40"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono">{completedToday}</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card shadow-glow-amber border-slate-100 dark:border-white/5 bg-white/60 dark:bg-slate-900/40"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono">{analytics?.currentStreak || 0}</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Day Streak 🔥</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card shadow-glow-purple border-slate-100 dark:border-white/5 bg-white/60 dark:bg-slate-900/40"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-500" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono">{subjects.length}</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subjects</span>
        </motion.div>
      </div>

      {/* New Feature: Focus Hub Motivational Widget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card-strong p-6 border-white/20 dark:border-white/5 relative overflow-hidden bg-gradient-to-r from-slate-900/80 via-indigo-950/40 to-slate-900/80"
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary-400">Daily Focus Hub</span>
            </div>
            
            {/* Quote of the Day */}
            <div className="flex items-start gap-3">
              <Quote className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-base font-medium text-slate-200 italic leading-relaxed">
                  "{STUDY_QUOTES[quoteIndex].quote}"
                </p>
                <p className="text-xs text-slate-400 mt-1 font-bold">— {STUDY_QUOTES[quoteIndex].author}</p>
              </div>
            </div>

            {/* Cognitive Study Tip */}
            <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block mb-0.5">Study Hack</span>
                <p className="text-sm text-slate-300">{STUDY_TIPS[tipIndex]}</p>
              </div>
            </div>
          </div>

          <button
            onClick={rollFocusHub}
            className="self-start md:self-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:scale-105 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" /> Roll Tip & Quote
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule panel */}
        <div className="lg:col-span-2 glass-card p-6 border-white/20 dark:border-white/5 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Today's Schedule
            </h2>
            {totalToday > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-gray-500 dark:text-slate-400">{Math.round(progressPercent)}% Done</span>
              </div>
            )}
          </div>

          {todaySchedule.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-650 dark:text-gray-400 mb-1">No schedule created for today</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">Let FocusFlow coordinate your tasks based on subject priorities.</p>
              <button onClick={handleGenerate} className="btn-primary inline-flex items-center gap-2 font-bold shadow-md">
                <Sparkles className="w-4 h-4" /> Generate AI Schedule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 opacity-70'
                      : item.status === 'MISSED'
                      ? 'bg-red-500/5 border-red-500/20 opacity-55'
                      : 'bg-white/45 dark:bg-slate-900/40 border-gray-150 dark:border-white/5 hover:border-primary-500/20 hover:scale-[1.01]'
                  }`}
                >
                  {/* Left color bar */}
                  <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: item.subjectColor }} />

                  {/* Time info */}
                  <div className="text-center flex-shrink-0 w-16">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white font-mono">{item.startTime?.slice(0, 5)}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">{item.endTime?.slice(0, 5)}</p>
                  </div>

                  {/* Subject info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 dark:text-white truncate text-sm">{item.subjectName}</span>
                      {item.isRevision && (
                        <span className="badge bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                          Revision
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{item.taskDescription}</p>
                  </div>

                  {/* Actions / Badge */}
                  <div className="flex-shrink-0">
                    {item.status === 'COMPLETED' ? (
                      <span className="badge-completed">Done</span>
                    ) : item.status === 'MISSED' ? (
                      <span className="badge-missed">Missed</span>
                    ) : item.taskType === 'BREAK' ? (
                      <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                        Break
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all hover:scale-105 border border-emerald-500/15"
                          title="Complete Block"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSkip(item.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-650 hover:text-white transition-all hover:scale-105 border border-red-500/15"
                          title="Skip Block"
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

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Pomodoro Timer widget */}
          <PomodoroTimer />

          {/* Upcoming Exams panel */}
          <div className="glass-card p-6 border-white/20 dark:border-white/5 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
              <Calendar className="w-5 h-5 text-primary-500" />
              Upcoming Exams
            </h3>
            {subjects.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4 italic">No subjects added yet</p>
            ) : (
              <div className="space-y-3.5">
                {subjects.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sub.colorCode }} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{sub.subjectName}</span>
                    </div>
                    <span className={`text-xs font-extrabold font-mono flex-shrink-0 ${
                      sub.daysUntilExam <= 3 ? 'text-red-500' : sub.daysUntilExam <= 7 ? 'text-amber-500' : 'text-gray-550 dark:text-slate-400'
                    }`}>
                      {sub.daysUntilExam === 0 ? 'Today!' : `${sub.daysUntilExam}d left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/subjects')}
              className="mt-5 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-wider"
            >
              View Subjects <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
