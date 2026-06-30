import { apiClient } from '../api/apiClient';

export const logService = {
  // Lấy danh sách nhật ký cổng (Parking Sessions) thật từ backend
  getParkingSessions: async () => {
    return apiClient.get('/sessions');
  },

  // Lấy danh sách nhật ký hệ thống thật từ backend
  getSystemLogs: async (params = {}) => {
    return apiClient.get('/logs', { params });
  },

  // Xuất báo cáo nhật ký từ backend
  exportLogs: async (params = {}) => {
    return apiClient.get('/logs/export', { params, responseType: 'blob' });
  }
};
