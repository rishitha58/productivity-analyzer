import axios from 'axios';

// Base URLs (will be in .env later)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const NLP_URL = import.meta.env.VITE_NLP_URL || 'http://localhost:8000';

// Main API instance (Node.js Backend)
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NLP Service instance (Python FastAPI)
export const nlpApi = axios.create({
  baseURL: NLP_URL,
  timeout: 30000, // NLP processing can take longer
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

nlpApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized - logout user
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }

      // Server error
      if (status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network error - no response from server');
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

nlpApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('NLP Service error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============ AUTH SERVICE ============
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
};

export default api;