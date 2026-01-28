import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to headers
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

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users'),
};

// Property APIs
export const propertyAPI = {
  createProperty: (data) => api.post('/properties', data),
  getProperties: (filters) => api.get('/properties', { params: filters }),
  getPropertyById: (id) => api.get(`/properties/${id}`),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

// Recommendation APIs
export const recommendationAPI = {
  getRecommendations: (filters) => api.get('/recommendations', { params: filters }),
  getPropertyRecommendations: (propertyId) => api.get(`/recommendations/property/${propertyId}`),
  createRecommendation: (data) => api.post('/recommendations', data),
  updateRecommendation: (id, data) => api.put(`/recommendations/${id}`, data),
  deleteRecommendation: (id) => api.delete(`/recommendations/${id}`),
};

export default api;
