import axios from 'axios';

const explicitBaseURL = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const DEV_API_CACHE_KEY = 'dev_api_base_url';

const probeApiHealth = async (port) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 700);

  try {
    const response = await fetch(`http://localhost:${port}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (response.ok) {
      return `http://localhost:${port}/api`;
    }
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timeout);
  }

  return null;
};

const resolveDevBaseURL = async () => {
  if (typeof window === 'undefined') {
    return '/api';
  }

  const cachedBaseURL = window.sessionStorage.getItem(DEV_API_CACHE_KEY);
  if (cachedBaseURL) {
    return cachedBaseURL;
  }

  const candidatePorts = [];
  for (let port = 5001; port <= 5025; port += 1) {
    candidatePorts.push(port);
  }
  candidatePorts.push(5000);

  for (const port of candidatePorts) {
    const discoveredBaseURL = await probeApiHealth(port);
    if (discoveredBaseURL) {
      window.sessionStorage.setItem(DEV_API_CACHE_KEY, discoveredBaseURL);
      return discoveredBaseURL;
    }
  }

  return '/api';
};

let resolvedBaseURLPromise = null;
const getResolvedBaseURL = () => {
  if (explicitBaseURL) {
    return Promise.resolve(explicitBaseURL);
  }

  if (!isDev) {
    return Promise.resolve('/api');
  }

  if (!resolvedBaseURLPromise) {
    resolvedBaseURLPromise = resolveDevBaseURL();
  }

  return resolvedBaseURLPromise;
};

const api = axios.create({
  baseURL: explicitBaseURL || '/api',
});

api.interceptors.request.use(
  async (config) => {
    const resolvedBaseURL = await getResolvedBaseURL();
    config.baseURL = resolvedBaseURL;

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users'),
};

export const propertyAPI = {
  createProperty: (data) => api.post('/properties', data),
  getProperties: (filters) => api.get('/properties', { params: filters }),
  getPropertyById: (id) => api.get(`/properties/${id}`),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

export const recommendationAPI = {
  getRecommendations: (filters) => api.get('/recommendations', { params: filters }),
  getPropertyRecommendations: (propertyId) => api.get(`/recommendations/property/${propertyId}`),
  createRecommendation: (data) => api.post('/recommendations', data),
  updateRecommendation: (id, data) => api.put(`/recommendations/${id}`, data),
  deleteRecommendation: (id) => api.delete(`/recommendations/${id}`),
};

export const valuationAPI = {
  estimateValue: (data) => api.post('/valuations/estimate', data),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getUserActivity: (period) => api.get('/analytics/user-activity', { params: { period } }),
  getProperties: () => api.get('/analytics/properties'),
  getPerformance: () => api.get('/analytics/performance'),
};

export const roiAPI = {
  generatePlan: (data) => api.post('/roi/plan', data),
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  createReminder: (data) => api.post('/notifications', data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

export const reportAPI = {
  exportValuationPdf: (data) =>
    api.post('/reports/valuation-pdf', data, {
      responseType: 'blob',
    }),
};

export default api;