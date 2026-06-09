const MOCK_DELAY = 1000; // Giả lập độ trễ mạng 1 giây

export const dashboardService = {
  // Lấy dữ liệu 4 thẻ thống kê trên cùng
  getSummaryStats: async () => {
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

  // Mock API tạo cơ sở mới
  createBranch: async (branchData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Giả lập thành công 100%
        console.log("Mock API nhận dữ liệu Create Branch:", branchData);
        resolve({ success: true, message: "Thêm cơ sở thành công", data: { id: Date.now(), ...branchData } });
        
        // Nếu muốn test lỗi thì uncomment dòng này:
        // reject(new Error("Lỗi giả lập từ server"));
      }, MOCK_DELAY * 1.5); // Nút quay 1.5s để nhìn cho rõ
    });
  }
};
