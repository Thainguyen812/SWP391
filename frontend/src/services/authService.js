import { apiClient } from '../api/apiClient';

const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

const clearUserCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('urbanpark_')) {
      // Keep persistent mock states (vehicles, balance, transactions, profile data, subscriptions)
      if (
        key.includes('_user_balance') ||
        key.includes('_user_vehicles') ||
        key.includes('_user_transactions') ||
        key.includes('_user_name') ||
        key.includes('_user_phone') ||
        key.includes('_user_email') ||
        key.includes('_user_address') ||
        key.includes('_phone_verified') ||
        key === 'urbanpark_vip_subscriptions'
      ) {
        continue;
      }
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

const extractErrorMessage = (error, defaultMsg) => {
  if (error.response && error.response.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
    if (error.response.data.error) {
      return error.response.data.error;
    }
  }
  return error.message || defaultMsg;
};

export const authService = {
  login: async (username, password, otp = null) => {
    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 600)); // fake delay
      if (password !== '123456') {
        return { success: false, message: "Mật khẩu sai (Mock API chấp nhận pass: 123456)" };
      }

      // Nếu chưa nhập OTP trong Mock Mode, trả về yêu cầu OTP
      if (!otp) {
        return { 
          success: true, 
          requiresOtp: true, 
          email: username.includes('@') ? username : `${username}@urbanpark.com`, 
          message: "Mã OTP đã được gửi về email (Mock API)." 
        };
      }

      // Mock OTP mặc định là 123456
      if (otp !== '123456') {
        return { success: false, message: "Mã OTP mock không chính xác (Vui lòng nhập 123456)" };
      }

      let role = 'ADMIN';
      let fullName = 'Admin User';
      if (username === 'staff') { role = 'STAFF'; fullName = 'Operations Staff'; }
      else if (username === 'manager') { role = 'MANAGER'; fullName = 'Parking Manager'; }
      else if (username.includes('driver')) { role = 'DRIVER'; fullName = 'Driver User'; }

      const mockUser = { 
        id: 'mock-id', 
        username, 
        role, 
        fullName,
        email: username.includes('@') ? username : `${username}@urbanpark.com`,
        phone: username.match(/^\d+$/) ? username : '0912345678'
      };
      sessionStorage.setItem('token', 'mock-jwt-token-12345'); localStorage.setItem('token', 'mock-jwt-token-12345');
      sessionStorage.setItem('user', JSON.stringify(mockUser)); localStorage.setItem('user', JSON.stringify(mockUser));

      // Xóa dữ liệu cache của người dùng cũ để tránh hiển thị chéo dữ liệu
      clearUserCache();

      return { success: true, user: mockUser };
    }

    try {
      // Bắn dữ liệu username/password/otp sang Backend
      const response = await apiClient.post('/auth/login', {
        username: username,
        password: password,
        otp: otp
      });

      // Nếu Backend phản hồi cần mã OTP
      if (response && response.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          email: response.email,
          message: response.message
        };
      }

      // Nếu thành công (API trả về data có token)
      if (response && response.accessToken) {
        const { accessToken, refreshToken, user } = response;

        // CẤT TOKEN VÀO KHO
        sessionStorage.setItem('token', accessToken); localStorage.setItem('token', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken); localStorage.setItem('refreshToken', refreshToken);
        }
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('user', JSON.stringify(user));
        }

        // Xóa dữ liệu cache của người dùng cũ để tránh hiển thị chéo dữ liệu
        clearUserCache();

        return { success: true, user: user };
      } else {
        return { success: false, message: "Phản hồi từ server không chứa token." };
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      const message = extractErrorMessage(error, "Tài khoản hoặc mật khẩu không đúng!");
      return { success: false, message: message };
    }
  },

  register: async (username, password, fullName, email, phone, otp) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        password,
        fullName,
        email,
        phone,
        otp,
        role: "DRIVER" // Mặc định đăng ký từ Driver App là tài xế (DRIVER)
      });
      // Xóa dữ liệu cache của trình duyệt để đảm bảo tài khoản mới tạo 100% trống dữ liệu
      clearUserCache();

      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      const message = extractErrorMessage(error, "Không thể đăng ký tài khoản!");
      return { success: false, message: message };
    }
  },

  sendOtp: async (email) => {
    try {
      const response = await apiClient.post('/auth/send-otp', { email });
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi gửi OTP:', error);
      const message = extractErrorMessage(error, "Không thể gửi OTP!");
      return { success: false, message: message };
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi xác thực OTP:', error);
      const message = extractErrorMessage(error, "Mã OTP không đúng hoặc đã hết hạn!");
      return { success: false, message: message };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi khôi phục mật khẩu:', error);
      const message = extractErrorMessage(error, "Không thể khôi phục mật khẩu!");
      return { success: false, message: message };
    }
  },

  logout: () => {
    // Xóa toàn bộ token và thông tin người dùng khỏi localStorage
    sessionStorage.removeItem('token'); sessionStorage.removeItem('refreshToken'); sessionStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user');
    
    // Xóa dữ liệu cache của tài xế để tránh hiển thị chéo giữa các tài khoản
    clearUserCache();
    
    // Điều hướng về trang login
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    // Kiểm tra xem có token trong kho không
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return !!token;
  },

  getUser: () => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  hasRole: (allowedRoles) => {
    const user = authService.getUser();
    if (!user || !user.role) return false;
    // Nếu allowedRoles là mảng, kiểm tra xem role của user có nằm trong mảng không
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  }
};
