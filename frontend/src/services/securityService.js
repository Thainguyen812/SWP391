import { apiClient } from '../api/apiClient';

export const securityService = {
  // Lấy các chính sách bảo mật thật từ backend
  getSecurityPolicies: async () => {
    return apiClient.get('/security/policies');
  },

  // Lấy thống kê phân quyền (RBAC) thật từ backend
  getRBACStats: async () => {
    return apiClient.get('/security/rbac-stats');
  },

  // Lấy nhật ký bảo mật thật từ backend
  getSecurityLogs: async () => {
    return apiClient.get('/security/logs');
  },

  // Lưu chính sách bảo mật thật xuống backend
  saveSecurityPolicies: async (policies) => {
    return apiClient.post('/security/policies', policies);
  }
};
