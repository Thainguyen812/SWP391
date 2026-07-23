import { apiClient } from '../api/apiClient';

export const dashboardService = {
  getSummaryStats: async (date) => {
    return apiClient.get('/dashboard/summary', { params: { date } });
  },

  getTopStaff: async (date) => {
    return apiClient.get('/dashboard/top-staff', { params: { date } });
  },

  getSystemAlerts: async (date) => {
    return apiClient.get('/dashboard/alerts', { params: { date } });
  },

  createBranch: async (branchData) => {
    return apiClient.post('/branches', branchData);
  },

  getMonitoringStatus: async (branchId = "HQ", floorId = "B1") => {
    return apiClient.get('/monitoring/status', { params: { branchId, floorId } });
  },

  getRecentActivities: async (branchId = "HQ", floorId = "B1") => {
    return apiClient.get('/monitoring/activities', { params: { branchId, floorId } });
  },

  getRevenueSummary: async (month, date) => {
    return apiClient.get('/revenue/summary', { params: { month, date } });
  },

  getRevenueCharts: async (month, date) => {
    return apiClient.get('/revenue/charts', { params: { month, date } });
  },

  getRevenueTransactions: async (page = 1) => {
    return apiClient.get('/revenue/transactions', { params: { page } });
  }
};
