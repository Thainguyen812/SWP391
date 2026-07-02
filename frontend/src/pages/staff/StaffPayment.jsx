import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  EditOutlined, 
  CheckCircleFilled,
  CloseCircleFilled,
  BankOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  WarningFilled,
  CarOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { notification, Input, Button, Modal, Spin } from 'antd';
import { useGlobalContext } from '../../context/GlobalContext';
import { apiClient } from '../../api/apiClient';
import { parkingService } from '../../services/parkingService';

export const StaffPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, fetchAllDataFromBackend, addTransaction, updateShiftStats, shiftStats, addActivityLog, currentVehicle, activeVehicles, removeActiveVehicle, isEmergency, currentUser, getVehicleFines, clearVehicleFines } = useGlobalContext();
  
  const totalSlots = 400; // Static capacity for now until API provides it
  const activeCount = activeVehicles ? activeVehicles.filter(v => !v.gate).length : 0;
  const emptyCount = Math.max(0, totalSlots - activeCount);
  const occupancyPercent = totalSlots > 0 ? Math.round((activeCount / totalSlots) * 100) : 0;
  
  const lostCardData = location.state?.lostCardVehicle;
  const isLostCard = location.state?.isLostCard;
  const penaltyAmount = location.state?.penaltyAmount || 200000;
  const baseAmount = 50000;
  
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [lan1Status, setLan1Status] = useState(isLostCard ? 'busy' : 'free');
  const [lan2Status, setLan2Status] = useState('free');
  const [lpr, setLpr] = useState(location.state?.lpr || lostCardData?.plate || currentVehicle?.plate || '30G-123.45');
  const [isEditingLpr, setIsEditingLpr] = useState(false);
  const [hasVehicle, setHasVehicle] = useState(isLostCard ? true : false);
  const [cashGiven, setCashGiven] = useState(0);
  const [cardCode, setCardCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [backendTxn, setBackendTxn] = useState(null);

  const calculateVisitorFee = (durationStr) => {
    if (!durationStr || durationStr === 'Đang vào') return 30000; // Default minimum fee
    const matchHours = durationStr.match(/(\d+)h/i);
    const matchMins = durationStr.match(/(\d+)m/i);
    const hours = matchHours ? parseInt(matchHours[1]) : 0;
    const mins = matchMins ? parseInt(matchMins[1]) : 0;
    
    // Round up if > 15 mins past the hour
    const totalHours = hours + (mins > 15 ? 1 : 0);
    
    let fee = 30000; // First 2 hours
    if (totalHours > 2) {
      fee += (totalHours - 2) * 10000; // +10k per additional hour
    }
    return fee;
  };

  const vehicleToPay = useMemo(() => {
    if (activeVehicles) {
      return activeVehicles.find(v => v.plate === lpr) || currentVehicle;
    }
    return currentVehicle;
  }, [activeVehicles, lpr, currentVehicle]);

  const isVip = vehicleToPay?.type === 'VIP' || vehicleToPay?.type === 'Vé tháng' || backendTxn?.ticketType === 'VIP' || backendTxn?.ticketType === 'Vé tháng' || location.state?.isVip === true || location.state?.type === 'VIP' || location.state?.type === 'Vé tháng';

  useEffect(() => {
    setIsPaid(false);
  }, [vehicleToPay]);

  useEffect(() => {
    // Auto-select payment method if VIP
    if (isVip) {
      setPaymentMethod('QR VIP');
    }
  }, [isVip]);

  useEffect(() => {
    if (backendTxn) {
      setTotalAmount(prev => {
        if (prev !== backendTxn.totalAmount) {
          setCashGiven(backendTxn.totalAmount);
          return backendTxn.totalAmount;
        }
        return prev;
      });
      return;
    }
    
    const isError = vehicleToPay?.status === 'Lỗi thẻ';

    let amount;
    let evPenalty = backendTxn?.violationPenalty || (lpr && lpr.includes('EV') ? 500000 : 0);
    
    // Calculate accumulated fines
    const accumulatedFines = lpr ? getVehicleFines(lpr).reduce((sum, fine) => sum + fine.amount, 0) : 0;
    
    if (isLostCard) {
      amount = calculateVisitorFee(lostCardData?.duration) + penaltyAmount + evPenalty;
    } else if (isVip) {
      amount = evPenalty;
    } else {
      amount = calculateVisitorFee(vehicleToPay?.duration) + evPenalty;
    }
    
    amount += accumulatedFines;
    
    setTotalAmount(prev => {
      if (prev !== amount) {
        setCashGiven(amount);
        return amount;
      }
      return prev;
    });
  }, [lpr, vehicleToPay, isLostCard, backendTxn]);

  const getCarImages = (plate) => {
    const images = [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1621416953228-868f04179e87?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80"
    ];
    let sum = 0;
    const str = plate || "default";
    for(let i=0; i<str.length; i++) sum += str.charCodeAt(i);
    return {
      in1: images[sum % images.length],
      in2: images[(sum + 1) % images.length],
      out1: images[(sum + 2) % images.length],
      out2: images[(sum + 3) % images.length]
    };
  };

  const carImgs = getCarImages(lpr);

  const handleScanCard = async () => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể quét thẻ lúc này.' });
      return;
    }
    if (!cardCode) return notification.warning({message: 'Vui lòng nhập hoặc quét mã thẻ'});
    setIsCheckingOut(true);
    try {
      const response = await apiClient.post(`/v1/parking/checkout-by-code/${cardCode}`);
      const txn = response.data;
      
      setBackendTxn(txn);
      setLpr(`THẺ: ${cardCode}`); // Since backend doesn't return plate directly in Transaction
      setTotalAmount(txn.totalAmount);
      setCashGiven(txn.totalAmount);
      setHasVehicle(true);
      setLan1Status('busy');
      notification.success({message: 'Quét thẻ thành công', description: `Đã tính phí: ${txn.totalAmount} VND. Vui lòng thu tiền.`});
    } catch (error) {
      notification.error({message: 'Lỗi Check-out', description: error.response?.data?.message || 'Không thể check-out bằng thẻ này'});
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePayment = () => {
    if (isPaid || isCheckingOut) return;
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thanh toán và mở cổng lúc này.' });
      return;
    }
    
    Modal.confirm({
      title: totalAmount === 0 ? 'Xác nhận mở cổng' : 'Xác nhận thanh toán',
      content: isLostCard ? `Tiến hành thu ${totalAmount.toLocaleString()} đ (Bao gồm phí đỗ xe và phạt mất thẻ) và mở cổng cho xe ${lpr}?` : 
               (totalAmount === 0 ? `Xác nhận mở cổng cho xe VIP ${lpr}?` : `Tiến hành thu phí và mở cổng cho xe ${lpr}?`),
      okText: totalAmount === 0 ? 'Xác nhận & Mở cổng' : 'Thu tiền & Mở cổng',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' },
      async onOk() {
        try {
          if (backendTxn && backendTxn.id) {
            await parkingService.confirmCheckout(backendTxn.id);
          } else {
            // NEW LOGIC FOR LOST CARD
            if (isLostCard) {
              const staffId = currentUser?.id; // Fixed mock Staff ID
              try {
                await apiClient.post('/api/blacklisted-cards/block-by-plate', null, {
                  params: {
                    plate: lpr,
                    reason: 'LOST',
                    staffId: staffId
                  }
                });
              } catch (err) {
                console.error("Failed to block card by plate", err);
              }
            }
            // Send mock transaction to backend so it saves in DB
            await apiClient.post('/revenue/transactions/mock', {
              amount: totalAmount,
              plate: lpr
            });
          }
          // Refresh global context to pull latest transactions and remove from active
          if (fetchAllDataFromBackend) fetchAllDataFromBackend();
        } catch (e) {
          console.error("Failed to mock transaction", e);
        }

        notification.success({message: 'Thanh toán thành công', description: 'Đã gửi lệnh mở cổng ra.', placement: 'topRight'});
        
        // Tắt hiển thị xe ngay lập tức (UI state)
        setIsPaid(true);
        removeActiveVehicle(lpr);
        setHasVehicle(false);
        addActivityLog({
          plate: lpr,
          model: isLostCard ? lostCardData?.model : (isVip ? (vehicleToPay?.model || "Thành viên VIP") : "Khách vãng lai"),
          type: isLostCard ? "MẤT THẺ" : (isVip ? "VIP" : "VÉ NGÀY"),
          gate: "Làn ra 1 - Cửa B",
          action: isLostCard ? "Ra bãi (Thu phạt)" : "Ra bãi (Đã thu)",
          time: "Vừa xong",
          status: "Thành Công",
          typeColor: isLostCard ? "text-red-600" : (isVip ? "text-amber-600" : "text-blue-600"),
          statusColor: "bg-emerald-100 text-emerald-700",
          actionColor: "text-emerald-600"
        });

        removeActiveVehicle(lpr);
        if (lpr) clearVehicleFines(lpr);

        setHasVehicle(false);
        setBackendTxn(null);
        setCardCode('');
        setTotalAmount(0);
        setCashGiven(0);
        setLan1Status('free');
      }
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Xác nhận huỷ giao dịch',
      content: 'Bạn có chắc chắn muốn huỷ bỏ giao dịch này? Phương tiện sẽ không được phép qua cổng.',
      okText: 'Huỷ giao dịch',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      onOk() {
        notification.error({message: 'Đã huỷ bỏ giao dịch', placement: 'topRight'});
        setHasVehicle(false);
        setLan1Status('free');
      }
    });
  };

  const simulateNextVehicle = () => {
    // Removed because we now use real scanning API
  };

  const handleCheckout = () => {
    notification.success({message: 'Chốt ca thành công', description: 'Báo cáo đang được in...', placement: 'topRight'});
  };

  return (
    <div className="p-6 w-full">
      {/* Header Tags */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex gap-3">
          <button 
            onClick={() => setLan1Status(lan1Status === 'free' ? 'busy' : 'free')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer border ${
              lan1Status === 'free' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${lan1Status === 'free' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            Làn ra 1: {lan1Status === 'free' ? 'Đang rảnh' : 'Đang bận'}
          </button>
          <button 
            onClick={() => setLan2Status(lan2Status === 'free' ? 'busy' : 'free')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer border ${
              lan2Status === 'free' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${lan2Status === 'free' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            Làn ra 2: {lan2Status === 'free' ? 'Đang rảnh' : 'Đang bận'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 m-0 flex items-center gap-2">
                  {isLostCard ? <span className="text-red-600"><WarningFilled className="mr-2"/> Xử lý Sự cố Mất thẻ</span> : "Xử lý vé vãng lai"}
                </h3>
                <span className="bg-slate-100 text-slate-500 font-mono text-xs px-3 py-1 rounded">TICKET #{useMemo(() => {
                  if (!lpr) return 1000;
                  let hash = 0;
                  for (let i = 0; i < lpr.length; i++) {
                    hash = lpr.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  return Math.abs(hash) % 9000 + 1000;
                }, [lpr])}</span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* LPR and Cameras */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Biển số nhận diện (LPR)</h4>
                  <div className="flex items-center justify-between border border-blue-200 bg-blue-50/50 rounded-lg p-3">
                    {isEditingLpr ? (
                      <Input 
                        value={lpr} 
                        onChange={(e) => setLpr(e.target.value.toUpperCase())}
                        onBlur={() => setIsEditingLpr(false)}
                        onPressEnter={() => setIsEditingLpr(false)}
                        autoFocus
                        className="text-xl font-bold tracking-wider"
                      />
                    ) : (
                      <span className="text-xl font-bold text-slate-800 tracking-wider">{lpr}</span>
                    )}
                    <button onClick={() => setIsEditingLpr(!isEditingLpr)} className="text-blue-600 hover:text-blue-800 transition-colors ml-3 cursor-pointer">
                      <EditOutlined className="text-lg" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc vào (Cam 1 - Góc trái)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.in1} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">ENT: CAM-01</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc vào (Cam 2 - Góc phải)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.in2} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">ENT: CAM-02</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc ra (Cam 3 - Góc trái)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.out1} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">EXT: CAM-03</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc ra (Cam 4 - Góc phải)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.out2} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">EXT: CAM-04</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex flex-col border-l border-slate-100 pl-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Thời gian gửi ({isLostCard ? 'Sự cố' : (vehicleToPay?.type || 'Vãng lai')})
                      {vehicleToPay?.type === 'VIP' && vehicleToPay?.status === 'Lỗi thẻ' && (
                        <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold">LỖI THẺ CẦN QUẸT LẠI</span>
                      )}
                    </h4>
                    <div className="text-base font-bold text-slate-800">{isLostCard ? lostCardData?.duration : (vehicleToPay?.duration && vehicleToPay?.duration !== 'Đang vào' ? vehicleToPay?.duration : '0h 0m')}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{isLostCard ? lostCardData?.inTime : (vehicleToPay?.inTime || '08:15')} - {new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng tiền thu</h4>
                    <div className="text-2xl font-black text-red-600">{totalAmount.toLocaleString()} <span className="text-sm font-bold">VND</span></div>
                    {isLostCard && <div className="text-[10px] text-red-500 mt-1">Đã bao gồm 200k tiền phạt thẻ</div>}
                    {(backendTxn?.violationPenalty > 0 || (lpr && lpr.includes('EV'))) && <div className="text-[10px] text-red-600 mt-1 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">⚠️ Bị phạt Đỗ sai vị trí EV (+500k)</div>}
                    {lpr && getVehicleFines(lpr).length > 0 && <div className="text-[10px] text-red-600 mt-1 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">⚠️ Đã bao gồm phạt cộng dồn (+{getVehicleFines(lpr).reduce((sum, f) => sum + f.amount, 0).toLocaleString()}đ)</div>}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Phương thức thanh toán</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        if (isVip) {
                          notification.warning({ message: 'Không khả dụng', description: 'Khách VIP bắt buộc thanh toán bằng QR Động theo quy trình.' });
                          return;
                        }
                        setPaymentMethod('cash');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isVip ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' :
                        paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <BankOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">Tiền mặt</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (isVip) {
                          notification.warning({ message: 'Không khả dụng', description: 'Khách VIP bắt buộc thanh toán bằng QR Động theo quy trình.' });
                          return;
                        }
                        setPaymentMethod('qr');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isVip ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' :
                        paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <QrcodeOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">VietQR</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (!isVip) {
                          notification.warning({ message: 'Không khả dụng', description: 'Phương thức này chỉ dành cho xe VIP/Vé tháng.' });
                          return;
                        }
                        setPaymentMethod('card');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        !isVip ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' :
                        paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-600 cursor-pointer' : 'border-slate-200 text-slate-500 hover:border-blue-300 cursor-pointer'
                      }`}
                    >
                      <QrcodeOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">QR VIP</span>
                    </button>
                  </div>
                </div>

                <div className="mb-6 flex-1 flex flex-col justify-center">
                  {paymentMethod === 'cash' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-fadeIn">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600">Tiền khách đưa:</span>
                        <Input 
                          className="w-32 text-right font-bold" 
                          value={cashGiven ? parseInt(cashGiven).toLocaleString('en-US') : ''} 
                          onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <div className="h-px w-full bg-slate-200 mb-3"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Tiền thối lại:</span>
                        <span className="text-lg font-black text-slate-800">
                          {Math.max(0, parseInt(cashGiven || 0) - totalAmount).toLocaleString('en-US')} <span className="text-xs font-bold text-slate-500">VND</span>
                        </span>
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'qr' && (
                    <div className="bg-white border border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center animate-fadeIn shadow-sm relative overflow-hidden">
                      <div className="w-28 h-28 bg-slate-50 rounded-lg flex items-center justify-center mb-3 border border-slate-200 overflow-hidden relative">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ThanhToanVeXe" alt="QR Code" className="w-24 h-24 object-contain" />
                        <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 text-center mb-3">Vui lòng yêu cầu khách hàng quét mã QR<br/>bằng ứng dụng Ngân hàng</span>
                      <button onClick={handlePayment} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-bold py-2 rounded transition-colors cursor-pointer">
                        Giả lập khách đã thanh toán thành công
                      </button>
                    </div>
                  )}
                  {paymentMethod === 'card' && (
                    <div className="bg-white border border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center animate-fadeIn shadow-sm relative overflow-hidden">
                      <div className="w-28 h-28 bg-slate-50 rounded-lg flex items-center justify-center mb-3 border border-slate-200 overflow-hidden relative">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VIP_Checkout_${lpr || 'Unknown'}`} alt="QR Code VIP" className="w-24 h-24 object-contain" />
                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 text-center mb-3">Mã QR dành cho Thành viên VIP<br/>(Dùng app hệ thống để quét)</span>
                      <button onClick={handlePayment} className="w-full bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 text-xs font-bold py-2 rounded transition-colors cursor-pointer flex items-center justify-center gap-2">
                        <QrcodeOutlined /> Giả lập đã quét mã VIP
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-auto">
                  <button onClick={handleCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors cursor-pointer">
                    Huỷ bỏ
                  </button>
                  <button 
                    onClick={handlePayment} 
                    disabled={isPaid || isCheckingOut}
                    className={`flex-[2] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md ${
                      isPaid || isCheckingOut ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-[#1677ff] hover:bg-blue-600 shadow-blue-500/20 cursor-pointer'
                    }`}
                  >
                    <CheckCircleFilled />
                    {totalAmount === 0 ? 'Xác nhận & Mở Cổng' : 'Thanh Toán & Mở Cổng'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* History Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 m-0">Lịch sử giao dịch gần đây</h3>
              <a onClick={(e) => { e.preventDefault(); navigate('/staff-transactions'); }} href="#" className="text-blue-600 text-xs font-bold hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                Xem tất cả <ArrowRightOutlined />
              </a>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-4 border-b border-slate-200">Thời gian</th>
                  <th className="p-4 border-b border-slate-200">Biển số</th>
                  <th className="p-4 border-b border-slate-200">Loại vé</th>
                  <th className="p-4 border-b border-slate-200 text-right">Số tiền</th>
                  <th className="p-4 border-b border-slate-200">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(txn => {
                  const statusColor = txn.statusColor || 'bg-emerald-100 text-emerald-600';
                  const textColor = statusColor.split(' ')[1] || 'text-emerald-600';
                  
                  let amountDisplay = txn.amount || (txn.totalAmount ? txn.totalAmount.toLocaleString('vi-VN') + 'đ' : '0đ');
                  if (typeof amountDisplay === 'string') {
                    amountDisplay = amountDisplay.replace('.00', '').replace('đ', '') + 'đ';
                    if (!amountDisplay.includes(',') && !amountDisplay.includes('.')) {
                      amountDisplay = parseInt(amountDisplay).toLocaleString('vi-VN') + 'đ';
                    }
                  }

                  const formatTime = (isoString) => {
                    if (!isoString) return '';
                    let cleanStr = isoString;
                    if (typeof cleanStr === 'string' && cleanStr.includes('T')) {
                      cleanStr = cleanStr.replace(/(\.\d{3})\d+Z$/, '$1Z');
                    }
                    const d = new Date(cleanStr);
                    if (isNaN(d.getTime())) return isoString;
                    return d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                  };

                  const timeDisplay = formatTime(txn.time);
                  const inTimeDisplay = txn.inTime ? formatTime(txn.inTime) : null;

                  const statusDisplay = (txn.status === 'SUCCESS' || txn.paymentStatus === 'SUCCESS') ? 'Thành công' : (txn.status === 'FAILED' || txn.paymentStatus === 'FAILED' ? 'Thất bại' : (txn.status || 'Thành công'));
                  
                  return (
                  <tr key={txn.id} className={txn.hasError ? "border-b border-red-50 bg-red-50/20 hover:bg-red-50/50 transition-colors" : "border-b border-slate-50 hover:bg-slate-50 transition-colors"}>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-semibold">{timeDisplay}</span>
                        {inTimeDisplay && <span className="text-[11px] text-slate-500 font-medium">Vào: {inTimeDisplay}</span>}
                      </div>
                    </td>
                      <td className={`p-4 font-bold ${txn.hasError ? 'text-red-600' : 'text-slate-800'}`}>{txn.plate || '---'}</td>
                    <td className="p-4">
                      <span className={`${txn.type === 'car' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-600'} text-[10px] px-2 py-0.5 rounded font-medium uppercase`}>
                        {txn.type === 'car' ? 'Ô TÔ' : (txn.type === 'moto' ? 'XE MÁY' : (txn.type || 'VÃNG LAI'))}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-right">{amountDisplay}</td>
                    <td className={`p-4 text-xs font-bold ${textColor}`}>
                      {txn.hasError ? <CloseCircleFilled className="mr-1" /> : <CheckCircleFilled className="mr-1" />} 
                      {statusDisplay}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Shift Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-800 leading-tight m-0">Tổng kết<br/>ca trực</h3>
              <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold text-center">
                Ca Sáng (06:00<br/>- 14:00)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Doanh Thu</div>
                <div className="text-xl font-black text-slate-800">{shiftStats ? (shiftStats.revenue / 1000).toLocaleString('vi-VN') + 'K' : '0K'}</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Lượt Xe Ra</div>
                <div className="text-xl font-black text-slate-800">{shiftStats ? shiftStats.transactions : 0}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600 font-medium">Tiền mặt</span>
                </div>
                <span className="font-bold text-slate-800">{shiftStats ? shiftStats.cash.toLocaleString('vi-VN') : 0} ₫</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 font-medium">VietQR</span>
                </div>
                <span className="font-bold text-slate-800">{shiftStats ? shiftStats.transfer.toLocaleString('vi-VN') : 0} ₫</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-lg transition-colors cursor-pointer">
              Chốt ca & In báo cáo
            </button>
          </div>

          {/* Capacity Card */}
          <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-base font-bold m-0 mb-1">Công suất bãi</h3>
            <div className="text-xs text-slate-400 mb-6">Cập nhật lúc 12:40</div>
            
            <div className="flex items-center justify-between">
              {/* CSS Circle Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-700"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    className="text-emerald-400"
                    strokeDasharray={`${occupancyPercent}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{occupancyPercent}%</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 text-sm flex-1 ml-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Đang đỗ</span>
                  <span className="font-bold text-white">{activeCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Trống</span>
                  <span className="font-bold text-emerald-400">{emptyCount}</span>
                </div>
                <div className="h-px w-full bg-slate-700 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tổng chỗ</span>
                  <span className="font-bold text-white">{totalSlots}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
