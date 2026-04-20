import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add CSRF token to requests
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get CSRF token from cookie
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    if (csrfToken) {
      const token = csrfToken.split('=')[1];
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
  }
  return config;
});

export const fetchCsrfCookie = async () => {
  try {
    await api.get('/sanctum/csrf-cookie');
    return true;
  } catch (error) {
    console.error('Failed to fetch CSRF cookie:', error);
    return false;
  }
};

export default api;