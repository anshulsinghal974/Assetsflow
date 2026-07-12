import API from './axios';

export const maintenanceAPI = {
  getAll: (params) => API.get('/maintenance', { params }),
  create: (data) => API.post('/maintenance', data),
  approve: (id) => API.put(`/maintenance/${id}/approve`),
  reject: (id) => API.put(`/maintenance/${id}/reject`),
  resolve: (id) => API.put(`/maintenance/${id}/resolve`),
};
