import API from './axios';

export const deptAPI = {
  getAll: (params) => API.get('/departments', { params }),
  create: (data) => API.post('/departments', data),
  update: (id, data) => API.put(`/departments/${id}`, data),
  delete: (id) => API.delete(`/departments/${id}`),
};
