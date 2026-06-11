import { apiClient } from '../api/apiClient';

const MOCK_DELAY = 1000; // Giả lập độ trễ mạng 1 giây

// Lấy cờ từ cấu hình môi trường (.env)
// Nếu bằng 'true' (string), hệ thống sẽ dùng dữ liệu giả. Nếu 'false', nó sẽ gọi API.
const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const dashboardService = {
  // Lấy dữ liệu 4 thẻ thống kê trên cùng
  getSummaryStats: async () => {
    if (!isMock) {
      // Dùng Real API
      return apiClient.get('/dashboard/summary');
    }

    // Dùng Mock Data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalRevenue: {
            value: "45.2",
            unit: "Tr",
            trend: "+12% so với hôm qua",
            isPositive: true
          },
          activeSessions: {
            value: "1,248",
            trend: null,
            progress: 60 // %
          },
          occupancyRate: {
            value: "85%",
            trend: "Tối ưu: 80-90%",
            isOptimal: true
          },
          issues: {
            value: "03",
            trend: "Xem chi tiết",
            isWarning: true
          }
        });
      }, MOCK_DELAY);
    });
  },

  // Lấy danh sách nhân viên xuất sắc
  getTopStaff: async () => {
    if (!isMock) {
      // Dùng Real API
      return apiClient.get('/dashboard/top-staff');
    }

    // Dùng Mock Data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: "Nguyễn Văn A", location: "Cổng Ra 01", count: 342, rank: 1, initial: "N" },
          { id: 2, name: "Trần Thị B", location: "Cổng Vào 02", count: 315, rank: 2, initial: "T" },
          { id: 3, name: "Lê Văn C", location: "Tuần tra Khu B", count: 289, rank: 3, initial: "L" },
        ]);
      }, MOCK_DELAY);
    });
  },

  // Lấy danh sách thông báo hệ thống
  getSystemAlerts: async () => {
    if (!isMock) {
      // Dùng Real API
      return apiClient.get('/dashboard/alerts');
    }

    // Dùng Mock Data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: "Mất kết nối Camera LPR Cổng 03",
            description: "Hệ thống không nhận được tín hiệu từ Camera C03 trong 5 phút qua. Yêu cầu kiểm tra kỹ thuật ngay lập tức.",
            time: "10 PHÚT TRƯỚC",
            actionText: "Chỉ định kỹ thuật",
            type: "error"
          },
          {
            id: 2,
            title: "Cảnh báo đầy bãi - Khu vực Tầng hầm 1",
            description: "Công suất hiện tại đạt 95%. Hệ thống tự động chuyển hướng xe mới xuống Tầng hầm 2.",
            time: "45 PHÚT TRƯỚC",
            actionText: null,
            type: "warning"
          },
          {
            id: 3,
            title: "Cập nhật phần mềm Barrier v2.1 hoàn tất",
            description: "Tất cả các cổng kiểm soát đã được đồng bộ phiên bản mới nhất.",
            time: "2 GIỜ TRƯỚC",
            actionText: null,
            type: "success"
          }
        ]);
      }, MOCK_DELAY);
    });
  },

  // Gọi API tạo cơ sở mới
  createBranch: async (branchData) => {
    if (!isMock) {
      // Dùng Real API
      return apiClient.post('/branches', branchData);
    }

    // Dùng Mock Data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Giả lập thành công 100%
        console.log("Mock API nhận dữ liệu Create Branch:", branchData);
        resolve({ success: true, message: "Thêm cơ sở thành công", data: { id: Date.now(), ...branchData } });
      }, MOCK_DELAY * 1.5);
    });
  },

  // --- TRANG GIÁM SÁT BÃI XE ---

  // Lấy trạng thái bãi xe hiện tại
  getMonitoringStatus: async (branchId = "HQ", floorId = "B1") => {
    if (!isMock) {
      return apiClient.get('/monitoring/status', { params: { branchId, floorId } });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        if (floorId === "B2") {
          resolve({
            totalCapacity: 800,
            currentlyParked: 350,
            parkedPercentage: 43,
            availableSpots: 450,
            vipVehicles: 15
          });
        } else if (floorId === "T1") {
          resolve({
            totalCapacity: 500,
            currentlyParked: 490,
            parkedPercentage: 98,
            availableSpots: 10,
            vipVehicles: 5
          });
        } else {
          // Mặc định B1
          resolve({
            totalCapacity: 1500,
            currentlyParked: 1248,
            parkedPercentage: 83,
            availableSpots: 252,
            vipVehicles: 42
          });
        }
      }, MOCK_DELAY);
    });
  },

  // Lấy danh sách hoạt động vào ra gần đây
  getRecentActivities: async (branchId = "HQ", floorId = "B1") => {
    if (!isMock) {
      return apiClient.get('/monitoring/activities', { params: { branchId, floorId } });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const activitiesB1 = [
          { id: 1, plateNumber: "51A-892.44", vehicleType: "Sedan", location: "Cổng vào 1", time: "10:42:15", status: "Vào", isVip: false },
          { id: 2, plateNumber: "29C-123.99", vehicleType: "SUV", location: "Cổng ra 2", time: "10:40:05", status: "Ra", isVip: false },
          { id: 3, plateNumber: "30F-999.99", vehicleType: "Sang trọng", location: "VIP Làn 1", time: "10:38:22", status: "Vào", isVip: true },
          { id: 4, plateNumber: "60A-112.33", vehicleType: "Hatchback", location: "Cổng vào 2", time: "10:35:10", status: "Vào", isVip: false }
        ];

        const activitiesB2 = [
          { id: 5, plateNumber: "61C-555.22", vehicleType: "Tải nhỏ", location: "Hầm B2 Lối 1", time: "10:45:10", status: "Ra", isVip: false },
          { id: 6, plateNumber: "51G-111.00", vehicleType: "SUV", location: "Hầm B2 Lối 2", time: "10:41:00", status: "Vào", isVip: false },
          { id: 7, plateNumber: "99A-999.99", vehicleType: "Sang trọng", location: "VIP B2", time: "10:30:15", status: "Ra", isVip: true }
        ];
        
        const activitiesT1 = [
          { id: 8, plateNumber: "29A-123.45", vehicleType: "Sedan", location: "Cổng chính", time: "10:46:12", status: "Vào", isVip: false },
          { id: 9, plateNumber: "30E-678.90", vehicleType: "SUV", location: "Cổng chính", time: "10:44:30", status: "Vào", isVip: false }
        ];

        if (floorId === "B2") resolve(activitiesB2);
        else if (floorId === "T1") resolve(activitiesT1);
        else resolve(activitiesB1);
      }, MOCK_DELAY);
    });
  }
};
