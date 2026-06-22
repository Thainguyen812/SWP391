import React, { useState } from 'react';
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

export const StaffPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, addTransaction, updateShiftStats, addActivityLog, currentVehicle, removeActiveVehicle } = useGlobalContext();
  
  const lostCardData = location.state?.lostCardVehicle;
  const isLostCard = location.state?.isLostCard;
  const penaltyAmount = location.state?.penaltyAmount || 200000;
  const baseAmount = 50000;
  
  const [totalAmount, setTotalAmount] = useState(isLostCard ? (baseAmount + penaltyAmount) : baseAmount);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [lan1Status, setLan1Status] = useState(isLostCard ? 'busy' : 'free');
  const [lan2Status, setLan2Status] = useState('free');
  const [lpr, setLpr] = useState(lostCardData?.plate || currentVehicle?.plate || '30G-123.45');
  const [isEditingLpr, setIsEditingLpr] = useState(false);
  const [hasVehicle, setHasVehicle] = useState(isLostCard ? true : false);
  const [cashGiven, setCashGiven] = useState(totalAmount);
  const [cardCode, setCardCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [backendTxn, setBackendTxn] = useState(null);

  const handleScanCard = async () => {
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
    Modal.confirm({
      title: 'Xác nhận thanh toán',
      content: isLostCard ? `Tiến hành thu ${totalAmount.toLocaleString()} đ (Bao gồm phí đỗ xe và phạt mất thẻ) và mở cổng cho xe ${lpr}?` : `Tiến hành thu phí và mở cổng cho xe ${lpr}?`,
      okText: 'Thu tiền & Mở cổng',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' },
      onOk() {
        notification.success({message: 'Thanh toán thành công', description: 'Đã gửi lệnh mở cổng ra.', placement: 'topRight'});
        
        // Update Global Context
        addTransaction({
          id: `#TRX-${Math.floor(1000 + Math.random() * 9000)}`,
          plate: lpr,
          type: "car",
          inTime: isLostCard ? lostCardData?.inTime : "07:00",
          inDate: "24/05",
          outTime: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}),
          outDate: "24/05",
          duration: isLostCard ? lostCardData?.duration : "3h 0m",
          amount: `${totalAmount.toLocaleString()} đ`,
          paymentMethod: isLostCard ? (paymentMethod === 'cash' ? "Tiền mặt (Phạt)" : "Chuyển khoản (Phạt)") : (paymentMethod === 'cash' ? "Tiền mặt" : "Chuyển khoản"),
          paymentIcon: <WalletOutlined className="text-blue-600" />,
          status: isLostCard ? "Xử lý mất thẻ" : "Thành công",
          statusColor: isLostCard ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700",
          hasError: isLostCard
        });
        updateShiftStats(totalAmount, paymentMethod === 'cash');
        addActivityLog({
          plate: lpr,
          model: isLostCard ? lostCardData?.model : "Khách vãng lai",
          type: isLostCard ? "MẤT THẺ" : "VÉ NGÀY",
          gate: "Làn ra 1 - Cửa B",
          action: isLostCard ? "Ra bãi (Thu phạt)" : "Ra bãi (Đã thu)",
          time: "Vừa xong",
          status: "Thành Công",
          typeColor: isLostCard ? "text-red-600" : "text-blue-600",
          statusColor: "bg-emerald-100 text-emerald-700",
          actionColor: "text-emerald-600"
        });

        removeActiveVehicle(lpr);

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
                <h3 className="text-lg font-bold text-slate-800 m-0">
                  {isLostCard ? <span className="text-red-600"><WarningFilled className="mr-2"/> Xử lý Sự cố Mất thẻ</span> : "Xử lý vé vãng lai"}
                </h3>
                <span className="bg-slate-100 text-slate-500 font-mono text-xs px-3 py-1 rounded">TICKET #{Math.floor(Math.random() * 9000) + 1000}</span>
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
                      <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">ENT: CAM-01</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc vào (Cam 2 - Góc phải)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">ENT: CAM-02</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc ra (Cam 3 - Góc trái)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">EXT: CAM-03</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc ra (Cam 4 - Góc phải)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1621416953228-868f04179e87?auto=format&fit=crop&w=400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">EXT: CAM-04</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex flex-col border-l border-slate-100 pl-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Thời gian gửi ({isLostCard ? 'Sự cố' : (currentVehicle?.type || 'Vãng lai')})</h4>
                    <div className="text-base font-bold text-slate-800">{isLostCard ? lostCardData?.duration : (currentVehicle?.duration || '04h 25m')}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{isLostCard ? lostCardData?.inTime : (currentVehicle?.inTime || '08:15')} - {new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng tiền thu</h4>
                    <div className="text-2xl font-black text-red-600">{totalAmount.toLocaleString()} <span className="text-sm font-bold">VND</span></div>
                    {isLostCard && <div className="text-[10px] text-red-500 mt-1">Đã bao gồm 200k tiền phạt</div>}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Phương thức thanh toán</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <BankOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">Tiền mặt</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('qr')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <QrcodeOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">VietQR</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <CreditCardOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">Thẻ TV</span>
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
                          {Math.max(0, parseInt(cashGiven || 0) - 50000).toLocaleString('en-US')} <span className="text-xs font-bold text-slate-500">VND</span>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center animate-fadeIn">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors" onClick={handlePayment} title="Click để giả lập quẹt thẻ">
                        <CreditCardOutlined className="text-3xl text-blue-500 animate-bounce" />
                      </div>
                      <span className="text-sm font-bold text-blue-800 mb-1">Xác thực Thẻ Thành Viên</span>
                      <span className="text-xs font-medium text-blue-600 text-center">Đang chờ tín hiệu chạm thẻ...<br/>(Click vào thẻ để giả lập quẹt)</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-auto">
                  <button onClick={handleCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors cursor-pointer">
                    Huỷ bỏ
                  </button>
                  <button onClick={handlePayment} className="flex-[2] bg-[#1677ff] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer">
                    <CheckCircleFilled />
                    Thanh Toán & Mở Cổng
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
                {transactions.slice(0, 5).map(txn => (
                  <tr key={txn.id} className={txn.hasError ? "border-b border-red-50 bg-red-50/20 hover:bg-red-50/50 transition-colors" : "border-b border-slate-50 hover:bg-slate-50 transition-colors"}>
                    <td className="p-4 text-slate-600">{txn.outTime || txn.inTime}</td>
                    <td className={`p-4 font-bold ${txn.hasError ? 'text-red-600' : 'text-slate-800'}`}>{txn.plate}</td>
                    <td className="p-4">
                      <span className={`${txn.type === 'car' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-600'} text-[10px] px-2 py-0.5 rounded font-medium uppercase`}>
                        {txn.type === 'car' ? 'Ô TÔ' : (txn.type === 'moto' ? 'XE MÁY' : txn.type)}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-right">{txn.amount}</td>
                    <td className={`p-4 text-xs font-bold ${txn.statusColor.split(' ')[1]}`}>
                      {txn.hasError ? <CloseCircleFilled className="mr-1" /> : <CheckCircleFilled className="mr-1" />} 
                      {txn.status}
                    </td>
                  </tr>
                ))}
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
                <div className="text-xl font-black text-slate-800">4,250K</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Lượt Xe Ra</div>
                <div className="text-xl font-black text-slate-800">142</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600 font-medium">Tiền mặt</span>
                </div>
                <span className="font-bold text-slate-800">2,100,000 ₫</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 font-medium">VietQR</span>
                </div>
                <span className="font-bold text-slate-800">2,150,000 ₫</span>
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
                  {/* Progress Circle (75%) */}
                  <path
                    className="text-emerald-400"
                    strokeDasharray="75, 100"
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
                  <span className="text-xl font-bold">75%</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 text-sm flex-1 ml-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Đang đỗ</span>
                  <span className="font-bold text-white">300</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Trống</span>
                  <span className="font-bold text-emerald-400">100</span>
                </div>
                <div className="h-px w-full bg-slate-700 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tổng chỗ</span>
                  <span className="font-bold text-white">400</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
