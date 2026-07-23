import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  AppstoreOutlined, 
  EyeOutlined, 
  DollarOutlined, 
  TeamOutlined, 
  UserOutlined, 
  SettingOutlined, 
  SafetyOutlined, 
  HistoryOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  SwapOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import './Sidebar.css';

const navItems = [
  { path: '/overview', label: 'Tổng quan', icon: <AppstoreOutlined /> },
  { path: '/monitoring', label: 'Giám sát bãi xe', icon: <EyeOutlined /> },
  { path: '/revenue', label: 'Doanh thu', icon: <DollarOutlined /> },
  { path: '/staff', label: 'Quản lý nhân sự', icon: <TeamOutlined /> },
  { path: '/customers', label: 'Khách hàng', icon: <UserOutlined /> },
  { path: '/transactions', label: 'Giao dịch', icon: <HistoryOutlined /> },
  { path: '/security', label: 'Bảo mật', icon: <SafetyOutlined />, adminOnly: true },
  { path: '/handover', label: 'Bàn giao ca', icon: <SwapOutlined /> },
  { path: '/logs', label: 'Nhật ký', icon: <FileTextOutlined />, adminOnly: true },
  { path: '/settings', label: 'Cài đặt', icon: <SettingOutlined />, adminOnly: true },
];

export const Sidebar = ({ onOpenAddBranch }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = authService.getUser();
  // Chuẩn hóa role: strip ROLE_ prefix và uppercase để so sánh chính xác
  const role = user?.role?.replace('ROLE_', '').toUpperCase() || '';
  const isAdmin = role === 'ADMIN';

  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly) return isAdmin;
    return true;
  });

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo Area */}
      <div className="sidebar-logo-area">
        <div className="sidebar-logo-icon">
          P
        </div>
        <div className="sidebar-logo-text-wrapper flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white m-0 tracking-wide">Urban</h1>
          <h2 className="text-2xl font-bold text-white m-0">Park System</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/overview');
            return (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`sidebar-nav-item ${
                    isActive 
                      ? 'sidebar-nav-item-active' 
                      : 'sidebar-nav-item-inactive'
                  }`}
                >
                  <span className={`sidebar-nav-icon ${isActive ? 'sidebar-nav-icon-active' : ''}`}>{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Area */}
      <div className="sidebar-bottom-area">
        {isAdmin && (
          <button 
            onClick={onOpenAddBranch}
            className="sidebar-add-btn"
          >
            <PlusOutlined />
            Thêm cơ sở mới
          </button>
        )}
        <ul className="sidebar-bottom-list">
          <li>
            <button className="sidebar-bottom-item" onClick={() => navigate('/support')}>
              <QuestionCircleOutlined className="sidebar-bottom-icon" />
              <span className="sidebar-bottom-label">Hỗ trợ</span>
            </button>
          </li>
          <li>
            <button className="sidebar-bottom-item" onClick={handleLogout}>
              <LogoutOutlined className="sidebar-bottom-icon" />
              <span className="sidebar-bottom-label">Đăng xuất</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
