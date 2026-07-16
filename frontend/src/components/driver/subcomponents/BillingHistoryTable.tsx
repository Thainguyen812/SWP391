import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Download, RefreshCw, Award } from 'lucide-react';
import { DriverContext } from '../DriverPwa';
 
const isTxDateInFilter = (txDateStr: string, filter: string) => {
  if (!txDateStr || filter === 'Tất cả') return true;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let txDate: Date;
  if (txDateStr === 'Vừa xong') {
    txDate = today;
  } else {
    const datePart = txDateStr.split(' ')[0];
    const parts = datePart.split('/');
    if (parts.length === 3) {
      txDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      return true;
    }
  }
  
  switch (filter) {
    case 'Hôm nay':
      return txDate.getTime() === today.getTime();
    case 'Hôm qua':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return txDate.getTime() === yesterday.getTime();
    case '7 ngày qua':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo;
    case 'Tháng này':
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    case 'Tháng trước':
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return txDate.getMonth() === prevMonth && txDate.getFullYear() === prevYear;
    case '3 tháng trước':
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return txDate >= threeMonthsAgo;
    case 'Năm nay':
      return txDate.getFullYear() === now.getFullYear();
    case 'Năm ngoái':
      return txDate.getFullYear() === now.getFullYear() - 1;
    case 'Các năm trước':
      return txDate.getFullYear() < now.getFullYear();
    default:
      return true;
  }
};
 
