import axios from 'axios';

// Normalize base API URL
const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return 'https://veeduvadagaiku-web-production.up.railway.app';
  }
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, '');
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vv_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't loop redirect if already on login/register/public routes
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/admin/login')) {
        localStorage.removeItem('vv_token');
        localStorage.removeItem('vv_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
