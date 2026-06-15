import { apiClient } from '../api/apiClient';

// Giả lập độ trễ mạng 1 giây
const MOCK_DELAY = 1000;

// Lấy cờ từ cấu hình môi trường (.env)
const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const settingsService = {
  // Lấy dữ liệu cấu hình
  getSystemSettings: async () => {
    if (!isMock) {
      return apiClient.get('/settings/system');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          camera: {
            status: 'online',
            lanVao: {
              ip: '192.168.1.101',
              confidence: 85,
              nightMode: true
            },
            lanRa: {
              ip: '192.168.1.102',
              confidence: 90,
              nightMode: true
            }
          },
          barrier: {
            speed: '3.0s',
            autoCloseDelay: 5,
            antiCrash: true
          },
          sensors: {
            loopIn: {
              active: true,
              frequency: 'medium' // 'low', 'medium', 'high'
            },
            loopOut: {
              active: true,
              frequency: 'low'
            }
          },
          network: {
            ipServer: '192.168.1.100',
            subnetMask: '255.255.255.0',
            gateway: '192.168.1.1'
          },
          firmware: {
            currentVersion: 'v2.4.1-build890',
            lastUpdated: '12/10/2023 14:30',
            hasUpdate: true,
            newVersion: 'v2.5.0',
            updateNotes: 'Bao gồm cải thiện thuật toán LPR ban đêm.'
          }
        });
      }, MOCK_DELAY);
    });
  },

  // Giả lập lưu cấu hình
  saveSystemSettings: async (settingsData) => {
    if (!isMock) {
      return apiClient.put('/settings/system', settingsData);
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Lưu cấu hình thành công' });
      }, 800);
    });
  }
};
