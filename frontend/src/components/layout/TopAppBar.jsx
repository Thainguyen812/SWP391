import { useId, useState } from "react";
import { SearchOutlined, BellOutlined, MoonOutlined, SunOutlined, MenuOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context/GlobalContext";
import "./TopAppBar.css";

export const TopAppBarSection = ({ onMenuClick }) => {
  const searchId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const { searchValue, setSearchValue, currentUser } = useGlobalContext();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchRoutes = currentUser?.role === 'STAFF' ? [
    { path: '/staff-dashboard', label: 'Bảng điều khiển', keywords: ['bảng điều khiển', 'dashboard', 'trang chủ'] },
    { path: '/staff-gate-control', label: 'Điều khiển Cổng', keywords: ['điều khiển', 'cổng', 'gate', 'mở cổng'] },
    { path: '/staff-monitoring', label: 'Giám sát Camera', keywords: ['giám sát', 'camera', 'ai', 'video'] },
    { path: '/staff-payment', label: 'Quản lý Đỗ xe / Thanh toán', keywords: ['thanh toán', 'đỗ xe', 'thu tiền', 'phí'] },
    { path: '/staff-security', label: 'Cảnh báo An ninh', keywords: ['an ninh', 'cảnh báo', 'security', 'vi phạm'] },
    { path: '/staff-lost-card', label: 'Báo mất thẻ', keywords: ['mất thẻ', 'báo mất', 'lost card'] },
    { path: '/staff-transactions', label: 'Lịch sử giao dịch', keywords: ['giao dịch', 'lịch sử', 'history', 'hóa đơn'] },
    { path: '/staff-settings', label: 'Cài đặt hệ thống', keywords: ['cài đặt', 'settings', 'hệ thống', 'cấu hình', 'giao ca'] }
  ] : [
    { path: '/overview', label: 'Tổng quan hệ thống', keywords: ['tổng quan', 'overview', 'dashboard', 'bảng điều khiển'] },
    { path: '/monitoring', label: 'Giám sát bãi đỗ', keywords: ['giám sát', 'camera', 'ai', 'bãi đỗ'] },
    { path: '/revenue', label: 'Quản lý doanh thu', keywords: ['doanh thu', 'revenue', 'tài chính', 'tiền'] },
    { path: '/customers', label: 'Quản lý khách hàng', keywords: ['khách hàng', 'customer', 'người dùng', 'vé tháng', 'vip'] },
    { path: '/staff', label: 'Quản lý nhân sự', keywords: ['nhân sự', 'nhân viên', 'staff', 'ca trực'] },
    { path: '/transactions', label: 'Tra cứu giao dịch', keywords: ['giao dịch', 'tra cứu', 'history', 'hóa đơn'] },
    { path: '/settings', label: 'Cài đặt hệ thống', keywords: ['cài đặt', 'settings', 'hệ thống', 'cấu hình'] },
    { path: '/support', label: 'Hỗ trợ khách hàng', keywords: ['hỗ trợ', 'support', 'cskh', 'ticket'] },
    { path: '/admin', label: 'Quản trị (Legacy)', keywords: ['admin', 'quản trị'] }
  ];

  const filteredRoutes = searchValue 
    ? searchRoutes.filter(r => r.keywords.some(kw => kw.includes(searchValue.toLowerCase()) || searchValue.toLowerCase().includes(kw)))
    : [];

  if (searchValue) {
    const isStaff = currentUser?.role === 'STAFF';
    filteredRoutes.push({
      path: isStaff ? '/staff-transactions' : '/transactions',
      label: `Tra cứu biển số / mã giao dịch "${searchValue}"`,
      icon: 'search',
      preserveSearch: true
    });
  }

  const handleSearchSelect = (route) => {
    navigate(route.path);
    if (!route.preserveSearch) {
      setSearchValue('');
    }
    setShowSearchDropdown(false);
  };

  let pageTitle = 'Trang chủ';
  
  // Staff pages
  if (location.pathname === '/staff-dashboard') pageTitle = 'Bảng điều khiển';
  else if (location.pathname === '/staff-gate-control') pageTitle = 'Điều khiển cổng';
  else if (location.pathname === '/staff-payment') pageTitle = 'Thanh toán đỗ xe';
  else if (location.pathname === '/staff-monitoring') pageTitle = 'Giám sát camera';
  else if (location.pathname === '/staff-security') pageTitle = 'Cảnh báo an ninh';
  else if (location.pathname === '/staff-lost-card') pageTitle = 'Báo mất thẻ';
  else if (location.pathname === '/staff-transactions') pageTitle = 'Lịch sử giao dịch';
  else if (location.pathname === '/staff-settings') pageTitle = 'Bàn giao ca';
  
  // Manager pages
  else if (location.pathname === '/overview') pageTitle = 'Tổng quan hệ thống';
  else if (location.pathname === '/monitoring') pageTitle = 'Giám sát bãi đỗ';
  else if (location.pathname === '/revenue') pageTitle = 'Quản lý doanh thu';
  else if (location.pathname === '/customers') pageTitle = 'Quản lý khách hàng';
  else if (location.pathname === '/staff') pageTitle = 'Quản lý nhân sự';
  else if (location.pathname === '/transactions') pageTitle = 'Tra cứu giao dịch';
  else if (location.pathname === '/settings') pageTitle = 'Cài đặt hệ thống';
  else if (location.pathname === '/support') pageTitle = 'Hỗ trợ khách hàng';
  else if (location.pathname === '/admin') pageTitle = 'Admin Dashboard';

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="top-app-bar bg-white px-3 sm:px-6 h-16 flex items-center justify-between shadow-sm border-b border-slate-200">
      {/* Left Area: Title & Mobile Hamburger */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-center border border-slate-200"
          title="Mở menu"
        >
          <MenuOutlined className="text-base" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-800 m-0 truncate">{pageTitle}</h1>
      </div>

      {/* Center Area: Search */}
      <div className="flex justify-center flex-1 hidden md:flex">
        <div className="relative w-full max-w-[400px]">
          <label htmlFor={searchId} className="sr-only">Tìm kiếm</label>
          <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 text-lg" />
          <input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredRoutes.length > 0) {
                handleSearchSelect(filteredRoutes[0]);
              }
            }}
            placeholder="Tìm biển số, giao dịch, chức năng..."
            className="w-full bg-[#f8fafc] border border-slate-200 placeholder-slate-400 text-slate-600 text-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
            autoComplete="off"
          />
          {showSearchDropdown && searchValue && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden z-50">
              {filteredRoutes.length > 0 ? (
                <ul className="m-0 p-0 list-none">
                  {filteredRoutes.map((route, idx) => (
                    <li 
                      key={idx}
                      className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-0"
                      onClick={() => handleSearchSelect(route)}
                    >
                      <SearchOutlined className={`mr-2 ${route.icon === 'search' ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className={route.icon === 'search' ? 'text-blue-600 font-medium' : ''}>
                        {route.label}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  Không tìm thấy tính năng nào.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Actions */}
      <div className="flex items-center justify-end gap-4 flex-1">
        <button 
          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[20px]"
          onClick={() => notification.info({ message: "Không có thông báo mới", description: "Hệ thống đang hoạt động bình thường.", placement: "topRight" })}
        >
          <BellOutlined />
        </button>
        <button className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[20px]" onClick={toggleDarkMode}>
          {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-800">
              {(currentUser?.name === 'Operations Staff' || currentUser?.fullName === 'Operations Staff' || (!currentUser?.name && !currentUser?.fullName)) ? 'Phạm Hải Đăng' : (currentUser?.fullName || currentUser?.name || "Nhân viên")}
            </span>
            <span className="text-xs text-slate-500 max-w-[120px] truncate" title={currentUser?.id}>
              {currentUser?.username === 'staff' ? 'NV015' : (currentUser?.username || (currentUser?.id ? currentUser.id.substring(0, 8).toUpperCase() : "NV-0000"))}
            </span>
          </div>
          <button className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer shadow-sm flex-shrink-0">
            <img src={(currentUser?.username === 'staff' || currentUser?.name === 'Operations Staff') ? 'https://i.pravatar.cc/150?img=11' : (currentUser?.avatar || "https://i.pravatar.cc/150?img=11")} alt="Avatar" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
};
