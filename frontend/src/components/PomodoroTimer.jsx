import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function PomodoroTimer() {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (soundEnabled) playSound();
            if (isBreak) {
              setIsBreak(false);
              return workMin * 60;
            } else {
              setSessions((s) => s + 1);
              setIsBreak(true);
              return breakMin * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak, workMin, breakMin, soundEnabled]);

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880; // Elegant high A-note
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio Context failed to play sound:', e);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMin * 60);
  };

  const totalTime = (isBreak ? breakMin : workMin) * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-card p-6 shadow-glow-primary border-slate-200 dark:border-white/5 relative overflow-hidden bg-white/60 dark:bg-slate-900/40">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0 flex items-center gap-2 font-display">
          <Timer className="w-5 h-5 text-primary-500 animate-pulse" /> Pomodoro Timer
        </h3>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? 'bg-primary-500/10 border-primary-500/20 text-primary-500'
              : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-400'
          }`}
          title={soundEnabled ? 'Mute Alert' : 'Unmute Alert'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Pulsing Visualizer Core Container */}
        <motion.div
          animate={isRunning ? {
            scale: [1, 1.03, 1],
            boxShadow: isBreak
              ? ['0 0 10px rgba(16, 185, 129, 0.1)', '0 0 20px rgba(16, 185, 129, 0.25)', '0 0 10px rgba(16, 185, 129, 0.1)']
              : ['0 0 10px rgba(99, 102, 241, 0.1)', '0 0 20px rgba(99, 102, 241, 0.25)', '0 0 10px rgba(99, 102, 241, 0.1)']
          } : {}}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="relative w-36 h-36 mb-5 flex items-center justify-center rounded-full bg-slate-950/20 dark:bg-slate-950/40 border border-white/10"
        >
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* SVG Gradients definitions */}
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            {/* Back track circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              className="text-gray-200/80 dark:text-white/5"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={isBreak ? 'url(#breakGradient)' : 'url(#focusGradient)'}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>

          {/* Time text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-[10px] uppercase tracking-widest font-extrabold mt-0.5 flex items-center gap-1 ${
              isBreak ? 'text-emerald-500' : 'text-primary-400'
            }`}>
              {isBreak ? (
                <>Relax 🌿</>
              ) : (
                <>Focus <Sparkles className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} /></>
              )}
            </span>
          </div>
        </motion.div>

        {/* Controls Panel */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-150 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:scale-105 active:scale-95 border border-transparent dark:border-white/5 transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleTimer}
            className={`p-4 rounded-2xl text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
              isBreak
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/35'
                : 'bg-gradient-to-r from-primary-500 to-indigo-600 shadow-primary-500/25 hover:shadow-primary-500/35'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
        </div>

        {/* Focus count indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-150 dark:border-white/5">
          <span>Focus Blocks Completed:</span>
          <span className="text-primary-500 font-extrabold">{sessions}</span>
        </div>
      </div>
    </div>
  );
}
