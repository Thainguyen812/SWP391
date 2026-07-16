import { apiClient } from '../api/apiClient';

export const customerService = {
  // Lấy dữ liệu thống kê khách hàng thật từ backend
  getStats: async () => {
    try {
      const response = await apiClient.get('/customers');
      const allCustomers = response || [];
      
      const totalCustomers = allCustomers.length;
      const monthlyCustomers = allCustomers.filter(c => c.type === 'Tháng').length;
      const vipCustomers = allCustomers.filter(c => c.type === 'VIP' && c.status === 'ACTIVE').length;
      const expiringCustomers = allCustomers.filter(c => c.status === 'EXPIRED' || c.status === 'WARNING').length;

      return {
        total: { value: totalCustomers, trend: "Cập nhật real-time", isPositive: true },
        monthly: { value: monthlyCustomers, sub: "Đang hoạt động" },
        vip: { value: vipCustomers, sub: "Đã duyệt" },
        expired: { value: expiringCustomers, sub: "Cần xử lý" }
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        total: { value: 0, trend: "-", isPositive: true },
        monthly: { value: 0, sub: "-" },
        vip: { value: 0, sub: "-" },
        expired: { value: 0, sub: "-" }
      };
    }
  },

  // Lấy danh sách khách hàng từ backend
  getCustomers: async (filter = 'all') => {
    const response = await apiClient.get('/customers');
    const realData = response || [];
    
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
