import React, { useContext, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Car, CheckCircle, Lock, Plus, RefreshCw, X } from 'lucide-react';
import { DriverContext, VEHICLE_PRICING } from '../DriverPwa';
 
export const VipRegistrationModal: React.FC = () => {
  const context = useContext(DriverContext);
  if (!context) return null;
 
  const {
    vehicles,
    regStep,
    setRegStep,
    selectedVehicleForVIP,
    setSelectedVehicleForVIP,
    selectedPackPrice,
    setSelectedPackPrice,
    selectedPackLabel,
    setSelectedPackLabel,
    paymentMethod,
    setPaymentMethod,
    balance,
    handleStartVnpay,
    triggerToast,
    setAddVehicleModalOpen,
    setNewType,
    setActiveTab,
    photoCavet,
    setPhotoCavet,
    photoCccd,
    setPhotoCccd,
    photoXe,
    setPhotoXe,
    extractedPlate,
    setExtractedPlate
  } = context;

  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [explanation, setExplanation] = useState('');

  const handleCheckoutValidation = () => {
    if (!photoCavet) {
      triggerToast('Vui lòng tải lên ảnh cà vẹt / đăng ký xe.', 'error');
      return;
    }
    if (!photoCccd) {
      triggerToast('Vui lòng tải lên ảnh CMND / CCCD chủ xe.', 'error');
      return;
    }
    if (!photoXe) {
      triggerToast('Vui lòng tải lên ảnh thực tế đầu xe.', 'error');
      return;
    }
    if (extractedPlate && extractedPlate !== selectedVehicleForVIP && !explanation.trim()) {
      triggerToast('Biển số OCR không khớp. Vui lòng nhập lý do giải trình.', 'error');
      return;
    }

    (window as any).lastUploadedPhotos = {
      registrationPaper: photoCavet,
      identityCard: photoCccd,
      frontPhoto: photoXe,
      explanation
    };

    handleStartVnpay();
  };
 
  return (
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
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
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
              
              {/* Choose vehicle */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-4">
                <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  🚙 Phương tiện áp dụng
                </strong>
 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicles.map((v: any) => {
                    const isChosen = selectedVehicleForVIP === v.plate;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVehicleForVIP(v.plate)}
                        className={`p-4 border rounded-2xl text-left flex items-center justify-between transition-all select-none cursor-pointer ${
                          isChosen 
                            ? 'border-blue-600 bg-blue-50/20 text-blue-800 font-extrabold ring-2 ring-blue-600/10' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-650'
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
                  })}
                </div>
 
                <button 
                  type="button"
                  onClick={() => {
                    setNewType('Ô tô gầm thấp 4-5 chỗ');
                    setAddVehicleModalOpen(true);
                  }}
                  className="pt-2 text-xs font-black text-blue-600 hover:underline inline-block cursor-pointer"
                >
                  + Thêm xe mới
                </button>
              </div>
 
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-5 text-left">
                <div className="space-y-1">
                  <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Tài liệu xác thực VIP
                  </strong>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Tài xế cần cung cấp cà vẹt, CCCD và ảnh đầu xe. OCR mô phỏng sẽ đối chiếu biển số trên cà vẹt với xe đang đăng ký.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Cà vẹt / Đăng ký xe</span>
                    {photoCavet ? (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={photoCavet} alt="Cà vẹt" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setPhotoCavet(null); setExtractedPlate(null); }}
                          className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center space-y-2 bg-slate-50">
                        <p className="text-[10px] text-slate-400">Chọn ảnh mẫu để chạy OCR:</p>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOcrLoading(true);
                              setPhotoCavet('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80');
                              setTimeout(() => {
                                setExtractedPlate(selectedVehicleForVIP || '30F-999.78');
                                setIsOcrLoading(false);
                                triggerToast('OCR đã trích xuất biển số khớp hồ sơ.', 'success');
                              }, 900);
                            }}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            Ảnh khớp biển số
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOcrLoading(true);
                              setPhotoCavet('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80');
                              setTimeout(() => {
                                setExtractedPlate('29A-888.88');
                                setIsOcrLoading(false);
                                triggerToast('OCR phát hiện biển số cà vẹt không khớp.', 'error');
                              }, 900);
                            }}
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            Ảnh khác biển số
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">2. CMND / CCCD chủ xe</span>
                    {photoCccd ? (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={photoCccd} alt="CCCD" className="w-full h-full object-cover" />
                        <button
                          type="button"
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

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">3. Ảnh thực tế đầu xe</span>
                    {photoXe ? (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={photoXe} alt="Ảnh đầu xe" className="w-full h-full object-cover" />
                        <button
                          type="button"
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
                        <span className="text-[9px] font-bold uppercase tracking-wider">Tải ảnh đầu xe</span>
                      </button>
                    )}
                  </div>
                </div>

                {isOcrLoading && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-700 font-extrabold animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>AI OCR đang quét biển số trên cà vẹt...</span>
                  </div>
                )}

                {!isOcrLoading && extractedPlate && (
                  <div className="space-y-3">
                    {extractedPlate === selectedVehicleForVIP ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-black">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>AI OCR trích xuất: {extractedPlate}. Biển số khớp với xe đang đăng ký.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-700 font-extrabold leading-relaxed">
                          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                          <div>
                            <span className="block font-black">AI OCR trích xuất: {extractedPlate}. Không khớp với {selectedVehicleForVIP}.</span>
                            <span className="text-[10.5px] font-semibold text-slate-500 block">Cần nhập lý do giải trình trước khi gửi hồ sơ duyệt VIP.</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Lý do giải trình khác biệt biển số
                          </label>
                          <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Ví dụ: xe đang chờ sang tên, xe mượn của thành viên gia đình..."
                            className="w-full p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Choose service package */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-4">
                <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  ⭐ Gói dịch vụ
                </strong>
 
                <div className="space-y-3.5">
                  {(() => {
                    const selectedVehicleObj = vehicles.find((v: any) => v.plate === selectedVehicleForVIP);
                    const selectedVehicleType = selectedVehicleObj ? selectedVehicleObj.type : 'Ô tô gầm thấp 4-5 chỗ';
                    const pricing = VEHICLE_PRICING[selectedVehicleType] || VEHICLE_PRICING['Ô tô gầm thấp 4-5 chỗ'];
                    return [
                      { 
                        id: 'pkg-2', 
                        label: 'Thẻ Tháng VIP', 
                        price: pricing.month, 
                        desc: 'Giải pháp tối ưu cho cư dân và nhân viên văn phòng.', 
                        badge: 'PHỔ BIẾN', 
                        features: [
                          'Chỗ đỗ xe cố định (Tầng B1)',
                          'Thanh toán bằng mã QR code lưu động',
                          'Hỗ trợ kỹ thuật 24/7 tức thì'
                        ] 
                      },
                      { 
                        id: 'pkg-3', 
                        label: 'Thẻ 3 Tháng VIP', 
                        price: pricing.month3, 
                        desc: 'Gói tiết kiệm 3 tháng cho hội viên thân thiết.', 
                        badge: 'TIẾT KIỆM', 
                        features: [
                          'Chỗ đỗ xe cố định (Tầng B1)',
                          'Thanh toán bằng mã QR code lưu động',
                          'Hỗ trợ kỹ thuật 24/7 tức thì'
                        ] 
                      },
                      { 
                        id: 'pkg-4', 
                        label: 'Thẻ 6 Tháng VIP', 
                        price: pricing.month6, 
                        desc: 'Gói nửa năm với nhiều ưu đãi đặc quyền.', 
                        badge: 'ƯU ĐÃI LỚN', 
                        features: [
                          'Chỗ đỗ xe cố định (Tầng B1)',
                          'Thanh toán bằng mã QR code lưu động',
                          'Hỗ trợ kỹ thuật 24/7 tức thì'
                        ] 
                      },
                      { 
                        id: 'pkg-5', 
                        label: 'Thẻ 1 Năm VIP', 
                        price: pricing.year, 
                        desc: 'Gói trọn gói 1 năm - giải pháp đỗ xe hoàn hảo.', 
                        badge: 'SIÊU TIẾT KIỆM', 
                        features: [
                          'Chỗ đỗ xe cố định (Tầng B1)',
                          'Thanh toán bằng mã QR code lưu động',
                          'Hỗ trợ kỹ thuật 24/7 tức thì'
                        ] 
                      }
                    ];
                  })().map(pkg => {
                    const isSelected = selectedPackLabel === pkg.label;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          setSelectedPackPrice(pkg.price);
                          setSelectedPackLabel(pkg.label);
                        }}
                        className={`p-5 border rounded-2xl transition-all cursor-pointer relative overflow-hidden select-none text-left ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/10 ring-2 ring-blue-600/10' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pkg.badge && (
                          <span className={`absolute right-0 top-0 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-450'
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
                          <div className="mt-4 pt-3 border-t border-slate-100 text-slate-650 text-xs space-y-1.5 leading-none">
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
                    <strong className="text-slate-800">30 ngày kể từ ngày duyệt</strong>
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
                    className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-lg border border-slate-200 text-slate-850 cursor-pointer"
                  >
                    <option value="wallet">Ví UrbanPark (Số dư: {balance.toLocaleString('vi-VN')}₫)</option>
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
 
                <p className="text-[11px] text-slate-450 text-center leading-normal max-w-[200px] mx-auto pt-1">
                  Bằng việc xác nhận, bạn đồng ý với <strong className="text-blue-500 hover:underline cursor-pointer">Điều khoản dịch vụ</strong>.
                </p>
              </div>
 
            </div>
 
          </div>
        </>
      )}
    </motion.div>
  );
};
