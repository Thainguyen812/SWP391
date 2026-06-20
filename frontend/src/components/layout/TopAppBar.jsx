import { useId, useState } from "react";
import { SearchOutlined, BellOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context/GlobalContext";
import "./TopAppBar.css";

export const TopAppBarSection = () => {
  const searchId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const { searchValue, setSearchValue } = useGlobalContext();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchRoutes = [
    { path: '/staff-dashboard', label: 'Bảng điều khiển', keywords: ['bảng điều khiển', 'dashboard', 'trang chủ'] },
    { path: '/staff-gate-control', label: 'Điều khiển Cổng', keywords: ['điều khiển', 'cổng', 'gate', 'mở cổng'] },
    { path: '/staff-monitoring', label: 'Giám sát Camera', keywords: ['giám sát', 'camera', 'ai', 'video'] },
    { path: '/staff-payment', label: 'Quản lý Đỗ xe / Thanh toán', keywords: ['thanh toán', 'đỗ xe', 'thu tiền', 'phí'] },
    { path: '/staff-security', label: 'Cảnh báo An ninh', keywords: ['an ninh', 'cảnh báo', 'security', 'vi phạm'] },
    { path: '/staff-lost-card', label: 'Báo mất thẻ', keywords: ['mất thẻ', 'báo mất', 'lost card'] },
    { path: '/staff-transactions', label: 'Lịch sử giao dịch', keywords: ['giao dịch', 'lịch sử', 'history', 'hóa đơn'] },
    { path: '/staff-settings', label: 'Cài đặt hệ thống', keywords: ['cài đặt', 'settings', 'hệ thống', 'cấu hình'] }
  ];

  const filteredRoutes = searchValue 
    ? searchRoutes.filter(r => r.keywords.some(kw => kw.includes(searchValue.toLowerCase()) || searchValue.toLowerCase().includes(kw)))
    : [];

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchValue('');
    setShowSearchDropdown(false);
  };

  let pageTitle = 'Trang chủ';
  if (location.pathname === '/staff-dashboard') {
    pageTitle = 'Bảng điều khiển';
  } else if (location.pathname === '/staff-gate-control') {
    pageTitle = 'Điều khiển cổng';
  } else if (location.pathname === '/staff-payment') {
    pageTitle = 'Thanh toán đỗ xe';
  } else if (location.pathname === '/staff-monitoring') {
    pageTitle = 'Giám sát camera';
  } else if (location.pathname === '/staff-security') {
    pageTitle = 'Cảnh báo an ninh';
  } else if (location.pathname === '/staff-lost-card') {
    pageTitle = 'Báo mất thẻ';
  } else if (location.pathname === '/staff-transactions') {
    pageTitle = 'Lịch sử giao dịch';
  } else if (location.pathname === '/staff-settings') {
    pageTitle = 'Bàn giao ca';
  }

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
    <header className="top-app-bar bg-white px-6 h-16 flex items-center justify-between shadow-sm border-b border-slate-200">
      {/* Left Area: Title */}
      <div className="flex items-center flex-1">
        <h1 className="text-lg font-bold text-slate-800 m-0">{pageTitle}</h1>
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
                handleSearchSelect(filteredRoutes[0].path);
              }
            }}
            placeholder="Tìm biển số, khu vực..."
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
                      onClick={() => handleSearchSelect(route.path)}
                    >
                      <SearchOutlined className="mr-2 text-slate-400" />
                      {route.label}
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
            <span className="text-sm font-bold text-slate-800">{currentUser?.name || "Nhân viên"}</span>
            <span className="text-xs text-slate-500">{currentUser?.id || "NV-0000"}</span>
          </div>
          <button className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer shadow-sm">
            <img src={currentUser?.avatar || "https://i.pravatar.cc/150?img=11"} alt="Avatar" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
};
