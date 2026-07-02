import { apiClient } from '../api/apiClient';

export const customerService = {
  // Lấy dữ liệu thống kê khách hàng thật từ backend
  getStats: async () => {
    return apiClient.get('/customers/stats');
  },

  // Lấy danh sách khách hàng thật từ danh sách users của backend
  getCustomers: async (filter = 'all') => {
    const response = await apiClient.get('/users');
    const realData = response.data.map(u => ({
      id: u.id,
      name: u.fullName || u.username,
      phone: u.phone || "N/A",
      plate: "N/A", // Trường biển số xe chưa được tích hợp trực tiếp trong model User
      type: u.role === "VIP" ? "VIP" : "Tháng",
      status: u.status,
      expireDate: "N/A"
    }));
    
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

  // Duyệt đăng ký VIP cho khách hàng qua backend
  approveVipSubscription: async (id, isApproved = true) => {
    if (isApproved) {
      // Gọi API duyệt VIP của BE
      return apiClient.post(`/vip/${id}/approve`);
    } else {
      // Gọi API từ chối VIP của BE kèm lý do mặc định (hoặc truyền lý do từ UI)
      return apiClient.post(`/vip/${id}/reject`, { reason: "Không đủ điều kiện phê duyệt" });
    }
  }
};
