import { apiClient } from '../api/apiClient';

const MOCK_DELAY = 800;
const isMock = true; // B?t bu?c dùng Mock vì Backend chua làm API này

// Mock DB Ä‘á»ƒ xá»­ lÃ½ tráº¡ng thÃ¡i khi ngÆ°á»i dÃ¹ng Approve/Reject
let mockCustomers = [
  { id: 1, name: "Nguyá»…n VÄƒn An", phone: "090 123 4567", plate: "51F-123.45", type: "VIP", status: "ACTIVE", expireDate: "31/12/2024" },
  { id: 2, name: "Tráº§n Thá»‹ BÃ­ch", phone: "091 987 6543", plate: "30A-987.65", type: "ThÃ¡ng", status: "ACTIVE", expireDate: "15/11/2023" },
  { id: 3, name: "LÃª Há»¯u TrÃ­", phone: "098 765 4321", plate: "43C-112.22", type: "ThÃ¡ng", status: "EXPIRED", expireDate: "01/10/2023" },
  { id: 4, name: "KhÃ¡ch VÃ£ng lai", phone: "Ticket #99281", plate: "60B-555.44", type: "Guest", status: "IN_PARK", expireDate: "N/A" },
  // Dá»¯ liá»‡u cho Task 11: VIP Subscription Approval Queue
  { 
    id: 5, 
    name: "Pháº¡m HoÃ ng ThÃ¡i", 
    phone: "093 333 4444", 
    plate: "61A-999.99", 
    type: "VIP", 
    status: "PENDING", 
    expireDate: "N/A",
    photos_urls: [
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&q=80", // áº¢nh xe
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80"  // Avatar/ID giáº£ láº­p
    ]
  },
  { 
    id: 6, 
    name: "NgÃ´ Thanh VÃ¢n", 
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
          total: { value: "1,248", trend: "+12% thÃ¡ng nÃ y", isPositive: true },
          monthly: { value: "856", sub: "Chiáº¿m 68% tá»•ng sá»‘" },
          vip: { value: "42", sub: "Khu vá»±c Ä‘á»— xe riÃªng" },
          expired: { value: "15", sub: "Trong vÃ²ng 7 ngÃ y tá»›i" }
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
          plate: "N/A", // ChÆ°a cÃ³ trong User model cá»§a backend
          type: u.role === "VIP" ? "VIP" : "ThÃ¡ng",
          status: u.status,
          expireDate: "N/A"
        }));
        
        let filtered = realData;
        if (filter === 'month') {
          filtered = realData.filter(c => c.type === 'ThÃ¡ng');
        } else if (filter === 'vip') {
          filtered = realData.filter(c => c.type === 'VIP' && c.status === 'ACTIVE');
        } else if (filter === 'pending') {
          filtered = realData.filter(c => c.type === 'VIP' && c.status === 'PENDING');
        }
        return filtered;
      }
    } catch (error) {
      console.warn("API lá»—i hoáº·c chÆ°a cÃ³ data, tá»± Ä‘á»™ng chuyá»ƒn vá» Dá»¯ liá»‡u giáº£ (Mock Data). Chi tiáº¿t:", error.message);
    }

    // Fallback: Cháº¡y khi isMock = true HOáº¶C khi gá»i API tháº­t tháº¥t báº¡i
    return new Promise(resolve => {
      setTimeout(() => {
        let filtered = mockCustomers;
        if (filter === 'month') {
          filtered = mockCustomers.filter(c => c.type === 'ThÃ¡ng');
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
          // TÃ­nh ngÃ y háº¿t háº¡n giáº£ láº­p 1 nÄƒm
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + 1);
          mockCustomers[index].expireDate = nextYear.toLocaleDateString('en-GB');
        } else {
          mockCustomers[index].status = "REJECTED";
        }
        
        // Giáº£ láº­p lÆ°u Audit Log
        console.log(`[Audit Log] Manager has ${isApproved ? 'APPROVED' : 'REJECTED'} VIP subscription for ${mockCustomers[index].name} (ID: ${id})`);
        
        resolve(mockCustomers[index]);
      }, MOCK_DELAY);
    });
  }
};
