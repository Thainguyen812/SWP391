import { apiClient } from '../api/apiClient';

export const customerService = {
  // Lấy dữ liệu thống kê khách hàng thật từ backend
  getStats: async () => {
    return apiClient.get('/customers/stats');
  },

  // Lấy danh sách khách hàng từ backend
  getCustomers: async (filter = 'all') => {
    if (filter === 'pending') {
      const response = await apiClient.get('/customers/pending-vips');
      return Array.isArray(response) ? response : [];
    }

    const response = await apiClient.get('/customers');
    const realData = Array.isArray(response) ? response : [];
    
    let filtered = realData;
    if (filter === 'month') {
      filtered = realData.filter(c => c.type === 'Registered' || c.type === 'Driver');
    } else if (filter === 'vip') {
      filtered = realData.filter(c => c.type === 'VIP' && c.status === 'ACTIVE');
    }
    return filtered;
  },

  // Duyệt/Từ chối đăng ký VIP cho khách hàng qua backend
  approveVipSubscription: async (id, isApproved = true, reason = "Không đủ điều kiện phê duyệt") => {
    if (isApproved) {
      return apiClient.post(`/vip/${id}/approve`);
    } else {
      return apiClient.post(`/vip/${id}/reject`, { reason });
    }
  },

  // Thêm khách hàng mới
  addCustomer: async (data) => {
    return apiClient.post('/customers', data);
  },

  // Chỉnh sửa khách hàng
  updateCustomer: async (id, data) => {
    return apiClient.put(`/customers/${id}`, data);
  },

  // Lịch sử gửi xe
  getCustomerHistory: async (id) => {
    return apiClient.get(`/customers/${id}/history`);
  },

  // Gia hạn thẻ
  renewCustomer: async (subscriptionId) => {
    return apiClient.post(`/customers/renew/${subscriptionId}`);
  }
};
