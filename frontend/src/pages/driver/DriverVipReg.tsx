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

export function DriverVipReg() {
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
    handleStartVnpay
  } = ctx;

  const [photoCavet, setPhotoCavet] = useState<string | null>(null);
  const [photoCccd, setPhotoCccd] = useState<string | null>(null);
  const [photoXe, setPhotoXe] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [extractedPlate, setExtractedPlate] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');

  const VEHICLE_PRICING = {
    'Ô tô gầm thấp 4-5 chỗ': {
      day: 50000,
      month: 1000000,
      quarter: 2700000,
      halfYear: 5000000,
      year: 9000000
    },
    'Xe 7 chỗ': {
      day: 70000,
      month: 1400000,
      quarter: 3800000,
      halfYear: 7000000,
      year: 12500000
    },
    'Xe 9 chỗ': {
      day: 70000,
      month: 1400000,
      quarter: 3800000,
      halfYear: 7000000,
      year: 12500000
    },
    'Xe 16 chỗ': {
      day: 100000,
      month: 2000000,
      quarter: 5400000,
      halfYear: 10000000,
      year: 18000000
    }
  };

  // Dynamically compute pricing based on selected vehicle
  const currentVeh = vehicles.find((v: any) => v.plate === selectedVehicleForVIP);
  const currentVehType = currentVeh ? currentVeh.type : 'Ô tô gầm thấp 4-5 chỗ';
  
  // Resolve prices based on vehicle type
  const pricingTier = (VEHICLE_PRICING as any)[currentVehType] || VEHICLE_PRICING['Ô tô gầm thấp 4-5 chỗ'];

  const packages = [
    { 
      id: 'pkg-2', 
      label: 'Thẻ Tháng VIP', 
      price: pricingTier.month, 
      desc: 'Giải pháp tối ưu cho cư dân và nhân viên văn phòng.', 
      badge: 'PHỔ BIẾN', 
      features: [
        'Chỗ đỗ xe cố định (Tầng B1)',
        'Rửa xe miễn phí 1 lần/tháng',
        'Hỗ trợ kỹ thuật 24/7 tức thì'
      ] 
    },
    { 
      id: 'pkg-3', 
      label: 'Thẻ 3 Tháng VIP', 
      price: pricingTier.quarter, 
      desc: 'Tiết kiệm 10% so với gia hạn từng tháng đơn lẻ.', 
      badge: 'TIẾT KIỆM', 
      features: [
        'Quyền lợi tương đương Thẻ Tháng VIP',
        'Tiết kiệm chi phí hơn'
      ] 
    },
    { 
      id: 'pkg-4', 
      label: 'Thẻ 6 Tháng VIP', 
      price: pricingTier.halfYear, 
      desc: 'Thời hạn nửa năm tiện lợi, giá ưu đãi lớn.', 
      badge: 'ƯU ĐÃI', 
      features: [
        'Quyền lợi tương đương Thẻ Tháng VIP',
        'Không lo trễ hạn thanh toán định kỳ'
      ] 
    },
    { 
      id: 'pkg-5', 
      label: 'Thẻ 1 Năm VIP', 
      price: pricingTier.year, 
      desc: 'Giải pháp tối thượng, tiết kiệm đến 25%.', 
      badge: 'VIP CLUB', 
      features: [
        'Quyền lợi tương đương Thẻ Tháng VIP',
        'Miễn phí 12 lần rửa xe/năm',
        'Tặng bộ quà tặng thành viên UrbanPark'
      ] 
    }
  ];

  // Sync selected price automatically when vehicle type or package label changes
  useEffect(() => {
    const activePkg = packages.find(p => p.label === selectedPackLabel);
    if (activePkg) {
      setSelectedPackPrice(activePkg.price);
    }
  }, [selectedVehicleForVIP, selectedPackLabel, vehicles]);

  const handleCheckoutValidation = () => {
    if (!photoCavet) {
      triggerToast("⚠️ Vui lòng tải lên Ảnh chụp Cà vẹt xe!", "error");
      return;
    }
    if (!photoCccd) {
      triggerToast("⚠️ Vui lòng tải lên Ảnh chụp CMND/CCCD!", "error");
      return;
    }
    if (!photoXe) {
      triggerToast("⚠️ Vui lòng tải lên Ảnh chụp xe thực tế!", "error");
      return;
    }
    if (extractedPlate && extractedPlate !== selectedVehicleForVIP && !explanation.trim()) {
      triggerToast("⚠️ Biển số Cà vẹt không khớp! Vui lòng điền giải trình khác biệt.", "error");
      return;
    }

    // Save documents to window to be picked up by Layout payment handler
    (window as any).lastUploadedPhotos = {
      registrationPaper: photoCavet,
      identityCard: photoCccd,
      frontPhoto: photoXe,
      explanation: explanation
    };

    handleStartVnpay();
  };

  return (
    <>
                <motion.div 
                  key="vip_reg"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">Đăng ký dịch vụ</h2>
                    <p className="text-slate-400 text-xs text-left">
                      Thiết lập thẻ tháng hoặc thẻ ngày cho phương tiện của bạn.
                    </p>
                  </div>

                  {vehicles.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-lg text-center max-w-xl mx-auto space-y-6 mt-8"
                    >
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <Car className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800">Chưa có phương tiện đăng ký</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Bạn cần thêm ít nhất một phương tiện vào tài khoản trước khi thực hiện mua vé tháng VIP hoặc đăng ký gói dịch vụ.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewType('Ô tô gầm thấp 4-5 chỗ');
                            setAddVehicleModalOpen(true);
                          }}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
                        >
                          + Thêm xe mới ngay
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('vehicles')}
                          className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-655 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                        >
                          Quản lý xe của tôi
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>

                  {/* Progressive Horizontal steps */}
                  <div className="bg-white px-8 py-5 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-6 overflow-x-auto">
                    {[
                      { step: 1, label: 'Chọn xe', completed: regStep > 1, active: regStep === 1 },
                      { step: 2, label: 'Chọn gói', completed: regStep > 2, active: regStep === 2 },
                      { step: 3, label: 'Thanh toán', completed: regStep > 3, active: regStep === 3 }
                    ].map((step, idx, arr) => (
                      <React.Fragment key={step.step}>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            step.completed 
                              ? 'bg-blue-600 text-white font-extrabold' 
                              : step.active 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                                : 'bg-slate-200 text-slate-500'
                          }`}>
                            {step.completed ? '✓' : step.step}
                          </span>
                          <span className={`text-xs font-extrabold uppercase ${step.active ? 'text-blue-600' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        {idx !== arr.length - 1 && (
                          <div className="h-[2px] bg-slate-200 max-w-[200px] flex-1" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Side-by-Side checkout workspace modules */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT WORKSPACE: FORM INPUTS */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* Sub-section 1: Choose vehicle */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          🚙 Phương tiện áp dụng
                        </strong>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {vehicles.length === 0 ? (
                            <div className="col-span-full p-4 text-sm text-slate-500 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                              Chưa có phương tiện nào. Vui lòng quay lại tab "Xe của tôi" để thêm xe trước khi đăng ký dịch vụ!
                            </div>
                          ) : (
                            vehicles.map(v => {
                              const isChosen = selectedVehicleForVIP === v.plate;
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => setSelectedVehicleForVIP(v.plate)}
                                  className={`p-4 border rounded-2xl text-left flex items-center justify-between transition-all select-none cursor-pointer ${
                                    isChosen 
                                      ? 'border-blue-600 bg-blue-50/20 text-blue-800 font-extrabold ring-2 ring-blue-600/10' 
                                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                  }`}
                                >
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-semibold block">{v.type} - {v.name}</span>
                                    <strong className="text-sm font-black font-mono tracking-wider">{v.plate}</strong>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    isChosen ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {isChosen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>

                        <button 
                          onClick={() => {
                            setNewType('Ô tô gầm thấp 4-5 chỗ');
                            setAddVehicleModalOpen(true);
                          }}
                          className="pt-2 text-xs font-black text-blue-600 hover:underline inline-block cursor-pointer"
                        >
                          + Thêm xe mới
                        </button>
                      </div>

                      {/* Sub-section 1.5: Minh chứng & OCR Xác thực */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-5 text-left">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          📄 Tải tài liệu minh chứng (CMND/Cà vẹt/Ảnh xe)
                        </strong>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                          Theo quy định an ninh cấp cao VIP của UrbanPark, tài xế cần tải lên 3 tài liệu minh chứng gốc. 
                          Hệ thống AI OCR sẽ tự động quét đối chiếu biển số trên Cà vẹt xe với biển số đăng ký.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* 1. Ảnh Cà vẹt */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Cà vẹt / Đăng ký xe</span>
                            {photoCavet ? (
                              <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group">
                                <img src={photoCavet} alt="Cà vẹt" className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => { setPhotoCavet(null); setExtractedPlate(null); }}
                                  className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center space-y-2 bg-slate-50">
                                <p className="text-[10px] text-slate-400">Chọn ảnh giả lập để chạy OCR:</p>
                                <div className="flex flex-col gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsOcrLoading(true);
                                      setPhotoCavet('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80');
                                      setTimeout(() => {
                                        setExtractedPlate(selectedVehicleForVIP || '30F-999.78');
                                        setIsOcrLoading(false);
                                        triggerToast("🤖 OCR: Đã trích xuất biển số trùng khớp thành công!", "success");
                                      }, 1500);
                                    }}
                                    className="w-full py-1.5 bg-blue-550 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                  >
                                    Ảnh cà vẹt khớp biển
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsOcrLoading(true);
                                      setPhotoCavet('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80');
                                      setTimeout(() => {
                                        setExtractedPlate('29A-888.88');
                                        setIsOcrLoading(false);
                                        triggerToast("🤖 OCR: Phát hiện biển số Cà vẹt không trùng khớp!", "error");
                                      }, 1500);
                                    }}
                                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                  >
                                    Ảnh cà vẹt khác biển
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Ảnh CMND/CCCD */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">2. CMND / CCCD chủ sở hữu</span>
                            {photoCccd ? (
                              <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group">
                                <img src={photoCccd} alt="CCCD" className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setPhotoCccd(null)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPhotoCccd('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80')}
                                className="w-full h-28 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer transition-colors"
                              >
                                <Plus className="w-5 h-5 mb-1" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Tải lên CCCD</span>
                              </button>
                            )}
                          </div>

                          {/* 3. Ảnh Xe Thực Tế */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">3. Ảnh thực tế biển đầu xe</span>
                            {photoXe ? (
                              <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group">
                                <img src={photoXe} alt="Ảnh xe" className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setPhotoXe(null)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPhotoXe('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80')}
                                className="w-full h-28 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer transition-colors"
                              >
                                <Plus className="w-5 h-5 mb-1" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Tải lên ảnh xe</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* OCR Feedback area */}
                        {isOcrLoading && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-700 font-extrabold animate-pulse">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            <span>🤖 AI OCR đang quét trích xuất biển số xe trên Cà vẹt...</span>
                          </div>
                        )}

                        {!isOcrLoading && extractedPlate && (
                          <div className="space-y-3">
                            {extractedPlate === selectedVehicleForVIP ? (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-black">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>✅ AI OCR trích xuất: {extractedPlate} (Khớp hoàn toàn với biển số xe đăng ký!)</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-700 font-extrabold leading-relaxed">
                                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                                  <div>
                                    <span className="block font-black">⚠️ AI OCR trích xuất: {extractedPlate} (KHÔNG TRÙNG KHỚP!)</span>
                                    <span className="text-[10.5px] font-semibold text-slate-500 block">Biển số trên Cà vẹt khác với biển số xe đã chọn ({selectedVehicleForVIP}). Vui lòng điền lý do giải trình.</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                    Lý do giải trình khác biệt biển số (Bắt buộc)
                                  </label>
                                  <textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="Ví dụ: Xe mượn của thành viên gia đình, xe mới mua đang đợi làm thủ tục sang tên đổi biển số..."
                                    className="w-full p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Sub-section 2: Choose service package */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          ⭐ Gói dịch vụ
                        </strong>

                        <div className="space-y-3.5">
                          {packages.map(pkg => {
                            const isSelected = selectedPackLabel === pkg.label;
                            return (
                              <div
                                key={pkg.id}
                                onClick={() => {
                                  setSelectedPackPrice(pkg.price);
                                  setSelectedPackLabel(pkg.label);
                                }}
                                className={`p-5 border rounded-2xl transition-all cursor-pointer relative overflow-hidden select-none ${
                                  isSelected 
                                    ? 'border-blue-600 bg-blue-50/10 ring-2 ring-blue-600/10' 
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {pkg.badge && (
                                  <span className={`absolute right-0 top-0 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {pkg.badge}
                                  </span>
                                )}

                                <div className="flex justify-between items-start">
                                  <div className="flex gap-3">
                                    <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${
                                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                    }`}>
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                      <strong className="text-sm font-black text-slate-900 block">{pkg.label}</strong>
                                      <p className="text-slate-400 text-xs mt-1 leading-normal max-w-md">{pkg.desc}</p>
                                    </div>
                                  </div>
                                  
                                  <span className="text-base font-black text-blue-600 font-mono">
                                    {pkg.price.toLocaleString('vi-VN')}đ
                                  </span>
                                </div>

                                {pkg.features.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-slate-100 text-slate-600 text-xs space-y-1.5 leading-none">
                                    {pkg.features.map(f => (
                                      <div key={f} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>{f}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT WORKSPACE: ORDER BILLING PANEL */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-6 text-left">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-widest block">
                          Tổng quan đơn hàng
                        </strong>

                        <div className="text-xs text-slate-500 space-y-3 leading-normal border-b border-slate-100 pb-5">
                          <div className="flex justify-between">
                            <span>Phương tiện:</span>
                            <strong className="text-slate-800 font-mono">{selectedVehicleForVIP}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Gói dịch vụ:</span>
                            <strong className="text-slate-800">{selectedPackLabel}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Thời hạn:</span>
                            <strong className="text-slate-800">
                              {(() => {
                                const start = new Date();
                                const end = new Date();
                                if (selectedPackLabel.includes('3 Tháng')) {
                                  end.setMonth(end.getMonth() + 3);
                                } else if (selectedPackLabel.includes('6 Tháng')) {
                                  end.setMonth(end.getMonth() + 6);
                                } else if (selectedPackLabel.includes('1 Năm')) {
                                  end.setFullYear(end.getFullYear() + 1);
                                } else if (selectedPackLabel.includes('Tháng') || selectedPackLabel.includes('VIP')) {
                                  end.setMonth(end.getMonth() + 1);
                                } else {
                                  end.setDate(end.getDate() + 1);
                                }
                                const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                return `${fmt(start)} - ${fmt(end)}`;
                              })()}
                            </strong>
                          </div>
                        </div>

                        <div className="flex justify-between items-center leading-none">
                          <span className="text-xs font-black text-slate-400">TỔNG THANH TOÁN:</span>
                          <strong className="text-2xl font-black text-blue-600 font-mono">
                            {selectedPackPrice.toLocaleString('vi-VN')}đ
                          </strong>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none mb-1.5">
                            Phương thức thanh toán
                          </label>
                          <select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as 'wallet' | 'vnpay')}
                            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-lg border border-slate-200 text-slate-850"
                          >
                            <option value="wallet">Ví UrbanPark (Số dư: ${balance.toFixed(2)})</option>
                            <option value="vnpay">Thẻ thanh toán nội địa VNPAY Sandbox</option>
                          </select>
                        </div>

                        <button 
                          onClick={handleCheckoutValidation}
                          className="w-full py-4 bg-slate-900 border border-slate-800 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4 text-white" />
                          <span>Xác nhận & Thanh toán</span>
                        </button>

                        <p className="text-[11px] text-slate-400 text-center leading-normal max-w-[200px] mx-auto pt-1">
                          Bằng việc xác nhận, bạn đồng ý với <strong className="text-blue-500 hover:underline cursor-pointer">Điều khoản dịch vụ</strong>.
                        </p>
                      </div>

                    </div>

                  </div>
                    </>
                  )}

                </motion.div>


    </>
  );
}
