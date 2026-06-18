import { apiClient } from '../api/apiClient';

const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';
const MOCK_DELAY = 800;

export const logService = {
  // Lấy danh sách nhật ký cổng (Parking Sessions)
  getParkingSessions: async () => {
    if (!isMock) {
      return apiClient.get('/sessions');
    }
    // Return empty array if mock, we will rely on backend for this feature
    return Promise.resolve([]);
  },

  // Lấy danh sách nhật ký hệ thống
  getSystemLogs: async (params = {}) => {
    if (!isMock) {
      return apiClient.get('/logs', { params });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Dữ liệu mock
        const mockLogs = [
          {
            id: "LOG001",
            timestamp: "2023-10-24T14:30:00",
            eventType: "SECURITY",
            user: "Nguyễn Văn Admin",
            role: "ADMIN",
            action: "Thay đổi chính sách mật khẩu: Yêu cầu độ phức tạp cao.",
            location: "Toàn hệ thống",
            ipAddress: "192.168.1.100",
            status: "success"
          },
          {
            id: "LOG002",
            timestamp: "2023-10-24T14:15:22",
            eventType: "SYSTEM",
            user: "Hệ thống",
            role: "SYSTEM",
            action: "Mất kết nối Camera LPR tại Cổng 03 (Vào).",
            location: "Cơ sở 01 - Tầng hầm B1",
            ipAddress: "10.0.0.45",
            status: "error"
          },
          {
            id: "LOG003",
            timestamp: "2023-10-24T13:45:10",
            eventType: "AUTH",
            user: "Lê Thị B",
            role: "MANAGER",
            action: "Đăng nhập hệ thống thành công.",
            location: "Cơ sở 02",
            ipAddress: "192.168.2.15",
            status: "success"
          },
          {
            id: "LOG004",
            timestamp: "2023-10-24T13:10:05",
            eventType: "CONFIG",
            user: "Trần Văn C",
            role: "ADMIN",
            action: "Cập nhật giá cước gửi xe theo giờ (Tăng 10%).",
            location: "Toàn hệ thống",
            ipAddress: "192.168.1.102",
            status: "warning"
          },
          {
            id: "LOG005",
            timestamp: "2023-10-24T12:05:00",
            eventType: "AUTH",
            user: "Hacker123",
            role: "UNKNOWN",
            action: "Cố gắng đăng nhập sai mật khẩu 5 lần. Đã khóa IP.",
            location: "Ngoại mạng",
            ipAddress: "203.0.113.42",
            status: "error"
          },
          {
            id: "LOG006",
            timestamp: "2023-10-24T11:30:00",
            eventType: "SYSTEM",
            user: "Hệ thống",
            role: "SYSTEM",
            action: "Đồng bộ hóa dữ liệu sao lưu định kỳ hoàn tất.",
            location: "Cloud Backup",
            ipAddress: "N/A",
            status: "success"
          },
          {
            id: "LOG007",
            timestamp: "2023-10-24T09:15:00",
            eventType: "STAFF",
            user: "Phạm Minh D",
            role: "STAFF",
            action: "Mở thanh chắn Barrier thủ công (Cổng 01 - Ra) do lỗi thẻ cứng.",
            location: "Cơ sở 01 - Tầng T1",
            ipAddress: "10.0.0.22",
            status: "warning"
          },
          {
            id: "LOG008",
            timestamp: "2023-10-24T08:00:00",
            eventType: "AUTH",
            user: "Nguyễn Văn Admin",
            role: "ADMIN",
            action: "Đăng nhập hệ thống thành công.",
            location: "Toàn hệ thống",
            ipAddress: "192.168.1.100",
            status: "success"
          }
        ];

        // Giả lập lọc dữ liệu đơn giản
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

  // Xuất báo cáo logs
  exportLogs: async (params = {}) => {
    if (!isMock) {
      return apiClient.get('/logs/export', { params, responseType: 'blob' });
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Export file CSV thành công", fileUrl: "/mock-downloads/system-logs.csv" });
      }, MOCK_DELAY * 2);
    });
  }
};
