import API from './axios';

export const employeeAPI = {
  getAll: (params) => API.get('/employees', { params }),
  getById: (id) => API.get(`/employees/${id}`),
  promote: (id, data) => API.put(`/employees/${id}/promote`, data),
};
