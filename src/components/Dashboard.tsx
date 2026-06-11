import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Settings, 
  ShieldAlert, 
  HelpCircle, 
  MapPin, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle,
  Database,
  Briefcase,
  Activity,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  user: {
    name: string;
    phone: string;
    role: string;
  };
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeFacility, setActiveFacility] = useState('Toàn hệ thống');
  const [activeMenu, setActiveMenu] = useState('Tổng quan');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, text: 'Mất kết nối Camera LPR Cổng 03 - Hệ thống không nhận được tín hiệu từ Camera C03.', time: '10 phút trước', badge: 'Chỉ định kỹ thuật', level: 'critical' },
    { id: 2, text: 'Xe tải biển số 29C-883.12 đỗ quá giờ quy định tại khu vực B3.', time: '35 phút trước', badge: 'Cảnh báo', level: 'warning' },
    { id: 3, text: 'Giao dịch thanh toán cổng vào 01 hoàn tất thành công.', time: '40 phút trước', badge: 'Thành công', level: 'info' }
  ]);
  const [liveTime, setLiveTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatNumber = (num: number) => num < 10 ? '0' + num : num;
      const formattedDate = `${formatNumber(now.getDate())}/${formatNumber(now.getMonth() + 1)}/${now.getFullYear()} ${formatNumber(now.getHours())}:${formatNumber(now.getMinutes())}:${formatNumber(now.getSeconds())}`;
      setLiveTime(formattedDate);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const clearLog = (id: number) => {
    setSystemLogs(prev => prev.filter(log => log.id !== id));
  };

  return (
    <div id="dashboard-wrapper" className={`min-h-screen flex text-slate-800 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50'}`}>
      
      {/* 1. SIDEBAR NAVIGATION PANEL */}
      <aside id="sidebar-panel" className={`w-72 shrink-0 border-r flex flex-col justify-between p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} hidden lg:flex`}>
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg leading-tight tracking-tight">UrbanPark</h2>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 font-bold block">Smart Parking System</span>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">Thực đơn chính</span>
            {[
              { id: 'Tổng quan', icon: <Activity className="w-4 h-5" /> },
              { id: 'Giám sát bãi xe', icon: <Car className="w-4 h-5" /> },
              { id: 'Doanh thu', icon: <DollarSign className="w-4 h-5" /> },
              { id: 'Quản lý nhân sự', icon: <Users className="w-4 h-5" /> },
              { id: 'Khách hàng', icon: <Briefcase className="w-4 h-5" /> },
              { id: 'Cấu hình kỹ thuật', icon: <Settings className="w-4 h-5" /> },
              { id: 'Bảo mật', icon: <ShieldAlert className="w-4 h-5" /> },
              { id: 'Nhật ký hệ thống', icon: <Database className="w-4 h-5" /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all group ${
                  activeMenu === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15 font-semibold' 
                    : isDarkMode 
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.id}</span>
                </div>
                {activeMenu !== item.id && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Action Panel Utilities */}
        <div className="space-y-4">
          <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed rounded-xl text-sm font-semibold text-blue-600 border-blue-500/30 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            <span>Thêm cơ sở mới</span>
          </button>

          <div className={`pt-4 border-t flex flex-col gap-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <button className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm text-slate-500 hover:text-blue-500 transition-colors`}>
              <HelpCircle className="w-4 h-4" />
              <span>Hỗ trợ kỹ thuật</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất hệ thống</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN HUB WORKSPACE AREA */}
      <main id="main-workspace-hub" className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        
        {/* TOP BAR / NAVIGATION HEADER */}
        <header id="top-bar-header" className={`border-b p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {/* Small Mobile Logo Indicator */}
            <div className="lg:hidden p-2 bg-blue-600 rounded-lg text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold tracking-wider rounded-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ĐANG HOẠT ĐỘNG
                </span>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">SYSTEM PORTAL VER 1.0</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight mt-0.5">
                {activeFacility === 'Toàn hệ thống' ? 'Hệ thống đỗ xe quốc gia UrbanPark' : `UrbanPark - ${activeFacility}`}
              </h1>
            </div>
          </div>

          {/* Quick Filters, Settings & Profile Area */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            
            {/* Facility Hub selector Tabs */}
            <div className={`p-1 rounded-xl flex items-center gap-1 text-xs font-semibold select-none ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {['Toàn hệ thống', 'Cơ sở 01', 'Cơ sở 02'].map(fac => (
                <button
                  key={fac}
                  onClick={() => setActiveFacility(fac)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFacility === fac 
                      ? isDarkMode ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {fac}
                </button>
              ))}
            </div>

            {/* Dark mode & notifications utilities */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-all border ${isDarkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                title="Thay đổi giao diện sáng/tối"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="relative">
                <button className={`p-2 rounded-xl transition-all border ${isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  <Bell className="w-4 h-4 animate-swing" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500Ring ring-2 ring-white" />
                </button>
              </div>
            </div>

            {/* User Profile Summary */}
            <div className={`flex items-center gap-2.5 pl-2.5 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div id="avatar-container" className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-600 uppercase select-none">
                {user.name ? user.name.slice(0, 2) : 'QT'}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-sm font-semibold leading-tight">{user.name || 'Người dùng'}</p>
                <p className="text-[10px] font-mono text-slate-400 leading-tight uppercase font-medium">{user.role || 'Quản lý viên'}</p>
              </div>
            </div>

          </div>
        </header>

        {/* WORKSPACE MIDDLE BODY */}
        <div id="workspace-content-body" className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          
          {/* Section banner and live time */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-dashed border-slate-200">
            <div>
              <p className="text-xs text-blue-500 font-mono tracking-wider font-bold">WORKSPACE DASHBOARD</p>
              <h2 className="text-2xl font-black tracking-tight">Hệ thống giám sát tổng hợp</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200/50">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Dữ liệu cập nhật: {liveTime || 'Đang đồng bộ...'}</span>
            </div>
          </div>

          {/* 3. GRID METRICS WIDGETS */}
          <div id="metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: TOTAL REVENUE */}
            <div className={`p-5 rounded-2xl border transition-all hover:translate-y-[-2px] hover:shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[12px] text-slate-400 font-medium uppercase tracking-wider block">Doanh thu hôm nay</span>
                  <div className="text-3xl font-extrabold tracking-tight mt-1.5">45.2 Tr ₫</div>
                </div>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-xs">
                <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +12.4%
                </span>
                <span className="text-slate-400">so với hôm qua</span>
              </div>
            </div>

            {/* Card 2: SLOTS OCCUPIED */}
            <div className={`p-5 rounded-2xl border transition-all hover:translate-y-[-2px] hover:shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[12px] text-slate-400 font-medium uppercase tracking-wider block">Xe đang đỗ / Tổng</span>
                  <div className="text-3xl font-extrabold tracking-tight mt-1.5">1,248 / 1,500</div>
                </div>
                <div className="p-2.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl">
                  <Car className="w-5 h-5" />
                </div>
              </div>
              {/* Dynamic filling mini bar indicator */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '83%' }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-bold">
                  <span>83.2% KHÔNG GIAN BÃI</span>
                  <span>Còn 252 chỗ trống</span>
                </div>
              </div>
            </div>

            {/* Card 3: CAPACITY EFFICIENCY */}
            <div className={`p-5 rounded-2xl border transition-all hover:translate-y-[-2px] hover:shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[12px] text-slate-400 font-medium uppercase tracking-wider block">Hiệu suất lấp đầy</span>
                  <div className="text-3xl font-extrabold tracking-tight mt-1.5">85%</div>
                </div>
                <div className="p-2.5 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-xs">
                <span className="text-sky-500 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded">Tối ưu chi phí</span>
                <span className="text-slate-400 font-light font-sans">Khu vực đề xuất: 80% - 90%</span>
              </div>
            </div>

            {/* Card 4: INCIDENTS LOGGED */}
            <div className={`p-5 rounded-2xl border transition-all hover:translate-y-[-2px] hover:shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[12px] text-slate-400 font-medium uppercase tracking-wider block">Sự cố cần xử lý</span>
                  <div className="text-3xl font-extrabold tracking-tight mt-1.5 text-rose-500">
                    {systemLogs.length < 10 ? '0' + systemLogs.length : systemLogs.length}
                  </div>
                </div>
                <div className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">Cấp bách</span>
                <a href="#notifications-panel animate-bounce" className="text-blue-500 hover:underline font-bold">Xem chi tiết &rarr;</a>
              </div>
            </div>

          </div>

          {/* 4. VISUAL CHARTS SECTION */}
          <div id="charts-layouts" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Chart 1: Revenue over last 7 days */}
            <div className={`p-5 sm:p-6 rounded-2xl border xl:col-span-8 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100/10">
                  <div>
                    <h3 className="font-extrabold text-[15px] tracking-tight">Doanh thu bãi xe (7 ngày qua)</h3>
                    <p className="text-xs text-slate-400">Đơn vị tính: Triệu Việt Nam Đồng (VND)</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-[11px] font-bold text-blue-600 rounded">Tháng này</span>
                </div>

                {/* Highly customizable, pixel-perfect reactive SVG bar chart representing Premium craftsmanship */}
                <div className="h-56 w-full flex items-end justify-between gap-2.5 pt-6 relative select-none">
                  {/* Background grid lines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-slate-100 border-dashed pointer-events-none" />
                  <div className="absolute inset-x-0 top-2/4 border-t border-slate-100 border-dashed pointer-events-none" />
                  <div className="absolute inset-x-0 top-3/quarter border-t border-slate-100 border-dashed pointer-events-none" />
                  
                  {[
                    { label: 'T2', val: 32, labelVal: '32M' },
                    { label: 'T3', val: 28, labelVal: '28M' },
                    { label: 'T4', val: 45, labelVal: '45M' },
                    { label: 'T5', val: 38, labelVal: '38M' },
                    { label: 'T6', val: 51, labelVal: '51M' },
                    { label: 'T7', val: 65, labelVal: '65M' },
                    { label: 'CN', val: 42, labelVal: '42M' }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                      
                      {/* Interactive hover tooltip value display */}
                      <span className="opacity-0 group-hover:opacity-100 duration-150 absolute bottom-[72%] bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none z-25">
                        {bar.labelVal} ₫
                      </span>

                      {/* Bar Column body */}
                      <div 
                        className="w-full max-w-[42px] bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-lg group-hover:from-blue-500 group-hover:to-sky-300 transition-all duration-300 relative shadow-sm"
                        style={{ height: `${(bar.val / 70) * 100}%` }}
                      >
                        {/* Glow accent highlight */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg" />
                      </div>

                      {/* Day representation label */}
                      <span className="text-xs font-semibold text-slate-400">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-light">Thống kê tự động đồng bộ từ tổng máy chủ trung tâm ₫</span>
                <span className="text-blue-500 font-bold hover:underline cursor-pointer">Báo cáo chi tiết &rarr;</span>
              </div>
            </div>

            {/* Chart 2: Vehicle distribution pie donut chart */}
            <div className={`p-5 sm:p-6 rounded-2xl border xl:col-span-4 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
              <div>
                <h3 className="font-extrabold text-[15px] tracking-tight pb-3 border-b border-slate-100/10">Phân bổ phương tiện</h3>
                
                {/* SVG Centered Circular Donut rendering actual segments */}
                <div className="relative flex justify-center items-center py-6">
                  
                  {/* Center static label */}
                  <div className="absolute text-center select-none pointer-events-none">
                    <p className="text-2xl font-black text-slate-900">1,248</p>
                    <p className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">TỔNG PHƯƠNG TIỆN</p>
                  </div>

                  {/* Stunning Vector Donut circle segments */}
                  <svg className="w-40 h-40 transform rotate-[-90deg]">
                    {/* Background wheel track */}
                    <circle cx="80" cy="80" r="62" fill="transparent" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeWidth="11" />
                    
                    {/* Segment 1: Cars (60%) => circumference is 2 * pi * r = 389.56 => 60% = 233.7 */}
                    <circle cx="80" cy="80" r="62" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDasharray="389.56" strokeDashoffset="155.82" strokeLinecap="round" className="transition-all duration-500" />
                    
                    {/* Segment 2: Standard (25%) => offset is 233.7 = dashoffset 155.82. 25% length is 97.39 */}
                    <circle cx="80" cy="80" r="62" fill="transparent" stroke="#38bdf8" strokeWidth="12" strokeDasharray="389.56" strokeDashoffset="253.21" strokeLinecap="round" />

                    {/* Segment 3: VIP (15%) => 15% length = 58.43 */}
                    <circle cx="80" cy="80" r="62" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="389.56" strokeDashoffset="311.64" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Descriptive Legends with beautiful matching badges */}
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span className="text-slate-500 leading-none">Ô tô (Đăng ký tháng)</span>
                    </div>
                    <span className="font-bold">60%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <span className="text-slate-500 leading-none">Xe máy / Xe vãng lai</span>
                    </div>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-500 leading-none">Xe VIP / Thành viên</span>
                    </div>
                    <span className="font-bold">15%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center font-light">
                Biểu đồ phân bổ nguồn cung theo lượt vào/ra bãi.
              </div>
            </div>

          </div>

          {/* 5. SPLIT: STAFF LIST & NOTIFICATION LOGS PANEL */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Shift Staff personnel table */}
            <div className={`p-5 sm:p-6 rounded-2xl border xl:col-span-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
              <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-[15px] tracking-tight">Hộ tống / Nhân sự ca trực</h3>
                  <p className="text-xs text-slate-400">Nhân viên đạt hiệu suất cao nhất</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">ĐẠT CHỈ TIÊU</span>
              </div>

              <div className="py-2.5 space-y-3.5">
                {[
                  { name: 'Nguyễn Văn A', slot: 'Cổng Ra 01', stats: '342 lượt xe', active: true, role: 'Kỹ Thuật Viên' },
                  { name: 'Trần Thị B', slot: 'Cổng Vào 02', stats: '315 lượt xe', active: true, role: 'Nhân Viên Soát Vé' },
                  { name: 'Phạm Minh C', slot: 'Khu Vực Bãi Cửu Long', stats: '298 lượt xe', active: false, role: 'Giám Sát Bãi' }
                ].map((staff, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 border border-slate-200 select-none">
                        {staff.name.slice(-1)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{staff.name}</h4>
                        <span className="text-[11px] text-slate-400 font-light block">{staff.role} • {staff.slot}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 block">{staff.stats}</span>
                      <span className="text-[10px] pb-0.5 inline-flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle className="w-3 h-3" /> Hiệu suất tuyệt vời
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Warning Alert listing */}
            <div id="notifications-panel" className={`p-5 sm:p-6 rounded-2xl border xl:col-span-7 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
              <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-[15px] tracking-tight">Cảnh báo &amp; Thông số hệ thống</h3>
                  <p className="text-xs text-slate-400">Yêu cầu phản hồi cấp bách của kỹ thuật</p>
                </div>
                <button 
                  onClick={() => setSystemLogs([])}
                  className="text-xs text-blue-500 hover:underline font-bold"
                >
                  Xóa tất cả log
                </button>
              </div>

              {systemLogs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                  <p className="text-sm">Mọi dịch vụ đang vận hành hoàn hảo!</p>
                  <span className="text-xs font-light text-slate-400">Hệ thống an ninh không phát sinh thêm sự cố</span>
                </div>
              ) : (
                <div className="pt-3 space-y-3.5">
                  {systemLogs.map(log => (
                    <div 
                      key={log.id} 
                      className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all relative ${
                        log.level === 'critical' 
                          ? 'bg-rose-50/70 border-rose-100 text-rose-950' 
                          : log.level === 'warning'
                            ? 'bg-amber-50/70 border-amber-100 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        log.level === 'critical' ? 'bg-rose-100 text-rose-600' : log.level === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 pr-6">
                        <p className="text-xs font-semibold leading-relaxed">{log.text}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          <span className="font-medium font-mono text-slate-500">{log.time}</span>
                          <span>•</span>
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            log.level === 'critical' ? 'bg-rose-100 text-rose-700' : log.level === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {log.badge}
                          </span>
                        </div>
                      </div>

                      {/* Quiet clear/X button */}
                      <button 
                        onClick={() => clearLog(log.id)}
                        className="absolute top-3.5 right-3.5 hover:bg-black/5 p-1 rounded-full text-slate-400 hover:text-slate-700 text-xs font-bold font-sans"
                        title="Đóng thông báo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer info line */}
        <footer className={`border-t p-4 text-center text-xs font-mono tracking-wider ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
          URBANPARK TECHNOLOGY SERVICE CORPORATION © {new Date().getFullYear()} • SECURITY NETWORK ENCRYPTED
        </footer>

      </main>

    </div>
  );
}
