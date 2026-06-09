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
  LogoutOutlined
} from '@ant-design/icons';
import './Sidebar.css';

const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: <AppstoreOutlined />, active: true },
  { id: 'monitoring', label: 'Giám sát bãi xe', icon: <EyeOutlined /> },
  { id: 'revenue', label: 'Doanh thu', icon: <DollarOutlined /> },
  { id: 'staff', label: 'Quản lý nhân sự', icon: <TeamOutlined /> },
  { id: 'customers', label: 'Khách hàng', icon: <UserOutlined /> },
  { id: 'settings', label: 'Cấu hình kỹ thuật', icon: <SettingOutlined /> },
  { id: 'security', label: 'Bảo mật', icon: <SafetyOutlined /> },
  { id: 'logs', label: 'Nhật ký hệ thống', icon: <HistoryOutlined /> },
];

export const Sidebar = ({ onOpenAddBranch }) => {
  return (
    <aside className="sidebar">
      {/* Logo Area */}
      <div className="sidebar-logo-area">
        <div className="sidebar-logo-icon">
          P
        </div>
        <div className="sidebar-logo-text-wrapper">
          <span className="sidebar-logo-title">UrbanPark</span>
          <span className="sidebar-logo-subtitle">HS thống đỗ xe thông minh</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button 
                className={`sidebar-nav-item ${
                  item.active 
                    ? 'sidebar-nav-item-active' 
                    : 'sidebar-nav-item-inactive'
                }`}
              >
                <span className={`sidebar-nav-icon ${item.active ? 'sidebar-nav-icon-active' : ''}`}>{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Area */}
      <div className="sidebar-bottom-area">
        <button 
          onClick={onOpenAddBranch}
          className="sidebar-add-btn"
        >
          <PlusOutlined />
          Thêm cơ sở mới
        </button>
        <ul className="sidebar-bottom-list">
          <li>
            <button className="sidebar-bottom-item">
              <QuestionCircleOutlined className="sidebar-bottom-icon" />
              <span className="sidebar-bottom-label">Hỗ trợ</span>
            </button>
          </li>
          <li>
            <button className="sidebar-bottom-item">
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
