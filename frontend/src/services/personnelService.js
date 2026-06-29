import { apiClient } from '../api/apiClient';

// Giáº£ láº­p Ä‘á»™ trá»… máº¡ng 1 giÃ¢y
const MOCK_DELAY = 1000;

// Láº¥y cá» tá»« cáº¥u hÃ¬nh mÃ´i trÆ°á»ng (.env)
const isMock = false; // B?t bu?c dùng Mock vì Backend chua làm API này

export const personnelService = {
  // Láº¥y danh sÃ¡ch nhÃ¢n viÃªn
  getPersonnelList: async () => {
    if (!isMock) {
      return apiClient.get('/personnel/list');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'EMP001',
            name: 'Tráº§n Thá»‹ BÃ©',
            role: 'GiÃ¡m sÃ¡t Cá»•ng vÃ o 1',
            status: 'active', // Äang trá»±c
            time: '06:00 - 14:00',
            phone: '...8892',
            avatar: 'https://i.pravatar.cc/150?u=tran_thi_be'
          },
          {
            id: 'EMP002',
            name: 'LÃª VÄƒn CÆ°á»ng',
            role: 'NhÃ¢n viÃªn Cá»•ng ra 2',
            status: 'active', // Äang trá»±c
            time: '06:00 - 14:00',
            phone: '...4415',
            avatar: 'https://i.pravatar.cc/150?u=le_van_cuong'
          },
          {
            id: 'EMP003',
            name: 'Pháº¡m Äá»©c Duy',
            role: 'Äá»™i trÆ°á»Ÿng Tuáº§n tra',
            status: 'inactive', // Nghá»‰ phÃ©p/ChÆ°a tá»›i ca
            time: 'Ca tiáº¿p: 14:00',
            phone: '...1123',
            avatar: 'https://i.pravatar.cc/150?u=pham_duc_duy'
          },
          {
            id: 'EMP004',
            name: 'HoÃ ng Yáº¿n',
            role: 'Há»— trá»£ KhÃ¡ch hÃ ng',
            status: 'leave', // Nghá»‰ phÃ©p
            time: 'á»m (1 ngÃ y)',
            phone: '...5566',
            avatar: 'https://i.pravatar.cc/150?u=hoang_yen'
          }
        ]);
      }, MOCK_DELAY);
    });
  },

  // Láº¥y lá»‹ch phÃ¢n ca hÃ´m nay
  getTodayShifts: async () => {
    if (!isMock) {
      return apiClient.get('/personnel/shifts/today');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { location: 'Cá»•ng vÃ o 1', morning: 'T.T. BÃ©', afternoon: 'P.Ä. Duy' },
          { location: 'Cá»•ng ra 1', morning: 'N.V. An', afternoon: 'L.T. Hoa' },
          { location: 'Cá»•ng ra 2 (VIP)', morning: 'L.V. CÆ°á»ng', afternoon: 'Trá»‘ng ca', isWarning: true },
          { location: 'Tuáº§n tra háº§m B1', morning: 'K.T. Long', afternoon: 'A.M. QuÃ¢n' },
        ]);
      }, MOCK_DELAY);
    });
  },

  // Láº¥y nháº­t kÃ½ bÃ n giao ca gáº§n nháº¥t
  getLatestHandover: async () => {
    if (!isMock) {
      return apiClient.get('/personnel/handover/latest');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          time: 'HÃ´m nay, 06:05',
          from: {
            shift: 'CA ÄÃŠM',
            name: 'HoÃ ng Kim',
            id: 'HKim_841123'
          },
          to: {
            shift: 'CA SÃNG',
            name: 'Tráº§n Thá»‹ BÃ©',
            id: 'TTB_041123'
          },
          notes: [
            'Há»‡ thá»‘ng barrier Cá»•ng ra 1 thá»‰nh thoáº£ng pháº£n há»“i cháº­m, Ä‘Ã£ bÃ¡o ká»¹ thuáº­t.',
            'Tiá»n máº·t bÃ n giao trong kÃ©t: 1,250,000 VND.',
            'CÃ³ 2 xe VIP gá»­i qua Ä‘Ãªm (Biá»ƒn sá»‘: 30G-123.45, 51H-987.65).'
          ]
        });
      }, MOCK_DELAY);
    });
  }
};
