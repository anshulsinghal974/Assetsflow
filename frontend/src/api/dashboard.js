import API from './axios';

export const dashboardAPI = {
  getKPIs: () => API.get('/dashboard/kpis'),
};
