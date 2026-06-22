import { apiClient } from '../api/apiClient';

// Giáº£ láº­p Ä‘á»™ trá»… máº¡ng 1 giÃ¢y
const MOCK_DELAY = 1000;

// Láº¥y cá» tá»« cáº¥u hÃ¬nh mÃ´i trÆ°á»ng (.env)
const isMock = true; // B?t bu?c dùng Mock vì Backend chua làm API này

export const settingsService = {
  // Láº¥y dá»¯ liá»‡u cáº¥u hÃ¬nh
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
            updateNotes: 'Bao gá»“m cáº£i thiá»‡n thuáº­t toÃ¡n LPR ban Ä‘Ãªm.'
          }
        });
      }, MOCK_DELAY);
    });
  },

  // Giáº£ láº­p lÆ°u cáº¥u hÃ¬nh
  saveSystemSettings: async (settingsData) => {
    if (!isMock) {
      return apiClient.put('/settings/system', settingsData);
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'LÆ°u cáº¥u hÃ¬nh thÃ nh cÃ´ng' });
      }, 800);
    });
  }
};
