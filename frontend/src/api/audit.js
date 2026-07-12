import API from './axios';

export const auditAPI = {
  getCycles: (params) => API.get('/audits', { params }),
  createCycle: (data) => API.post('/audits', data),
  getCycleById: (id) => API.get(`/audits/${id}`),
  updateItem: (cycleId, itemId, data) => API.put(`/audits/${cycleId}/items/${itemId}`, data),
  closeCycle: (id) => API.put(`/audits/${id}/close`),
};
