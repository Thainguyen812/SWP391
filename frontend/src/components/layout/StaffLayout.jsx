import React from 'react';
import { StaffSidebar } from './StaffSidebar';
import { TopAppBarSection } from './TopAppBar';

const StaffLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9] dark:bg-slate-900 w-full">
      {/* Sidebar - Cố định bên trái */}
      <div className="flex-shrink-0 h-full w-[250px] relative z-20 hidden md:block">
        <StaffSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 w-full">
        {/* Top App Bar - Cố định ở trên */}
        <div className="flex-shrink-0 z-30 shadow-sm border-b border-[#e2e8f0] dark:border-slate-800">
          <TopAppBarSection />
        </div>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
