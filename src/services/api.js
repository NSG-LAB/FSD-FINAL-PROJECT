import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
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