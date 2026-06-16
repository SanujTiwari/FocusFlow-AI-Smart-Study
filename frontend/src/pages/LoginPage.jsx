import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Sparkles, BookOpen, Clock, Award, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, userId, name, email: userEmail } = res.data;
      setAuth({ id: userId, name, email: userEmail }, token);
      toast.success(`Welcome back, ${name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const mockTimeline = [
    { time: '09:00 AM', label: 'AI Study: Mathematics', type: 'study', color: 'from-blue-500 to-indigo-500', desc: 'Focus: Calculus limits & derivatives' },
    { time: '10:30 AM', label: 'Rest Break', type: 'break', color: 'from-emerald-400 to-teal-500', desc: 'Hydrate & walk around' },
    { time: '10:45 AM', label: 'AI Review: Physics', type: 'revision', color: 'from-purple-500 to-pink-500', desc: 'Active recall: Electromagnetism' },
    { time: '12:15 PM', label: 'Daily Goal Met!', type: 'goal', color: 'from-amber-400 to-orange-500', desc: 'Streak maintained: 5 days 🔥' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Background Neon Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.2, 0.85, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-primary-600/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 60, -70, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 30, -50, 0],
            y: [0, 50, 60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Left Side - Interactive Showcase */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10 border-r border-slate-900/50 bg-slate-950/40 backdrop-blur-xl">
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
            Your AI Study Planner
          </motion.p>

          {/* Interactive Study Timeline Mockup */}
          <div className="glass-card-strong p-6 text-left border border-white/10 shadow-2xl relative overflow-hidden bg-slate-900/50">
            <div className="absolute top-0 right-0 p-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary-400" /> AI Generating Plan
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" /> Today's Dynamic Schedule
            </h3>
            
            <div className="space-y-4 relative border-l-2 border-slate-800 ml-2.5 pl-6">
              {mockTimeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.15 }}
                  className="relative group cursor-default"
                >
                  {/* Timeline bullet dot */}
                  <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-primary-500 flex items-center justify-center transition-all group-hover:scale-125`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  </div>
                  
                  <div className="bg-slate-950/40 hover:bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 hover:border-slate-700/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-mono font-medium">{item.time}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r ${item.color} text-white shadow-sm`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Premium Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Main Glass Form */}
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

            <h2 className="text-3xl font-extrabold text-white mb-2 font-display">Welcome Back</h2>
            <p className="text-slate-400 mb-8 text-sm">Sign in to resume your premium study journey</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">Password</label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
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
                id="login-submit"
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
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
