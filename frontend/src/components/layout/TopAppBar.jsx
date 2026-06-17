import { useId, useState } from "react";
import { SearchOutlined, BellOutlined, MoonOutlined, SunOutlined, CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { useLocation } from "react-router-dom";
import { useGlobalContext } from "../../context/GlobalContext";
import "./TopAppBar.css";

const locations = [
  { id: "co-so-01", label: ["Cơ", "sở 01"] },
  { id: "co-so-02", label: ["Cơ sở", "02"] },
  { id: "toan-he-thong", label: ["Toàn hệ", "thống"] },
];

export const TopAppBarSection = () => {
  const searchId = useId();
  const location = useLocation();
  const { searchValue, setSearchValue, activeLocation, setActiveLocation } = useGlobalContext();
  const [isOnline, setIsOnline] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Xác định Title của trang dựa vào Route
  let pageTitle = null;
  if (location.pathname === '/staff-dashboard') pageTitle = 'Bảng điều khiển';
  else if (location.pathname === '/staff-gate-control') pageTitle = 'Điều khiển Cổng';
  else if (location.pathname === '/staff-payment') pageTitle = 'Hệ thống quản lý đỗ xe';

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
    <header className="top-app-bar">
      {/* Left Area: Search or Title */}
      <div className="search-container">
        {pageTitle ? (
          <div className="flex items-center gap-2 text-base text-slate-500 ml-4 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 m-0 whitespace-nowrap truncate">{pageTitle}</h2>
            <span className="px-2 flex-shrink-0">|</span>
            <span className="tracking-wide whitespace-nowrap truncate hidden sm:block">UrbanPark Systems</span>
          </div>
        ) : (
          <div className="search-input-wrapper">
            <label htmlFor={searchId} className="sr-only">Tìm kiếm</label>
            <SearchOutlined className="search-icon" />
            <input
              id={searchId}
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Tìm kiếm..."
              className="search-input"
            />
          </div>
        )}
      </div>

      {/* Center Area: Location Selector */}
      <div className="location-nav">
        <nav className="location-list">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveLocation(loc.id)}
              className={`location-item ${
                activeLocation === loc.id ? "location-item-active" : "location-item-inactive"
              }`}
            >
              <span className={`location-text ${activeLocation === loc.id ? "location-text-active" : "location-text-inactive"}`}>
                {loc.label[0]} <br/> {loc.label[1]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right Area: Actions & Avatar */}
      <div className="actions-container">
        <button 
          className={`status-btn ${!isOnline ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' : ''}`}
          onClick={() => setIsOnline(!isOnline)}
        >
          {isOnline ? (
            <CheckCircleOutlined className="status-icon" />
          ) : (
            <WarningOutlined className="status-icon text-orange-500" />
          )}
          <span className="status-text">{isOnline ? 'Hệ thống: Hoạt động' : 'Hệ thống: Bảo trì'}</span>
        </button>

        <div className="icons-group">
          <button 
            className="icon-btn"
            onClick={() => notification.info({ message: "Không có thông báo mới", description: "Hệ thống đang hoạt động bình thường.", placement: "topRight" })}
          >
            <BellOutlined />
          </button>
          <button className="icon-btn" onClick={toggleDarkMode}>
            {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          </button>
          <button className="avatar-btn">
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="avatar-img" />
          </button>
        </div>
      </div>
    </header>
  );
};
