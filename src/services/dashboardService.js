import api from './api';

const dashboardService = {
  getData: (params) => api.get('/dashboard', { params }),
};

export default dashboardService;
