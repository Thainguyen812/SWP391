import React, { useState } from 'react';
import { StaffSidebar } from './StaffSidebar';
import { TopAppBarSection } from './TopAppBar';
import { Drawer } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppstoreOutlined, 
  DesktopOutlined, 
  CreditCardOutlined, 
  VideoCameraOutlined,
  MenuOutlined
} from '@ant-design/icons';

const StaffLayout = ({ children }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const mobileNavItems = [
    { path: '/staff-dashboard', label: 'Tổng quan', icon: <AppstoreOutlined /> },
    { path: '/staff-gate-control', label: 'Cổng trực', icon: <DesktopOutlined /> },
    { path: '/staff-payment', label: 'Thanh toán', icon: <CreditCardOutlined /> },
    { path: '/staff-monitoring', label: 'Giám sát', icon: <VideoCameraOutlined /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9] dark:bg-slate-900 w-full flex-col md:flex-row">
      {/* Sidebar - Cố định bên trái máy tính */}
      <div className="flex-shrink-0 h-full w-[250px] relative z-20 hidden md:block">
        <StaffSidebar />
      </div>

      {/* Drawer di động cho điện thoại */}
      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        placement="left"
        width={260}
        styles={{ body: { padding: 0, backgroundColor: '#051424' } }}
      >
        <StaffSidebar onItemClick={() => setMobileDrawerOpen(false)} />
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 w-full pb-14 md:pb-0">
        {/* Top App Bar */}
        <div className="flex-shrink-0 z-30 shadow-sm border-b border-[#e2e8f0] dark:border-slate-800">
          <TopAppBarSection onMenuClick={() => setMobileDrawerOpen(true)} />
        </div>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto w-full p-2 sm:p-4">
          {children}
        </main>
      </div>

      {/* Bottom Navigation Bar di động cho điện thoại */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#051424] text-slate-300 border-t border-slate-800 flex justify-around items-center h-14 shadow-2xl">
        {mobileNavItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold transition-all ${isActive ? 'text-blue-400 bg-white/10' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="text-base leading-none mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
        >
          <MenuOutlined className="text-base leading-none mb-1" />
          <span>Tất cả</span>
        </button>
      </div>
    </div>
  );
};

export default StaffLayout;
