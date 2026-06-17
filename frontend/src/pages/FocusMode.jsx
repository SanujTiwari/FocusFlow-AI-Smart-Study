import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCw, Volume2, ArrowLeft, 
  VolumeX, Bell, BellOff, Sparkles, Award, Coffee, BookOpen, SkipForward
} from 'lucide-react';
import { preferencesAPI, subjectAPI } from '../services/api';
import toast from 'react-hot-toast';

const AMBIENT_SOUNDS = [
  { id: 'silent', label: 'Silent', icon: VolumeX, url: null },
  { id: 'lofi', label: 'Lofi Chill 🎵', icon: Sparkles, url: 'https://raw.githubusercontent.com/jigardave8/pro_contentfiles/main/lofi-chill-background-music-313055.mp3' },
  { id: 'rain', label: 'Heavy Rain 🌧️', icon: Volume2, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'cafe', label: 'Cozy Cafe ☕', icon: Coffee, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'forest', label: 'Forest Birds 🌲', icon: Award, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' }
];

export default function FocusMode() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // Timer States
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [timerMode, setTimerMode] = useState('work'); // work, break
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Ambient Sound States
  const [selectedSound, setSelectedSound] = useState('silent');
  const [volume, setVolume] = useState(0.5);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Notification Permissions
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Load preferences & subjects
  useEffect(() => {
    loadSettings();
    loadSubjects();
    
    // Check notification permission state
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    return () => {
      stopTimer();
      stopAudio();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const res = await preferencesAPI.get();
      if (res.data) {
        const wMin = res.data.pomodoroWorkMinutes || 25;
        const bMin = res.data.pomodoroBreakMinutes || 5;
        setWorkTime(wMin);
        setBreakTime(bMin);
        setTimeLeft(wMin * 60);
      }
    } catch (err) {
      console.error('Failed to load Pomodoro preferences', err);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await subjectAPI.getAll();
      setSubjects(res.data);
      if (res.data.length > 0) {
        setSelectedSubjectId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  // Notification Handler
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success('Notifications enabled! 🔔');
    } else {
      setNotificationsEnabled(false);
      toast.error('Notifications permission denied');
    }
  };

  const sendNotification = (title, options) => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(title, options);
    }
  };

  // Timer Core logic
  const startTimer = () => {
    if (isActive) return;
    setIsActive(true);
    
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished!
          handleTimerExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setIsActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const skipTimer = () => {
    stopTimer();
    handleTimerExpiry();
  };

  const handleTimerExpiry = () => {
    // Play timer completed sound
    const audioChime = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
    audioChime.volume = 0.6;
    audioChime.play().catch(e => console.log('Chime playback delayed'));

    if (timerMode === 'work') {
      setTimerMode('break');
      setTimeLeft(breakTime * 60);
      sendNotification('Break Time! ☕', {
        body: `Great job focusing! Take a ${breakTime} minute stretch break.`,
        icon: '/favicon.ico'
      });
      toast.success('Focus block completed! Time for a rest! ☕');
    } else {
      setTimerMode('work');
      setTimeLeft(workTime * 60);
      sendNotification('Back to Work! 📚', {
        body: `Let's focus for ${workTime} minutes! You can do it.`,
        icon: '/favicon.ico'
      });
      toast.success('Break finished! Let\'s focus again! 📚');
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimerMode('work');
    setTimeLeft(workTime * 60);
    toast('Timer reset');
  };

  // Audio Playback logic
  const handleSoundChange = (soundId) => {
    setSelectedSound(soundId);
    stopAudio();

    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (sound && sound.url) {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
      
      setIsAudioPlaying(true);
      audio.play().catch(e => {
        console.error('Audio stream block', e);
        setIsAudioPlaying(false);
        toast.error('Click focus mode screen to enable audio streams');
      });
    } else {
      setIsAudioPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log(e));
      setIsAudioPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  // Formatting helpers
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Circular progress calculations
  const totalDuration = timerMode === 'work' ? workTime * 60 : breakTime * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Selected subject metadata
  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="fixed inset-0 h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 z-50 overflow-hidden font-sans select-none">
      
      {/* Immersive mesh light layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: isActive ? [1, 1.15, 0.95, 1] : 1,
            rotate: isActive ? [0, 90, 180, 360] : 0
          }}
          transition={{
            duration: timerMode === 'work' ? 45 : 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-colors duration-1000 ${
            timerMode === 'work' ? 'bg-cyan-500/10' : 'bg-rose-500/10'
          }`}
        />
        <motion.div
          animate={{
            scale: isActive ? [1, 0.9, 1.1, 1] : 1,
            rotate: isActive ? [0, -90, -180, -360] : 0
          }}
          transition={{
            duration: timerMode === 'work' ? 50 : 20,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className={`absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full blur-[140px] opacity-40 transition-colors duration-1000 ${
            timerMode === 'work' ? 'bg-indigo-500/10' : 'bg-amber-500/10'
          }`}
        />
      </div>

      {/* Header Panel */}
      <header className="relative z-10 flex items-center justify-between w-full">
        <button
          onClick={() => {
            stopTimer();
            stopAudio();
            navigate(-1);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-350 hover:text-white transition-all text-xs font-bold uppercase tracking-wider hover:-translate-x-1"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Assistant
        </button>

        {/* Notifications toggler */}
        <button
          onClick={requestNotificationPermission}
          className={`p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
            notificationsEnabled 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
          }`}
          title={notificationsEnabled ? 'Web notifications active' : 'Enable web notifications'}
        >
          {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Focus Timer Arena */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center w-full max-w-lg mx-auto py-6">
        
        {/* Subject Focus Selector */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-4 py-2 mb-6">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-200 border-none outline-none focus:ring-0 cursor-pointer min-w-[120px]"
          >
            {subjects.length === 0 ? (
              <option value="">No Active Subject</option>
            ) : (
              subjects.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-950 text-slate-200">{s.subjectName}</option>
              ))
            )}
          </select>
        </div>

        {/* Big Circular Clock indicator */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
            {/* Background circle track */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Glowing progress track */}
            <circle
              className={`transition-all duration-300 stroke-linecap-round ${
                timerMode === 'work' ? 'stroke-cyan-500 shadow-glow-cyan' : 'stroke-rose-500 shadow-glow-rose'
              }`}
              style={{ filter: `drop-shadow(0 0 6px ${timerMode === 'work' ? 'rgba(6,182,212,0.6)' : 'rgba(244,63,94,0.6)'})` }}
              cx="120"
              cy="120"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeWidth="8"
              fill="transparent"
            />
          </svg>

          {/* Clock Text inside Ring */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
              {timerMode === 'work' ? 'Study Focus' : 'Stretch Break'}
            </span>
            <span className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tight">
              {formatTime(timeLeft)}
            </span>
            {currentSubjectObj && (
              <span 
                className="text-[10px] font-bold mt-2 px-2.5 py-0.5 rounded-full border border-white/5 flex items-center gap-1.5"
                style={{ color: currentSubjectObj.colorCode, backgroundColor: `${currentSubjectObj.colorCode}10` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentSubjectObj.colorCode }} />
                {currentSubjectObj.subjectName}
              </span>
            )}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4.5 mt-8">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-450 hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Reset Timer"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            onClick={isActive ? stopTimer : startTimer}
            className={`p-5 rounded-3xl text-white font-extrabold transition-all hover:scale-110 active:scale-95 shadow-xl ${
              timerMode === 'work'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/10'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/10'
            }`}
            title={isActive ? 'Pause Session' : 'Start Focus'}
          >
            {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
          </button>

          <button
            onClick={skipTimer}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-450 hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Skip Session"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

      </main>

      {/* Ambient Sound Deck Panel */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto glass-card-strong p-5.5 border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Soundtrack list selectors */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 text-center md:text-left">
            Ambient Soundscape
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
            {AMBIENT_SOUNDS.map((sound) => {
              const Icon = sound.icon;
              const isSelected = selectedSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleSoundChange(sound.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                    isSelected
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sound.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Volume controls */}
        {selectedSound !== 'silent' && (
          <div className="flex items-center gap-3.5 w-full md:w-[220px] bg-slate-950/45 p-3 rounded-2xl border border-white/5">
            <button
              onClick={toggleAudio}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400"
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
