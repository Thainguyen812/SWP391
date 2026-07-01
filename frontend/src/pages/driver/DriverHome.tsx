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

export function DriverHome() {
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
    ticketAttachedFiles, setTicketAttachedFiles, triggerToast, isTxDateInFilter, handleLogout,
    triggerSecurityTest
  } = ctx;

  return (
    <>
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8 text-left"
                >
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      Chào mừng trở lại, {user.name.split(' ').slice(-1)[0]}
                    </h2>
                    <p className="text-slate-400 text-xs">
                      Tổng quan hoạt động và trạng thái xe của bạn hôm nay.
                    </p>
                  </div>

                  {isOffline && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-red-50 text-red-800 rounded-2xl border border-red-200/60 p-5 space-y-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-red-950 uppercase font-sans">CHẾ ĐỘ NGOẠI TUYẾN GIAO THÔNG (OFFLINE RESCUE MODE)</h4>
                          <p className="text-xs text-red-700/90 leading-relaxed font-semibold">
                            Hệ thống tự động phát hiện mất mạng Internet bốt gác cổng. Để bảo toàn lưu thông và tránh kẹt barrier, vui lòng xuất trình Mã Vé Cứu Hộ Ngoại Tuyến dưới đây cho nhân viên bốt trực.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-red-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="text-[10px] text-slate-400 font-mono font-bold block">RESCUE TICKET TOKEN</span>
                          <strong className="text-xs font-mono font-black text-slate-800 tracking-wide uppercase select-all">
                            UP-OFFLINE-RESCUE-HASH-8812
                          </strong>
                          <span className="text-[10.5px] text-emerald-505 font-extrabold block">
                            ✓ Xác chuẩn mã cơ sở mã hoá cục bộ
                          </span>
                        </div>
                        <div className="w-20 h-20 bg-slate-50 border border-slate-150 p-1 rounded-lg flex items-center justify-center shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=120&auto=format&fit=crop&q=80" 
                            alt="Offline qr code representation" 
                            className="w-16 h-16 object-cover select-none filter contrast-125 saturate-0"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Top segment grid columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Card: Trạng thái hiện tại */}
                    <div className="lg:col-span-7 bg-blue-500/5 hover:bg-blue-500/10 rounded-2xl border border-blue-100 flex flex-col justify-between p-6 transition-all relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-400">TRỌNG ĐIỂM GIÁM SÁT</span>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Trạng Thái Hiện Tại</h3>
                        </div>
                        {currentParked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#10b981] font-bold text-xs rounded-full uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ĐANG ĐỖ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs rounded-full uppercase tracking-wide">
                            TRỐNG
                          </span>
                        )}
                      </div>

                      <p className="text-slate-500 text-xs mt-3">
                        {currentParked ? "Xe đang đỗ trong cơ sở bãi đỗ thông minh" : "Hiện tại không có xe nào đang đỗ trong bãi"}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white border border-slate-200/60 rounded-xl leading-snug">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">BIỂN SỐ NHẬN DIỆN</span>
                          <strong className="text-sm sm:text-base font-black text-slate-800 font-mono italic tracking-wide">{currentParked?.plate || 'Chưa ghi nhận'}</strong>
                        </div>
                        <div className="p-4 bg-white border border-slate-200/60 rounded-xl leading-snug flex items-center gap-3">
                          <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                            <MapPin className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">VỊ TRÍ ƯỚC TÍNH</span>
                            <strong className="text-xs sm:text-sm font-extrabold text-slate-850 block">{currentParked?.location || 'Chưa ghi nhận'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Card: Quick billing operations & shortcuts */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      
                      {/* Large Blue payment trigger */}
                      <button 
                        onClick={() => {
                          setActiveTab('vip_reg');
                          setRegStep(2);
                        }}
                        className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/10 cursor-pointer active:scale-[0.99] transition-all"
                      >
                        <CreditCard className="w-5 h-5 text-white" />
                        <span>Thanh Toán Ngay</span>
                      </button>

                      {/* Beneath grid */}
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        
                        <button 
                          onClick={() => {
                            triggerToast('Đã kích hoạt thiết bị đo lường định vị radar xe của bạn!', 'success');
                          }}
                          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2 select-none group cursor-pointer active:scale-95 transition-all"
                        >
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-slate-700 tracking-tight leading-none">Tìm Xe Của Tôi</span>
                        </button>

                        <button 
                          onClick={() => {
                            setActiveTab('vip_reg');
                            setRegStep(2);
                          }}
                          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2 select-none group cursor-pointer active:scale-95 transition-all"
                        >
                          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-full group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-slate-700 tracking-tight leading-none">Gia Hạn Vé Tháng</span>
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* HOẠT ĐỘNG GẦN ĐÂY */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Hoạt Động Gần Đây
                      </h3>
                      <button 
                        onClick={() => setActiveTab('billing')}
                        className="text-xs font-extrabold text-blue-600 hover:underline cursor-pointer"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead>
                          <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/55 rounded-lg">
                            <th className="py-3 px-4">Thời Gian</th>
                            <th className="py-3 px-4">Sự Kiện</th>
                            <th className="py-3 px-4">Biển Số</th>
                            <th className="py-3 px-4 text-right">Phí</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/70">
                          {transactions.slice(0, 3).map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-medium text-slate-500">{tx.date}</td>
                              <td className="py-3.5 px-4 font-black">
                                <span className={`inline-flex items-center gap-1.5 ${tx.isEntry ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {tx.isEntry ? '➔ Xe vào' : '➔ Xe ra'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{tx.plate}</td>
                              <td className={`py-3.5 px-4 text-right font-bold ${tx.isEntry ? 'text-slate-400' : 'text-rose-600 font-mono'}`}>
                                {tx.fee}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ANTI-THEFT EXPERIMENT BOX */}
                  <div id="user-pwa-antitheft-card" className="p-5 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <strong className="text-xs text-yellow-800 font-extrabold">HỘP THỬ NGHIỆM ĐỘT NHẬP AN NINH DRIVER</strong>
                      </div>
                      <p className="text-[11px] text-yellow-600/90 leading-relaxed font-semibold">
                        Kích hoạt còi báo động nhân bốt gác để kiểm tra độ trễ phản hồi kẹp phanh gạt chặn barie tự động bảo vệ tài sản!
                      </p>
                    </div>
                    <button 
                      onClick={triggerSecurityTest}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-extrabold text-[11px] rounded-lg tracking-wide uppercase cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      Báo động đột nhập
                    </button>
                  </div>

                  {/* USER INTERACTIVE STATE CONTROL PANEL (GOOD & BAD CASES) */}
                  <div id="user-testing-pnl" className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                        Bảng Thử Nghiệm Tình Huống Vận Hành (User Portal)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Positive Scenarios */}
                      <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>TRƯỜNG HỢP TỐT (SUCCESS RUNS)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                          Kiểm định các tiến trình tiêu chuẩn vận hành mượt mà của chủ xe.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentParked({
                                plate: vehicles[0]?.plate || '30G-123.45',
                                status: 'ĐANG ĐỖ',
                                location: 'Khu A • Tầng 2',
                                isParked: true
                              });
                              // Add ticket log
                              const newTx: TransactionItem = {
                                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                                date: 'Vừa xong',
                                type: 'Xe ô tô vào bãi',
                                plate: vehicles[0]?.plate || '30G-123.45',
                                fee: '$2.00',
                                isEntry: true,
                                status: 'Thành công'
                              };
                              setTransactions(prev => [newTx, ...prev]);
                              triggerToast('Giả lập: Xe ô tô tự động quét LPR vào bãi thành công!', 'success');
                            }}
                            className="p-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
                          >
                            Xe vào bãi (LPR Chuẩn)
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (isOffline) {
                                triggerToast('Lỗi: Không thể nạp ví ở chế độ Ngoại tuyến!', 'error');
                                return;
                              }
                              setBalance(prev => prev + 50.0);
                              const newTx: TransactionItem = {
                                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                                date: 'Vừa xong',
                                type: 'Nạp ví VNPAY',
                                plate: '-',
                                fee: '+$50.00',
                                isEntry: true,
                                status: 'Thành công'
                              };
                              setTransactions(prev => [newTx, ...prev]);
                              triggerToast('Giả lập: Nạp thêm $50.00 vào số dư ví thành công!', 'success');
                            }}
                            className="p-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
                          >
                            Nạp ví VNPAY $50
                          </button>
                        </div>
                      </div>

                      {/* Negative/Abnormal Fault Scenarios */}
                      <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>TRƯỜNG HỢP XẤU (ABNORMAL/FAULT RUNS)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                          Sự cố giả định liên quan đến ví cạn kiệt, hoặc mất kết nối bốt kiểm soát.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBalance(0.15);
                              triggerToast('Giả lập: Đã hạ ví về mức cực thấp ($0.15)!', 'error');
                            }}
                            className="p-1.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
                          >
                            Hạ số dư ví về $0.15
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsOffline(!isOffline);
                              triggerToast(
                                !isOffline 
                                  ? '⚠️ Đã tắt mạng! Bốt gác đang hoạt động Ngoại tuyến.' 
                                  : '🟢 Khôi phục mạng Internet bốt gác hoạt động Online!', 
                                !isOffline ? 'error' : 'success'
                              );
                            }}
                            className={`p-1.5 py-2 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer ${
                              isOffline ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            {isOffline ? 'Kết nối Internet lại' : 'Tắt mạng (Mất kết nối)'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10.5px] text-slate-500 leading-snug p-3 bg-slate-50 border border-slate-150 rounded-xl text-left">
                      💡 <strong>Hướng dẫn kiểm thử nhanh:</strong> Click <strong>"Hạ số dư ví về $0.15"</strong>, rồi sang tab <strong>"Đăng ký hàng tháng"</strong> hoặc dùng Ví để thanh toán. Bạn sẽ kích hoạt ngay kịch bản lỗi thanh toán do cạn số dư! Click <strong>"Tắt mạng"</strong> để kích hoạt chế độ cứu nạn khẩn cấp ngoại tuyến.
                    </div>
                  </div>

                </motion.div>


    </>
  );
}
