import API from './axios';

export const bookingAPI = {
  getAll: (params) => API.get('/bookings', { params }),
  create: (data) => API.post('/bookings', data),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
  reschedule: (id, data) => API.put(`/bookings/${id}/reschedule`, data),
};
