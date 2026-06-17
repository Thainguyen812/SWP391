import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  AppstoreOutlined, 
  VideoCameraOutlined, 
  DesktopOutlined, 
  CreditCardOutlined, 
  AlertOutlined, 
  IdcardOutlined, 
  HistoryOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import './Sidebar.css';

const navItems = [
  { path: '/staff-dashboard', label: 'Bảng điều khiển', icon: <AppstoreOutlined /> },
  { path: '/staff-gate-control', label: 'Điều khiển cổng', icon: <DesktopOutlined /> },
  { path: '/staff-monitoring', label: 'Giám sát', icon: <VideoCameraOutlined /> },
  { path: '/staff-payment', label: 'Thanh toán', icon: <CreditCardOutlined /> },
  { path: '/staff-security', label: 'Cảnh báo an ninh', icon: <AlertOutlined /> },
  { path: '#', label: 'Báo mất thẻ', icon: <IdcardOutlined /> },
  { path: '#', label: 'Lịch sử giao ca', icon: <HistoryOutlined /> },
];

export const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get user data for bottom section
  let userName = "Nguyễn Văn A";
  let userShift = "CA SÁNG (06:00 - 14:00)";
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.fullName) userName = user.fullName;
    }
  } catch (e) {}

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#051424' }}>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Logo Area */}
        <div className="sidebar-logo-area border-b border-white/10 pb-6 mb-4 flex-shrink-0">
          <div className="flex flex-col gap-1 px-6">
            <h1 className="text-2xl font-bold text-white m-0 tracking-wide">UrbanPark</h1>
            <h2 className="text-xl font-bold text-white m-0">Staff</h2>
            <span className="text-xs text-slate-400 font-mono tracking-wider mt-1">Terminal Operations</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <ul className="sidebar-nav-list px-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/staff-dashboard');
              return (
                <li key={index} className="mb-1">
                  <Link 
                    to={item.path}
                    className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    <span className={`sidebar-nav-icon ${isActive ? 'sidebar-nav-icon-active' : ''}`}>{item.icon}</span>
                    <span className="sidebar-nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Area: User Info */}
      <div className="border-t border-white/20 p-5 mt-auto flex-shrink-0">
        <div className="flex items-center gap-4 mb-6 px-1">
          <div className="w-12 h-12 rounded-[14px] border border-white/30 bg-transparent flex-shrink-0"></div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-white leading-tight truncate">{userName}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 truncate">{userShift}</span>
          </div>
        </div>

        <div className="flex flex-col mt-2 px-1 gap-1">
          <button className="sidebar-bottom-item bg-transparent border-0 cursor-pointer text-left w-full text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
            <QuestionCircleOutlined className="sidebar-bottom-icon" />
            <span className="sidebar-bottom-label ml-1">Hỗ trợ</span>
          </button>
          <button onClick={handleLogout} className="sidebar-bottom-item bg-transparent border-0 cursor-pointer text-left w-full text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
            <LogoutOutlined className="sidebar-bottom-icon" />
            <span className="sidebar-bottom-label ml-1">Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
