import { apiClient } from '../api/apiClient';

export const customerService = {
  // Lấy dữ liệu thống kê khách hàng thật từ backend
  getStats: async () => {
    return apiClient.get('/customers/stats');
  },

  // Lấy danh sách khách hàng từ backend
  getCustomers: async (filter = 'all') => {
    const response = await apiClient.get('/customers');
    const realData = response.data;
    
    let filtered = realData;
    if (filter === 'month') {
      filtered = realData.filter(c => c.type === 'Tháng');
    } else if (filter === 'vip') {
      filtered = realData.filter(c => c.type === 'VIP' && c.status === 'ACTIVE');
    } else if (filter === 'pending') {
      filtered = realData.filter(c => c.type === 'VIP' && c.status === 'PENDING');
    }
    return filtered;
  },

  // Duyệt/Từ chối đăng ký VIP cho khách hàng qua backend
  approveVipSubscription: async (id, isApproved = true) => {
    if (isApproved) {
      return apiClient.post(`/vip/${id}/approve`);
    } else {
      return apiClient.post(`/vip/${id}/reject`, { reason: "Không đủ điều kiện phê duyệt" });
    }
  }
};
