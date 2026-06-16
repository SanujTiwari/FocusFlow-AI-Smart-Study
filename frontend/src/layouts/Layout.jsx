import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore, useSidebarStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, BookOpen, BarChart3,
  Settings, LogOut, Menu, X, Moon, Sun, Bell, GraduationCap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { isOpen, toggle } = useSidebarStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col h-full bg-white/70 dark:bg-surface-900/70 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/5 transition-all duration-300 ease-in-out`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100 dark:border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
            <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
              <polygon points="12,7 13.5,10 16.5,10 14.2,12 15,15 12,13.2 9,15 9.8,12 7.5,10 10.5,10" fill="white" />
            </svg>
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-left"
            >
              <span className="text-lg font-bold font-serif text-gray-900 dark:text-white tracking-tight leading-none block">FocusFlow</span>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">AI study planner</span>
            </motion.div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''} ${!isOpen ? 'justify-center px-3' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-white/5">
          {isOpen && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 ${!isOpen ? 'justify-center px-3' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/50 dark:bg-surface-900/50 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              {isOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
                  <polygon points="12,7 13.5,10 16.5,10 14.2,12 15,15 12,13.2 9,15 9.8,12 7.5,10 10.5,10" fill="white" />
                </svg>
              </div>
              <div className="text-left">
                <span className="font-bold font-serif text-gray-900 dark:text-white leading-none block">FocusFlow</span>
                <span className="text-[8px] text-slate-400 font-semibold block">AI study planner</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300"
              id="dark-mode-toggle"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 relative"
                id="notification-bell"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 glass-card-strong p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl text-sm ${
                              n.isRead
                                ? 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400'
                                : 'bg-primary-50 dark:bg-primary-950/30 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {n.message}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex items-center justify-around py-2 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/5">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
