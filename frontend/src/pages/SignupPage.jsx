import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Sparkles, TrendingUp, Flame, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.signup({ name, email, password });
      const { token, userId, name: userName, email: userEmail } = res.data;
      setAuth({ id: userId, name: userName, email: userEmail }, token);
      toast.success(`Welcome to FocusFlow, ${userName}! 🚀`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Background Neon Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, -40, 50, 0],
            y: [0, 80, -60, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-primary-600/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 70, -30, 0],
            y: [0, -50, 80, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-10 -left-20 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]"
        />
      </div>

      {/* Left - Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/65 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl shadow-black/40">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold font-display bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                FocusFlow
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-2 font-display">Create Account</h2>
            <p className="text-slate-400 mb-8 text-sm">Start your smart study journey today</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="w-full btn-primary font-bold mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right - Branding Showcase */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10 border-l border-slate-900/50 bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-lg w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 via-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30"
          >
            <GraduationCap className="w-11 h-11 text-white animate-pulse" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight mb-2 font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
          >
            FocusFlow
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-slate-400 mb-8"
          >
            Study Smarter, Not Harder
          </motion.p>

          {/* Interactive Progress Illustration */}
          <div className="glass-card-strong p-6 text-left border border-white/10 shadow-2xl relative overflow-hidden bg-slate-900/50 space-y-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> FocusFlow Analytics Demo
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Daily Streak Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">7 Days</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Daily Streak</p>
                </div>
              </motion.div>

              {/* Tasks Completed */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">92%</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Completion Rate</p>
                </div>
              </motion.div>
            </div>

            {/* Preparation Level Visualizer */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Chemistry Exam Prep</span>
                <span className="text-xs font-bold text-primary-400">80% Ready</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>4 Syllabus Chapters Done</span>
                <span>1 Chapter Left</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
