import { apiClient } from '../api/apiClient';

const MOCK_DELAY = 800;
const isMock = true; // B?t bu?c d�ng Mock v� Backend chua l�m API n�y

export const securityService = {
  getSecurityPolicies: async () => {
    if (!isMock) {
      return apiClient.get('/security/policies');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          is2FAEnabled: true,
          sessionTimeoutDesktop: '30 Phút',
          sessionTimeoutMobile: '4 Giờ',
          passwordMinLength: 12,
          passwordRequireSpecial: true,
          passwordRequireNumber: true
        });
      }, MOCK_DELAY);
    });
  },

  getRBACStats: async () => {
    if (!isMock) {
      return apiClient.get('/security/rbac-stats');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: "Super Admin", count: 3, color: "bg-red-500" },
          { id: 2, name: "Quản lý Cơ sở", count: 12, color: "bg-blue-600" },
          { id: 3, name: "Kế toán", count: 5, color: "bg-emerald-500" },
          { id: 4, name: "Nhân viên Bãi xe", count: 48, color: "bg-slate-500" },
        ]);
      }, MOCK_DELAY);
    });
  },

  getSecurityLogs: async () => {
    if (!isMock) {
      return apiClient.get('/security/logs');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            type: "success",
            content: "Admin NguyenV đã cập nhật chính sách mật khẩu.",
            time: "10:45 AM - Hôm nay",
          },
          {
            id: 2,
            type: "warning",
            content: "Đăng nhập thất bại (x3) tài khoản nhanvien_bx02.",
            time: "09:12 AM - Hôm nay",
          },
        ]);
      }, MOCK_DELAY);
    });
  },

  saveSecurityPolicies: async (policies) => {
    if (!isMock) {
      return apiClient.post('/security/policies', policies);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Lưu cấu hình thành công" });
      }, 500);
    });
  }
};
