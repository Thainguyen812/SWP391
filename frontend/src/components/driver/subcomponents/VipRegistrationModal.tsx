import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Car, CheckCircle, Lock } from 'lucide-react';
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
    setAddVehicleModalOpen,
    setNewType,
    setActiveTab
  } = context;
 
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
                  onClick={handleStartVnpay}
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
