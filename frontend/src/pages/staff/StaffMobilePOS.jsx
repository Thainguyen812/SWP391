import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, QrcodeOutlined, SearchOutlined, 
  CheckCircleFilled, CarOutlined, DollarOutlined, 
  BankOutlined, CheckOutlined, MobileOutlined,
  ClockCircleOutlined, CloseOutlined, ScanOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { notification, Spin } from 'antd';
import { apiClient } from '../../api/apiClient';
import dayjs from 'dayjs';
import { useGlobalContext } from '../../context/GlobalContext';

export const StaffMobilePOS = () => {
  const navigate = useNavigate();
  const { activeVehicles, currentUser, getVehicleFines, clearVehicleFines, currentVehicle, removeActiveVehicle } = useGlobalContext();
  const [plate, setPlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fee, setFee] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [auditData, setAuditData] = useState(null);

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

  const handleSearchWithPlate = (searchPlate) => {
    const p = searchPlate || plate;
    if (!p) {
      notification.warning({ message: 'Vui lòng nhập biển số xe' });
      return;
    }
    
    setIsLoading(true);
    try {
      const found = activeVehicles?.find(v => v.plate === p.toUpperCase() || v.plate.includes(p.toUpperCase()));
      
      if (found) {
        setVehicle(found);
        setPlate(found.plate);
        
        // Nếu là vé tháng/VIP
        let baseFee = 0;
        if (found.type === 'VIP' || found.type === 'Vé tháng' || found.type === 'Khách VIP') {
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

  const handleSimulateScan = () => {
    setShowScanner(true);
    setTimeout(() => {
      setShowScanner(false);
      // Try to use currentVehicle if it exists in activeVehicles
      let selectedVehicle = null;
      if (currentVehicle && activeVehicles && activeVehicles.find(v => v.plate === currentVehicle.plate)) {
        selectedVehicle = activeVehicles.find(v => v.plate === currentVehicle.plate);
      } else if (activeVehicles && activeVehicles.length > 0) {
        // Ưu tiên khách vãng lai để hiện tính phí
        const guests = activeVehicles.filter(v => v.type === 'Khách Vãng Lai' || v.type === 'Vãng lai' || !v.type);
        const listToPick = guests.length > 0 ? guests : activeVehicles;
        selectedVehicle = listToPick[Math.floor(Math.random() * listToPick.length)];
      }
      
      if (selectedVehicle) {
        setPlate(selectedVehicle.plate);
        notification.success({message: `Đã nhận diện biển số: ${selectedVehicle.plate}`});
        
        // Auto trigger search with the found vehicle
        handleSearchWithPlate(selectedVehicle.plate);
      } else {
        const fallback = '30A-12345';
        setPlate(fallback);
        handleSearchWithPlate(fallback);
      }
    }, 2000);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Lấy tọa độ GPS giả lập (có thể thay bằng navigator.geolocation thực tế)
      const mockLat = (21.0 + Math.random() * 0.1).toFixed(6);
      const mockLng = (105.8 + Math.random() * 0.1).toFixed(6);
      const mockGps = `${mockLat}, ${mockLng}`;
      const timestamp = new Date().toISOString();

      // Gọi API congestion/checkout
      await apiClient.post('/v1/parking/congestion/checkout', {
        licensePlate: vehicle.plate,
        staffId: currentUser?.id,
        gpsLocation: mockGps,
        timestamp: timestamp,
        proofImageUrl: 'https://example.com/mobile-proof.jpg', // Mock proof
        paymentMethod: paymentMethod === 'cash' ? 'CASH' : 'QR_BANK'
      });
      
      setAuditData({ gps: mockGps, time: dayjs(timestamp).format('HH:mm:ss DD/MM/YYYY') });
      setIsSuccess(true);
      notification.success({ 
        message: 'Thanh toán thành công', 
        description: `Xe ${vehicle.plate} đã thanh toán và có thể ra thẳng qua cổng.` 
      });
      if (vehicle?.plate) {
        clearVehicleFines(vehicle.plate);
        removeActiveVehicle(vehicle.plate);
      }
      
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
    setAuditData(null);
  };

  // Màn hình Mobile POS
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
            <p className="text-[10px] text-blue-200">Giải tỏa ùn tắc lưu động</p>
          </div>
          <MobileOutlined className="text-xl text-blue-200 opacity-50" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in pb-20">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircleFilled className="text-6xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Thanh toán hoàn tất!</h2>
              <p className="text-slate-500 mb-6 text-sm">
                Xe <strong className="text-slate-800 text-lg uppercase bg-slate-200 px-2 py-1 rounded">{vehicle?.plate}</strong> đã hoàn tất thanh toán.
              </p>
              
              <div className="bg-white w-full rounded-xl p-4 shadow-sm border border-slate-100 mb-6 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Tổng tiền thu:</span>
                    <span className="font-black text-slate-800 text-lg">{fee.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Phương thức:</span>
                    <span className="font-bold text-slate-800">
                      {paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'qr' ? 'VietQR' : 'QR Động'}
                    </span>
                  </div>
                  {/* Audit Data Display */}
                  {auditData && (
                    <div className="bg-slate-50 p-3 rounded-lg mt-3 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
                        <CheckOutlined /> Dữ liệu kiểm toán lưu động
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600 mb-1">
                        <EnvironmentOutlined className="mt-0.5 text-blue-500" />
                        <div>
                          <div className="font-bold">GPS Location</div>
                          <div className="font-mono text-[10px]">{auditData.gps}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <ClockCircleOutlined className="mt-0.5 text-blue-500" />
                        <div>
                          <div className="font-bold">Timestamp</div>
                          <div className="font-mono text-[10px]">{auditData.time}</div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              
              <button 
                onClick={handleNewSession}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform cursor-pointer"
              >
                TIẾP TỤC QUÉT XE KHÁC
              </button>
            </div>
          ) : (
            <div className="p-4 flex flex-col min-h-full">
              
              {!vehicle ? (
                <div className="flex-1 flex flex-col items-center justify-center pb-20 animate-slide-up">
                  <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <ScanOutlined className="text-4xl text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Quét Biển Số Xe</h2>
                  <p className="text-sm text-slate-500 text-center mb-8 px-4">
                    Sử dụng camera điện thoại để nhận diện biển số xe tự động và truy xuất tính tiền.
                  </p>
                  
                  <button 
                    onClick={handleSimulateScan}
                    className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-2 mb-8 text-lg"
                  >
                    <ScanOutlined /> MỞ CAMERA QUÉT
                  </button>

                  <div className="w-full relative flex items-center justify-center mb-8">
                    <div className="w-full border-t border-slate-200 absolute"></div>
                    <span className="bg-slate-50 px-4 text-xs font-bold text-slate-400 relative z-10 uppercase">Hoặc nhập thủ công</span>
                  </div>

                  <div className="w-full bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex gap-2">
                    <input 
                      type="text" 
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchWithPlate(null)}
                      placeholder="VD: 51A-12345"
                      className="flex-1 bg-transparent border-none py-3 px-4 font-bold text-slate-700 focus:outline-none focus:ring-0 uppercase text-lg"
                    />
                    <button 
                      onClick={() => handleSearchWithPlate(null)}
                      disabled={isLoading}
                      className="bg-slate-800 text-white px-6 rounded-xl font-bold active:scale-95 transition-transform cursor-pointer"
                    >
                      {isLoading ? <Spin size="small" /> : 'TÌM'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-slide-up pb-32">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4 overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase shadow-sm">
                      Đang ở trong bãi
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                        <CarOutlined className="text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-wider">{vehicle.plate}</h3>
                        <p className="text-xs font-medium text-slate-500">{vehicle.type} - Cổng vào: {vehicle.gate || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center mb-4 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-600">
                        <ClockCircleOutlined />
                        <span className="text-sm font-bold">Giờ vào: {vehicle.inTime || dayjs().subtract(2, 'hour').format('HH:mm')}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Phí gửi xe</span>
                        <span className="text-xl font-black text-red-600">{fee.toLocaleString()}đ</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">Khách thanh toán qua:</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            if (vehicle.type === 'VIP' || vehicle.type === 'Vé tháng') {
                              notification.warning({ message: 'Không khả dụng', description: 'VIP/Vé tháng quét thẻ.'});
                              return;
                            }
                            setPaymentMethod('cash');
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            (vehicle.type === 'VIP' || vehicle.type === 'Vé tháng') ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' :
                            paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${paymentMethod === 'cash' ? 'border-blue-500' : 'border-slate-300'}`}>
                            {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                          </div>
                          <BankOutlined className="text-lg" />
                          <span className="font-bold text-sm">Tiền mặt</span>
                        </button>
                        
                        <button 
                          onClick={() => setPaymentMethod(vehicle.type === 'VIP' || vehicle.type === 'Vé tháng' ? 'card' : 'qr')}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            (paymentMethod === 'qr' || paymentMethod === 'card') ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${(paymentMethod === 'qr' || paymentMethod === 'card') ? 'border-blue-500' : 'border-slate-300'}`}>
                            {(paymentMethod === 'qr' || paymentMethod === 'card') && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                          </div>
                          <QrcodeOutlined className="text-lg" />
                          <span className="font-bold text-sm">Mã QR</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info Area */}
                  {paymentMethod === 'qr' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center animate-fade-in">
                      <div className="w-48 h-48 bg-slate-50 rounded-xl mb-4 p-3 relative border border-slate-100 shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT_${vehicle.plate}_${fee}`} 
                          alt="QR Code" 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-1.5 shadow-md border border-slate-100 flex items-center justify-center">
                          <DollarOutlined className="text-blue-500 text-xl" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-700 text-center mb-1">Khách hàng quét mã VietQR</p>
                      <p className="text-xs font-medium text-slate-500 text-center">Đưa màn hình này cho khách để họ dùng App ngân hàng quét thanh toán.</p>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-200 flex flex-col items-center animate-fade-in bg-yellow-50/30">
                      <div className="w-48 h-48 bg-white rounded-xl mb-4 p-3 relative border-2 border-yellow-400 shadow-md">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QR_VIP_${vehicle.plate}`} 
                          alt="VIP QR Code" 
                          className="w-full h-full object-contain" 
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-lg px-2 py-0.5 shadow-md border border-yellow-500 flex items-center justify-center">
                          <span className="font-black text-slate-900 text-xs uppercase">VIP</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-800 text-center uppercase">Thẻ Vé Tháng / VIP</p>
                      <p className="text-xs font-medium text-slate-600 text-center mt-1">Khách hàng dùng thẻ hoặc App nội bộ để quét mở cổng tự động (0đ).</p>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 flex items-center justify-between animate-fade-in bg-blue-50/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-sm border border-blue-100">
                          <BankOutlined className="text-xl" />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-700">Thu tiền mặt</span>
                          <span className="block text-xs text-slate-500">Khách trả trực tiếp</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-slate-800">{fee.toLocaleString()}đ</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Fixed Bottom Checkout Button (Only show if vehicle is selected and not success) */}
          {vehicle && !isSuccess && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 pb-8 md:pb-4 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] z-20">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold p-2.5 rounded-lg mb-3 flex items-start gap-2 shadow-sm">
                <span className="text-base leading-none">⚠️</span>
                <span>LƯU Ý: Staff KHÔNG THU HỒI Thẻ Tạm tại bước này. Trả lại thẻ cho khách giữ để đảm bảo kiểm soát đầu ra đồng bộ tại cổng trạm.</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer uppercase tracking-wider text-sm border-2 border-slate-800"
              >
                {isProcessing ? <Spin size="small" /> : (
                  <>
                    <CheckOutlined className="text-lg" />
                    Xác nhận thanh toán lưu động
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Camera Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col font-sans animate-fade-in">
          <div className="p-4 flex justify-between items-center text-white bg-black/60 z-10 absolute top-0 left-0 right-0 backdrop-blur-md border-b border-white/10">
            <span className="font-bold text-lg flex items-center gap-2"><ScanOutlined /> Quét Biển Số</span>
            <button onClick={() => setShowScanner(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors backdrop-blur-md">
              <CloseOutlined className="text-xl" />
            </button>
          </div>
          
          <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
            {/* Fake camera feed background */}
            <img 
              src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80" 
              alt="camera feed" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" 
            />
            
            {/* Dark overlay with cutout (using borders trick) */}
            <div className="absolute inset-0 z-0 opacity-70 bg-black" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 15% 100%, 15% 35%, 85% 35%, 85% 65%, 15% 65%, 15% 100%, 100% 100%, 100% 0%)' }}></div>
            
            {/* Viewfinder box */}
            <div className="w-[70%] h-[30%] relative z-10">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>
              
              {/* Target crosshair center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400/50">
                <ScanOutlined className="text-4xl" />
              </div>
              
              {/* Scanning line animation */}
              <style>{`
                @keyframes scan-line {
                  0% { top: 0; opacity: 0; }
                  10% { opacity: 1; }
                  50% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                  animation: scan-line 2s ease-in-out infinite;
                }
              `}</style>
              <div className="w-full h-1 bg-emerald-400 absolute left-0 shadow-[0_0_20px_5px_rgba(52,211,153,0.8)] animate-scan z-20"></div>
            </div>
            
            <div className="absolute bottom-12 text-white font-bold text-sm bg-black/60 px-6 py-3 rounded-full backdrop-blur-md z-10 shadow-lg border border-white/10 flex items-center gap-2 animate-pulse">
              <ScanOutlined /> Đang nhận diện biển số...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
