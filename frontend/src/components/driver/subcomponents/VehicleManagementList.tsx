import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Plus, Car, Lock, Unlock, RefreshCw } from 'lucide-react';
import { DriverContext } from '../DriverPwa';
 
export const VehicleManagementList: React.FC = () => {
  const context = useContext(DriverContext);
  if (!context) return null;
 
  const {
    vehicles,
    searchSupportQuery,
    isTogglingLock,
    handleToggleLockInPwa,
    setSelectedVehicleForVIP,
    setActiveTab,
    setEditingVehicleId,
    setEditPlate,
    setEditName,
    setEditType,
    setEditVehicleModalOpen,
    setAddVehicleModalOpen,
    setNewType,
    getRemainingDays
  } = context;
 
  const filteredVehicles = vehicles.filter((v: any) => {
    if (!searchSupportQuery) return true;
    return (v.plate || '').toLowerCase().includes(searchSupportQuery.toLowerCase()) ||
           (v.name || '').toLowerCase().includes(searchSupportQuery.toLowerCase()) ||
           (v.type || '').toLowerCase().includes(searchSupportQuery.toLowerCase());
  });
 
  return (
    <motion.div 
      key="vehicles"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Phương tiện của tôi</h2>
          <p className="text-slate-400 text-xs">
            Quản lý các phương tiện đã đăng ký để ra vào hệ thống UrbanPark.
          </p>
        </div>
        
        <button 
          onClick={() => setAddVehicleModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Thêm xe mới</span>
        </button>
      </div>
 
      {/* Registered Vehicle Listings list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((v: any) => (
          <div 
            key={v.id} 
            className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
              v.isLocked ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200/60'
            }`}
          >
            
            {/* Vehicle Photo Block */}
            <div className="h-44 bg-slate-100 relative flex items-center justify-center overflow-hidden">
              {v.image ? (
                <img 
                  src={v.image} 
                  alt={v.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Car className="w-16 h-16 stroke-[1]" />
                  <span className="text-[10px] font-bold tracking-wider font-mono uppercase text-slate-400 bg-slate-200/40 px-2 py-0.5 rounded-md">BIKE NO REGCARD</span>
                </div>
              )}
 
              {/* Anti-theft live scanner badge */}
              <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#10b981] font-bold text-[9px] rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  HOẠT ĐỘNG
                </span>
                {v.isLocked && (
                  <span className="px-2.5 py-1 bg-rose-500 text-white font-black text-[9px] rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                    SHIELD LOCK ON
                  </span>
                )}
              </div>
 
            </div>
 
            {/* Card metadata detail */}
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-xl font-black text-slate-850 font-mono tracking-wide">{v.plate}</strong>
                  <span className="text-xs text-slate-400 font-bold block mt-0.5">{v.name}</span>
                  {v.activeSubscription && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 bg-emerald-50 rounded-md uppercase tracking-wider">
                      ✨ {v.activeSubscription}
                    </span>
                  )}
                </div>
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                  <Car className="w-4 h-4" />
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3.5 text-left leading-normal font-sans">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LOẠI XE</span>
                  <strong className="text-xs font-black text-slate-700 block mt-0.5">{v.type}</strong>
                </div>
                <div>
                  {v.activeSubscription ? (
                    <>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">HẠN SỬ DỤNG</span>
                      <strong className="text-xs font-black text-emerald-600 block mt-0.5">
                        {v.subscriptionExpiry}
                        <span className="text-[10px] ml-1.5 font-bold text-slate-500">
                          (Còn {getRemainingDays(v.subscriptionExpiry || '')} ngày)
                        </span>
                      </strong>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NGÀY ĐĂNG KÝ</span>
                      <strong className="text-xs font-extrabold text-slate-700 block mt-0.5">{v.regDate}</strong>
                    </>
                  )}
                </div>
              </div>
 
               {/* Lock Trigger Controller */}
               <div className="flex items-center justify-between gap-3 pt-1">
                 {v.activeSubscription ? (
                   <button
                     disabled={isTogglingLock === v.id}
                     onClick={() => handleToggleLockInPwa(v.id, v.plate, v.isLocked)}
                     className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                       v.isLocked
                         ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50'
                         : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-200/50'
                     }`}
                   >
                     {isTogglingLock === v.id ? (
                       <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                     ) : v.isLocked ? (
                       <>
                         <Lock className="w-4 h-4 text-rose-500" />
                         <span>Xe đang khoá bảo vệ</span>
                       </>
                     ) : (
                       <>
                         <Unlock className="w-4 h-4 text-slate-400" />
                         <span>Xe đang mở khoá</span>
                       </>
                     )}
                   </button>
                 ) : (
                   <button
                     onClick={() => {
                       setSelectedVehicleForVIP(v.plate);
                       setActiveTab('vip_reg');
                     }}
                     className="flex-1 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all"
                   >
                     <Lock className="w-3.5 h-3.5 text-slate-400" />
                     <span>Đăng ký VIP để khoá bánh</span>
                   </button>
                 )}
 
                 <button 
                   onClick={() => {
                     setEditingVehicleId(v.id);
                     setEditPlate(v.plate);
                     setEditName(v.name);
                     setEditType(v.type);
                     setEditVehicleModalOpen(true);
                   }}
                   className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
                 >
                   Sửa
                 </button>
               </div>
 
            </div>
 
          </div>
        ))}
 
        {/* Dotted empty slot widget */}
        <button 
          onClick={() => setAddVehicleModalOpen(true)}
          className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/20 transition-all rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3 group select-none min-h-[300px] cursor-pointer"
        >
          <div className="p-3 bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 rounded-full transition-all">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <strong className="text-xs font-black text-slate-800 tracking-tight group-hover:text-blue-600 block">Thêm xe mới</strong>
            <p className="text-[10px] text-slate-400 font-medium max-w-[200px] mx-auto mt-0.5">
              Đăng ký xe mới để sử dụng dịch vụ bãi đỗ tự động tiện lợi.
            </p>
          </div>
        </button>
 
      </div>
    </motion.div>
  );
};
