import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Subjects
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Schedule
export const scheduleAPI = {
  generate: (data) => api.post('/schedule/generate', data),
  getByDate: (date) => api.get(`/schedule?date=${date}`),
  getWeekly: (startDate) => api.get(`/schedule/week?start=${startDate}`),
  markComplete: (id) => api.put(`/schedule/${id}/complete`),
  markSkipped: (id) => api.put(`/schedule/${id}/skip`),
  reschedule: () => api.post('/schedule/reschedule'),
  getMissedCount: () => api.get('/schedule/missed-count'),
};

// Analytics
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
};

// Preferences
export const preferencesAPI = {
  get: () => api.get('/preferences'),
  update: (data) => api.put('/preferences', data),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
