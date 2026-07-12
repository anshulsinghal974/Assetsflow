import API from './axios';

export const transferAPI = {
  getAll: (params) => API.get('/transfers', { params }),
  create: (data) => API.post('/transfers', data),
  approve: (id) => API.put(`/transfers/${id}/approve`),
  reject: (id) => API.put(`/transfers/${id}/reject`),
};
