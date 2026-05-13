import api from './api';

const cardService = {
  getAll:      ()              => api.get('/cards'),
  create:      (data)          => api.post('/cards', data),
  update:      (id, data)      => api.put(`/cards/${id}`, data),
  remove:      (id)            => api.delete(`/cards/${id}`),
  getInvoice:  (id, params)    => api.get(`/cards/${id}/invoice`, { params }),
};

export default cardService;
