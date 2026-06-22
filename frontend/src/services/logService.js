import { apiClient } from '../api/apiClient';

const isMock = true; // B?t bu?c dùng Mock vì Backend chua làm API này
const MOCK_DELAY = 800;

export const logService = {
  // Láº¥y danh sÃ¡ch nháº­t kÃ½ cá»•ng (Parking Sessions)
  getParkingSessions: async () => {
    if (!isMock) {
      return apiClient.get('/sessions');
    }
    // Return empty array if mock, we will rely on backend for this feature
    return Promise.resolve([]);
  },

  // Láº¥y danh sÃ¡ch nháº­t kÃ½ há»‡ thá»‘ng
  getSystemLogs: async (params = {}) => {
    if (!isMock) {
      return apiClient.get('/logs', { params });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Dá»¯ liá»‡u mock
        const mockLogs = [
          {
            id: "LOG001",
            timestamp: "2023-10-24T14:30:00",
            eventType: "SECURITY",
            user: "Nguyá»…n VÄƒn Admin",
            role: "ADMIN",
            action: "Thay Ä‘á»•i chÃ­nh sÃ¡ch máº­t kháº©u: YÃªu cáº§u Ä‘á»™ phá»©c táº¡p cao.",
            location: "ToÃ n há»‡ thá»‘ng",
            ipAddress: "192.168.1.100",
            status: "success"
          },
          {
            id: "LOG002",
            timestamp: "2023-10-24T14:15:22",
            eventType: "SYSTEM",
            user: "Há»‡ thá»‘ng",
            role: "SYSTEM",
            action: "Máº¥t káº¿t ná»‘i Camera LPR táº¡i Cá»•ng 03 (VÃ o).",
            location: "CÆ¡ sá»Ÿ 01 - Táº§ng háº§m B1",
            ipAddress: "10.0.0.45",
            status: "error"
          },
          {
            id: "LOG003",
            timestamp: "2023-10-24T13:45:10",
            eventType: "AUTH",
            user: "LÃª Thá»‹ B",
            role: "MANAGER",
            action: "ÄÄƒng nháº­p há»‡ thá»‘ng thÃ nh cÃ´ng.",
            location: "CÆ¡ sá»Ÿ 02",
            ipAddress: "192.168.2.15",
            status: "success"
          },
          {
            id: "LOG004",
            timestamp: "2023-10-24T13:10:05",
            eventType: "CONFIG",
            user: "Tráº§n VÄƒn C",
            role: "ADMIN",
            action: "Cáº­p nháº­t giÃ¡ cÆ°á»›c gá»­i xe theo giá» (TÄƒng 10%).",
            location: "ToÃ n há»‡ thá»‘ng",
            ipAddress: "192.168.1.102",
            status: "warning"
          },
          {
            id: "LOG005",
            timestamp: "2023-10-24T12:05:00",
            eventType: "AUTH",
            user: "Hacker123",
            role: "UNKNOWN",
            action: "Cá»‘ gáº¯ng Ä‘Äƒng nháº­p sai máº­t kháº©u 5 láº§n. ÄÃ£ khÃ³a IP.",
            location: "Ngoáº¡i máº¡ng",
            ipAddress: "203.0.113.42",
            status: "error"
          },
          {
            id: "LOG006",
            timestamp: "2023-10-24T11:30:00",
            eventType: "SYSTEM",
            user: "Há»‡ thá»‘ng",
            role: "SYSTEM",
            action: "Äá»“ng bá»™ hÃ³a dá»¯ liá»‡u sao lÆ°u Ä‘á»‹nh ká»³ hoÃ n táº¥t.",
            location: "Cloud Backup",
            ipAddress: "N/A",
            status: "success"
          },
          {
            id: "LOG007",
            timestamp: "2023-10-24T09:15:00",
            eventType: "STAFF",
            user: "Pháº¡m Minh D",
            role: "STAFF",
            action: "Má»Ÿ thanh cháº¯n Barrier thá»§ cÃ´ng (Cá»•ng 01 - Ra) do lá»—i tháº» cá»©ng.",
            location: "CÆ¡ sá»Ÿ 01 - Táº§ng T1",
            ipAddress: "10.0.0.22",
            status: "warning"
          },
          {
            id: "LOG008",
            timestamp: "2023-10-24T08:00:00",
            eventType: "AUTH",
            user: "Nguyá»…n VÄƒn Admin",
            role: "ADMIN",
            action: "ÄÄƒng nháº­p há»‡ thá»‘ng thÃ nh cÃ´ng.",
            location: "ToÃ n há»‡ thá»‘ng",
            ipAddress: "192.168.1.100",
            status: "success"
          }
        ];

        // Giáº£ láº­p lá»c dá»¯ liá»‡u Ä‘Æ¡n giáº£n
        let filteredData = [...mockLogs];
        
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredData = filteredData.filter(log => 
            log.action.toLowerCase().includes(keyword) || 
            log.user.toLowerCase().includes(keyword) ||
            log.id.toLowerCase().includes(keyword)
          );
        }

        if (params.eventType && params.eventType !== 'ALL') {
          filteredData = filteredData.filter(log => log.eventType === params.eventType);
        }

        resolve({
          data: filteredData,
          total: filteredData.length,
          page: params.page || 1,
          limit: params.limit || 10
        });
      }, MOCK_DELAY);
    });
  },

  // Xuáº¥t bÃ¡o cÃ¡o logs
  exportLogs: async (params = {}) => {
    if (!isMock) {
      return apiClient.get('/logs/export', { params, responseType: 'blob' });
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Export file CSV thÃ nh cÃ´ng", fileUrl: "/mock-downloads/system-logs.csv" });
      }, MOCK_DELAY * 2);
    });
  }
};
