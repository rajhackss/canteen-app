import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// ⚠️ API URL Configuration ⚠️
// When compiling into an APK, ensure your live Render backend URL is set here:
// Example: 'https://canteen-backend.onrender.com/api'
// ============================================================================
const RENDER_BACKEND_URL = 'https://canteen-app-ltsi.onrender.com/api';

// For local development on physical device on same WiFi:
const LOCAL_BACKEND_URL = 'http://10.66.207.180:5000/api';

// Set to true to connect to Render (REQUIRED for Standalone APK builds)
const USE_RENDER = true;

export const API_URL = USE_RENDER ? RENDER_BACKEND_URL : LOCAL_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};

export default api;