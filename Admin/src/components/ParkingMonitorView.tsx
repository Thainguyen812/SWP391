import React, { useState } from 'react';
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
  History,
  Search,
  Check,
  X,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Eye,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  const [activeTabFloor, setActiveTabFloor] = useState<'B1' | 'B2'>('B1');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Total spots in systems (exact Screenshot 2 match)
  const totalSlotsStatic = 500;
  
  // Initial occupied is 342, vip is 12, vacant is 158.
  // We can track the modifications based on the state of blueprintSlots relative to initial state.
  const initialOccupiedCount = 9; // Number of initial non-vacant in manual config
  const initialVipCount = 3; 

  const currentOccupiedInDb = blueprintSlots.filter(s => s.status === 'ĐÃ ĐỖ' || s.status === 'XE VIP').length;
  const currentVipInDb = blueprintSlots.filter(s => s.status === 'XE VIP').length;

  const deltaOccupied = currentOccupiedInDb - initialOccupiedCount;
  const deltaVip = currentVipInDb - initialVipCount;

  const currentTotalOccupied = Math.max(0, 342 + deltaOccupied);
  const currentTotalVip = Math.max(0, 12 + deltaVip);
  const currentTotalVacant = Math.max(0, totalSlotsStatic - currentTotalOccupied);

  // Static Screenshot 2 activities prepended with new ones
  const staticActivities = [
    { id: 'sa-1', plate: '30A-123.45', type: 'VĂNG LAI', gate: 'Cổng vào 1', time: 'Vừa xong', action: 'Vào', status: 'VĂNG LAI' },
    { id: 'sa-2', plate: '51F-987.65', type: 'VIP', gate: 'Cổng ra 2', time: '2 phút trước', action: 'Ra', status: 'VIP' },
    { id: 'sa-3', plate: '29C-444.11', type: 'THUÊ BAO', gate: 'Cổng vào 3', time: '5 phút trước', action: 'Vào', status: 'THUÊ BAO' },
    { id: 'sa-4', plate: 'UNKNOWN', type: 'CẢNH BÁO LPR', gate: 'Cổng vào 1', time: '10 phút trước', action: 'ALERT', status: 'ALERT' }
  ];

  // Merge runtime dynamic activities with static screenshot ones
  const allActivitiesDisplay = [
    ...recentActivities.map(act => ({
      id: act.id,
      plate: act.plate,
      type: act.vip ? 'VIP' : 'VĂNG LAI',
      gate: act.gate || 'Cổng vào 1',
      time: act.time || 'Vừa xong',
      action: act.action || 'Vào',
      status: act.vip ? 'VIP' : 'VĂNG LAI'
    })),
    ...staticActivities
  ].filter(act => {
    if (!activitySearchQuery) return true;
    const q = activitySearchQuery.toLowerCase();
    return act.plate.toLowerCase().includes(q) || act.gate.toLowerCase().includes(q) || act.type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100 font-sans" id="parking-monitor-board">

      {/* ADMIN INTERACTIVE SIMULATION & DIAGNOSTIC PANEL */}
      <div id="admin-simulation-pnl" className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-105 uppercase tracking-widest font-sans">
              Bảng Thử Nghiệm Tình Huống Kỹ Thuật & Giả Lập Hệ Thống (Mã nguồn Bốt Vận Hành)
            </h3>
          </div>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md text-slate-500 font-mono font-bold">
            ADMIN KERNEL V2.1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* GOOD SCENARIOS (TRƯỜNG HỢP TỐT) */}
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/10 dark:border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>TRƯỜNG HỢP TỐT (SUCCESS RUNS)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Thử nghiệm hệ thống tự động hóa khi thiết bị ngoài bãi hoạt động hoàn hảo:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  let count = 0;
                  const updatedSlots = blueprintSlots.map(s => {
                    if (s.status === 'CÒN' && count < 3) {
                      count++;
                      return {
                        ...s,
                        status: 'ĐÃ ĐỖ',
                        vehicleType: 'Sedan',
                        plate: `30F-${Math.floor(10000 + Math.random() * 90000)}`,
                        entryTime: '15:10'
                      };
                    }
                    return s;
                  });
                  setBlueprintSlots(updatedSlots);
                  triggerToast('Giả lập: 3 xe ô tô quét biển LPR chuẩn và vào bầm thành công!', 'success');
                }}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
              >
                Đồng bộ LPR (3 Xe Vào)
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const occupied = blueprintSlots.find(s => s.status === 'ĐÃ ĐỖ');
                  if (!occupied) {
                    triggerToast('Không có phương tiện giả lập để thanh toán!', 'error');
                    return;
                  }
                  handleManualCheckOut(occupied.id, occupied.label);
                  triggerToast(`Xác nhận thanh toán tự động hoàn tất cho ô ${occupied.label}!`, 'success');
                }}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
              >
                Thống toán & Giải toả ô đỗ
              </button>
            </div>
          </div>

          {/* BAD SCENARIOS (TRƯỜNG HỢP XẤU) */}
          <div className="p-4 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/10 dark:border-rose-500/20 space-y-3">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>TRƯỜNG HỢP XẤU & SỰ CỐ (FAULT TUNING)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Phát hiện và cảnh báo tức thời các trạng thái không an sau ngoài bến bãi:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerToast('🚨 HỆ THỐNG PHÁT HIỆN: Camera LPR Cổng Vào 1 bị che khuất hoặc lỗi tín hiệu!', 'error');
                }}
                className="p-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
              >
                Mất tín hiệu camera LPR
              </button>
              
              <button
                type="button"
                onClick={() => {
                  triggerToast('⚠️ CẢNH BÁO BÓT GÁC: Cảm biến vòng từ (Loop Sensor) kẹt ở cổng 2!', 'error');
                }}
                className="p-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
              >
                Lỗi kẹt cảm biến vòng từ
              </button>
            </div>
          </div>

        </div>

        <div className="text-[10px] dark:text-slate-400 text-slate-500 leading-normal bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
          📍 <strong>Mẹo kiểm tra phản xạ vận hành:</strong> Bằng cách giả lập <strong>"Mất tín hiệu camera LPR"</strong>, bốt trực sẽ được thông báo ngay điều hướng nhân viên bảo an kiểm tra đầu cáp quang hoặc chuyển sang chụp ảnh thủ công bằng app di động để khắc phục tức thời!
        </div>
      </div>
      
      {/* TOP FOUR STATS CARDS ROW (Exact Screenshot 2 Replication) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        {/* CARD 1: TỔNG CHỖ */}
        <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-3xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black font-mono shrink-0">
            P
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">TỔNG CHỖ</span>
            <h3 className="text-3xl font-black font-sans leading-tight mt-0.5">{totalSlotsStatic}</h3>
          </div>
        </div>

        {/* CARD 2: ĐANG ĐỖ */}
        <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-3xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">ĐANG ĐỖ</span>
              <h3 className="text-3xl font-black font-sans leading-tight mt-0.5">{currentTotalOccupied}</h3>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-550 dark:text-rose-455">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          {/* Visual Red/Orange Line Indicator */}
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${Math.round((currentTotalOccupied / totalSlotsStatic) * 100)}%` }} />
          </div>
        </div>

        {/* CARD 3: TRỐNG */}
        <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-3xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">TRỐNG</span>
              <h3 className="text-3xl font-black font-sans leading-tight mt-0.5 text-emerald-600 dark:text-emerald-400">{currentTotalVacant}</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          {/* Visual Green Line Indicator */}
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.round((currentTotalVacant / totalSlotsStatic) * 100)}%` }} />
          </div>
        </div>

        {/* CARD 4: XE VIP */}
        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between text-white shadow-md relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">★ XE VIP</span>
              <h3 className="text-2.5xl font-mono font-black tracking-tight mt-0.5">{currentTotalVip}</h3>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5">
            <Sparkles className="w-24 h-24 text-white" />
          </div>
        </div>

      </div>

      {/* TWO-COLUMN GRAPHICS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ARCHITECTURAL PARKING BLUEPRINT MAP (COLSPAN 8) */}
        <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 rounded-2xl space-y-5 text-left">
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <strong className="text-base font-black text-slate-850 dark:text-white font-sans">
                Sơ đồ tầng hầm {activeTabFloor}
              </strong>
              {/* Flashing LIVE dot tag */}
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-100 dark:border-rose-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>

            {/* Level B1 vs. B2 Toggles (Exact Screenshot 2) */}
            <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-950 text-xs font-bold font-sans">
              <button
                onClick={() => {
                  setActiveTabFloor('B1');
                  triggerToast('Hiện sơ đồ: Tầng hầm B1', 'info');
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTabFloor === 'B1'
                    ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-3xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Tầng B1
              </button>
              <button
                onClick={() => {
                  setActiveTabFloor('B2');
                  triggerToast('Hiện sơ đồ: Tầng hầm B2 (Dữ liệu giả lập)', 'info');
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTabFloor === 'B2'
                    ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-3xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Tầng B2
              </button>
            </div>
          </div>

          {/* DYNAMIC INTERACTIVE PLATFORM CANVAS GRID */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-850 p-4 min-h-[360px] flex flex-col justify-between relative overflow-hidden">
            
            {/* GRID BACKGROUND WATERMARK */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-25" />
            
            <div className="relative z-10 space-y-6">
              
              {/* INTERACTIVE CONTROLS BOX FOR DEMO SIMULATIONS */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <span>Click vào ô trống để Đỗ Xe, click ô có xe để Trả Xe / Thanh toán.</span>
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const vacant = blueprintSlots.find(s => s.status === 'CÒN');
                      if (!vacant) {
                        triggerToast('Hầm đã đầy chỗ!', 'error');
                        return;
                      }
                      const p = prompt('Biển số xe vào bãi:', `30A-${Math.floor(10000 + Math.random() * 90000)}`);
                      if (p) {
                        const isVip = Math.random() > 0.7;
                        const type = isVip ? 'Sang trọng' : 'Sedan';
                        const updatedSlots = blueprintSlots.map(s => s.id === vacant.id ? {
                          ...s, status: isVip ? 'XE VIP' : 'ĐÃ ĐỖ', vehicleType: type, plate: p.toUpperCase(), entryTime: '14:30'
                        } : s);
                        setBlueprintSlots(updatedSlots);
                        setRecentActivities([{
                          id: `run-${Date.now()}`, plate: p.toUpperCase(), type, gate: 'Cổng vào 1', time: 'Vừa xong', action: 'Vào', vip: isVip
                        }, ...recentActivities]);
                        triggerToast(`Đã xếp chỗ thành công: ${p.toUpperCase()} tại bến ${vacant.label}!`, 'success');
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10.5px] rounded-lg transition-all shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Mô phỏng Xe Vào</span>
                  </button>

                  <button 
                    onClick={() => {
                      const occupied = blueprintSlots.find(s => s.status === 'ĐÃ ĐỖ' || s.status === 'XE VIP');
                      if (!occupied) {
                        triggerToast('Không có xe nào đang đỗ để ra bãi!', 'error');
                        return;
                      }
                      handleManualCheckOut(occupied.id, occupied.label);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-extrabold text-[10.5px] rounded-lg transition-all border border-slate-205 dark:border-slate-750 flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Mô phỏng Xe Ra</span>
                  </button>
                </div>
              </div>

              {/* GRAPHICAL ARCHITECTURAL MAP SCHEMATIC */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {blueprintSlots.map(slot => {
                  const isAvailable = slot.status === 'CÒN';
                  const isVip = slot.status === 'XE VIP';
                  const isMaintenance = slot.status === 'BẢO TRÌ';
                  
                  return (
                    <div
                      key={slot.id}
                      onClick={() => {
                        if (isMaintenance) {
                          triggerToast(`Vị trí ${slot.label} đang thuộc diện bảo trì hệ thống!`, 'error');
                          return;
                        }
                        if (isAvailable) {
                          setSelectedSlotForCheckIn(slot);
                          setCheckInPlate(`29A-${Math.floor(10000 + Math.random() * 90000)}`);
                        } else {
                          setSelectedSlotDetails(slot);
                        }
                      }}
                      className={`relative border rounded-xl p-3 flex flex-col justify-between aspect-[4/3] cursor-pointer transition-all hover:scale-[1.03] select-none block text-left ${
                        isAvailable
                          ? 'bg-white dark:bg-slate-900 border-emerald-500/30 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-emerald-500/10 hover:shadow-md'
                          : isVip
                          ? 'bg-[#1e1b4b] border-indigo-500 text-indigo-200'
                          : isMaintenance
                          ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-300/40 dark:border-rose-900/40 text-slate-400 opacity-60'
                          : 'bg-slate-50 dark:bg-slate-950/30 border-rose-500/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {/* Slot Header Label */}
                      <div className="flex justify-between items-center select-none">
                        <strong className="text-xs font-mono font-black">{slot.label}</strong>
                        {isVip ? (
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                        ) : isAvailable ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 block shrink-0" />
                        ) : isMaintenance ? (
                          <Wrench className="w-3 h-3 text-rose-550 shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-rose-500 block shrink-0" />
                        )}
                      </div>

                      {/* Schematic Visual vehicle / details inside box */}
                      <div className="mt-2 block">
                        {isAvailable ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">TRỐNG</span>
                        ) : isMaintenance ? (
                          <span className="text-[9.5px] font-bold text-slate-400 block truncate">BẢO TRÌ</span>
                        ) : (
                          <div className="space-y-0.5 truncate block">
                            <strong className="text-[11px] font-mono leading-none tracking-tight block uppercase text-slate-900 dark:text-white">
                              {slot.plate}
                            </strong>
                            <span className="text-[9px] text-slate-400 font-bold block truncate">
                              {slot.vehicleType}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: RECENT ACTIVITIES LIST (COLSPAN 4) (Exact Screenshot 2) */}
        <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 text-left">
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-105 dark:border-slate-850">
            <strong className="text-sm font-black text-slate-850 dark:text-white">
              Hoạt động gần nhất
            </strong>

            <button
              onClick={() => triggerToast("Hiển thị bộ lọc hoạt động gần nhất nâng cấp!", "info")}
              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-lg text-slate-450 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Search bar filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Lọc hoạt động..."
              value={activitySearchQuery}
              onChange={(e) => setActivitySearchQuery(e.target.value)}
              className="w-full text-xs font-bold pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Feed Activity List Frame */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {allActivitiesDisplay.map(act => {
                const isAlert = act.status === 'ALERT';
                const isVip = act.status === 'VIP';
                const isThueBao = act.status === 'THUÊ BAO';
                const isExit = act.action === 'Ra';

                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`p-3 border rounded-xl transition-all flex items-center justify-between gap-3 text-xs leading-normal ${
                      isAlert 
                        ? 'bg-rose-50/60 dark:bg-rose-950/15 border-rose-250 dark:border-rose-900/30 border-l-4 border-l-rose-500 shadow-rose-200/5 dark:shadow-none' 
                        : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-105 dark:border-slate-850/60'
                    }`}
                  >
                    
                    <div className="flex items-center gap-3">
                      {/* Live Indicator Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border uppercase font-black font-mono text-[10px] select-none ${
                        isAlert
                          ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-455 dark:border-rose-900/30'
                          : isVip
                          ? 'bg-slate-900 text-white border-slate-800'
                          : isThueBao
                          ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30'
                      }`}>
                        {isAlert ? '⚠️' : isExit ? '←' : '→'}
                      </div>

                      <div className="leading-tight block text-left">
                        <strong className={`font-mono text-sm uppercase block tracking-tight ${isAlert ? 'text-rose-600 font-extrabold' : 'text-slate-850 dark:text-white'}`}>
                          {act.plate}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          {act.type} • {act.gate}
                        </span>
                      </div>
                    </div>

                    <div className="text-right leading-tight">
                      <span className="text-[10px] text-slate-400 font-bold font-mono block">{act.time}</span>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider mt-1.5 px-1.5 py-0.5 rounded ${
                        isAlert 
                          ? 'bg-rose-100 text-rose-750 dark:bg-rose-500/10 dark:text-rose-455' 
                          : isVip 
                          ? 'bg-slate-800 text-slate-200' 
                          : isThueBao 
                          ? 'bg-blue-50 text-blue-650 dark:bg-blue-950/20' 
                          : 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20'
                      }`}>
                        {act.action === 'Ra' ? 'Cổng ra' : act.action === 'ALERT' ? 'CẢNH BÁO LPR' : 'Cổng vào'}
                      </span>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button
            onClick={() => {
              setActiveMenu('system_log');
              triggerToast("Mở màn hình nhật ký kiểm toán hệ thống để xem dòng chảy dữ liệu...", "info");
            }}
            className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] uppercase tracking-wider transition-all duration-200 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl"
          >
            Mở rộng nhật ký toàn bộ bốt trục
          </button>

        </div>

      </div>

      {/* QUICK SLOT CHECK-IN AND CHECK-OUT MODAL SCREENS OVERLAY (DYNAMIC REACTIVES) */}
      <AnimatePresence>
        {selectedSlotForCheckIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-905 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full space-y-4 overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedSlotForCheckIn(null)}
                className="absolute top-4 right-4 text-slate-450 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b">
                <Compass className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-black font-sans">Đỗ xe thủ công: Cột {selectedSlotForCheckIn.label}</h3>
              </div>

              <div className="space-y-3.5 block text-left text-xs font-bold">
                <div className="space-y-1 block">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Biển kiểm soát</label>
                  <input
                    type="text"
                    value={checkInPlate}
                    onChange={(e) => setCheckInPlate(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm leading-tight uppercase font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Phân nhóm phương tiện</label>
                  <select
                    value={checkInVehicleType}
                    onChange={(e) => setCheckInVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Sedan">Sedan (Ô tô)</option>
                    <option value="SUV">SUV (Bán tải/Hatchback)</option>
                    <option value="Sang trọng">Xe Sang trọng (Phí Cao)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkInIsVip}
                    onChange={() => setCheckInIsVip(!checkInIsVip)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-350 focus:ring-indigo-500"
                  />
                  <span>Áp dụng diện hội viên đặc biệt (VIP)</span>
                </label>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setSelectedSlotForCheckIn(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 font-extrabold text-xs rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    if (!checkInPlate.trim()) {
                      triggerToast('Vui lòng nhập biển kiểm soát hợp lệ!', 'error');
                      return;
                    }
                    
                    // Trigger manual check in
                    const updatedSlots = blueprintSlots.map(s => {
                      if (s.id === selectedSlotForCheckIn.id) {
                        return {
                          ...s,
                          status: checkInIsVip ? 'XE VIP' : 'ĐÃ ĐỖ',
                          vehicleType: checkInVehicleType,
                          plate: checkInPlate.toUpperCase(),
                          entryTime: new Date().toLocaleTimeString().substring(0, 5)
                        };
                      }
                      return s;
                    });
                    setBlueprintSlots(updatedSlots);
                    
                    const newLog = {
                      id: `run-${Date.now()}`,
                      plate: checkInPlate.toUpperCase(),
                      type: checkInVehicleType,
                      gate: 'Cổng vào 1',
                      time: new Date().toLocaleTimeString().substring(0, 8),
                      action: 'Vào',
                      vip: checkInIsVip
                    };
                    setRecentActivities([newLog, ...recentActivities]);

                    setVehicles([
                      {
                        plate: checkInPlate.toUpperCase(),
                        type: checkInVehicleType === 'Sang trọng' ? 'VIP' : 'CON',
                        zone: 'Khu C (Hầm B1)',
                        slot: selectedSlotForCheckIn.label,
                        entryTime: new Date().toLocaleTimeString().substring(0, 5),
                        ownerName: checkInIsVip ? 'Khách hàng VIP' : 'Khách vãng lai',
                        phone: '090*******'
                      },
                      ...vehicles
                    ]);

                    triggerToast(`Đã đỗ xe ${checkInPlate.toUpperCase()} thành công tại ô ${selectedSlotForCheckIn.label}!`, 'success');
                    setSelectedSlotForCheckIn(null);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Xác nhận đỗ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSlotDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-905 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full space-y-4 overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedSlotDetails(null)}
                className="absolute top-4 right-4 text-slate-450 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b">
                <Eye className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-black font-sans text-slate-850 dark:text-white">Chi tiết vị trí {selectedSlotDetails.label}</h3>
              </div>

              <div className="space-y-3 block text-left text-xs font-bold text-slate-600 dark:text-slate-350">
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span>BIỂN SỐ XE</span>
                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white tracking-widest">{selectedSlotDetails.plate}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span>LOẠI PHƯƠNG TIỆN</span>
                  <span className="text-slate-900 dark:text-white font-black">{selectedSlotDetails.vehicleType || 'Sedan'}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span>HẠNG KHÁCH HÀNG</span>
                  <span className={`font-black ${selectedSlotDetails.status === 'XE VIP' ? 'text-amber-500' : 'text-blue-500'}`}>
                    {selectedSlotDetails.status === 'XE VIP' ? 'HỘI VIÊN VIP' : 'VÃNG LAI'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>THỜI ĐIỂM VÀO</span>
                  <span className="font-mono text-slate-900 dark:text-white font-black">{selectedSlotDetails.entryTime || '10:12'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedSlotDetails(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-xs font-extrabold rounded-xl"
                >
                  Đóng cửa sổ
                </button>
                <button
                  onClick={() => {
                    handleManualCheckOut(selectedSlotDetails.id, selectedSlotDetails.label);
                    setSelectedSlotDetails(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  LPR Xuất Bãi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
