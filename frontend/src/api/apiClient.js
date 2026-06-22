import axios from 'axios';

// Khởi tạo một instance của axios với các cấu hình mặc định
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Tuỳ chọn: ngắt kết nối nếu server quá lâu không phản hồi (10s)
});

// Interceptor cho Request: Tự động gắn Token trước khi gửi API
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (sử dụng key 'token' theo chuẩn mới)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Bắt lỗi chung từ Server trả về
apiClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data thay vì bọc trong response.data của axios
    return response.data;
  },
  (error) => {
    // Bắt các mã lỗi phổ biến (401: Hết phiên, 403: Không có quyền...)
    if (error.response) {
      if (error.response.status === 401) {
        console.error("Phiên đăng nhập hết hạn hoặc Token không hợp lệ. Đang đá văng về màn hình Login...");
        // Tự động xóa token lỗi
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Tránh reload liên tục nếu đang ở trang login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
