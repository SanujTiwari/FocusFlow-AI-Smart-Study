import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Clock, Timer, Save } from 'lucide-react';
import { preferencesAPI } from '../services/api';
import { useThemeStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const user = useAuthStore((s) => s.user);
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
      try { const res = await preferencesAPI.get(); setPrefs(res.data); } catch (err) { console.error(err); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await preferencesAPI.update(prefs); toast.success('Preferences saved! ⚙️'); }
    catch (err) { toast.error('Failed to save preferences'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary-500" /> Settings
      </h1>

      {/* Profile */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500">Toggle dark/light theme</p>
            </div>
          </div>
          <button onClick={toggleDarkMode}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}>
            <motion.div animate={{ x: darkMode ? 24 : 0 }} className="w-6 h-6 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Study Preferences */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-500" /> Study Preferences
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Study Time</label>
            <div className="grid grid-cols-3 gap-2">
              {['MORNING', 'EVENING', 'FLEXIBLE'].map((t) => (
                <button key={t} onClick={() => setPrefs({ ...prefs, studyTimePreference: t })}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${prefs.studyTimePreference === t ? 'bg-primary-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                  {t === 'MORNING' ? '🌅 Morning' : t === 'EVENING' ? '🌙 Evening' : '⚡ Flexible'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Study Hours/Day: <span className="text-primary-500 font-bold">{prefs.availableHoursPerDay}h</span></label>
            <input type="range" min="1" max="12" value={prefs.availableHoursPerDay} onChange={(e) => setPrefs({ ...prefs, availableHoursPerDay: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Break Duration: <span className="text-primary-500 font-bold">{prefs.breakDurationMinutes} min</span></label>
            <input type="range" min="5" max="30" step="5" value={prefs.breakDurationMinutes} onChange={(e) => setPrefs({ ...prefs, breakDurationMinutes: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500" />
          </div>
        </div>
      </div>

      {/* Pomodoro Settings */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary-500" /> Pomodoro Settings
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Duration (min)</label>
            <input type="number" min="15" max="60" value={prefs.pomodoroWorkMinutes} onChange={(e) => setPrefs({ ...prefs, pomodoroWorkMinutes: parseInt(e.target.value) || 25 })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Break Duration (min)</label>
            <input type="number" min="1" max="15" value={prefs.pomodoroBreakMinutes} onChange={(e) => setPrefs({ ...prefs, pomodoroBreakMinutes: parseInt(e.target.value) || 5 })} className="input-field" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
        <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
