import { apiClient } from '../api/apiClient';

const MOCK_DELAY = 800;
const isMock = false; // B?t bu?c dùng Mock vì Backend chua làm API này

export const securityService = {
  getSecurityPolicies: async () => {
    if (!isMock) {
      return apiClient.get('/security/policies');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          is2FAEnabled: true,
          sessionTimeoutDesktop: '30 PhÃºt',
          sessionTimeoutMobile: '4 Giá»',
          passwordMinLength: 12,
          passwordRequireSpecial: true,
          passwordRequireNumber: true
        });
      }, MOCK_DELAY);
    });
  },

  getRBACStats: async () => {
    if (!isMock) {
      return apiClient.get('/security/stats');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: "Super Admin", count: 3, color: "bg-red-500" },
          { id: 2, name: "Quáº£n lÃ½ CÆ¡ sá»Ÿ", count: 12, color: "bg-blue-600" },
          { id: 3, name: "Káº¿ toÃ¡n", count: 5, color: "bg-emerald-500" },
          { id: 4, name: "NhÃ¢n viÃªn BÃ£i xe", count: 48, color: "bg-slate-500" },
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
            content: "Admin NguyenV Ä‘Ã£ cáº­p nháº­t chÃ­nh sÃ¡ch máº­t kháº©u.",
            time: "10:45 AM - HÃ´m nay",
          },
          {
            id: 2,
            type: "warning",
            content: "ÄÄƒng nháº­p tháº¥t báº¡i (x3) tÃ i khoáº£n nhanvien_bx02.",
            time: "09:12 AM - HÃ´m nay",
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
        resolve({ success: true, message: "LÆ°u cáº¥u hÃ¬nh thÃ nh cÃ´ng" });
      }, 500);
    });
  }
};
