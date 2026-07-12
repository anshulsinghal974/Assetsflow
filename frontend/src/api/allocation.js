import API from './axios';

export const allocationAPI = {
  getAll: (params) => API.get('/allocations', { params }),
  create: (data) => API.post('/allocations', data),
  returnAsset: (id, data) => API.put(`/allocations/${id}/return`, data),
};
