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
        if (branchId === "BR2") {
          // Dữ liệu cho Cơ sở 2
          if (floorId === "B2") {
            resolve({ totalCapacity: 600, currentlyParked: 100, parkedPercentage: 16, availableSpots: 500, vipVehicles: 2 });
          } else if (floorId === "T1") {
            resolve({ totalCapacity: 300, currentlyParked: 50, parkedPercentage: 16, availableSpots: 250, vipVehicles: 0 });
          } else {
            resolve({ totalCapacity: 1000, currentlyParked: 450, parkedPercentage: 45, availableSpots: 550, vipVehicles: 12 });
          }
        } else {
          // Dữ liệu cho Cơ sở chính (HQ)
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
            // Mặc định B1 HQ
            resolve({
              totalCapacity: 1500,
              currentlyParked: 1248,
              parkedPercentage: 83,
              availableSpots: 252,
              vipVehicles: 42
            });
          }
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
        if (branchId === "BR2") {
          // Danh sách hoạt động cho Cơ sở 2
          resolve([
            { id: 10, plateNumber: "61A-111.11", vehicleType: "Sedan", location: "Cổng BR2", time: "11:05:00", status: "Vào", isVip: false },
            { id: 11, plateNumber: "62C-222.22", vehicleType: "Tải", location: "Cổng BR2", time: "11:00:15", status: "Ra", isVip: false }
          ]);
          return;
        }

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
  },

  // --- TRANG BÁO CÁO DOANH THU ---

  getRevenueSummary: async (month) => {
    if (!isMock) {
      return apiClient.get('/revenue/summary', { params: { month } });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          today: { value: "18.4M", trend: "+12.5% so với hôm qua", isPositive: true },
          thisMonth: { value: "452M", trend: "-2.1% so với tháng trước", isPositive: false },
          projectedYear: { value: "5.4B", subtitle: "Đạt 92% KPI" }
        });
      }, MOCK_DELAY);
    });
  },

  getRevenueCharts: async (month) => {
    if (!isMock) {
      return apiClient.get('/revenue/charts', { params: { month } });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data cho Bar Chart (10 điểm mốc đại diện cho 30 ngày để demo)
        const barData = [
          { name: "01/10", value: 20 }, { name: "04/10", value: 22 },
          { name: "08/10", value: 15 }, { name: "11/10", value: 28 },
          { name: "15/10", value: 18 }, { name: "18/10", value: 35 },
          { name: "22/10", value: 25 }, { name: "25/10", value: 40 },
          { name: "28/10", value: 38 }, { name: "Hôm nay", value: 45 }
        ];

        // Mock data cho Pie Chart (Loại phương tiện)
        const pieData = [
          { name: "Ô tô (Vãng lai)", value: 9.2, percent: 50, color: "#1677ff" },
          { name: "Ô tô (Vé tháng/VIP)", value: 6.4, percent: 35, color: "#001529" },
          { name: "Xe máy", value: 2.8, percent: 15, color: "#52c41a" }
        ];

        resolve({ barData, pieData, totalVehicleRevenue: "18.4M" });
      }, MOCK_DELAY);
    });
  },

  getRevenueTransactions: async (page = 1) => {
    if (!isMock) {
      return apiClient.get('/revenue/transactions', { params: { page } });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: 248,
          items: [
            { id: "#TRX-8924", time: "14:32:05 Hôm nay", plate: "30G-123.45", type: "Ô tô - Vãng lai", amount: "25,000đ", method: "VNPAY", status: "THÀNH CÔNG" },
            { id: "#TRX-8923", time: "14:28:11 Hôm nay", plate: "29A-999.99", type: "Vé tháng (VIP)", amount: "0đ", method: "Thẻ từ Auto", status: "ĐÃ GHI NHẬN" },
            { id: "#TRX-8922", time: "14:15:00 Hôm nay", plate: "15B-678.90", type: "Xe máy", amount: "5,000đ", method: "Lỗi kết nối", status: "CẦN XỬ LÝ" },
            { id: "#TRX-8921", time: "14:10:22 Hôm nay", plate: "30E-555.22", type: "Ô tô - Vãng lai", amount: "25,000đ", method: "Tiền mặt", status: "THÀNH CÔNG" }
          ]
        });
      }, MOCK_DELAY);
    });
  }
};
