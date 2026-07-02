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

export function DriverSettings() {
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
    profilePhone, setProfilePhone, isPhoneVerified, setIsPhoneVerified, profileEmail, setProfileEmail,
    profileAddress, setProfileAddress, is2faEnabled, setIs2faEnabled,
    emailNotifyGate, setEmailNotifyGate, smsNotifyGate, setSmsNotifyGate,
    emailNotifyReceipt, setEmailNotifyReceipt, smsNotifyReceipt, setSmsNotifyReceipt,
    billingTimeFilter, setBillingTimeFilter, billingTypeFilter, setBillingTypeFilter,
    searchSupportQuery, setSearchSupportQuery, expandedFaq, setExpandedFaq,
    ticketTopic, setTicketTopic, ticketMessage, setTicketMessage,
    ticketAttachedFiles, setTicketAttachedFiles, triggerToast, isTxDateInFilter, handleLogout
  } = ctx;

  return (
    <>
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-950 tracking-tight">Cài đặt tài khoản</h2>
                      <p className="text-slate-400 text-xs font-semibold">
                        Quản lý thông tin cá nhân, bảo mật và tùy chọn thanh toán.
                      </p>
                    </div>
                    <button 
                      onClick={() => triggerToast('Đã lưu mọi thay đổi thiết lập tài khoản thành công!', 'success')}
                      className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer self-stretch sm:self-auto"
                    >
                      Lưu thay đổi
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* LEFT / CENTER: ACCOUNT PROFILE & PREFERENCES */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Personal Info Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-5">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                          <div className="w-14 h-14 rounded-full bg-blue-600/10 text-blue-600 border border-blue-200 text-xl flex items-center justify-center font-black">
                            {profileName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-sm font-black text-slate-900 block">{profileName}</strong>
                            <span className="text-xs text-slate-400 font-semibold uppercase font-mono tracking-wider">Tài xế UrbanPark VIP</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Họ và tên</label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={e => setProfileName(e.target.value)}
                              className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Số điện thoại</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={profilePhone}
                                onChange={e => {
                                  setProfilePhone(e.target.value);
                                  setIsPhoneVerified(false);
                                  localStorage.setItem('urbanpark_phone_verified', 'false');
                                }}
                                className="w-full p-3 pr-24 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                              />
                              {isPhoneVerified ? (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/15">
                                  ✓ Đã xác thực
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsPhoneVerified(true);
                                    localStorage.setItem('urbanpark_phone_verified', 'true');
                                    triggerToast('Xác thực số điện thoại thành công!', 'success');
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-500/15 transition-colors cursor-pointer"
                                >
                                  ⚠ Chưa xác thực
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Địa chỉ Email</label>
                            <input
                              type="email"
                              value={profileEmail}
                              onChange={e => setProfileEmail(e.target.value)}
                              className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Địa chỉ thường trú</label>
                            <input
                              type="text"
                              value={profileAddress}
                              onChange={e => setProfileAddress(e.target.value)}
                              className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notifications settings */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          Tùy chọn thông báo
                        </strong>

                        <div className="divide-y divide-slate-100 font-sans text-xs">
                          {/* Row 1 */}
                          <div className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="space-y-0.5">
                              <strong className="text-slate-800 font-extrabold">Sự kiện vào/ra bãi xe</strong>
                              <p className="text-slate-400 text-[11px] font-semibold leading-normal">
                                Nhận thông báo thời gian thực khi xe đi qua trạm kiểm soát rào chắn.
                              </p>
                            </div>
                            <div className="flex gap-4 font-black text-[11px]">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={emailNotifyGate} 
                                  onChange={(e) => setEmailNotifyGate(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>Email</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={smsNotifyGate} 
                                  onChange={(e) => setSmsNotifyGate(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>SMS</span>
                              </label>
                            </div>
                          </div>

                          {/* Row 2 */}
                          <div className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="space-y-0.5">
                              <strong className="text-slate-800 font-extrabold">Biên lai thanh toán</strong>
                              <p className="text-slate-400 text-[11px] font-semibold leading-normal">
                                Tự động gửi biên lai hóa đơn thuế điện tử về tài khoản sau hành trình.
                              </p>
                            </div>
                            <div className="flex gap-4 font-black text-[11px]">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={emailNotifyReceipt} 
                                  onChange={(e) => setEmailNotifyReceipt(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>Email</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={smsNotifyReceipt} 
                                  onChange={(e) => setSmsNotifyReceipt(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>SMS</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: WALLET CARD AND SECURITY */}
                    <div className="space-y-6">
                      
                      {/* UrbanPark Wallet Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-5 text-left">
                        <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans leading-none">
                          Ví UrbanPark
                        </strong>

                        {/* Glossy Balance Visual Card */}
                        <div className="bg-slate-900 bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl relative overflow-hidden text-white shadow-lg shadow-slate-900/10">
                          <div className="absolute right-[-15px] bottom-[-15px] opacity-10">
                            <QrCode className="w-28 h-28" />
                          </div>
                          
                          <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
                            Số dư khả dụng
                          </span>
                          <strong className="text-3xl font-black font-mono tracking-tight block mt-1">
                            ${balance.toFixed(2)}
                          </strong>

                          <button 
                            type="button"
                            onClick={() => {
                              if (isOffline) {
                                triggerToast('Lỗi: Không thể nạp tiền vào ví ở chế độ Ngoại tuyến!', 'error');
                                return;
                              }
                              setSelectedPackPrice(50.00);
                              setSelectedPackLabel('Nạp tiền vào ví điện tử UrbanPark');
                              setVnpayStep('info');
                              setVnpayModalOpen(true);
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Nạp tiền ngay</span>
                          </button>
                        </div>

                        {/* Linked bank status */}
                        <div className="space-y-3 pt-1">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                            LIÊN KẾT NGÂN HÀNG
                          </span>

                          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black flex items-center justify-center font-mono">
                                VCB
                              </div>
                              <div>
                                <strong className="text-[11.5px] font-black text-slate-800 block">Vietcombank **** 1234</strong>
                                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                  Mặc định thanh toán
                                </span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => triggerToast('Đã huỷ liên kết tài khoản Vietcombank thành công.', 'info')}
                              className="text-[11px] font-black text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              Gỡ
                            </button>
                          </div>

                          <button 
                            type="button"
                            onClick={() => triggerToast('Chức năng liên kết ngân hàng mở rộng đang chuẩn bị ra mắt!', 'info')}
                            className="w-full py-2.5 border border-dashed border-slate-350 hover:border-blue-400 text-slate-500 hover:text-blue-600 font-bold text-xs rounded-xl cursor-pointer text-center select-none"
                          >
                            + Thêm phương thức mới
                          </button>
                        </div>
                      </div>

                      {/* Security Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                          Bảo mật
                        </strong>

                        <div className="space-y-3.5 text-xs font-sans">
                          {/* 2FA switcher */}
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <strong className="text-slate-800 font-extrabold block">Xác thực 2 lớp (2FA)</strong>
                              <span className="text-slate-450 text-[10px] leading-normal block max-w-[180px]">
                                Xác minh mã OTP thứ cấp bảo vệ truy cập từ thiết bị mới.
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setIs2faEnabled(!is2faEnabled);
                                triggerToast(is2faEnabled ? 'Đã tắt bảo vệ 2FA.' : 'Xác thực hai lớp (2FA) hỗ trợ thành công!', 'info');
                              }}
                              className={`w-10 h-6 shrink-0 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                                is2faEnabled ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                                is2faEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>

                          {/* Quick Password inputs */}
                          <div className="space-y-2">
                            <strong className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đổi mật khẩu tài khoản</strong>
                            
                            <div className="space-y-1.5">
                              <input 
                                type="password" 
                                placeholder="Mật khẩu hiện tại..."
                                className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-200 focus:bg-white text-xs outline-none"
                              />
                              <input 
                                type="password" 
                                placeholder="Mật khẩu mới..."
                                className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-200 focus:bg-white text-xs outline-none"
                              />
                            </div>
                            
                            <button 
                              type="button"
                              onClick={() => triggerToast('Mật khẩu tài khoản đã được thay đổi an toàn!', 'success')}
                              className="pt-1.5 text-[10.5px] font-black text-blue-600 hover:underline cursor-pointer inline-block"
                            >
                              Cập nhật mật khẩu ngay →
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>


    </>
  );
}
