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

  // Lấy phân ca tuần
  getWeeklyShifts: async () => {
    return apiClient.get('/personnel/shifts/weekly');
  },

  // Cập nhật phân ca tuần
  updateWeeklyShifts: async (data) => {
    return apiClient.post('/personnel/shifts/weekly/update', data);
  },

  // Lấy nhật ký bàn giao ca gần nhất thật từ backend
  getLatestHandover: async () => {
    return apiClient.get('/personnel/handover/latest');
  },

  // Lấy lịch sử tất cả bàn giao ca
  getHandoverHistory: async () => {
    return apiClient.get('/personnel/handover/history');
  },

  // Thêm nhân viên mới
  addPersonnel: async (data) => {
    return apiClient.post('/personnel/add', data);
  },

  // Sắp xếp ca trực (giả định dùng chung route shift/handover cho demo hoặc gọi shift api nếu có)
  scheduleShift: async (data) => {
    return apiClient.post('/shifts/handover', data); 
  },

  // Xóa nhân viên
  deletePersonnel: async (id) => {
    return apiClient.delete(`/personnel/delete/${id}`);
  }
};
