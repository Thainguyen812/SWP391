import { useId, useState } from "react";
import { SearchOutlined, BellOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { useLocation } from "react-router-dom";
import { useGlobalContext } from "../../context/GlobalContext";
import "./TopAppBar.css";

export const TopAppBarSection = () => {
  const searchId = useId();
  const location = useLocation();
  const { searchValue, setSearchValue } = useGlobalContext();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Xác định Title và Breadcrumb dựa vào Route
  let pageTitle = 'Trang chủ';
  let breadcrumb = 'Trang chủ';
  
  if (location.pathname === '/staff-dashboard') {
    pageTitle = 'Bảng điều khiển';
    breadcrumb = 'Trang chủ > Bảng điều khiển';
  } else if (location.pathname === '/staff-gate-control') {
    pageTitle = 'Điều khiển Cổng';
    breadcrumb = 'Trang chủ > Điều khiển Cổng';
  } else if (location.pathname === '/staff-payment') {
    pageTitle = 'Quản lý Đỗ xe';
    breadcrumb = 'Trang chủ > Quản lý Đỗ xe';
  } else if (location.pathname === '/staff-monitoring') {
    pageTitle = 'Giám sát Camera';
    breadcrumb = 'Trang chủ > Giám sát bãi xe';
  } else if (location.pathname === '/staff-security') {
    pageTitle = 'Cảnh báo An ninh';
    breadcrumb = 'Trang chủ > Cảnh báo An ninh';
  } else if (location.pathname === '/staff-lost-card') {
    pageTitle = 'Báo mất thẻ';
    breadcrumb = 'Trang chủ > Báo mất thẻ';
  } else if (location.pathname === '/staff-transactions') {
    pageTitle = 'Lịch sử giao dịch';
    breadcrumb = 'Trang chủ > Lịch sử giao dịch';
  } else if (location.pathname === '/staff-settings') {
    pageTitle = 'Cài đặt hệ thống';
    breadcrumb = 'Trang chủ > Cài đặt';
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
    <header className="top-app-bar bg-white px-6 h-[72px] flex items-center justify-between shadow-sm border-b border-slate-200">
      {/* Left Area: Breadcrumb & Title */}
      <div className="flex flex-col justify-center">
        <div className="text-[11px] text-slate-500 font-medium mb-0.5">
          {breadcrumb.split(' > ').map((part, index, array) => (
            <span key={index}>
              <span className={index === array.length - 1 ? 'text-slate-700 font-bold' : ''}>{part}</span>
              {index < array.length - 1 && <span className="mx-1 text-slate-300">&gt;</span>}
            </span>
          ))}
        </div>
        <h1 className="text-[22px] font-bold text-slate-800 m-0 leading-tight">{pageTitle}</h1>
      </div>

      {/* Right Area: Search & Actions */}
      <div className="flex items-center gap-6">
        <div className="relative w-[300px] hidden md:block">
          <label htmlFor={searchId} className="sr-only">Tìm kiếm</label>
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm kiếm hệ thống..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm px-9 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-lg"
            onClick={() => notification.info({ message: "Không có thông báo mới", description: "Hệ thống đang hoạt động bình thường.", placement: "topRight" })}
          >
            <BellOutlined />
          </button>
          <button className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-lg" onClick={toggleDarkMode}>
            {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          </button>
          <button className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer">
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
};
