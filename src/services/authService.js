import { apiClient } from '../api/apiClient';

export const authService = {
  login: async (username, password) => {
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

  register: async (username, password, fullName, email, phone) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        password,
        fullName,
        email,
        phone,
        role: "STAFF" // Mặc định khi đăng ký là nhân viên (hoặc DRIVER tuỳ logic)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      const message = error.response?.data?.message || error.message || "Không thể đăng ký tài khoản!";
      return { success: false, message: message };
    }
  },

  logout: () => {
    // Xóa toàn bộ token và thông tin người dùng khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Điều hướng về trang login
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    // Kiểm tra xem có token trong kho không
    const token = localStorage.getItem('token');
    return !!token;
  }
};
