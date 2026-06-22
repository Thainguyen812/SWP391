import { apiClient } from '../api/apiClient';

const MOCK_DELAY = 800;
const isMock = true; // B?t bu?c d�ng Mock v� Backend chua l�m API n�y

// Mock DB để xử lý trạng thái khi người dùng Approve/Reject
let mockCustomers = [
  { id: 1, name: "Nguyễn Văn An", phone: "090 123 4567", plate: "51F-123.45", type: "VIP", status: "ACTIVE", expireDate: "31/12/2024" },
  { id: 2, name: "Trần Thị Bích", phone: "091 987 6543", plate: "30A-987.65", type: "Tháng", status: "ACTIVE", expireDate: "15/11/2023" },
  { id: 3, name: "Lê Hữu Trí", phone: "098 765 4321", plate: "43C-112.22", type: "Tháng", status: "EXPIRED", expireDate: "01/10/2023" },
  { id: 4, name: "Khách Vãng lai", phone: "Ticket #99281", plate: "60B-555.44", type: "Guest", status: "IN_PARK", expireDate: "N/A" },
  // Dữ liệu cho Task 11: VIP Subscription Approval Queue
  { 
    id: 5, 
    name: "Phạm Hoàng Thái", 
    phone: "093 333 4444", 
    plate: "61A-999.99", 
    type: "VIP", 
    status: "PENDING", 
    expireDate: "N/A",
    photos_urls: [
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&q=80", // Ảnh xe
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80"  // Avatar/ID giả lập
    ]
  },
  { 
    id: 6, 
    name: "Ngô Thanh Vân", 
    phone: "094 555 6666", 
    plate: "51K-888.88", 
    type: "VIP", 
    status: "PENDING", 
    expireDate: "N/A",
    photos_urls: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80", 
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
    ]
  }
];

export const customerService = {
  getStats: async () => {
    if (!isMock) {
      return apiClient.get('/customers/stats');
    }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          total: { value: "1,248", trend: "+12% tháng này", isPositive: true },
          monthly: { value: "856", sub: "Chiếm 68% tổng số" },
          vip: { value: "42", sub: "Khu vực đỗ xe riêng" },
          expired: { value: "15", sub: "Trong vòng 7 ngày tới" }
        });
      }, MOCK_DELAY);
    });
  },

  getCustomers: async (filter = 'all') => {
    try {
      if (!isMock) {
        const response = await apiClient.get('/users');
        const realData = response.data.map(u => ({
          id: u.id,
          name: u.fullName || u.username,
          phone: u.phone || "N/A",
          plate: "N/A", // Chưa có trong User model của backend
          type: u.role === "VIP" ? "VIP" : "Tháng",
          status: u.status,
          expireDate: "N/A"
        }));
        
        let filtered = realData;
        if (filter === 'month') {
          filtered = realData.filter(c => c.type === 'Tháng');
        } else if (filter === 'vip') {
          filtered = realData.filter(c => c.type === 'VIP' && c.status === 'ACTIVE');
        } else if (filter === 'pending') {
          filtered = realData.filter(c => c.type === 'VIP' && c.status === 'PENDING');
        }
        return filtered;
      }
    } catch (error) {
      console.warn("API lỗi hoặc chưa có data, tự động chuyển về Dữ liệu giả (Mock Data). Chi tiết:", error.message);
    }

    // Fallback: Chạy khi isMock = true HOẶC khi gọi API thật thất bại
    return new Promise(resolve => {
      setTimeout(() => {
        let filtered = mockCustomers;
        if (filter === 'month') {
          filtered = mockCustomers.filter(c => c.type === 'Tháng');
        } else if (filter === 'vip') {
          filtered = mockCustomers.filter(c => c.type === 'VIP' && c.status === 'ACTIVE');
        } else if (filter === 'pending') {
          filtered = mockCustomers.filter(c => c.type === 'VIP' && c.status === 'PENDING');
        }
        resolve(filtered);
      }, MOCK_DELAY);
    });
  },

  approveVipSubscription: async (id, isApproved = true) => {
    if (!isMock) {
      return apiClient.post(`/vip/${id}/approve`, { approved: isApproved });
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error("Customer not found"));
          return;
        }

        if (isApproved) {
          mockCustomers[index].status = "ACTIVE";
          // Tính ngày hết hạn giả lập 1 năm
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + 1);
          mockCustomers[index].expireDate = nextYear.toLocaleDateString('en-GB');
        } else {
          mockCustomers[index].status = "REJECTED";
        }
        
        // Giả lập lưu Audit Log
        console.log(`[Audit Log] Manager has ${isApproved ? 'APPROVED' : 'REJECTED'} VIP subscription for ${mockCustomers[index].name} (ID: ${id})`);
        
        resolve(mockCustomers[index]);
      }, MOCK_DELAY);
    });
  }
};
