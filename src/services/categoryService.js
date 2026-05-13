import api from './api';

const categoryService = {
  getAll:  ()          => api.get('/categories'),
  create:  (data)      => api.post('/categories', data),
  update:  (id, data)  => api.put(`/categories/${id}`, data),
  remove:  (id)        => api.delete(`/categories/${id}`),
};

export default categoryService;
