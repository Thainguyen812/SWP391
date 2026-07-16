import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { Modal } from 'antd';
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

  const getFloorNumber = (code: string) => {
    if (!code) return "";
    const c = code.toUpperCase();
    if (c === "F1") return "1";
    if (c === "F2") return "2";
    if (c === "B1") return "B1";
    if (c === "G") return "G";
    return c;
  };

  const getFloorName = (code: string) => {
    if (!code) return "Chưa gán";
    const c = code.toUpperCase();
    if (c === "F1") return "Tầng 1 — Khu Xe Gia Đình 4-5 Chỗ (Sedan, Hatchback, EV)";
    if (c === "F2") return "Tầng 2 — Khu Xe 7-9 Chỗ (SUV, CUV, MPV)";
    if (c === "B1") return "Tầng B1 — Khu Xe Van & Xe Tải Nhỏ";
    if (c === "G") return "Tầng G — Khu Xe Khách 12-16 Chỗ";
    return `Tầng ${c}`;
  };

  const handleFindCar = () => {
    if (currentParked && currentParked.isParked) {
      Modal.info({
        title: 'Định vị phương tiện của bạn',
        content: (
          <div className="space-y-3 mt-3 text-left">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-550 font-bold uppercase tracking-wider">VỊ TRÍ ĐỖ XE</p>
                <strong className="text-lg font-black text-slate-800">
                  {currentParked.assignedZone ? `Tầng ${getFloorNumber(currentParked.assignedZone)}` : currentParked.location}
                </strong>
              </div>
            </div>
            <div className="text-xs text-slate-550 font-semibold space-y-1">
              <p>• Biển số xe: <strong className="font-mono text-slate-700">{currentParked.plate}</strong></p>
              <p>• Trạng thái: <span className="text-emerald-600 font-extrabold">{currentParked.status}</span></p>
              {currentParked.assignedZone ? (
                <p className="mt-2 text-blue-600 font-bold bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/60 leading-relaxed">
                  📍 Vị trí đỗ chỉ định: {getFloorName(currentParked.assignedZone)}
                </p>
              ) : (
                <p className="mt-2 text-slate-400">Chỉ dẫn: Bạn có thể đi bộ qua Lối đi bộ Zone A, bấm thang máy lên Tầng 2 để nhận xe.</p>
              )}
            </div>
          </div>
        ),
        okText: 'Đóng',
        centered: true,
        maskClosable: true,
      });
    } else {
      triggerToast('Hiện tại không có phương tiện nào của bạn đang đỗ trong bãi xe!', 'info');
    }
  };

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
                  <div className="grid grid-cols-1 gap-6">
                    
                    <button 
                      onClick={() => {
                        setActiveTab('vip_reg');
                        setRegStep(2);
                      }}
                      className="w-full p-6 bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Gia Hạn Vé Tháng / VIP</h4>
                          <p className="text-xs text-slate-400 font-semibold leading-normal">
                            Đăng ký hoặc gia hạn gói giữ xe tháng/năm tiện lợi cho phương tiện của bạn.
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-black text-xs rounded-xl uppercase tracking-wider">
                        Tiếp Tục
                      </div>
                    </button>

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
                                <span className={`inline-flex items-center gap-1.5 ${
                                  tx.type?.includes('Đăng kí') || tx.type?.includes('Thanh toán') || tx.type?.includes('Nạp tiền')
                                    ? 'text-blue-600 font-semibold' 
                                    : tx.isEntry 
                                      ? 'text-emerald-600' 
                                      : 'text-rose-600'
                                }`}>
                                  {tx.type?.includes('Đăng kí') || tx.type?.includes('Thanh toán') || tx.type?.includes('Nạp tiền') ? tx.type : (tx.isEntry ? '➔ Xe vào' : '➔ Xe ra')}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{tx.plate === '-' ? '—' : tx.plate}</td>
                              <td className={`py-3.5 px-4 text-right font-bold ${
                                tx.type?.includes('Nạp tiền')
                                  ? 'text-emerald-600 font-mono'
                                  : tx.isEntry 
                                    ? 'text-slate-400' 
                                    : 'text-rose-600 font-mono'
                              }`}>
                                {tx.fee}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>



                </motion.div>


    </>
  );
}
