import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL    || 'http://localhost:3000/api';
const TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT) || 15_000;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: TIMEOUT,
});

/* ── Request interceptor ──────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor ─────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Token expirado ou inválido — força logout
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.replace('/login');
      return Promise.reject(error);
    }

    // Rate limit — informa ao chamador
    if (status === 429) {
      const retry = error.response.headers['retry-after'];
      error.message = retry
        ? `Muitas requisições. Tente novamente em ${retry}s.`
        : 'Muitas requisições. Aguarde um momento.';
      return Promise.reject(error);
    }

    // Servidor em manutenção
    if (status === 503) {
      error.message = 'Serviço temporariamente indisponível. Tente novamente em breve.';
      return Promise.reject(error);
    }

    // Timeout ou sem rede
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      error.message = 'Sem conexão com o servidor. Verifique sua internet.';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
