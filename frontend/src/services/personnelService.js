import { apiClient } from '../api/apiClient';

// Giả lập độ trễ mạng 1 giây
const MOCK_DELAY = 1000;

// Lấy cờ từ cấu hình môi trường (.env)
const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const personnelService = {
  // Lấy danh sách nhân viên
  getPersonnelList: async () => {
    if (!isMock) {
      return apiClient.get('/personnel/list');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'EMP001',
            name: 'Trần Thị Bé',
            role: 'Giám sát Cổng vào 1',
            status: 'active', // Đang trực
            time: '06:00 - 14:00',
            phone: '...8892',
            avatar: 'https://i.pravatar.cc/150?u=tran_thi_be'
          },
          {
            id: 'EMP002',
            name: 'Lê Văn Cường',
            role: 'Nhân viên Cổng ra 2',
            status: 'active', // Đang trực
            time: '06:00 - 14:00',
            phone: '...4415',
            avatar: 'https://i.pravatar.cc/150?u=le_van_cuong'
          },
          {
            id: 'EMP003',
            name: 'Phạm Đức Duy',
            role: 'Đội trưởng Tuần tra',
            status: 'inactive', // Nghỉ phép/Chưa tới ca
            time: 'Ca tiếp: 14:00',
            phone: '...1123',
            avatar: 'https://i.pravatar.cc/150?u=pham_duc_duy'
          },
          {
            id: 'EMP004',
            name: 'Hoàng Yến',
            role: 'Hỗ trợ Khách hàng',
            status: 'leave', // Nghỉ phép
            time: 'Ốm (1 ngày)',
            phone: '...5566',
            avatar: 'https://i.pravatar.cc/150?u=hoang_yen'
          }
        ]);
      }, MOCK_DELAY);
    });
  },

  // Lấy lịch phân ca hôm nay
  getTodayShifts: async () => {
    if (!isMock) {
      return apiClient.get('/personnel/shifts/today');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { location: 'Cổng vào 1', morning: 'T.T. Bé', afternoon: 'P.Đ. Duy' },
          { location: 'Cổng ra 1', morning: 'N.V. An', afternoon: 'L.T. Hoa' },
          { location: 'Cổng ra 2 (VIP)', morning: 'L.V. Cường', afternoon: 'Trống ca', isWarning: true },
          { location: 'Tuần tra hầm B1', morning: 'K.T. Long', afternoon: 'A.M. Quân' },
        ]);
      }, MOCK_DELAY);
    });
  },

  // Lấy nhật ký bàn giao ca gần nhất
  getLatestHandover: async () => {
    if (!isMock) {
      return apiClient.get('/personnel/handover/latest');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          time: 'Hôm nay, 06:05',
          from: {
            shift: 'CA ĐÊM',
            name: 'Hoàng Kim',
            id: 'HKim_841123'
          },
          to: {
            shift: 'CA SÁNG',
            name: 'Trần Thị Bé',
            id: 'TTB_041123'
          },
          notes: [
            'Hệ thống barrier Cổng ra 1 thỉnh thoảng phản hồi chậm, đã báo kỹ thuật.',
            'Tiền mặt bàn giao trong két: 1,250,000 VND.',
            'Có 2 xe VIP gửi qua đêm (Biển số: 30G-123.45, 51H-987.65).'
          ]
        });
      }, MOCK_DELAY);
    });
  }
};
