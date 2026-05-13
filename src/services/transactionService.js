import api from './api';

const transactionService = {
  getAll:     (params) => api.get('/transactions', { params }),
  getById:    (id)     => api.get(`/transactions/${id}`),
  getSummary: (params) => api.get('/transactions/summary', { params }),
  create:     (data)   => api.post('/transactions', data),
  update:     (id, data) => api.put(`/transactions/${id}`, data),
  remove:     (id)     => api.delete(`/transactions/${id}`),
};

export default transactionService;
