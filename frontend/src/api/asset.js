import API from './axios';

export const assetAPI = {
  getAll: (params) => API.get('/assets', { params }),
  getById: (id) => API.get(`/assets/${id}`),
  create: (data) => API.post('/assets', data),
  update: (id, data) => API.put(`/assets/${id}`, data),
  delete: (id) => API.delete(`/assets/${id}`),
  getHistory: (id) => API.get(`/assets/${id}/history`),
};
