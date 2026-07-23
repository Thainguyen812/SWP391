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

export function DriverDashboardPanel() {
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
    activeQrToken, qrExpiryTime, isGeneratingQr, countdownSec,
    isQrRequested, setIsQrRequested
  } = ctx;

  return (
    <>
                <motion.div
                  key="driver_pnl"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <KeyRound className="w-6 h-6 text-blue-600" />
                        Bảng Điều Khiển Tài Xế (Bật Khóa & Tạo Mã QR)
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold">
                        Giao diện tương tác và bảo mật tức thời kết nối trực tiếp đến Backend Cloud UrbanPark.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* LEFT PART: VEHICLE SELECTOR & SMART LOCK ENGINE */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">THIẾT BỊ</span>
                            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wide">Khóa Bảo Vệ Kẹp Phanh Xe</h3>
                          </div>
                          <Lock className="w-5 h-5 text-blue-600" />
                        </div>

                        {/* Dropdown vehicle selector */}
                        {(() => {
                          const vipVehicles = vehicles.filter(v => v.isVip === true);
                          return (
                            <div className="space-y-2">
                              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Chọn phương tiện VIP đang điều khiển</label>
                              {vipVehicles.length > 0 ? (
                                <select
                                  value={selectedVehId || (vipVehicles[0]?.plate || vipVehicles[0]?.id || '')}
                                  onChange={(e) => setSelectedVehId(e.target.value)}
                                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                  {vipVehicles.map(v => (
                                    <option key={v.plate || v.id} value={v.plate || v.id}>
                                      {v.plate} - {v.name} ({v.isLocked ? "ĐÃ KHÓA" : "MỞ KHÓA"})
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                                  Chưa có phương tiện nào đăng ký/được duyệt Thẻ Tháng VIP.
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Big visual lock feedback area */}
                        {(() => {
                          const vipVehicles = vehicles.filter(v => v.isVip === true);
                          const activeVeh = vipVehicles.find(v => v.id === selectedVehId || v.plate === selectedVehId) || vipVehicles[0];
                          if (!activeVeh) return null;
                          return (
                            <div className="bg-slate-50 rounded-2xl border border-slate-150 p-6 flex flex-col items-center justify-center text-center space-y-4">
                              <div className="p-4 bg-[#f8fafc] rounded-full border border-slate-200/80 shadow-sm text-slate-700">
                                {activeVeh.isLocked ? (
                                  <Lock className="w-10 h-10 text-red-600 animate-bounce" />
                                ) : (
                                  <Unlock className="w-10 h-10 text-amber-500" />
                                )}
                              </div>

                              <div className="space-y-1">
                                {activeVeh.isVip ? (
                                  <>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                      {activeVeh.isLocked ? "THIẾT BỊ ĐÃ KÍCH HOẠT KHÓA AN TOÀN" : "BẢO VỆ PHƯƠNG TIỆN ĐANG MỞ"}
                                    </h4>
                                    <p className="text-[10.5px] text-slate-500 max-w-[280px] leading-relaxed">
                                      {activeVeh.isLocked
                                        ? "Bánh xe đang được kẹp phanh bảo vệ. Nếu có xe di chuyển trái phép qua barie, siren bốt trực sẽ tự động phát cảnh báo báo động đỏ!"
                                        : "Nhấn nút bên dưới để kích hoạt chế độ kẹp phanh an toàn từ xa khi đỗ xe trong bãi."}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">
                                      DÀNH RIÊNG CHO HỘI VIÊN VIP
                                    </h4>
                                    <p className="text-[10.5px] text-slate-500 max-w-[280px] leading-relaxed">
                                      Tính năng khóa bánh bảo vệ radar và kẹp phanh hơi thông minh chống trộm từ xa chỉ áp dụng cho phương tiện có vé tháng VIP đang hoạt động.
                                    </p>
                                  </>
                                )}
                              </div>

                              {activeVeh.isVip ? (
                                <button
                                  type="button"
                                  disabled={isTogglingLock === activeVeh.id}
                                  onClick={() => handleToggleLock(activeVeh)}
                                  className={`w-full py-3.5 px-4 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    activeVeh.isLocked
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                                      : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                                  }`}
                                >
                                  {isTogglingLock === activeVeh.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : activeVeh.isLocked ? (
                                    <>
                                      <Unlock className="w-4 h-4" />
                                      <span>MỞ KHÓA BÁNH XE</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-4 h-4" />
                                      <span>KÍCH HOẠT KHÓA BÁNH AN TOÀN</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVehicleForVIP(activeVeh);
                                    setIsVipModalOpen(true);
                                  }}
                                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                  ĐĂNG KÝ VIP NGAY ĐỂ KÍCH HOẠT
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>


                    {/* RIGHT PART: DYNAMIC QR PASS CODE */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CHỨNG THƯ</span>
                            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wide">Mã QR Ra Vào Cổng Trực</h3>
                          </div>
                          <QrCode className="w-5 h-5 text-blue-600" />
                        </div>

                        {/* Vehicle selector for QR code generation */}
                        {(() => {
                          const vipVehicles = vehicles.filter(v => v.isVip === true);
                          return (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Chọn phương tiện VIP sinh Mã QR</label>
                              {vipVehicles.length > 0 ? (
                                <select
                                  value={selectedVehId || (vipVehicles[0]?.plate || vipVehicles[0]?.id || '')}
                                  onChange={(e) => setSelectedVehId(e.target.value)}
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                  {vipVehicles.map((v) => (
                                    <option key={v.plate || v.id} value={v.plate || v.id}>
                                      🚘 {v.plate} - {v.name} (THẺ THÁNG VIP)
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                                  Chưa có phương tiện nào đăng ký/được duyệt Thẻ Tháng VIP.
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Flow direction selector */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Chiều Ra/Vào của Phương Tiện</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setQrDirection('VÀO')}
                              className={`py-2 text-center text-xs font-extrabold rounded-lg select-none transition-all ${
                                qrDirection === 'VÀO' 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              CHIỀU VÀO (GATE IN)
                            </button>
                            <button
                              type="button"
                              onClick={() => setQrDirection('RA')}
                              className={`py-2 text-center text-xs font-extrabold rounded-lg select-none transition-all ${
                                qrDirection === 'RA' 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              CHIỀU RA (GATE OUT)
                            </button>
                          </div>
                        </div>

                        {/* Rendering dynamic custom QR design vector mapping */}
                        {(() => {
                          const vipVehicles = vehicles.filter(v => v.isVip === true);
                          const activeVeh = vipVehicles.find(v => v.id === selectedVehId || v.plate === selectedVehId) || vipVehicles[0];
                          if (!activeVeh) {
                            return (
                              <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-6 flex flex-col items-center justify-center text-center space-y-3 mt-2">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xl shadow-inner">
                                  🔒
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">BẠN CHƯA CÓ XE VIP NÀO</h4>
                                  <p className="text-[11px] text-amber-800 max-w-[280px] leading-relaxed">
                                    Tính năng Tạo Mã QR động ra vào cổng chỉ dành riêng cho phương tiện đã đăng ký <strong>Thẻ tháng VIP</strong> và được duyệt thành công.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (vehicles.length > 0) setSelectedVehicleForVIP(vehicles[0]);
                                    setIsVipModalOpen(true);
                                  }}
                                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                                >
                                  ⚡ Đăng ký VIP ngay để tạo mã QR
                                </button>
                              </div>
                            );
                          }
                          const qrValueString = `${activeVeh.plate}|${qrDirection}|${Date.now()}`;
                          if (!isQrRequested) {
                            return (
                              <div className="bg-slate-50 rounded-2xl border border-slate-150 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 bg-blue-50 rounded-full text-blue-650 border border-blue-100/80">
                                  <QrCode className="w-10 h-10 opacity-75" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Mã QR đang ẩn</h4>
                                  <p className="text-[10.5px] text-slate-500 max-w-[260px] leading-relaxed">
                                    Để bảo mật thông tin ra vào, vui lòng nhấn nút bên dưới để tạo mã QR động có hiệu lực trong 5 phút.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsQrRequested(true)}
                                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                                >
                                  Yêu cầu xuất mã QR
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col items-center justify-center space-y-4">
                              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-inner w-44 h-44 flex flex-col items-center justify-center relative group">
                                {/* Simulated cool tech look camera scan target helper lines */}
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-600" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-600" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-600" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-600" />
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(activeQrToken || qrValueString)}`}
                                  alt="QR Code"
                                  className="w-28 h-28 object-contain"
                                />

                                <div className="text-[8px] text-blue-600 font-bold block bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-2">
                                  MÃ VÉ KHÁCH VIP
                                </div>
                              </div>

                              <div className="w-full text-center space-y-1">
                                <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">Chữ ký số bốt gác (Gate Token Hash)</span>
                                <strong className="text-xs font-mono font-black text-slate-800 tracking-wider block bg-white border border-slate-200 p-2 rounded-xl select-all shadow-inner break-all">
                                  {activeQrToken || qrValueString}
                                </strong>
                              </div>

                              <div className="w-full space-y-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(activeQrToken || qrValueString);
                                    triggerToast("📋 Sao chép mã chữ ký số bốt gác thành công!", "success");
                                  }}
                                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl active:scale-95 transition-all outline-none"
                                >
                                  Sao chép Mã QR văn bản
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsQrRequested(false)}
                                  className="w-full py-2 bg-rose-55 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl active:scale-95 transition-all outline-none border border-rose-200/50"
                                >
                                  Ẩn mã QR bảo mật
                                </button>
                              </div>

                              {qrExpiryTime && (
                                <p className="text-[10px] text-slate-400 text-center font-semibold pt-1">
                                  ⏱️ Mã QR động tự động làm mới sau <span className="text-blue-600 font-bold">{countdownSec} giây</span>
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="text-[10.5px] font-medium text-slate-500 leading-relaxed text-left p-3.5 bg-blue-50/55 rounded-2xl border border-blue-100">
                        📄 <strong>Nhập mã chữ ký trên ở bốt kiểm soát:</strong> Nhân viên bốt gác có thể trực tiếp sao chép mã chữ ký xe trên hoặc nhập tay biển số {vehicles.find(v => v.id === selectedVehId || v.plate === selectedVehId)?.plate || '"30G-123.45"'} của bạn để tạo dọn xe và nâng barie tự động một cách chân thực nhất!
                      </div>
                    </div>

                  </div>
                </motion.div>


    </>
  );
}
