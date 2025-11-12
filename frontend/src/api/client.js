import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    const status = err?.response?.status;
    const url = err?.config?.url || '';

    // No redirigir si falló el propio login
    const isLogin = url.includes('/auth/login');

    if (status === 401 && !isLogin) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return; // corta flujo
    }
    return Promise.reject(err); // deja que el componente maneje el error
  }
);

export default api;
