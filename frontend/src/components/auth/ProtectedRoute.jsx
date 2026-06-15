import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, đá về trang /login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !authService.hasRole(allowedRoles))) {
    // Nếu đã đăng nhập nhưng không có quyền truy cập trang này
    // Chuyển hướng người dùng về trang chủ tương ứng với quyền của họ
    if (user?.role === 'DRIVER') {
      return <Navigate to="/driver" replace />;
    } else {
      return <Navigate to="/overview" replace />;
    }
  }

  // Nếu hợp lệ, cho phép render component con
  return children;
};
