import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 bg-grid flex flex-col justify-between p-6 md:p-12 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Background neon light layers (underneath grid) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -60, 45, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 60, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute bottom-10 right-10 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[110px]"
        />
      </div>

      {/* Top Left Header Logo branding */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 self-start z-10"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
            <polygon points="12,7 13.5,10 16.5,10 14.2,12 15,15 12,13.2 9,15 9.8,12 7.5,10 10.5,10" fill="white" />
          </svg>
        </div>
        <div className="text-left">
          <h2 className="text-xl font-bold font-serif text-white tracking-tight leading-none">FocusFlow</h2>
          <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">AI-powered study planner</p>
        </div>
      </motion.div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-36 max-w-7xl w-full mx-auto my-8 z-10">
        
        {/* Left Side: Mock Live Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-[380px] bg-slate-950/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-2xl space-y-6"
        >
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live Dashboard</span>
            </div>
            <motion.span 
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            >
              AI active
            </motion.span>
          </div>

          {/* Stats blocks grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: '14', name: 'Day streak', color: 'text-emerald-400', delay: 0.2 },
              { val: '94%', name: 'Completion', color: 'text-cyan-400', delay: 0.3 },
              { val: '6.2h', name: 'This week', color: 'text-amber-500', delay: 0.4 }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.4 }}
                whileHover={{ y: -3, scale: 1.03, borderColor: 'rgba(255,255,255,0.1)' }}
                className="bg-slate-900/50 border border-white/5 rounded-xl p-3 text-center transition-all cursor-default"
              >
                <p className={`text-xl font-extrabold font-mono ${stat.color}`}>{stat.val}</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">{stat.name}</p>
              </motion.div>
            ))}
          </div>

          {/* Preparation level meter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Physics exam prep</span>
              <span className="text-cyan-400 font-extrabold">80% ready</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full" 
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
              <span>4 chapters done</span>
              <span>1 remaining</span>
            </div>
          </div>

          {/* Timeline Schedule list */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Today's Schedule</h3>
            
            <div className="relative border-l border-slate-800 ml-1.5 pl-5 space-y-4">
              
              {/* Item 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                whileHover={{ x: 2 }}
                className="relative cursor-default"
              >
                <span className="absolute -left-[24px] top-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-cyan-400" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">09:00</span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">Mathematics — Calculus</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Limits & derivatives deep dive</span>
                  </div>
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 rounded">
                    study
                  </span>
                </div>
              </motion.div>

              {/* Item 2 */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                whileHover={{ x: 2 }}
                className="relative cursor-default"
              >
                <span className="absolute -left-[24px] top-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-emerald-400" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">10:30</span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">Rest break</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Hydrate & walk around</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded">
                    break
                  </span>
                </div>
              </motion.div>

              {/* Item 3 */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                whileHover={{ x: 2 }}
                className="relative cursor-default"
              >
                <span className="absolute -left-[24px] top-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-purple-400" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">10:45</span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">Physics — Electromagnetism</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Active recall session</span>
                  </div>
                  <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded">
                    revision
                  </span>
                </div>
              </motion.div>

              {/* Item 4 */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                whileHover={{ x: 2 }}
                className="relative cursor-default"
              >
                <span className="absolute -left-[24px] top-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-amber-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">12:15</span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">Daily goal achieved</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">14-day streak maintained</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded">
                    goal met
                  </span>
                </div>
              </motion.div>

            </div>
          </div>

        </motion.div>

        {/* Right Side: Tabbed Signup Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[420px] bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Navigation Tab strip */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 grid grid-cols-2 text-center mb-6">
            <button
              onClick={() => navigate('/login')}
              className="py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button className="py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md">
              Sign up
            </button>
          </div>

          <h2 className="text-3xl font-bold font-serif text-white mb-1">Create account</h2>
          <p className="text-xs text-slate-400 mb-8 font-medium">Start your smart study journey today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Full Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-all text-sm pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              id="signup-submit"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-500 hover:from-cyan-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Social signup block */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative bg-slate-900/90 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Horizontal Google & GitHub buttons (No Apple) */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:scale-[1.02] transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:scale-[1.02] transition-all">
              <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>

      </div>

      {/* Footer copyright segment */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-[10px] text-slate-650 font-bold z-10"
      >
        © {new Date().getFullYear()} FocusFlow. Study Smart.
      </motion.div>
    </div>
  );
}
