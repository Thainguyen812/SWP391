import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Car, Calendar, CreditCard, Settings, LogOut, HelpCircle, Bell, Search, 
  MapPin, Activity, CheckCircle, Lock, Unlock, Plus, ChevronRight, ArrowRight, 
  ShieldAlert, Volume2, VolumeX, X, RefreshCw, Clock, QrCode, DollarSign, 
  Download, Wrench, PhoneCall, Mail, MessageSquare, Paperclip, AlertTriangle, 
  KeyRound, Coins, Sliders
} from 'lucide-react';

export function DriverBilling() {
  const ctx: any = useOutletContext();
  const navigate = useNavigate();
  const {
    user, accessToken, onLogout, isDarkMode,
    activeTab, setActiveTab, isOffline, setIsOffline,
    paymentMethod, setPaymentMethod, balance, setBalance,
    selectedVehId, setSelectedVehId, qrDirection, setQrDirection,
    isTogglingLock, setIsTogglingLock, vehicles, setVehicles,
    transactions, setTransactions, currentParked, setCurrentParked,
    addVehicleModalOpen, setAddVehicleModalOpen, newPlate, setNewPlate,
    newName, setNewName, newType, setNewType, regStep, setRegStep,
    selectedVehicleForVIP, setSelectedVehicleForVIP, selectedPackPrice, setSelectedPackPrice,
    selectedPackLabel, setSelectedPackLabel, vnpayBank, setVnpayBank,
    vnpayCardNo, setVnpayCardNo, vnpayCardHolder, setVnpayCardHolder,
    vnpayOtp, setVnpayOtp, vnpayModalOpen, setVnpayModalOpen,
    vnpayStep, setVnpayStep, isSirenMuted, setIsSirenMuted,
    isAlertOverlayShown, setIsAlertOverlayShown, profileName, setProfileName,
    profilePhone, setProfilePhone, profileEmail, setProfileEmail,
    profileAddress, setProfileAddress, is2faEnabled, setIs2faEnabled,
    emailNotifyGate, setEmailNotifyGate, smsNotifyGate, setSmsNotifyGate,
    emailNotifyReceipt, setEmailNotifyReceipt, smsNotifyReceipt, setSmsNotifyReceipt,
    billingTimeFilter, setBillingTimeFilter, billingTypeFilter, setBillingTypeFilter,
    searchSupportQuery, setSearchSupportQuery, expandedFaq, setExpandedFaq,
    ticketTopic, setTicketTopic, ticketMessage, setTicketMessage,
    ticketAttachedFiles, setTicketAttachedFiles, triggerToast, isTxDateInFilter, handleLogout
  } = ctx;

  const getBillingStats = () => {
    let sumThisMonth = 0;
    let sumLastMonth = 0;
    
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Last month calculations
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    if (lastMonth < 0) {
      lastMonth = 11;
      lastMonthYear = currentYear - 1;
    }
    
    transactions.forEach(tx => {
      if (tx.isEntry === false) {
        // Parse date DD/MM/YYYY HH:mm:ss
        const datePart = tx.date ? tx.date.split(' ')[0] : '';
        const parts = datePart ? datePart.split('/') : [];
        if (parts.length === 3) {
          const dMonth = parseInt(parts[1], 10) - 1; // 0-11
          const dYear = parseInt(parts[2], 10);
          
          const feeStr = tx.fee ? tx.fee.replace(/[-+$₫]/g, '').replace(/,/g, '').trim() : '';
          const value = parseFloat(feeStr);
          if (!isNaN(value)) {
            const valVND = tx.fee && tx.fee.includes('$') ? value * 25000 : value;
            
            if (dMonth === currentMonth && dYear === currentYear) {
              sumThisMonth += valVND;
            } else if (dMonth === lastMonth && dYear === lastMonthYear) {
              sumLastMonth += valVND;
            }
          }
        }
      }
    });
    
    let percentText = "0% so với tháng trước";
    let isDecrease = false;
    let isIncrease = false;
    
    if (sumLastMonth === 0) {
      if (sumThisMonth > 0) {
        percentText = "+100% so với tháng trước";
        isIncrease = true;
      } else {
        percentText = "Không thay đổi so với tháng trước";
      }
    } else {
      const diff = ((sumThisMonth - sumLastMonth) / sumLastMonth) * 100;
      const rounded = Math.round(diff);
      if (rounded < 0) {
        percentText = `${rounded}% so với tháng trước`;
        isDecrease = true;
      } else if (rounded > 0) {
        percentText = `+${rounded}% so với tháng trước`;
        isIncrease = true;
      } else {
        percentText = "0% so với tháng trước";
      }
    }
    
    return {
      sumThisMonth,
      percentText,
      isDecrease,
      isIncrease
    };
  };

  return (
    <>
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
                            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 text-slate-800 outline-none transition-all"
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
                            .filter(tx => {
                              // Filter by date range
                              if (!isTxDateInFilter(tx.date, billingTimeFilter)) return false;
                              
                              // Filter by type
                              if (billingTypeFilter === 'Tất cả') return true;
                              return tx.type.toLowerCase().trim() === billingTypeFilter.toLowerCase().trim();
                            })
                            .map(tx => {
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
                                        onClick={() => triggerToast(`Đang chuẩn bị tải hoá đơn ${tx.id}...`, 'info')}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Tải HĐ</span>
                                      </button>
                                    ) : tx.status === 'Thất bại' ? (
                                      <button 
                                        onClick={() => triggerToast('Đang kết nối lại tới cổng thanh toán...', 'info')}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] cursor-pointer"
                                      >
                                        <RefreshCw className="w-3 h-3 animate-spin" />
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
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600 rounded-lg bg-white cursor-pointer"
                        >
                          Trang trước
                        </button>
                        <button 
                          type="button"
                          onClick={() => triggerToast('Tính năng chuyển trang đang được xây dựng!', 'info')}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600 rounded-lg bg-white cursor-pointer"
                        >
                          Trang sau
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>


    </>
  );
}
