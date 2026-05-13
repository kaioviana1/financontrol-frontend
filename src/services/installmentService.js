import api from './api';

const installmentService = {
  getAll:   (params)     => api.get('/installments', { params }),
  getById:  (id)         => api.get(`/installments/${id}`),
  create:   (data)       => api.post('/installments', data),
  update:   (id, data)   => api.put(`/installments/${id}`, data),
  remove:   (id)         => api.delete(`/installments/${id}`),
  pay:      (id)         => api.put(`/installments/${id}/pay`),
  unpay:    (id)         => api.put(`/installments/${id}/unpay`),
};

export default installmentService;
