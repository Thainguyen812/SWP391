import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, QrcodeOutlined, SearchOutlined, 
  CheckCircleFilled, CarOutlined, DollarOutlined, 
  BankOutlined, CheckOutlined, MobileOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { notification, Spin } from 'antd';
import { apiClient } from '../../api/apiClient';
import dayjs from 'dayjs';
import { useGlobalContext } from '../../context/GlobalContext';

export const StaffMobilePOS = () => {
  const navigate = useNavigate();
  const { activeVehicles, currentUser, getVehicleFines, clearVehicleFines } = useGlobalContext();
  const [plate, setPlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fee, setFee] = useState(0);

  const calculateFee = (inTime) => {
    // Giả lập tính phí như backend
    if (!inTime) return 10000;
    try {
      const [hours, minutes] = inTime.split(':').map(Number);
      const now = new Date();
      const inDate = new Date();
      inDate.setHours(hours, minutes, 0);
      let diffMs = now - inDate;
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return diffHours > 4 ? 30000 : 10000;
    } catch {
      return 10000;
    }
  };

  const handleSearch = async () => {
    if (!plate) {
      notification.warning({ message: 'Vui lòng nhập biển số xe' });
      return;
    }
    
    setIsLoading(true);
    try {
      const found = activeVehicles?.find(v => v.plate === plate.toUpperCase() || v.plate.includes(plate.toUpperCase()));
      
      if (found) {
        setVehicle(found);
        
        // Nếu là vé tháng/VIP
        let baseFee = 0;
        if (found.type === 'VIP' || found.type === 'Vé tháng') {
          baseFee = 0;
          setPaymentMethod('card'); // VIP bắt buộc QR động (card)
        } else {
          baseFee = calculateFee(found.inTime);
          setPaymentMethod('cash');
        }
        
        // Cộng dồn tiền phạt
        const accumulatedFines = getVehicleFines(found.plate).reduce((sum, fine) => sum + fine.amount, 0);
        setFee(baseFee + accumulatedFines);
      } else {
        notification.error({ message: 'Không tìm thấy xe', description: 'Xe không có trong bãi hoặc đã ra khỏi bãi.' });
        setVehicle(null);
      }
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Lỗi kết nối', description: 'Không thể tải dữ liệu từ máy chủ.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Gọi API congestion/checkout
      await apiClient.post('/v1/parking/congestion/checkout', {
        licensePlate: vehicle.plate,
        staffId: currentUser?.id,
        gpsLocation: '21.028511, 105.804817', // Mock GPS
        proofImageUrl: 'https://example.com/mobile-proof.jpg', // Mock proof
        paymentMethod: paymentMethod === 'cash' ? 'CASH' : 'QR_BANK'
      });
      
      setIsSuccess(true);
      notification.success({ 
        message: 'Thanh toán thành công', 
        description: `Xe ${vehicle.plate} đã thanh toán và có thể ra thẳng qua cổng.` 
      });
      if (vehicle?.plate) clearVehicleFines(vehicle.plate);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
      notification.error({ message: 'Thanh toán thất bại', description: errorMsg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSession = () => {
    setPlate('');
    setVehicle(null);
    setIsSuccess(false);
  };

  // Nếu màn hình không phải mobile, hiển thị background mờ và căn giữa một box có kích thước điện thoại
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-4 font-sans">
      <div className="bg-white w-full h-screen md:h-[850px] md:w-[400px] md:rounded-[2rem] md:shadow-2xl overflow-hidden flex flex-col relative border-4 border-slate-800">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center gap-3 shadow-md z-10 pt-8 md:pt-4">
          <button onClick={() => navigate('/staff-dashboard')} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <ArrowLeftOutlined />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Mobile POS</h1>
            <p className="text-[10px] text-blue-200">Giải tỏa kẹt xe / Thanh toán lưu động</p>
          </div>
          <MobileOutlined className="text-xl text-blue-200 opacity-50" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircleFilled className="text-6xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Thành công!</h2>
              <p className="text-slate-500 mb-6 text-sm">
                Xe <strong className="text-slate-800 text-lg uppercase bg-slate-200 px-2 py-1 rounded">{vehicle?.plate}</strong> đã hoàn tất thanh toán.
              </p>
              
              <div className="bg-white w-full rounded-xl p-4 shadow-sm border border-slate-100 mb-8 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Phí gửi xe:</span>
                    <span className="font-bold text-slate-800">
                      {vehicle.type === 'VIP' || vehicle.type === 'Vé tháng' ? '0 đ' : `${calculateFee(vehicle.inTime).toLocaleString()} đ`}
                    </span>
                  </div>
                  {getVehicleFines(vehicle.plate).length > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-red-600">
                      <span className="text-red-500 text-sm">Phạt vi phạm ({getVehicleFines(vehicle.plate).length} lỗi):</span>
                      <span className="font-bold">+{getVehicleFines(vehicle.plate).reduce((sum, fine) => sum + fine.amount, 0).toLocaleString()} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 bg-red-50 px-2 rounded-t mt-2">
                    <span className="text-red-700 font-bold">Tổng tiền thu:</span>
                    <span className="font-black text-red-600 text-lg">{fee.toLocaleString()} đ</span>
                  </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Phương thức:</span>
                  <span className="font-bold text-slate-800">
                    {paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'qr' ? 'VietQR' : 'QR Động'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 text-sm">Thời gian:</span>
                  <span className="font-bold text-slate-800">{dayjs().format('HH:mm - DD/MM')}</span>
                </div>
              </div>
              
              <button 
                onClick={handleNewSession}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform cursor-pointer"
              >
                TIẾP TỤC QUÉT XE KHÁC
              </button>
            </div>
          ) : (
            <div className="p-4">
              
              {/* Search Box */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nhập biển số xe (hoặc quét biển)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <CarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="VD: 51A-12345"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg uppercase transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-slate-800 text-white w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                  >
                    {isLoading ? <Spin size="small" /> : <SearchOutlined className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Result Area */}
              {vehicle && (
                <div className="animate-slide-up">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4 overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                      Đang ở trong bãi
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <CarOutlined className="text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-wider">{vehicle.plate}</h3>
                        <p className="text-xs font-medium text-slate-500">{vehicle.type} - Gate {vehicle.gate}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <ClockCircleOutlined />
                        <span className="text-sm font-medium">Giờ vào: {vehicle.inTime || '08:15'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Phí gửi xe</span>
                        <span className="text-lg font-black text-red-600">{fee.toLocaleString()}đ</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">Phương thức thu tiền</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            if (vehicle.type === 'VIP' || vehicle.type === 'Vé tháng') {
                              notification.warning({ message: 'Không khả dụng', description: 'VIP bắt buộc quét QR.'});
                              return;
                            }
                            setPaymentMethod('cash');
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            (vehicle.type === 'VIP' || vehicle.type === 'Vé tháng') ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' :
                            paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${paymentMethod === 'cash' ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-transparent'}`}>
                            {paymentMethod === 'cash' && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                          </div>
                          <BankOutlined className="text-lg" />
                          <span className="font-bold text-sm">Tiền mặt</span>
                        </button>
                        
                        <button 
                          onClick={() => setPaymentMethod(vehicle.type === 'VIP' || vehicle.type === 'Vé tháng' ? 'card' : 'qr')}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            (paymentMethod === 'qr' || paymentMethod === 'card') ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${(paymentMethod === 'qr' || paymentMethod === 'card') ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-transparent'}`}>
                            {(paymentMethod === 'qr' || paymentMethod === 'card') && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                          </div>
                          <QrcodeOutlined className="text-lg" />
                          <span className="font-bold text-sm">Mã QR</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Area (QR or Cash summary) */}
                  {paymentMethod === 'qr' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-24 flex flex-col items-center">
                      <div className="w-48 h-48 bg-slate-100 rounded-xl mb-4 p-2 relative">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT_${vehicle.plate}_${fee}`} 
                          alt="QR Code" 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                        {/* Biểu tượng logo ngân hàng giả */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-1 w-10 h-10 shadow-sm border border-slate-100 flex items-center justify-center">
                          <DollarOutlined className="text-blue-500 text-xl" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-500 text-center">Đưa mã này cho khách hàng quét để thanh toán. Chờ xác nhận từ hệ thống.</p>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-24 flex flex-col items-center">
                      <div className="w-48 h-48 bg-slate-100 rounded-xl mb-4 p-2 relative border-2 border-yellow-400">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QR_VIP_${vehicle.plate}`} 
                          alt="VIP QR Code" 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-lg p-1 px-2 shadow-sm border border-yellow-500 flex items-center justify-center">
                          <span className="font-bold text-slate-900 text-xs uppercase">VIP</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-700 text-center uppercase">Quét mã nhận diện xe VIP/Vé Tháng</p>
                      <p className="text-xs font-medium text-slate-500 text-center mt-1">Khách hàng sử dụng thẻ hoặc App để quét mã này để mở cổng (Miễn phí).</p>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-24 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <BankOutlined />
                        </div>
                        <span className="font-bold text-slate-700">Thu tiền mặt</span>
                      </div>
                      <span className="text-xl font-black text-slate-800">{fee.toLocaleString()}đ</span>
                    </div>
                  )}

                  {/* Fixed Bottom Button */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 pb-8 md:pb-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                    <button 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                      {isProcessing ? <Spin size="small" /> : (
                        <>
                          <CheckOutlined />
                          XÁC NHẬN THANH TOÁN
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


