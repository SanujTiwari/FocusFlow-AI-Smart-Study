import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Flame, Target, Clock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { analyticsAPI } from '../services/api';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4', '#3b82f6'];

// Custom Premium Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 dark:bg-slate-950/95 border border-white/10 backdrop-blur-md p-3.5 rounded-xl shadow-2xl text-xs font-sans text-slate-100">
        <p className="font-extrabold mb-1.5 uppercase tracking-wider text-slate-400">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="font-medium text-slate-350">{item.name}:</span>
            <span className="font-bold font-mono text-slate-100">{item.value} {item.value === 1 ? 'hr' : 'hrs'}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsAPI.getOverview();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500 font-sans italic">
        No analytics data available yet. Complete some study tasks first!
      </div>
    );
  }

  const pieData = [
    { name: 'Completed', value: data.completedTasks, color: '#10b981' },
    { name: 'Missed', value: data.missedTasks, color: '#f43f5e' },
    { name: 'Pending', value: Math.max(0, data.totalTasks - data.completedTasks - data.missedTasks), color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const shadowGlowMap = {
    primary: 'shadow-glow-primary',
    amber: 'shadow-glow-amber',
    purple: 'shadow-glow-purple',
    blue: 'shadow-glow-primary',
    emerald: 'shadow-glow-emerald',
    gray: 'border-slate-200 dark:border-white/5 shadow-sm'
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Review your long-term streak progress and study time allocations</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Target, label: 'Completion', value: `${data.completionRate}%`, color: 'primary' },
          { icon: Flame, label: 'Streak', value: `${data.currentStreak}d`, color: 'amber' },
          { icon: TrendingUp, label: 'Best Streak', value: `${data.longestStreak}d`, color: 'purple' },
          { icon: Clock, label: 'Study Hours', value: data.totalStudyHours, color: 'blue' },
          { icon: CheckCircle2, label: 'Completed', value: data.completedTasks, color: 'emerald' },
          { icon: BarChart3, label: 'Total Tasks', value: data.totalTasks, color: 'gray' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`stat-card border bg-white/60 dark:bg-slate-900/40 ${shadowGlowMap[stat.color]}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5`}>
              <stat.icon className={`w-5 h-5 ${
                stat.color === 'primary' ? 'text-primary-500' :
                stat.color === 'blue' ? 'text-indigo-500' :
                stat.color === 'amber' ? 'text-amber-500' :
                stat.color === 'purple' ? 'text-purple-500' :
                stat.color === 'emerald' ? 'text-emerald-500' : 'text-gray-400'
              }`} />
            </div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-1">{stat.value}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Pie Chart */}
        <div className="glass-card p-6 border-white/20 dark:border-white/5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-1">Task Completion</h3>
            <p className="text-xs text-gray-400 mb-4">Breakdown of planned focus slots</p>
          </div>
          
          {pieData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12 text-sm italic">No completion data recorded yet</p>
          )}
          
          <div className="flex justify-center flex-wrap gap-5 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-semibold text-gray-650 dark:text-gray-400">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend (Filled Area Chart) */}
        <div className="glass-card p-6 border-white/20 dark:border-white/5 shadow-lg">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-1">Weekly Study Trend</h3>
            <p className="text-xs text-gray-400 mb-4">Total study hours calculated per week</p>
          </div>
          
          {data.weeklyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.weeklyTrend}>
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '600' }} stroke="rgba(99,102,241,0.15)" />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '600' }} stroke="rgba(99,102,241,0.15)" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hoursStudied"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  name="Weekly Hours"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-16 text-sm italic">Log completed tasks to view weekly trends</p>
          )}
        </div>

        {/* Subject Breakdown Bar Chart */}
        <div className="glass-card p-6 lg:col-span-2 border-white/20 dark:border-white/5 shadow-lg">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-1">Hours per Subject</h3>
            <p className="text-xs text-gray-400 mb-4">Distribution of total study time across subjects</p>
          </div>

          {data.subjectBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.subjectBreakdown} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: '600' }} stroke="rgba(99,102,241,0.15)" />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: '600' }} stroke="rgba(99,102,241,0.15)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hoursStudied" radius={[6, 6, 0, 0]} name="Hours Allocation">
                  {data.subjectBreakdown.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.colorCode || CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-20 text-sm italic">Add subjects and start focus blocks to compile analysis</p>
          )}
        </div>
      </div>
    </div>
  );
}
