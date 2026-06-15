import axios from 'axios';

// Khởi tạo một instance của axios với các cấu hình mặc định
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Tuỳ chọn: ngắt kết nối nếu server quá lâu không phản hồi (10s)
});

// Interceptor cho Request: Tự động gắn Token trước khi gửi API
apiClient.interceptors.request.use(
  (config) => {
    // Thường lấy token từ localStorage hoặc Redux/Zustand
    const token = localStorage.getItem('access_token');
    
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
        console.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        // Code xử lý logout hoặc redirect về /login ở đây
      }
    }
    return Promise.reject(error);
  }
);
