import { apiClient } from '../api/apiClient';

export const dashboardService = {
  getSummaryStats: async () => {
    return apiClient.get('/dashboard/summary');
  },

  getTopStaff: async () => {
    return apiClient.get('/dashboard/top-staff');
  },

  getSystemAlerts: async () => {
    return apiClient.get('/dashboard/alerts');
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

  getRevenueSummary: async (month) => {
    return apiClient.get('/revenue/summary', { params: { month } });
  },

  getRevenueCharts: async (month) => {
    return apiClient.get('/revenue/charts', { params: { month } });
  },

  getRevenueTransactions: async (page = 1) => {
    return apiClient.get('/revenue/transactions', { params: { page } });
  }
};
