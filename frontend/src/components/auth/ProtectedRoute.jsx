import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, đá về trang /login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép render component con
  return children;
};
