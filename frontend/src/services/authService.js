import { apiClient } from '../api/apiClient';

const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const authService = {
  login: async (username, password) => {
    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 600)); // fake delay
      if (password !== '123456') {
        return { success: false, message: "Mật khẩu sai (Mock API chấp nhận pass: 123456)" };
      }

      let role = 'ADMIN';
      let fullName = 'Admin User';
      if (username === 'staff') { role = 'STAFF'; fullName = 'Operations Staff'; }
      else if (username === 'manager') { role = 'MANAGER'; fullName = 'Parking Manager'; }
      else if (username.includes('driver')) { role = 'DRIVER'; fullName = 'Driver User'; }

      const mockUser = { id: 'mock-id', username, role, fullName };
      localStorage.setItem('token', 'mock-jwt-token-12345');
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    }

    try {
      // Bắn dữ liệu username/password sang Backend
      const response = await apiClient.post('/auth/login', {
        username: username,
        password: password
      });

      // Nếu thành công (API trả về data có token)
      if (response && response.accessToken) {
        const { accessToken, refreshToken, user } = response;

        // CẤT TOKEN VÀO KHO
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Xóa dữ liệu cache của người dùng cũ để tránh hiển thị chéo dữ liệu
        localStorage.removeItem('urbanpark_user_vehicles');
        localStorage.removeItem('urbanpark_user_balance');
        localStorage.removeItem('urbanpark_user_transactions');

        return { success: true, user: user };
      } else {
        return { success: false, message: "Phản hồi từ server không chứa token." };
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      // Xử lý lỗi trả về từ backend
      const message = error.response?.data?.message || error.message || "Tài khoản hoặc mật khẩu không đúng!";
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
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      const message = error.response?.data?.message || error.message || "Không thể đăng ký tài khoản!";
      return { success: false, message: message };
    }
  },

  sendOtp: async (email) => {
    try {
      const response = await apiClient.post('/auth/send-otp', { email });
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi gửi OTP:', error);
      const message = error.response?.data?.message || error.message || "Không thể gửi OTP!";
      return { success: false, message: message };
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi xác thực OTP:', error);
      const message = error.response?.data?.message || error.message || "Mã OTP không đúng hoặc đã hết hạn!";
      return { success: false, message: message };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi khôi phục mật khẩu:', error);
      const message = error.response?.data?.message || error.message || "Không thể khôi phục mật khẩu!";
      return { success: false, message: message };
    }
  },

  logout: () => {
    // Xóa toàn bộ token và thông tin người dùng khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Xóa dữ liệu cache của tài xế để tránh hiển thị chéo giữa các tài khoản
    localStorage.removeItem('urbanpark_user_vehicles');
    localStorage.removeItem('urbanpark_user_balance');
    localStorage.removeItem('urbanpark_user_transactions');
    
    // Điều hướng về trang login
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    // Kiểm tra xem có token trong kho không
    const token = localStorage.getItem('token');
    return !!token;
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
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
