// frontend/src/api/client.js
import axios from 'axios';

const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: base,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  r => r,
  (err) => {
    // manejo mínimo de errores: si es 401 forzar logout
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // no redirijo aquí para no acoplar a router; componentes pueden manejar
    }
    return Promise.reject(err);
  }
);

export default api;