export const BillingHistoryTable: React.FC = () => {
  const context = useContext(DriverContext);
  if (!context) return null;
 
  const {
    vehicles,
    transactions,
    billingTimeFilter,
    setBillingTimeFilter,
    billingTypeFilter,
    setBillingTypeFilter,
    getBillingStats,
    getRemainingDays,
    setSelectedSubForDetail,
    triggerToast
  } = context;
 
  return (
    <motion.div 
      key="billing"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Lịch sử thanh toán</h2>
        <p className="text-slate-400 text-xs font-semibold">
          Xem lịch sử thanh toán và đăng ký gói tháng.
        </p>
      </div>
 
      {/* Summary amount and Quick filter cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Amount card */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-200/60 flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block font-sans">
              SỐ TIỀN THANH TOÁN THÁNG NÀY
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {(() => {
                const { sumThisMonth } = getBillingStats();
                return sumThisMonth.toLocaleString('vi-VN') + '₫';
              })()}
            </div>
          </div>
          <div className="mt-3">
            {(() => {
              const { percentText, isDecrease, isIncrease } = getBillingStats();
              let textColor = "text-slate-600 bg-slate-50 border border-slate-100";
              let dotColor = "bg-slate-400";
              if (isDecrease) {
                textColor = "text-emerald-600 bg-emerald-50 border border-emerald-500/15";
                dotColor = "bg-emerald-500";
              } else if (isIncrease) {
                textColor = "text-red-600 bg-red-50 border border-red-500/15";
                dotColor = "bg-red-500";
              }
              return (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full ${textColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isDecrease || isIncrease ? 'animate-pulse' : ''}`} />
                  {percentText}
                </span>
              );
            })()}
          </div>
        </div>
 
        {/* Filter controls cards (Span 2) */}
        <div className="md:col-span-2 bg-white p-5 rounded-[24px] border border-slate-200/60 space-y-4">
          <div className="flex items-center gap-2">
            <strong className="text-xs font-black text-slate-800 uppercase tracking-widest block font-sans">
              Bộ Lọc Hoá Đơn
            </strong>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">
                Thời gian
              </label>
              <select 
                value={billingTimeFilter}
                onChange={(e) => setBillingTimeFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 text-slate-850 outline-none transition-all cursor-pointer"
              >
                <option value="Tất cả">Tất cả thời gian</option>
                <optgroup label="Gần đây">
                  <option value="Hôm nay">Hôm nay</option>
                  <option value="Hôm qua">Hôm qua</option>
                  <option value="7 ngày qua">7 ngày qua</option>
                </optgroup>
                <optgroup label="Theo tháng">
                  <option value="Tháng này">Tháng này</option>
                  <option value="Tháng trước">Tháng trước</option>
                  <option value="3 tháng trước">3 tháng trước</option>
                </optgroup>
                <optgroup label="Theo năm">
                  <option value="Năm nay">Năm nay</option>
                  <option value="Năm ngoái">Năm ngoái</option>
                  <option value="Các năm trước">Các năm trước</option>
                </optgroup>
              </select>
            </div>
 
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">
                Loại giao dịch
              </label>
              <select 
                value={billingTypeFilter}
                onChange={(e) => setBillingTypeFilter(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 text-slate-800 outline-none transition-all cursor-pointer"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Vé ngày">Vé ngày</option>
                <option value="Vé tháng">Vé tháng</option>
                <option value="Nạp ví">Nạp ví</option>
              </select>
            </div>
          </div>
        </div>
 
      </div>
 
      {/* VIP Subscriptions status and expiry card */}
      {(() => {
        const savedSubsStr = localStorage.getItem('urbanpark_vip_subscriptions');
        let mySubs: any[] = [];
        if (savedSubsStr) {
          try {
            mySubs = JSON.parse(savedSubsStr);
          } catch (e) {}
        }
        
        const userVehiclePlates = new Set((vehicles || []).map((v: any) => v.plate.trim().toUpperCase()));
        
        // Filter by user's own vehicle plates
        const userOnlySubs = mySubs.filter((s: any) => 
          s.vehicle_plate && userVehiclePlates.has(s.vehicle_plate.trim().toUpperCase())
        );

        // Group by vehicle plate and select latest subscription
        const groupedSubsMap: { [plate: string]: any } = {};
        for (const sub of userOnlySubs) {
          const plate = sub.vehicle_plate.trim().toUpperCase();
          const existing = groupedSubsMap[plate];
          if (!existing) {
            groupedSubsMap[plate] = { ...sub };
          } else {
            // Compare status: prefer ACTIVE over PENDING/REJECTED
            if (sub.status === 'ACTIVE') {
              existing.status = 'ACTIVE';
            } else if (existing.status !== 'ACTIVE' && (sub.status === 'PENDING' || sub.status === 'PENDING_APPROVAL')) {
              existing.status = 'PENDING';
            }
            
            // Compare endDate: choose the latest one
            const parseDate = (dStr: string) => {
              try {
                if (dStr.includes('/')) {
                  const parts = dStr.split('/');
                  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                }
                return new Date(dStr);
              } catch (e) {
                return new Date(0);
              }
            };
            
            const existingDate = parseDate(existing.endDate);
            const newDate = parseDate(sub.endDate);
            
            if (newDate > existingDate) {
              existing.endDate = sub.endDate;
              existing.type = sub.type;
              existing.id = sub.id;
            }
          }
        }
        
        const activeOrPendingSubs = Object.values(groupedSubsMap).filter((s: any) => 
          s.status === 'ACTIVE' || s.status === 'PENDING' || s.status === 'PENDING_APPROVAL'
        );
        
        if (activeOrPendingSubs.length === 0) return null;
        
        return (
          <div className="space-y-3">
            <strong className="text-xs font-black text-slate-800 uppercase tracking-widest block font-sans">
              Gói VIP đang sử dụng & Đang chờ duyệt
            </strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeOrPendingSubs.map((sub: any) => {
                const isPending = sub.status === 'PENDING' || sub.status === 'PENDING_APPROVAL';
                const remainingDays = isPending ? 0 : getRemainingDays(sub.endDate);
                
                return (
                  <div 
                    onClick={() => setSelectedSubForDetail(sub)}
                    key={sub.id} 
                    className={`p-4 rounded-[22px] border transition-all cursor-pointer hover:shadow-md ${
                      isPending 
                        ? 'bg-amber-50/50 border-amber-200/60 hover:border-amber-300' 
                        : 'bg-white border-slate-200/60 shadow-xs hover:border-slate-300'
                    } flex items-start gap-3.5`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isPending ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1 font-sans">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs font-black text-slate-800 uppercase">
                          {sub.vehicle_plate}
                        </strong>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${
                          isPending 
                            ? 'bg-amber-100/80 text-amber-700' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-500/10'
                        }`}>
                          {isPending ? 'Chờ duyệt' : 'Hoạt động'}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 font-bold leading-normal">
                        Gói đăng ký: <span className="text-slate-800">{sub.type}</span>
                      </p>
                      
                      {isPending ? (
                        <p className="text-[10px] text-amber-600 font-bold leading-normal animate-pulse">
                          ⏱️ Hồ sơ đang được Manager xác thực...
                        </p>
                      ) : (
                        <div className="space-y-1 pt-0.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-bold">Hạn dùng: {sub.endDate}</span>
                            <span className={`font-black uppercase ${
                              remainingDays <= 5 ? 'text-rose-600 animate-pulse' : 'text-blue-600'
                            }`}>
                              Còn {remainingDays} ngày
                            </span>
                          </div>
                          
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                remainingDays <= 5 ? 'bg-rose-500' : 'bg-blue-500'
                              }`} 
                              style={{ width: `${Math.min(100, (remainingDays / 30) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
 
      {/* Main Grid Data Table */}
      <div className="bg-white rounded-[24px] border border-slate-250/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/60">
                <th className="py-4 px-5">Mã GD</th>
                <th className="py-4 px-5">Ngày thực hiện</th>
                <th className="py-4 px-5">Loại dịch vụ</th>
                <th className="py-4 px-5">Biển số xe</th>
                <th className="py-4 px-5">Số tiền</th>
                <th className="py-4 px-5">Trạng thái</th>
                <th className="py-4 px-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-slate-700 font-sans">
              {transactions
                .filter((tx: any) => {
                  // Filter by date range
                  if (!isTxDateInFilter(tx.date, billingTimeFilter)) return false;
                  
                  // Filter by type
                  if (billingTypeFilter === 'Tất cả') return true;
                  const typeLower = tx.type.toLowerCase();
                  if (billingTypeFilter === 'Vé ngày') {
                    return typeLower.includes('vé ngày') || typeLower.includes('ngày') || typeLower.includes('daily');
                  }
                  if (billingTypeFilter === 'Vé tháng') {
                    return typeLower.includes('vé tháng') || typeLower.includes('tháng') || typeLower.includes('vip') || typeLower.includes('monthly');
                  }
                  if (billingTypeFilter === 'Nạp tiền') {
                    return typeLower.includes('nạp') || typeLower.includes('topup') || typeLower.includes('top up');
                  }
                  return typeLower.includes(billingTypeFilter.toLowerCase().trim());
                })
                .map((tx: any) => {
                  const statusStyle = 
                    tx.status === 'Thành công' 
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/10' 
                      : tx.status === 'Đang xử lý' 
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/10' 
                        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/10';
 
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 font-bold font-mono text-slate-900">{tx.id}</td>
                      <td className="py-4 px-5 font-semibold text-slate-500">{tx.date}</td>
                      <td className="py-4 px-5 font-bold">
                        <span className="text-slate-800">{tx.type}</span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-500">
                        {tx.plate === '-' ? <span className="text-slate-350">—</span> : tx.plate}
                      </td>
                      <td className="py-4 px-5 font-bold font-mono text-slate-900">{tx.fee}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black rounded-full uppercase leading-none ${statusStyle}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-bold">
                        {tx.status === 'Thành công' ? (
                          <button 
                            type="button"
                            onClick={() => triggerToast(`Đang chuẩn bị tải hoá đơn ${tx.id}...`, 'info')}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải HĐ</span>
                          </button>
                        ) : tx.status === 'Thất bại' ? (
                          <button 
                            type="button"
                            onClick={() => triggerToast('Đang kết nối lại tới cổng thanh toán...', 'info')}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Thử lại</span>
                          </button>
                        ) : (
                          <span className="text-slate-450">Đang chờ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
 
        {/* Pagination area */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono">
            Hiển thị 1-4 trong số 42 giao dịch
          </span>
          <div className="flex gap-2 font-black">
            <button 
              type="button"
              onClick={() => triggerToast('Tính năng chuyển trang đang được xây dựng!', 'info')}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] uppercase tracking-wider text-slate-650 rounded-lg bg-white cursor-pointer"
            >
              Trang trước
            </button>
            <button 
              type="button"
              onClick={() => triggerToast('Tính năng chuyển trang đang được xây dựng!', 'info')}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] uppercase tracking-wider text-slate-655 rounded-lg bg-white cursor-pointer"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
