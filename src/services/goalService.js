import api from './api';

const goalService = {
  getAll:  ()          => api.get('/goals'),
  getById: (id)        => api.get(`/goals/${id}`),
  create:  (data)      => api.post('/goals', data),
  update:  (id, data)  => api.put(`/goals/${id}`, data),
  remove:  (id)        => api.delete(`/goals/${id}`),
};

export default goalService;
