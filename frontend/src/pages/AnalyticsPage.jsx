import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Flame, Target, Clock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { analyticsAPI } from '../services/api';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4', '#3b82f6'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res = await analyticsAPI.getOverview(); setData(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">No analytics data available yet. Complete some study tasks first!</div>;

  const pieData = [
    { name: 'Completed', value: data.completedTasks, color: '#22c55e' },
    { name: 'Missed', value: data.missedTasks, color: '#ef4444' },
    { name: 'Pending', value: Math.max(0, data.totalTasks - data.completedTasks - data.missedTasks), color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Target, label: 'Completion', value: `${data.completionRate}%`, color: 'primary' },
          { icon: Flame, label: 'Streak', value: `${data.currentStreak}d`, color: 'amber' },
          { icon: TrendingUp, label: 'Best Streak', value: `${data.longestStreak}d`, color: 'purple' },
          { icon: Clock, label: 'Study Hours', value: data.totalStudyHours, color: 'blue' },
          { icon: CheckCircle2, label: 'Completed', value: data.completedTasks, color: 'emerald' },
          { icon: BarChart3, label: 'Total Tasks', value: data.totalTasks, color: 'gray' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="stat-card">
            <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
            <span className="text-xs text-gray-500">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Completion</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-12">No data yet</p>}
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Study Trend</h3>
          {data.weeklyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="hoursStudied" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-12">Complete tasks to see trends</p>}
        </div>

        {/* Subject Breakdown */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subject Breakdown</h3>
          {data.subjectBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.subjectBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="subjectName" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="hoursStudied" radius={[8, 8, 0, 0]} name="Hours Studied">
                  {data.subjectBreakdown.map((entry, i) => <Cell key={i} fill={entry.colorCode || CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-12">No subject data yet</p>}
        </div>
      </div>
    </div>
  );
}
