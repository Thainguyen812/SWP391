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

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('100000');
  const [withdrawBank, setWithdrawBank] = useState('Vietcombank');
  const [withdrawAccNo, setWithdrawAccNo] = useState('');

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      triggerToast('Vui lòng nhập mật khẩu hiện tại!', 'error');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      triggerToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    setIsChangingPw(true);
    try {
      const response = await fetch('/api/v1/driver/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(sessionStorage.getItem('token') || localStorage.getItem('token'))}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        triggerToast('✓ Đổi mật khẩu tài khoản thành công 100%!', 'success');
        setOldPassword('');
        setNewPassword('');
      } else {
        triggerToast(`Lỗi: ${data.message || 'Không thể đổi mật khẩu'}`, 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Lỗi kết nối máy chủ khi đổi mật khẩu!', 'error');
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleWithdraw = () => {
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      triggerToast('Vui lòng nhập số tiền hợp lệ!', 'error');
      return;
    }
    if (val > balance) {
      triggerToast('Số tiền rút vượt quá số dư khả dụng!', 'error');
      return;
    }
    if (!withdrawAccNo.trim()) {
      triggerToast('Vui lòng nhập số tài khoản ngân hàng!', 'error');
      return;
    }

    const newBal = balance - val;
    setBalance(newBal);
    const phoneKey = user?.phone || (user?.username && !user?.username.includes('@') ? user?.username : 'default');
    localStorage.setItem(`urbanpark_user_balance_${phoneKey}`, newBal.toString());

    const newTx = {
      id: `#WD${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('vi-VN'),
      type: `Rút tiền về ${withdrawBank} (${withdrawAccNo})`,
      plate: '-',
      fee: `-${val.toLocaleString('vi-VN')}₫`,
      isEntry: false,
      status: 'Thành công'
    };

    setTransactions((prev: any) => [newTx, ...prev]);
    setWithdrawModalOpen(false);
    setWithdrawAccNo('');
    triggerToast(`✓ Đã gửi lệnh rút ${val.toLocaleString('vi-VN')}₫ về ${withdrawBank} thành công!`, 'success');
  };

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
                        Quản lý thông tin cá nhân, bảo mật và tùy chọn ví điện tử.
                      </p>
                    </div>
                    <button 
                      onClick={() => triggerToast('Đã lưu mọi thay đổi thiết lập tài khoản thành công!', 'success')}
                      className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer self-stretch sm:self-auto"
                    >
                      Lưu thay đổi
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT PANEL: Profile Info */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-6">
                      <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                        Hồ sơ cá nhân
                      </strong>

                      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 font-black text-xl flex items-center justify-center font-mono shrink-0">
                          {user?.name ? user.name.split(' ').slice(-1)[0].charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-850 text-sm">{user?.name || 'Tài xế UrbanPark'}</h4>
                          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block font-mono">
                            TÀI XẾ URBANPARK VIP
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                              Họ và tên
                            </label>
                            <input 
                              type="text" 
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none focus:bg-white transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                              Số điện thoại
                            </label>
                            <div className="relative flex items-center">
                              <input 
                                type="text" 
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:bg-white transition-all pr-24"
                              />
                              <span className="absolute right-2 text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md">
                                {isPhoneVerified ? '✓ Đã xác thực' : '⚠️ Chưa xác thực'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Địa chỉ Email
                          </label>
                          <input 
                            type="email" 
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:bg-white transition-all font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Địa chỉ thường trú
                          </label>
                          <input 
                            type="text" 
                            value={profileAddress}
                            onChange={(e) => setProfileAddress(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: Wallet & Security */}
                    <div className="lg:col-span-5 space-y-6">
                      
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
                            {balance.toLocaleString('vi-VN')}₫
                          </strong>

                          <div className="mt-4 flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={() => {
                                if (isOffline) {
                                  triggerToast('Lỗi: Không thể nạp tiền vào ví ở chế độ Ngoại tuyến!', 'error');
                                  return;
                                }
                                setSelectedPackPrice(500000);
                                setSelectedPackLabel('Nạp tiền vào ví điện tử UrbanPark');
                                setVnpayStep('info');
                                setVnpayModalOpen(true);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Nạp tiền VNPAY</span>
                            </button>

                            <button 
                              type="button"
                              onClick={() => setWithdrawModalOpen(true)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all border border-slate-700 cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>Rút tiền về NGÂN HÀNG</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Security Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                          Bảo mật tài khoản
                        </strong>

                        <div className="space-y-3.5 text-xs font-sans">
                          {/* Quick Password inputs */}
                          <div className="space-y-2">
                            <strong className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đổi mật khẩu tài khoản (Lưu Database)</strong>
                            
                            <div className="space-y-1.5">
                              <input 
                                type="password" 
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Mật khẩu hiện tại..."
                                className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-200 focus:bg-white text-xs outline-none font-mono"
                              />
                              <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mật khẩu mới (ít nhất 6 ký tự)..."
                                className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-200 focus:bg-white text-xs outline-none font-mono"
                              />
                            </div>
                            
                            <button 
                              type="button"
                              disabled={isChangingPw}
                              onClick={handleChangePassword}
                              className="pt-1.5 text-[10.5px] font-black text-blue-600 hover:underline cursor-pointer inline-block disabled:opacity-50"
                            >
                              {isChangingPw ? 'Đang cập nhật DB...' : 'Cập nhật mật khẩu ngay →'}
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                  {/* MODAL RÚT TIỀN VỀ NGÂN HÀNG */}
                  {withdrawModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base font-black text-slate-800">Rút tiền từ Ví về Ngân hàng</h3>
                          </div>
                          <button onClick={() => setWithdrawModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Số dư khả dụng hiện tại</span>
                            <strong className="text-lg font-black font-mono text-blue-700">{balance.toLocaleString('vi-VN')}₫</strong>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ngân hàng thụ hưởng</label>
                            <select 
                              value={withdrawBank} 
                              onChange={(e) => setWithdrawBank(e.target.value)}
                              className="w-full p-2.5 border rounded-xl bg-slate-50 border-slate-200 text-xs font-bold outline-none"
                            >
                              <option value="Vietcombank">Vietcombank (Ngân hàng TMCP Ngoại thương)</option>
                              <option value="MBBank">MBBank (Ngân hàng Quân Đội)</option>
                              <option value="Techcombank">Techcombank (Ngân hàng Kỹ thương)</option>
                              <option value="VietinBank">VietinBank (Ngân hàng Công thương)</option>
                              <option value="BIDV">BIDV (Ngân hàng Đầu tư và Phát triển)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Số tài khoản nhận tiền</label>
                            <input 
                              type="text" 
                              value={withdrawAccNo} 
                              onChange={(e) => setWithdrawAccNo(e.target.value)}
                              placeholder="Ví dụ: 1029384756..."
                              className="w-full p-2.5 border rounded-xl bg-slate-50 border-slate-200 text-xs font-mono font-bold outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Số tiền muốn rút (VNĐ)</label>
                            <input 
                              type="number" 
                              value={withdrawAmount} 
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              placeholder="Nhập số tiền..."
                              className="w-full p-2.5 border rounded-xl bg-slate-50 border-slate-200 text-xs font-mono font-bold outline-none focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setWithdrawModalOpen(false)}
                            className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button 
                            type="button" 
                            onClick={handleWithdraw}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                          >
                            Xác nhận rút tiền
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>


    </>
  );
}
