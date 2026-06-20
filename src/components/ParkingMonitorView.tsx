import React from 'react';
import { 
  Home, 
  Layers, 
  Plus, 
  LogOut, 
  ChevronDown, 
  Activity, 
  Info, 
  Sparkles, 
  Compass, 
  Wrench, 
  History 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Highly polished, realistic 2D vector graphic representing a top-down view of a car
const TopDownCarSVG = ({ color }: { color: string }) => {
  return (
    <svg viewBox="0 0 100 50" className="w-full h-8 select-none pointer-events-none drop-shadow-md">
      {/* Wheels */}
      <rect x="15" y="1" width="14" height="6" rx="2" fill="#1e293b" />
      <rect x="70" y="1" width="14" height="6" rx="2" fill="#1e293b" />
      <rect x="15" y="43" width="14" height="6" rx="2" fill="#1e293b" />
      <rect x="70" y="43" width="14" height="6" rx="2" fill="#1e293b" />
      
      {/* Car body */}
      <rect x="8" y="5" width="84" height="40" rx="10" fill={color} />
      
      {/* Roof outline */}
      <rect x="25" y="10" width="46" height="30" rx="6" fill="#111827" opacity="0.15" />
      
      {/* Windshields */}
      <path d="M 28,12 L 34,9 L 34,41 L 28,38 Z" fill="#e2e8f0" opacity="0.8" />
      <path d="M 68,12 L 62,9 L 62,41 L 68,38 Z" fill="#e2e8f0" opacity="0.8" />
      
      {/* Headlights */}
      <rect x="91" y="9" width="3" height="6" rx="1.5" fill="#fef08a" />
      <rect x="91" y="35" width="3" height="6" rx="1.5" fill="#fef08a" />
      
      {/* Taillights */}
      <rect x="7" y="10" width="3" height="5" rx="1" fill="#ef4444" />
      <rect x="7" y="35" width="3" height="5" rx="1" fill="#ef4444" />
    </svg>
  );
};

interface ParkingMonitorViewProps {
  blueprintSlots: any[];
  setBlueprintSlots: (slots: any[]) => void;
  recentActivities: any[];
  setRecentActivities: (activities: any[]) => void;
  vehicles: any[];
  setVehicles: (vehicles: any[]) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  isDarkMode: boolean;
  setActiveMenu: (menu: any) => void;
  handleManualCheckIn: () => void;
  handleManualCheckOut: (slotId: string, label: string) => void;
  
  // State from Dashboard
  checkInPlate: string;
  setCheckInPlate: (plate: string) => void;
  checkInVehicleType: string;
  setCheckInVehicleType: (type: any) => void;
  checkInIsVip: boolean;
  setCheckInIsVip: (isVip: boolean) => void;
  selectedSlotForCheckIn: any;
  setSelectedSlotForCheckIn: (slot: any) => void;
  selectedSlotDetails: any;
  setSelectedSlotDetails: (slot: any) => void;
  
  monitoringFacility: string;
  setMonitoringFacility: (f: string) => void;
  monitoringFloor: string;
  setMonitoringFloor: (fl: string) => void;
  showFacilityDropdown: boolean;
  setShowFacilityDropdown: (show: boolean) => void;
  showFloorDropdown: boolean;
  setShowFloorDropdown: (show: boolean) => void;
}

export function ParkingMonitorView({
  blueprintSlots,
  setBlueprintSlots,
  recentActivities,
  setRecentActivities,
  vehicles,
  setVehicles,
  triggerToast,
  isDarkMode,
  setActiveMenu,
  handleManualCheckIn,
  handleManualCheckOut,
  checkInPlate,
  setCheckInPlate,
  checkInVehicleType,
  setCheckInVehicleType,
  checkInIsVip,
  setCheckInIsVip,
  selectedSlotForCheckIn,
  setSelectedSlotForCheckIn,
  selectedSlotDetails,
  setSelectedSlotDetails,
  monitoringFacility,
  setMonitoringFacility,
  monitoringFloor,
  setMonitoringFloor,
  showFacilityDropdown,
  setShowFacilityDropdown,
  showFloorDropdown,
  setShowFloorDropdown
}: ParkingMonitorViewProps) {

  // Dynamic status values matching the exact numbers shown in the screenshots
  const totalSlotsStatic = 1500;
  // Dynamic offset to scale based on current mock database
  const activeOccupiedInDb = blueprintSlots.filter(s => s.status === 'ĐÃ ĐỖ' || s.status === 'XE VIP').length;
  const activeVipInDb = blueprintSlots.filter(s => s.status === 'XE VIP').length;
  
  // Base offset to meet the exact static screenshot target (1,248 and 42)
  const currentTotalOccupied = 1239 + activeOccupiedInDb;
  const currentTotalVip = 39 + activeVipInDb;
  const currentTotalVacant = totalSlotsStatic - currentTotalOccupied;
  const occupiedPercentage = Math.round((currentTotalOccupied / totalSlotsStatic) * 100);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-150" id="parking-monitor-board">
      
      {/* TWO-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (COLSPAN 8): FILTERS & ARCHITECTURAL BLUEPRINT */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* HEADER SELECTION ROW WITH DROPDOWNS AND REAL-TIME ACTION TRIGGERS */}
          <div className="flex flex-wrap items-center gap-3 pb-1">
            
            {/* Facility selector */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowFacilityDropdown(!showFacilityDropdown);
                  setShowFloorDropdown(false);
                }}
                className={`px-4 py-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold flex items-center gap-2 select-none min-w-[170px] justify-between shadow-xs transition-all duration-150 cursor-pointer ${
                  showFacilityDropdown ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span>{monitoringFacility}</span>
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              
              <AnimatePresence>
                {showFacilityDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-30 overflow-hidden"
                  >
                    {['Cơ sở chính (HQ)', 'Cơ sở Bắc Từ Liêm', 'Cơ sở Quận 1 (HCMC)'].map(fac => (
                      <button
                        key={fac}
                        onClick={() => {
                          setMonitoringFacility(fac);
                          setShowFacilityDropdown(false);
                          triggerToast(`Chuyển sang: ${fac}`, 'info');
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300 transition-colors block cursor-pointer"
                      >
                        {fac}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Floor level selector */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowFloorDropdown(!showFloorDropdown);
                  setShowFacilityDropdown(false);
                }}
                className={`px-4 py-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold flex items-center gap-2 select-none min-w-[140px] justify-between shadow-xs transition-all duration-150 cursor-pointer ${
                  showFloorDropdown ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{monitoringFloor}</span>
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              
              <AnimatePresence>
                {showFloorDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-30 overflow-hidden"
                  >
                    {['Tầng hầm B1', 'Tầng hầm B2', 'Tầng trệt G'].map(flr => (
                      <button
                        key={flr}
                        onClick={() => {
                          setMonitoringFloor(flr);
                          setShowFloorDropdown(false);
                          triggerToast(`Bộ lọc sơ đồ: ${flr}`, 'success');
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300 transition-colors block cursor-pointer"
                      >
                        {flr}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simulated Live Action Controls representing functional gates */}
            <div className="sm:ml-auto flex items-center gap-2">
              <button 
                onClick={() => {
                  // Find first vacant spot in Level B1
                  const vacant = blueprintSlots.find(s => s.status === 'CÒN');
                  if (!vacant) {
                    triggerToast('Hầm B1 đã chật kín, mô phỏng xe vào tự động chuyển bãi đỗ khác!', 'error');
                    return;
                  }
                  const mockPlates = ['51A-892.44', '29C-123.99', '30F-999.99', '60A-112.33', '43B-777.88', '30K-959.59'];
                  const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)];
                  const isVipRandom = Math.random() > 0.6 || randomPlate === '30F-999.99';
                  const carType = randomPlate === '29C-123.99' ? 'SUV' : 'Sedan';
                  
                  triggerToast(`Nhận diện LPR cổng vào: Phát hiện phương tiện ${randomPlate}...`, 'info');
                  
                  setTimeout(() => {
                    const updatedSlots = blueprintSlots.map(s => {
                      if (s.id === vacant.id) {
                        return {
                          ...s,
                          status: isVipRandom ? 'XE VIP' : 'ĐÃ ĐỖ',
                          vehicleType: carType,
                          plate: randomPlate,
                          entryTime: new Date().toLocaleTimeString().substring(0, 5)
                        };
                      }
                      return s;
                    });
                    setBlueprintSlots(updatedSlots);

                    // Add live action log with current timestamp
                    const nowString = new Date().toLocaleTimeString().substring(0, 8);
                    const newLog = {
                      id: `act-${Date.now()}`,
                      plate: randomPlate,
                      type: isVipRandom ? 'Sang trọng (VIP)' : carType,
                      gate: 'Cổng vào 1',
                      time: nowString,
                      action: 'Vào',
                      vip: isVipRandom
                    };
                    setRecentActivities([newLog, ...recentActivities]);

                    // Sync vehicles register
                    setVehicles([
                      {
                        plate: randomPlate,
                        type: isVipRandom ? 'VIP' : 'OTO',
                        zone: 'Khu C (Hầm B1)',
                        slot: vacant.label,
                        entryTime: new Date().toLocaleTimeString().substring(0, 5),
                        ownerName: isVipRandom ? 'Khách hàng VIP' : 'Khách vãng lai',
                        phone: '090*******'
                      },
                      ...vehicles
                    ]);
                    
                    triggerToast(`Xe ${randomPlate} đỗ thành công tại bến ${vacant.label}!`, 'success');
                  }, 800);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Xe Vào</span>
              </button>

              <button 
                onClick={() => {
                  const occupied = blueprintSlots.find(s => s.status === 'ĐÃ ĐỖ' || s.status === 'XE VIP');
                  if (!occupied) {
                    triggerToast('Hiện tại không có xe nào đang đỗ tại LEVEL B1!', 'error');
                    return;
                  }
                  handleManualCheckOut(occupied.id, occupied.label);
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Simulate Xe Ra</span>
              </button>
            </div>

          </div>

          {/* THE MASTER SMART PARKING BLUEPRINT CARD */}
          <div className={`p-6 bg-white dark:bg-slate-900 border rounded-2xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200/80 shadow-sm'} space-y-4`}>
            
            {/* Blueprint Header */}
            <div className="flex justify-between items-center text-xs font-semibold pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400 block">SƠ ĐỒ BÃI XE KHOA HỌC: {monitoringFloor}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">Hiệu suất: Ổn định</span>
                <button 
                  onClick={() => {
                    const resetSlots = blueprintSlots.map(s => ({
                      id: s.id,
                      label: s.label,
                      status: s.status === 'BẢO TRÌ' ? 'BẢO TRÌ' : 'CÒN'
                    }));
                    setBlueprintSlots(resetSlots);
                    setVehicles([]);
                    triggerToast('Đã dọn dẹp trống toàn bộ ô đỗ hầm B1', 'info');
                  }}
                  className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer"
                >
                  Reset Trống
                </button>
              </div>
            </div>

            {/* SCHEMATIC FLOOR LAYOUT MAP */}
            <div className="relative rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 bg-[#eef2f6] dark:bg-[#0f172a] shadow-inner select-none overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25" />
              
              <div className="relative z-10 space-y-6">
                
                {/* Blueprint Header Label */}
                <div className="text-center font-mono opacity-80 py-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                  <h3 className="text-sm font-black tracking-[0.2em] text-[#334155] dark:text-[#475569]">SMART PARKING BLUEPRINT</h3>
                  <span className="text-[10.5px] font-bold text-[#475569] dark:text-slate-400">{monitoringFloor} • ARCHITECTURAL CAP GRID</span>
                </div>

                {/* ZONE A: MAIN SEDAN LANES */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-black text-slate-400 tracking-wider block">ZONE A (DÀNH CHO Ô TÔ CON / SEDAN)</span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {blueprintSlots.filter(s => ['B1-01', 'B1-02', 'B1-03', 'B1-04', 'B1-05', 'B1-06', 'B1-07', 'B1-08'].some(prefix => s.id.includes(prefix))).map(slot => {
                      const isOccupied = slot.status === 'ĐÃ ĐỖ' || slot.status === 'XE VIP';
                      const isVip = slot.status === 'XE VIP';
                      const isMaint = slot.status === 'BẢO TRÌ';
                      return (
                        <button
                          key={slot.id}
                          onClick={() => {
                            if (isMaint) {
                              triggerToast(`Vị trí ${slot.label} đang bảo trì cảm biến điện!`, 'error');
                            } else if (isOccupied) {
                              setSelectedSlotDetails(slot);
                              setSelectedSlotForCheckIn(null);
                            } else {
                              setSelectedSlotForCheckIn(slot);
                              setSelectedSlotDetails(null);
                              setCheckInPlate('');
                            }
                          }}
                          className={`relative border p-2 rounded-lg flex flex-col items-center justify-between min-h-[96px] transition-all cursor-pointer outline-hidden ${
                            isOccupied 
                              ? isVip 
                                ? 'bg-amber-500/10 border-amber-500 hover:ring-2 hover:ring-amber-500/30' 
                                : 'bg-blue-600/10 border-blue-600 hover:ring-2 hover:ring-blue-600/30'
                              : isMaint
                                ? 'bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-700 opacity-60 cursor-not-allowed'
                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 hover:border-emerald-500 hover:scale-103'
                          }`}
                        >
                          <span className="text-[9px] font-mono font-black text-slate-400 leading-none">{slot.label}</span>
                          
                          <div className="w-full flex-1 flex items-center justify-center py-1">
                            {isOccupied ? (
                              <div className="w-full text-center">
                                <TopDownCarSVG color={isVip ? '#eab308' : '#ef4444'} />
                                <span className="text-[9px] font-mono font-black text-slate-800 dark:text-white block mt-0.5 truncate uppercase">{slot.plate}</span>
                              </div>
                            ) : isMaint ? (
                              <div className="text-[9px] font-bold text-slate-500 flex flex-col items-center gap-0.5 leading-none">
                                <Wrench className="w-3.5 h-3.5" />
                                <span>ERR</span>
                              </div>
                            ) : (
                              <div className="w-full h-8 border border-dashed border-emerald-300 dark:border-emerald-850 rounded bg-emerald-500/5 flex items-center justify-center text-[9px] font-extrabold text-[#10b981]">
                                TRỐNG
                              </div>
                            )}
                          </div>
                          
                          {isOccupied && (
                            <span className={`text-[7px] font-black uppercase inline-block leading-none ${isVip ? 'text-amber-500' : 'text-blue-500'}`}>
                              {isVip ? '★ VIP' : 'Sedan'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CENTRAL ROADWAY WITH REAL DIRECTION INDICATORS */}
                <div className="relative py-2 font-mono select-none overflow-hidden h-14 bg-slate-300/30 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-[10px] font-bold text-[#475569] dark:text-slate-400">
                  <span className="flex items-center gap-1.5 leading-none">
                    <span>◀ LỐI DI CHUYỂN CHỦ ĐẠO ◀</span>
                    <span className="border-t border-dashed border-slate-400 dark:border-slate-600 w-8" />
                  </span>
                  <div className="flex flex-col items-center justify-center text-center leading-none text-[8px] opacity-45">
                    <span>TỰ ĐỘNG CHUẨN LPR CỔNG VÀO / RA</span>
                    <span>TƯƠNG TÁC CHẠY CHÈN REAL-TIME HẦM B1</span>
                  </div>
                  <span className="flex items-center gap-1.5 leading-none">
                    <span className="border-t border-dashed border-slate-400 dark:border-slate-600 w-8" />
                    <span>▶ LỐI RA THÔNG BARIE SỐ 1 ▶</span>
                  </span>
                </div>

                {/* ZONE B & ZONE C: COMBO CHARGING AND HEAVY SUV SLOTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* ZONE B - CHARGING ready */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-black text-slate-400 tracking-wider block">ZONE B (CÓ SẠC ĐIỆN NHANH EV⚡)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {blueprintSlots.filter(s => ['B1-12', 'B1-13', 'B1-14', 'B1-15', 'B1-16', 'B1-17', 'B1-18', 'B1-19'].some(prefix => s.id.includes(prefix))).map(slot => {
                        const isOccupied = slot.status === 'ĐÃ ĐỖ' || slot.status === 'XE VIP';
                        const isVip = slot.status === 'XE VIP';
                        const isMaint = slot.status === 'BẢO TRÌ';
                        return (
                          <button
                            key={slot.id}
                            onClick={() => {
                              if (isMaint) {
                                triggerToast(`Trạm sạc ${slot.label} bảo dưỡng ổ phát!`, 'error');
                              } else if (isOccupied) {
                                setSelectedSlotDetails(slot);
                                setSelectedSlotForCheckIn(null);
                              } else {
                                setSelectedSlotForCheckIn(slot);
                                setSelectedSlotDetails(null);
                                setCheckInPlate('');
                              }
                            }}
                            className={`relative border p-2 flex flex-col items-center justify-between min-h-[90px] rounded-lg transition-all cursor-pointer outline-hidden ${
                              isOccupied 
                                ? isVip 
                                  ? 'bg-amber-500/10 border-amber-500 hover:ring-2 hover:ring-amber-500/30' 
                                  : 'bg-blue-600/10 border-blue-600 hover:ring-2 hover:ring-blue-600/30'
                                : isMaint
                                  ? 'bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-700 opacity-60 cursor-not-allowed'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:scale-103'
                            }`}
                          >
                            <div className="w-full flex justify-between items-center text-[8.5px] font-mono leading-none">
                              <span className="text-slate-400 font-bold">{slot.label}</span>
                              <span className="text-emerald-500 font-black">⚡</span>
                            </div>
                            
                            <div className="w-full flex-1 flex items-center justify-center py-0.5">
                              {isOccupied ? (
                                <div className="w-full text-center">
                                  <TopDownCarSVG color={isVip ? '#eab308' : '#3b82f6'} />
                                  <span className="text-[8.5px] font-mono font-black text-slate-800 dark:text-white block mt-0.5 truncate uppercase">{slot.plate}</span>
                                </div>
                              ) : isMaint ? (
                                <div className="text-[8.5px] font-bold text-slate-550 flex flex-col items-center">
                                  <Wrench className="w-3.5 h-3.5" />
                                  <span>MNT</span>
                                </div>
                              ) : (
                                <div className="w-full h-7 border border-dashed border-emerald-300 dark:border-emerald-800 rounded bg-emerald-500/5 flex items-center justify-center text-[8.5px] font-extrabold text-emerald-500">
                                  SẠC EV
                                </div>
                              )}
                            </div>
                            
                            {isOccupied && (
                              <span className={`text-[6.5px] font-black uppercase text-center block leading-none ${isVip ? 'text-amber-500' : 'text-blue-500'}`}>
                                {isVip ? '★ VIP' : 'Ev Sedan'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ZONE C - SUV SIZE */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-black text-slate-400 tracking-wider block">ZONE C (DÀNH CHO XE SUV / LỚN)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {blueprintSlots.filter(s => ['B1-20', 'B1-21', 'B1-22', 'B1-23', 'B1-24', 'B1-25', 'B1-26', 'B1-27'].some(prefix => s.id.includes(prefix))).map(slot => {
                        const isOccupied = slot.status === 'ĐÃ ĐỖ' || slot.status === 'XE VIP';
                        const isVip = slot.status === 'XE VIP';
                        const isMaint = slot.status === 'BẢO TRÌ';
                        return (
                          <button
                            key={slot.id}
                            onClick={() => {
                              if (isMaint) {
                                triggerToast(`Vị trí SUV ${slot.label} đang nâng cấp bảo trì cảm biến cân!`, 'error');
                              } else if (isOccupied) {
                                setSelectedSlotDetails(slot);
                                setSelectedSlotForCheckIn(null);
                              } else {
                                setSelectedSlotForCheckIn(slot);
                                setSelectedSlotDetails(null);
                                setCheckInPlate('');
                              }
                            }}
                            className={`relative border p-2 flex flex-col items-center justify-between min-h-[90px] rounded-lg transition-all cursor-pointer outline-hidden ${
                              isOccupied 
                                ? isVip 
                                  ? 'bg-amber-500/10 border-amber-500 hover:ring-2 hover:ring-amber-500/30' 
                                  : 'bg-blue-600/10 border-blue-600 hover:ring-2 hover:ring-blue-600/30'
                                : isMaint
                                  ? 'bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-700 opacity-60 cursor-not-allowed'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:scale-103'
                            }`}
                          >
                            <span className="text-[8.5px] font-mono text-slate-400 leading-none block self-start font-bold">{slot.label}</span>
                            
                            <div className="w-full flex-1 flex items-center justify-center py-0.5">
                              {isOccupied ? (
                                <div className="w-full text-center">
                                  <TopDownCarSVG color={isVip ? '#eab308' : '#ec4899'} />
                                  <span className="text-[8.5px] font-mono font-black text-slate-800 dark:text-white block mt-0.5 truncate uppercase">{slot.plate}</span>
                                </div>
                              ) : isMaint ? (
                                <div className="text-[8.5px] font-bold text-slate-550 flex flex-col items-center">
                                  <Wrench className="w-3.5 h-3.5" />
                                  <span>MNT</span>
                                </div>
                              ) : (
                                <div className="w-full h-7 border border-dashed border-emerald-350 dark:border-emerald-800 rounded bg-emerald-500/5 flex items-center justify-center text-[8.5px] font-extrabold text-[#10b981]">
                                  TRỐNG
                                </div>
                              )}
                            </div>
                            
                            {isOccupied && (
                              <span className={`text-[6.5px] font-black uppercase inline-block leading-none ${isVip ? 'text-amber-500' : 'text-blue-500'}`}>
                                {isVip ? '★ VIP Card' : 'SUV Size'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* BOTTOM MAP META INFO SUMMARY */}
                <div className="flex justify-between items-center opacity-60 text-[9.5px] font-mono text-slate-500 border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 font-bold">
                  <span>HIỆU SUẤT TRỐNG CÒN LẠI: {Math.round((blueprintSlots.filter(s => s.status === 'CÒN').length / blueprintSlots.length) * 100)}% ({blueprintSlots.filter(s => s.status === 'CÒN').length}/{blueprintSlots.length} ô)</span>
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-400 rotate-45" />
                    <span>MẶT BẰNG HẦM B1 THỰC VẬT SCALE 1.0</span>
                  </span>
                </div>

              </div>
            </div>

            {/* SEAMLESS LANDSCAPE FOOTER LEGEND */}
            <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold tracking-wide">
              <div className="flex items-center gap-2">
                <span className="w-4 h-3 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 uppercase">CÒN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-3 rounded bg-blue-600 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 uppercase">ĐÃ ĐỖ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-3 rounded bg-amber-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 font-bold uppercase">XE VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-3 rounded bg-slate-400 inline-block animate-pulse" />
                <span className="text-slate-600 dark:text-slate-400 uppercase">BẢO TRÌ</span>
              </div>
            </div>

          </div>

          {/* DOCK DRAWER CONTROL COMPONENT - INLINE FLOATING DETAILS */}
          <AnimatePresence mode="wait">
            {selectedSlotForCheckIn && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-5 bg-white dark:bg-slate-900 border border-blue-500/25 rounded-2xl shadow-xl space-y-4 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2 pl-2">
                    <Plus className="w-4 h-4 text-blue-500" />
                    <span>CẤP PHÉP ĐỖ XE THỦ CÔNG TẠI Ô [{selectedSlotForCheckIn.label}]</span>
                  </h4>
                  <button onClick={() => setSelectedSlotForCheckIn(null)} className="text-slate-400 hover:text-red-500 font-extrabold text-xs cursor-pointer">HỦY BỎ</button>
                </div>
                
                <p className="text-slate-550 dark:text-slate-350 text-xs pl-2">Nhập thủ công thông tin phương tiện đỗ hiện diện để đồng bộ thanh toán vào cơ sở dữ liệu.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 pl-2 font-sans items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Biển kiểm soát</label>
                    <input 
                      type="text"
                      placeholder="30A-999.88"
                      value={checkInPlate}
                      onChange={(e) => setCheckInPlate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs uppercase font-extrabold text-slate-800 dark:text-white tracking-widest outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Dòng xe</label>
                    <select 
                      value={checkInVehicleType}
                      onChange={(e: any) => setCheckInVehicleType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <option value="Sedan">Sedan (Du lịch 4-5 chỗ)</option>
                      <option value="SUV">SUV (Tổng 7 chỗ/Bác tài)</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Sang trọng">VIP Luxury VIP</option>
                    </select>
                  </div>

                  <div className="flex items-center h-10 select-none">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded text-blue-500 border-slate-300"
                        checked={checkInIsVip}
                        onChange={(e) => setCheckInIsVip(e.target.checked)}
                      />
                      <span className="text-xs font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>Thành viên VIP</span>
                      </span>
                    </label>
                  </div>

                  <div>
                    <button 
                      onClick={handleManualCheckIn}
                      className="w-full py-2 bg-blue-605 hover:bg-blue-700 bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wide rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      Xác Nhận Đỗ
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedSlotDetails && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-5 bg-white dark:bg-slate-900 border border-amber-500/25 rounded-2xl shadow-xl space-y-4 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                
                <div className="flex justify-between items-center pl-2">
                  <h4 className="text-sm font-black text-amber-600 dark:text-amber-4000 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-500" />
                    <span>CHI TIẾT PHIÊN XE ĐANG ĐỖ: Ô ĐỖ [{selectedSlotDetails.label}]</span>
                  </h4>
                  <button onClick={() => setSelectedSlotDetails(null)} className="text-slate-400 hover:text-red-500 font-extrabold text-xs cursor-pointer">ĐÓNG</button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 pl-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wide font-bold">Biển kiểm soát xe</span>
                    <strong className="text-sm font-mono font-black text-[#1e293b] dark:text-white uppercase tracking-widest">{selectedSlotDetails.plate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wide font-bold">Kiểu mẫu dáng xe</span>
                    <strong className="text-xs text-slate-700 dark:text-slate-200 block font-bold">{selectedSlotDetails.vehicleType || 'Sedan'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wide font-bold">Giờ cập bến đỗ</span>
                    <strong className="text-xs text-slate-700 dark:text-slate-200 block font-bold">{selectedSlotDetails.entryTime || 'Mới đây'} (Vừa đỗ)</strong>
                  </div>
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => handleManualCheckOut(selectedSlotDetails.id, selectedSlotDetails.label)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      Lệnh xuất barie (Xe ra khỏi bãi)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN (COLSPAN 4): SUMMARY STATS & REPLICATED RECENT IN/OUT ACTIVITY TIMELINE (100% VISUALLY MATCHING OVERVIEW) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* STATS DECK 1: TRẠNG THÁI BÃI (REPLICATED 100% IN ACCORDANCE WITH THE IMAGE SPECIFICATIONS) */}
          <div className={`p-6 bg-white dark:bg-slate-900 border rounded-2xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200/80 shadow-sm'} space-y-5 text-left`}>
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-sans">Trạng thái bãi</h3>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4 text-xs font-sans">
              
              {/* Option 1: Tổng số chỗ */}
              <div className="space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Tổng số chỗ</span>
                  <span className="text-slate-800 dark:text-white font-black text-sm">1,500</span>
                </div>
                <div className="h-0.5 w-full bg-slate-900 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Option 2: Hiện đang đỗ */}
              <div className="space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Hiện đang đỗ ({occupiedPercentage}%)</span>
                  <span className="text-rose-500 font-black text-sm">{currentTotalOccupied}</span>
                </div>
                {/* Visual red track indicator */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-300" 
                    style={{ width: `${occupiedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Option 3: Còn trống */}
              <div className="space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Còn trống</span>
                  <span className="text-emerald-500 font-black text-sm">{currentTotalVacant}</span>
                </div>
                {/* Visual green track indicator */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${100 - occupiedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Option 4: Xe VIP hiện diện */}
              <div className="pt-2">
                <div className="flex justify-between items-center bg-amber-500/5 dark:bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/10 font-bold">
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-black">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Xe VIP hiện diện</span>
                  </span>
                  <span className="text-slate-900 dark:text-white font-black text-sm">{currentTotalVip}</span>
                </div>
              </div>

            </div>

          </div>

          {/* DOCK TIMELINE CARD 2: HOẠT ĐỘNG VÀO/RA (100% REPLICATED ACCORDING TO SCREENSHOT ROWS) */}
          <div className={`p-6 bg-white dark:bg-slate-900 border rounded-2xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200/80 shadow-sm'} space-y-4 text-left`}>
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Hoạt động vào/ra</h3>
              <History className="w-4 h-4 text-slate-400" />
            </div>

            {/* Structured horizontal timeline rows */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {recentActivities.map(act => {
                  const isEntry = act.action === 'Vào' || act.action === 'IN';
                  const isVip = act.vip;
                  return (
                    <motion.div 
                      key={act.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-805/40"
                    >
                      <div className="flex items-center gap-2.5">
                        {isVip ? (
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-black shrink-0 select-none">
                            ★
                          </div>
                        ) : isEntry ? (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0 select-none">
                            IN
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0 select-none">
                            OUT
                          </div>
                        )}
                        <div className="leading-tight">
                          <strong className="text-xs font-mono font-black text-slate-800 dark:text-white uppercase block leading-none">{act.plate}</strong>
                          <span className="text-[10px] text-slate-400 font-bold block mt-1">{act.type} • {act.gate}</span>
                        </div>
                      </div>
                      
                      <div className="text-right leading-tight">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block">{act.time}</span>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider mt-1 ${isVip ? 'text-amber-500' : isEntry ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {isEntry ? 'Vào' : 'Ra'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Seamless Action Link to view Full Audit trail */}
            <button 
              onClick={() => {
                setActiveMenu('system_log');
                triggerToast('Bộ chọn: Hiển thị toàn bộ lịch trình nhật ký hệ thống!', 'info');
              }}
              className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-extrabold text-xs transition-all duration-200 rounded-xl cursor-pointer"
            >
              Xem tất cả lịch sử
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
