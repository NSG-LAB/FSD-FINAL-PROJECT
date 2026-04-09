import axios from 'axios';
import { toast } from 'react-toastify';

const readViteEnv = () => {
  try {
    return Function('return import.meta.env')();
  } catch (_) {
    return undefined;
  }
};

const viteEnv = readViteEnv() || {};
const nodeEnv = typeof process !== 'undefined' && process.env ? process.env : {};
const explicitBaseURL = viteEnv.VITE_API_URL || nodeEnv.VITE_API_URL;
const isDev = typeof viteEnv.DEV === 'boolean' ? viteEnv.DEV : nodeEnv.NODE_ENV !== 'production';
const DEV_API_CACHE_KEY = 'dev_api_base_url';
const DEFAULT_DEV_PORT = Number(viteEnv.VITE_API_PORT || nodeEnv.VITE_API_PORT || 5000);

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

  const candidatePorts = [DEFAULT_DEV_PORT, 5000, 5001, 5002, 5003, 5004, 5005]
    .filter((port, index, allPorts) => Number.isInteger(port) && port > 0 && allPorts.indexOf(port) === index);

  const probePromises = candidatePorts.map((port) => probeApiHealth(port));
  const probeResults = await Promise.all(probePromises);
  const discoveredBaseURL = probeResults.find(Boolean);

  if (discoveredBaseURL) {
    window.sessionStorage.setItem(DEV_API_CACHE_KEY, discoveredBaseURL);
    return discoveredBaseURL;
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
    resolvedBaseURLPromise = resolveDevBaseURL().then((resolvedBaseURL) => {
      // If backend is temporarily unavailable, avoid pinning fallback forever.
      if (resolvedBaseURL === '/api') {
        resolvedBaseURLPromise = null;
      }

      return resolvedBaseURL;
    });
  }

  return resolvedBaseURLPromise;
};

export const primeApiConnection = () => getResolvedBaseURL().catch(() => '/api');

const api = axios.create({
  baseURL: explicitBaseURL || '/api',
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

const getApiErrorMessage = (error, fallbackMessage = 'Request failed. Please try again.') => {
  const responseMessage = error?.response?.data?.message;

  if (responseMessage && typeof responseMessage === 'string') {
    return responseMessage;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection and retry.';
  }

  if (!error?.response) {
    return 'Unable to reach the server. Please check your connection and retry.';
  }

  return fallbackMessage;
};

export const showApiErrorToast = ({
  error,
  fallbackMessage,
  onRetry,
}) => {
  const message = getApiErrorMessage(error, fallbackMessage);

  toast.error(
    ({ closeToast }) => (
      <div className="space-y-2">
        <p className="text-sm">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={() => {
              closeToast?.();
              onRetry();
            }}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            Retry
          </button>
        )}
      </div>
    ),
    {
      autoClose: false,
      closeOnClick: false,
    }
  );
};

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

if (typeof window !== 'undefined') {
  // Warm up API base URL discovery so the first user action does not pay this cost.
  primeApiConnection();
}

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  getProfileSummary: () => api.get('/users/profile/summary'),
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
  getPersonalizedRecommendations: (params) =>
    api.get('/recommendations', { params: { ...params, sortBy: 'personalized' } }),
  getPropertyRecommendations: (propertyId, params) => api.get(`/recommendations/property/${propertyId}`, { params }),
  createRecommendation: (data) => api.post('/recommendations', data),
  updateRecommendation: (id, data) => api.put(`/recommendations/${id}`, data),
  deleteRecommendation: (id) => api.delete(`/recommendations/${id}`),
};

export const valuationAPI = {
  estimateValue: (data) => api.post('/valuations/estimate', data),
  estimateRenovationCost: (data) => api.post('/valuations/cost-estimate', data),
};

export const renovationProjectAPI = {
  getProjects: (params) => api.get('/renovation-projects', { params }),
  getUpliftSpendAnalytics: (params) => api.get('/renovation-projects/analytics/uplift-vs-spend', { params }),
  exportProjectsCsv: (params) =>
    api.get('/renovation-projects/export/csv', {
      params,
      responseType: 'blob',
    }),
  getProjectById: (id) => api.get(`/renovation-projects/${id}`),
  createProject: (data) => api.post('/renovation-projects', data),
  updateProject: (id, data) => api.put(`/renovation-projects/${id}`, data),
  updateTasks: (id, data) => api.patch(`/renovation-projects/${id}/tasks`, data),
  updateBudget: (id, data) => api.patch(`/renovation-projects/${id}/budget`, data),
  addTimelineEntry: (id, data) => api.post(`/renovation-projects/${id}/timeline`, data),
  deleteProject: (id) => api.delete(`/renovation-projects/${id}`),
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

export const enhancementChecklistAPI = {
  getByPropertyBefore: (propertyId) => api.get(`/enhancement-checklist/${propertyId}/before`),
  getByPropertyAfter: (propertyId) => api.get(`/enhancement-checklist/${propertyId}/after`),
  updateItem: (id, data) => api.put(`/enhancement-checklist/${id}`, data),
  uploadFiles: (id, formData) => api.post(`/enhancement-checklist/upload/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (id, url) => api.delete(`/enhancement-checklist/file/${id}`, { data: { url } }),
};

export default api;