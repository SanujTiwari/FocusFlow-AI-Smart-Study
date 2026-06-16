import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Moon, Sun, Clock, Timer, Save, User, UserCheck } from 'lucide-react';
import { preferencesAPI } from '../services/api';
import { useThemeStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [prefs, setPrefs] = useState({
    studyTimePreference: 'FLEXIBLE',
    availableHoursPerDay: 6,
    breakDurationMinutes: 15,
    pomodoroWorkMinutes: 25,
    pomodoroBreakMinutes: 5,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await preferencesAPI.get();
        setPrefs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await preferencesAPI.update(prefs);
      toast.success('Preferences saved! ⚙️');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'study', label: 'AI Study Planner', icon: Clock },
    { id: 'timer', label: 'Pomodoro Config', icon: Timer },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in font-sans">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary-500 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure your profile, scheduling criteria, and Pomodoro presets</p>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex bg-white/40 dark:bg-slate-900/30 backdrop-blur-md p-1 rounded-2xl border border-gray-150 dark:border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white dark:bg-slate-900 shadow-md rounded-xl border border-gray-150 dark:border-white/5 z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Settings Sections Containers */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Profile card details */}
              <div className="glass-card p-6 border-white/20 dark:border-white/5 shadow-lg">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-4">Account Profile</h2>
                <div className="flex items-center gap-4.5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-500/25">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 mt-1">
                      <UserCheck className="w-3 h-3" /> Account Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Theme / Appearance settings */}
              <div className="glass-card p-6 border-white/20 dark:border-white/5 shadow-lg">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-1">Theme Preferences</h2>
                <p className="text-xs text-gray-400 mb-4">Toggle background interface visuals</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                      {darkMode ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Dark Theme Mode</p>
                      <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">Toggle dark theme for night study sessions</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`w-14 h-8 rounded-full p-1 transition-all ${
                      darkMode ? 'bg-primary-500 shadow-inner' : 'bg-gray-300 dark:bg-white/5'
                    }`}
                  >
                    <motion.div
                      animate={{ x: darkMode ? 24 : 0 }}
                      className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'study' && (
            <motion.div
              key="study-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Study preference settings */}
              <div className="glass-card p-6 border-white/20 dark:border-white/5 shadow-lg space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-1">AI Planner Configurations</h2>
                  <p className="text-xs text-gray-400">Optimize schedule generation values</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400 mb-2.5">
                    Preferred Study Time
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['MORNING', 'EVENING', 'FLEXIBLE'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setPrefs({ ...prefs, studyTimePreference: t })}
                        className={`py-3 rounded-xl text-xs font-bold transition-all ${
                          prefs.studyTimePreference === t
                            ? 'bg-gradient-to-r from-primary-500 to-indigo-650 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-gray-150/70 dark:bg-white/5 text-gray-500 dark:text-slate-450'
                        }`}
                      >
                        {t === 'MORNING' ? '🌅 Morning' : t === 'EVENING' ? '🌙 Evening' : '⚡ Flexible'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400">
                      Daily Study Hours Limit
                    </label>
                    <span className="text-xs font-extrabold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/15 font-mono">
                      {prefs.availableHoursPerDay} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={prefs.availableHoursPerDay}
                    onChange={(e) => setPrefs({ ...prefs, availableHoursPerDay: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-250 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400">
                      Standard Break Duration
                    </label>
                    <span className="text-xs font-extrabold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/15 font-mono">
                      {prefs.breakDurationMinutes} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={prefs.breakDurationMinutes}
                    onChange={(e) => setPrefs({ ...prefs, breakDurationMinutes: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-250 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timer' && (
            <motion.div
              key="timer-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Pomodoro parameters */}
              <div className="glass-card p-6 border-white/20 dark:border-white/5 shadow-lg space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-1">Pomodoro Timer Configuration</h2>
                  <p className="text-xs text-gray-400">Adjust session block timing presets</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400 mb-2">
                      Work Block Duration (min)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="60"
                      value={prefs.pomodoroWorkMinutes}
                      onChange={(e) => setPrefs({ ...prefs, pomodoroWorkMinutes: parseInt(e.target.value) || 25 })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-650 dark:text-gray-400 mb-2">
                      Short Break Duration (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={prefs.pomodoroBreakMinutes}
                      onChange={(e) => setPrefs({ ...prefs, pomodoroBreakMinutes: parseInt(e.target.value) || 5 })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button */}
      {(activeTab === 'study' || activeTab === 'timer') && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 font-bold shadow-md"
        >
          <Save className="w-5 h-5 text-white" />
          {saving ? 'Saving changes...' : 'Save Configurations'}
        </motion.button>
      )}
    </div>
  );
}
