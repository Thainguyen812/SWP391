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
    ticketAttachedFiles, setTicketAttachedFiles, triggerToast, isTxDateInFilter, handleLogout
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
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Chọn phương tiện đang điều khiển</label>
                          <select
                            value={selectedVehId}
                            onChange={(e) => setSelectedVehId(e.target.value)}
                            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {vehicles.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.plate} - {v.name} ({v.isLocked ? "ĐÃ KHÓA" : "MỞ KHÓA"})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Big visual lock feedback area */}
                        {(() => {
                          const activeVeh = vehicles.find(v => v.id === selectedVehId) || vehicles[0];
                          if (!activeVeh) {
                            return (
                              <div className="p-8 text-center text-xs text-slate-400">
                                Chưa đăng ký bất kỳ chiếc xe nào. Vui lòng thêm xe ở tab "Xe của tôi"!
                              </div>
                            );
                          }
                          const isLocked = activeVeh.isLocked;
                          return (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isLocked ? 'from-rose-500 to-red-600' : 'from-emerald-400 to-teal-500'}`} />
                              
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-all ${
                                isLocked ? 'bg-red-50 text-red-600 shadow-lg shadow-red-200' : 'bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100'
                              }`}>
                                {isLocked ? (
                                  <Lock className="w-8 h-8 animate-pulse" />
                                ) : (
                                  <Unlock className="w-8 h-8" />
                                )}
                              </div>

                              <div className="space-y-1">
                                <h4 className={`text-sm font-black uppercase tracking-wider ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                                  {isLocked ? "Đang Khóa Chống Trộm" : "Mở Khóa - Sẵn Sàng Chạy"}
                                </h4>
                                <span className="text-[10px] bg-slate-200/60 font-mono text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-wider select-all">
                                  {activeVeh.plate}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                {isLocked 
                                  ? "Ví bốt và Barrier của bãi đỗ sẽ giữ rào đóng cứng và kẹp phanh hơi bánh xe nếu phát hiện xe di chuyển ra ngoài bốt gác lúc này."
                                  : "Bốt an ninh sẽ cho phép xe ra vào thoải mái, tự động đối khớp thông tin từ camera LPR và QR số."
                                }
                              </p>

                              <button
                                type="button"
                                disabled={isTogglingLock === activeVeh.id}
                                onClick={() => handleToggleLockInPwa(activeVeh.id, activeVeh.plate, isLocked)}
                                className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white shadow-md active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
                                  isLocked 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200' 
                                    : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-red-100'
                                }`}
                              >
                                {isTogglingLock === activeVeh.id ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Đang cấu hình khóa...</span>
                                  </>
                                ) : isLocked ? (
                                  <>
                                    <Unlock className="w-4 h-4" />
                                    <span>Bấm để Mở Khóa (Unlock Vehicle)</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    <span>Kích hoạt Khóa Bánh Radar Ô tô</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="text-[10px] text-slate-400 bg-slate-50 border border-slate-150 p-3 rounded-xl mt-4 leading-relaxed italic">
                        💡 <strong>Gợi ý kiểm thử lỗi (Bad flow):</strong> Bật <strong>"Kích hoạt Khóa Bánh"</strong> ở đây, sau đó sang <strong>Trực cổng (nhập biển số)</strong> và bấm thông quét xe có biển số này. Bạn sẽ kích hoạt ngay kịch bản báo động đột nhập bốt trực!
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
                          const activeVeh = vehicles.find(v => v.id === selectedVehId) || vehicles[0];
                          if (!activeVeh) return null;
                          const qrValueString = `${activeVeh.plate}|${qrDirection}|${Date.now()}`;
                          return (
                            <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col items-center justify-center space-y-4">
                              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-inner w-44 h-44 flex flex-col items-center justify-center relative group">
                                {/* Simulated cool tech look camera scan target helper lines */}
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-600" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-600" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-600" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-600" />

                                {/* A highly stylized custom vector matrix blocks grid representing a high contrast QR code */}
                                <div className="grid grid-cols-5 gap-1.5 w-28 h-28 opacity-95">
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />

                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />

                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-sky-500 rounded animate-pulse" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />

                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />

                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                </div>

                                <div className="text-[8px] text-blue-600 font-bold block bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-2">
                                  MÃ VÉ KHÁCH VIP
                                </div>
                              </div>

                              <div className="w-full text-center space-y-1">
                                <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">Chữ ký số bốt gác (Gate Token Hash)</span>
                                <strong className="text-xs font-mono font-black text-slate-800 tracking-wider block bg-white border border-slate-200 p-2 rounded-xl select-all select-all shadow-inner break-all">
                                  {qrValueString}
                                </strong>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(qrValueString);
                                  triggerToast("📋 Sao chép mã chữ ký số bốt gác thành công!", "success");
                                }}
                                className="w-full py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-extrabold text-xs rounded-xl active:scale-95 transition-all outline-none"
                              >
                                Sao chép Mã QR văn bản
                              </button>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="text-[10.5px] font-medium text-slate-500 leading-relaxed text-left p-3.5 bg-blue-50/55 rounded-2xl border border-blue-100">
                        📄 <strong>Nhập mã chữ ký trên ở bốt kiểm soát:</strong> Nhân viên bốt gác có thể trực tiếp sao chép mã chữ ký xe trên hoặc nhập tay biển số {vehicles.find(v => v.id === selectedVehId)?.plate || '"30G-123.45"'} của bạn để tạo dọn xe và nâng barie tự động một cách chân thực nhất!
                      </div>
                    </div>

                  </div>
                </motion.div>


    </>
  );
}
