import API from './axios';

export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
};
