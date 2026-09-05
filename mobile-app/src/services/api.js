import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// ⚠️ API URL Configuration ⚠️
// Live backend URL on Vercel:
// ============================================================================
const VERCEL_BACKEND_URL = 'https://backend-six-amber-19.vercel.app/api';

// For local development on physical device on same WiFi:
const LOCAL_BACKEND_URL = 'http://10.66.207.180:5000/api';

// Set to true to connect to Production Backend (REQUIRED for Standalone APK builds)
const USE_PROD = true;

export const API_URL = USE_PROD ? VERCEL_BACKEND_URL : LOCAL_BACKEND_URL;
export const ADMIN_URL = USE_PROD
  ? 'https://backend-six-amber-19.vercel.app/admin'
  : 'http://10.66.207.180:5000/admin';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const menuAPI = {
  getAll: (category) => api.get('/menu', { params: { category } }),
  getById: (id) => api.get(`/menu/${id}`),
  getPopular: () => api.get('/menu/popular'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  rate: (id, data) => api.post(`/orders/${id}/rate`, data),
};

export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;