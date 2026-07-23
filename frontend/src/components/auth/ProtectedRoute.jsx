import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  /* 
  BỎ CHẶN LUÔN CẢ MÀN HÌNH LOGIN ĐỂ TEST
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, đá về trang /login
    return <Navigate to="/login" replace />;
  }
  */

  // BỎ CHẶN QUYỀN ĐỂ DỄ TEST - Bất kỳ role nào cũng vào được tất cả các trang
  /*
  if (allowedRoles && (!user || !authService.hasRole(allowedRoles))) {
    // Nếu đã đăng nhập nhưng không có quyền truy cập trang này
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-rose-500 p-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-white text-center">Truy cập bị từ chối</h1>
          </div>
          <div className="p-8">
            <p className="text-slate-600 text-center mb-6">Tài khoản của bạn không có đủ quyền hạn để truy cập vào hệ thống quản trị này.</p>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-500">Vai trò hiện tại</span>
                <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
                  {user?.role || 'KHÔNG CÓ'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-medium text-slate-500">Yêu cầu hệ thống</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  {allowedRoles.join(', ')}
                </span>
              </div>
            </div>

            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Đăng xuất & Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    );
  }
  */

  // Nếu hợp lệ, cho phép render component con
  return children;
};
