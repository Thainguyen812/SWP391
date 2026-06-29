import { apiClient } from '../api/apiClient';

export const personnelService = {
  // Lấy danh sách nhân viên thật từ backend
  getPersonnelList: async () => {
    return apiClient.get('/personnel/list');
  },

  // Lấy lịch phân ca hôm nay thật từ backend
  getTodayShifts: async () => {
    return apiClient.get('/personnel/shifts/today');
  },

  // Lấy nhật ký bàn giao ca gần nhất thật từ backend
  getLatestHandover: async () => {
    return apiClient.get('/personnel/handover/latest');
  }
};
