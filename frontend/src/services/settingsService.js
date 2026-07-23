import { apiClient } from '../api/apiClient';

export const settingsService = {
  // Lấy cấu hình hệ thống thật từ backend
  getSystemSettings: async () => {
    return apiClient.get('/settings/system');
  },

  // Lưu cấu hình hệ thống thật xuống backend
  saveSystemSettings: async (settingsData) => {
    return apiClient.put('/settings/system', settingsData);
  },

  // Khôi phục cấu hình mặc định
  restoreDefaultSettings: async () => {
    return apiClient.post('/settings/system/restore');
  }
};
