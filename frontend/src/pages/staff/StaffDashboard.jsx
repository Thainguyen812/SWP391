import React, { useState, useEffect } from 'react';
import { 
  InfoCircleOutlined, 
  SoundOutlined,
  ExportOutlined,
  VideoCameraOutlined,
  WalletOutlined,
  FilterOutlined,
  DownloadOutlined,
  CheckCircleFilled,
  WarningOutlined,
  CreditCardOutlined,
  CarOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { Tag, Modal, notification, Spin, message, Input, Button, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import { logService } from '../../services/logService';
import { useGlobalContext } from '../../context/GlobalContext';
import { apiClient } from '../../api/apiClient';

export const StaffDashboard = () => {
  const navigate = useNavigate();
  const [manualBarrierStates, setManualBarrierStates] = useState({});
  
  // States for Violation Modal
  const [isViolationModalVisible, setIsViolationModalVisible] = useState(false);
  const [violationPlate, setViolationPlate] = useState('');
  const [violationReason, setViolationReason] = useState('Đỗ sai quy định');

  const { activityLogs, addActivityLog, addSecurityAlert, securityAlerts, currentVehicle, setCurrentVehicle, activeVehicles, totalGates, setTotalGates, removeSecurityAlert, isEmergency, removeActiveVehicle, fetchAllDataFromBackend, gates, addTransaction, processEntryVehicle } = useGlobalContext();

  const isManualBarrierOpen = currentVehicle ? manualBarrierStates[currentVehicle.id] || false : false;

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [currentLogPage, setCurrentLogPage] = useState(1);
  const LOGS_PER_PAGE = 5;
  const [isGateConfigModalVisible, setIsGateConfigModalVisible] = useState(false);
  const [newGateCount, setNewGateCount] = useState(totalGates);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [isLotModalVisible, setIsLotModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isManualEntryModalVisible, setIsManualEntryModalVisible] = useState(false);
  const [manualCardCode, setManualCardCode] = useState('');

  // Auto-select first active vehicle on load
  useEffect(() => {
    if (activeVehicles && activeVehicles.length > 0 && !currentVehicle) {
      setCurrentVehicle(activeVehicles[0]);
    }
  }, [activeVehicles, currentVehicle, setCurrentVehicle]);

  // Use only activityLogs (which now preserves manual interactions) for the live log
  const displayLogs = activityLogs;
  const currentLogs = displayLogs.slice((currentLogPage - 1) * LOGS_PER_PAGE, currentLogPage * LOGS_PER_PAGE);

  const vehiclesInLotCount = activeVehicles ? activeVehicles.filter(v => !v.gate).length : 0;
  const pendingProcessingCount = activeVehicles ? activeVehicles.filter(v => v.gate).length : 0;
  const waitingPaymentCount = activeVehicles ? activeVehicles.filter(v => v.gate && (v.status === 'Chờ thanh toán' || v.status === 'Lỗi thẻ')).length : 0;
  const alertsCount = securityAlerts ? securityAlerts.length : 0;


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingLogs(true);
        const data = await logService.getParkingSessions();
        if (data && Array.isArray(data)) {
          const mappedLogs = data.filter(session => !session.isPending).map((session, index) => {
            const isCheckIn = !session.checkOutTime;
            
            // Map vehicle details from backend DTO
            let vehicleDisplay = "Khách vãng lai";
            if (session.vehicleBrand || session.vehicleModel) {
               vehicleDisplay = `${session.vehicleModel} ${session.vehicleColor ? `(${session.vehicleColor})` : ''}`.trim();
            } else if (session.isVip) {
               vehicleDisplay = "Xe đăng ký tháng";
            } else if (session.isSuspicious) {
               vehicleDisplay = "Lỗi nhận diện biển số";
            }
            
            // Map gate
            const gateStr = isCheckIn ? `Cổng vào ${index % 2 === 0 ? '1' : '2'}` : `Cổng ra ${index % 2 === 0 ? '1' : '2'}`;
            
            // Map status
            let statusStr = "THÀNH CÔNG";
            if (session.isSuspicious) {
                statusStr = "CẦN XỬ LÝ";
            } else if (session.sessionStatus === 'COMPLETED') {
                statusStr = "ĐÃ THU 30.000Đ"; // Fake fee amount for UI
            }

            return {
              id: session.id,
              plate: session.licensePlate || '-- KHÔNG RÕ --',
              model: vehicleDisplay,
              type: session.isVip ? "VIP" : (session.isSuspicious ? "LỖI" : "KHÁCH"),
              typeColor: session.isVip ? "#000" : (session.isSuspicious ? "#ef4444" : "#64748b"),
              gate: gateStr, 
              action: session.isSuspicious ? "Chặn Tự động" : (isCheckIn ? "Vào bãi" : "Ra bãi"),
              actionColor: session.isSuspicious ? "text-red-600" : (isCheckIn ? "text-emerald-600" : "text-blue-600"),
              time: new Date(session.checkOutTime || session.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              status: statusStr,
              statusColor: session.isSuspicious ? "bg-red-100 text-red-700" : (session.sessionStatus === 'COMPLETED' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")
            };
          });
          // Sort newest first
          mappedLogs.sort((a, b) => b.time.localeCompare(a.time));
          setLogs(mappedLogs);
        } else {
          setLogs([]);
        }
      } catch (error) {
        console.error("Failed to fetch parking sessions:", error);
        // Soft fallback if API not ready
        setLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchSessions();
  }, []);

  const handleOpenManualBarrier = () => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thao tác Barrier lúc này.' });
      return;
    }
    if (currentVehicle && currentVehicle.status === 'Lỗi thẻ') {
      notification.error({ message: 'Không thể mở Barrier', description: 'Xe đang báo Lỗi thẻ. Vui lòng ấn "Xử lý ngay" để thu tiền phạt và cấp lại thẻ trước khi mở cổng!' });
      return;
    }
    if (!isManualBarrierOpen) {
      Modal.confirm({
        title: 'Mở Barrier Thủ Công',
        icon: <WarningOutlined className="text-yellow-500" />,
        content: 'Bạn đang yêu cầu mở Barrier thủ công. Hành động này sẽ được lưu vào nhật ký.',
        okText: 'Xác nhận Mở',
        cancelText: 'Hủy bỏ',
        okButtonProps: { type: 'primary', className: 'bg-blue-600' },
        onOk() {
          if (currentVehicle) {
            setManualBarrierStates(prev => ({ ...prev, [currentVehicle.id]: true }));
            
            const isEntry = currentVehicle.gate?.toLowerCase().includes('vào');
            const isVip = currentVehicle.type === 'VIP';
            
            if (isEntry) {
              apiClient.post('/sessions/approve-entry', { plate: currentVehicle.plate }).catch(e => console.log(e));
              processEntryVehicle(currentVehicle.plate); // Keep it in the lot
            } else {
              addTransaction({
                id: 'TX' + Date.now().toString().slice(-6),
                plate: currentVehicle.plate,
                type: isVip ? 'VIP' : 'Vãng lai',
                amount: 0,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                method: 'Miễn phí (Mở thủ công)',
                staff: 'Phạm Hải Đăng'
              });
              removeActiveVehicle(currentVehicle.plate); // Check it out completely
            }
          }
          addActivityLog({
            plate: currentVehicle ? currentVehicle.plate : 'N/A',
            model: currentVehicle ? currentVehicle.model : 'Thủ công',
            type: 'MỞ BARRIER',
            gate: currentVehicle ? currentVehicle.gate : 'Cổng Khẩn Cấp',
            action: 'Mở Thủ công',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: 'THÀNH CÔNG',
            typeColor: 'text-orange-600',
            statusColor: 'bg-emerald-100 text-emerald-700',
            actionColor: 'text-emerald-600',
            image: currentVehicle ? currentVehicle.image : null
          });
          notification.success({ message: 'Thành công', description: 'Lệnh mở Barrier đã được gửi đến thiết bị.', placement: 'topRight' });
        }
      });
    } else {
      Modal.confirm({
        title: 'Đóng Barrier Thủ Công',
        icon: <WarningOutlined className="text-yellow-500" />,
        content: 'Bạn đang yêu cầu đóng Barrier. Hành động này sẽ được lưu vào nhật ký.',
        okText: 'Xác nhận Đóng',
        cancelText: 'Hủy bỏ',
        okButtonProps: { type: 'primary', danger: true, className: 'bg-red-600' },
        onOk() {
          if (currentVehicle) setManualBarrierStates(prev => ({ ...prev, [currentVehicle.id]: false }));
          addActivityLog({
            plate: currentVehicle ? currentVehicle.plate : 'N/A',
            model: currentVehicle ? currentVehicle.model : 'Thủ công',
            type: 'ĐÓNG BARRIER',
            gate: currentVehicle ? currentVehicle.gate : 'Cổng Khẩn Cấp',
            action: 'Đóng Thủ công',
            time: 'Vừa xong',
            status: 'THÀNH CÔNG',
            typeColor: 'text-orange-600',
            statusColor: 'bg-emerald-100 text-emerald-700',
            actionColor: 'text-emerald-600',
            image: currentVehicle ? currentVehicle.image : null
          });
          notification.success({ message: 'Thành công', description: 'Lệnh đóng Barrier đã được gửi đến thiết bị.', placement: 'topRight' });
        }
      });
    }
  };

  const handleCashCollection = () => {
    if (!currentVehicle) {
      notification.warning({ message: 'Vui lòng chọn xe', description: 'Bạn cần chọn một xe trên màn hình Camera trước khi thao tác.' });
      return;
    }
    const isEntryGate = currentVehicle.gate?.toLowerCase().includes('vào');
    const isCardError = currentVehicle.status === 'Lỗi thẻ';
    
    if (isEntryGate) {
      if (isCardError) {
        notification.info({ message: 'Chuyển hướng', description: 'Đang mở màn hình nhập xe thủ công...' });
        navigate('/staff-gate-control', { state: { manualPlate: currentVehicle.plate } });
        return;
      }

      addActivityLog({
        plate: currentVehicle.plate,
        model: currentVehicle.model,
        type: 'VÀO BÃI',
        gate: currentVehicle.gate,
        action: 'Đã cấp vé',
        time: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit', second: '2-digit'}),
        status: 'THÀNH CÔNG',
        typeColor: 'text-blue-600',
        statusColor: 'bg-emerald-100 text-emerald-700',
        actionColor: 'text-emerald-600',
        image: currentVehicle.image
      });
      
      apiClient.post('/sessions/approve-entry', { plate: currentVehicle.plate }).then(() => {
        notification.success({ message: 'Xác nhận vào bãi', description: `Cho phép xe ${currentVehicle.plate} vào bãi thành công.` });
        if (fetchAllDataFromBackend) fetchAllDataFromBackend(); // Fetch updated state from backend
      }).catch(err => {
        notification.error({ message: 'Lỗi', description: 'Có lỗi xảy ra khi xác nhận vào bãi.' });
      });
    } else {
      notification.info({ message: 'Hệ thống', description: 'Đang mở giao diện xử lý...', placement: 'topRight' });
      if (currentVehicle.status === 'Lỗi thẻ' && currentVehicle.type !== 'VIP' && currentVehicle.type !== 'Vé tháng') {
        navigate('/staff-lost-card', { state: { lpr: currentVehicle.plate } });
      } else {
        navigate('/staff-payment', { state: { lpr: currentVehicle.plate } });
      }
    }
  };

  const handleReportViolation = () => {
    setViolationPlate(currentVehicle?.plate || '');
    setIsViolationModalVisible(true);
  };

  const handleReportLostCard = () => {
    Modal.confirm({
      title: 'Báo Mất Thẻ',
      icon: <WarningOutlined className="text-yellow-500" />,
      content: 'Bạn có chắc chắn muốn khóa thẻ bị mất và tiến hành quy trình phạt mất thẻ không?',
      okText: 'Khóa Thẻ',
      cancelText: 'Hủy',
      okButtonProps: { danger: true, type: 'primary', className: 'bg-white text-red-500 border-red-500 hover:bg-red-50' },
      onOk() {
        notification.error({ message: 'Thẻ đã bị khóa', description: 'Hệ thống đã khóa thẻ hiện tại và ghi nhận báo mất.', placement: 'topRight' });
        navigate('/staff-lost-card');
      }
    });
  };

  return (
    <div className="p-6 w-full">
      
      {/* Alert Banner */}
      {securityAlerts && securityAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center mb-6">
          <div className="flex items-start gap-3">
            <InfoCircleOutlined className="text-red-500 mt-1" />
            <div>
              <h4 className="text-red-600 font-bold text-xs tracking-wider uppercase mb-1">Cảnh báo An ninh</h4>
              <p className="text-slate-700 text-sm m-0">Hệ thống đang có {securityAlerts.length} cảnh báo cần xử lý. Vui lòng kiểm tra màn hình Giám sát.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const msg = message.loading('Đang gửi báo cáo khẩn cấp...', 0);
              setTimeout(() => {
                msg();
                notification.success({ message: 'Báo cáo thành công', description: 'Toàn bộ thông tin cảnh báo đã được gửi đến thiết bị của Quản lý.', placement: 'topRight' });
              }, 1500);
            }}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors"
          >
            <SoundOutlined />
            Báo cáo Quản lý
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Làn hoạt động */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Số làn hoạt động</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-800">
                {(() => {
                  if (isEmergency) return 0;
                  const gatesInMaintenance = gates ? gates.filter(g => g.mode === 'Bảo trì').length : 0;
                  return Math.max(0, totalGates - gatesInMaintenance);
                })()}
              </span>
              <span className="text-xl text-slate-400 font-medium">/ {totalGates}</span>
            </div>
            <div className="flex gap-1">
              {(() => {
                const gatesInMaintenance = gates ? gates.filter(g => g.mode === 'Bảo trì').length : 0;
                const activeLanesCount = isEmergency ? 0 : Math.max(0, totalGates - gatesInMaintenance);
                const inactiveLanesCount = totalGates - activeLanesCount;
                return (
                  <>
                    {[...Array(activeLanesCount)].map((_, i) => <div key={`active-${i}`} className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>)}
                    {[...Array(inactiveLanesCount)].map((_, i) => <div key={`inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-red-500"></div>)}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Xe trong bãi */}
        <div onClick={() => setIsLotModalVisible(true)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition-all">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Số xe trong bãi</h4>
          <div className="text-4xl font-extrabold text-slate-800 mb-2">{vehiclesInLotCount.toString().padStart(2, "0")}</div>
          <div className="text-xs text-orange-500 font-medium flex items-center gap-1">
            <WarningOutlined />
            {pendingProcessingCount} xe đang ở cổng
          </div>
        </div>

        {/* Chờ thanh toán */}
        <div 
          onClick={() => setIsPaymentModalVisible(true)}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Chờ thanh toán</h4>
            <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded font-bold">THỦ CÔNG</span>
          </div>
          <div className="text-4xl font-extrabold text-slate-800 mb-2">{waitingPaymentCount.toString().padStart(2, "0")}</div>
          <div className="text-xs text-slate-500">Cần hỗ trợ tại Cổng ra 2</div>
        </div>

        {/* Cảnh báo mở */}
        <div 
          onClick={() => setIsAlertModalVisible(true)}
          className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-red-400 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cảnh báo mở</h4>
            <span className="text-red-500 text-3xl font-bold leading-none mt-[-5px]">*</span>
          </div>
          <div className="text-4xl font-extrabold text-red-600 mb-2">{alertsCount.toString().padStart(2, "0")}</div>
          <div className="text-xs text-red-500 font-medium">Cần xử lý ngay lập tức</div>
        </div>
      </div>

      {/* Main Grid: Live AI Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Live Feed */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <EyeIcon />
              Giám sát AI Trực tiếp
            </h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              Live feed
            </span>
          </div>
          
          <div className={`grid ${totalGates > 4 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {(() => {


              return Array.from({ length: totalGates }).map((_, i) => {
              const isEntry = i < Math.ceil(totalGates / 2);
              const gateNum = isEntry ? i + 1 : i - Math.ceil(totalGates / 2) + 1;
              const typeLabel = isEntry ? 'VÀO' : 'RA';
              
              const cam = {
                id: `CAM-${isEntry ? 'IN' : 'OUT'}-${gateNum.toString().padStart(2, '0')}`,
                name: `CỔNG ${typeLabel} ${gateNum}`,
                defaultImage: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80'
              };
              
              // Chỉ hiển thị xe trên màn hình Camera nếu xe ĐANG TRONG QUÁ TRÌNH XỬ LÝ tại đúng cổng đó.
              // Nếu trạng thái là 'Hợp lệ', nghĩa là xe đã đi qua cổng và đang đỗ trong bãi -> Không hiển thị trên Camera nữa.
              const vehicle = activeVehicles?.find(v => 
                v.gate && 
                v.gate.toUpperCase() === cam.name.toUpperCase()
              );
              const isSelected = vehicle && currentVehicle?.id === vehicle.id;
              
              // Helper to map status to color
              const getStatusBadge = (type, status) => {
                if (type === 'VIP') return <span className="bg-slate-800 border border-slate-600 text-white text-[10px] font-bold px-2 py-1 rounded">VIP</span>;
                if (status === 'Lỗi thẻ' || status === 'Chờ thanh toán') return <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">{status}</span>;
                return <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">HỢP LỆ</span>;
              };

              const getFloorDisplayName = (v) => {
                if (v.floorName) return v.floorName;
                const code = v.assignedZoneCode || v.assignedZoneId || '';
                const c = code.toUpperCase();
                if (c === "F1") return "Tầng 1";
                if (c === "F2") return "Tầng 2";
                if (c === "B1") return "Tầng B1";
                if (c === "G") return "Tầng G";
                return code || "F1";
              };

              return (
                <div 
                  key={cam.id}
                  onClick={() => vehicle && setCurrentVehicle(vehicle)}
                  className={`relative rounded-lg overflow-hidden border-2 aspect-[16/9] bg-slate-900 group ${vehicle ? 'cursor-pointer' : ''} transition-all ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-[1.02] z-10' : 'border-slate-200 hover:border-slate-400 opacity-90 hover:opacity-100'}`}
                >
                  <img 
                    src={vehicle ? vehicle.image : cam.defaultImage} 
                    onError={(e) => { e.target.onerror = null; e.target.src = cam.defaultImage; }}
                    alt={cam.name} 
                    className={`w-full h-full object-cover ${vehicle ? 'opacity-80' : 'opacity-40 grayscale'}`} 
                  />
                  
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                    {cam.id}: {cam.name}
                  </div>
                  
                  {/* Bounding Box Mock based on index to simulate variety */}
                  {vehicle && i === 0 && (
                    <div className="absolute top-[40%] left-[30%] w-[40%] h-[20%] border-2 border-emerald-400 transition-all duration-300">
                      <div className="absolute -top-6 left-0 bg-emerald-400 text-black text-[10px] font-bold px-1 py-0.5">NHẬN DIỆN BIỂN SỐ</div>
                    </div>
                  )}

                  {/* Selected Overlay */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      ĐANG CHỌN
                    </div>
                  )}

                  {/* Mini LED Board Widget */}
                  {vehicle && (
                    <div className={`absolute ${isSelected ? 'top-10' : 'top-2'} right-2 w-[155px] bg-slate-950/90 border border-slate-800 rounded px-1.5 py-0.5 shadow-md flex items-center overflow-hidden z-10`}>
                      {vehicle.type === 'VIP' ? (
                        <marquee scrollamount="4" className="font-mono text-[9px] font-bold text-amber-500 tracking-wider w-full" style={{ textShadow: '0 0 4px rgba(245, 158, 11, 0.6)' }}>
                          WELCOME VIP {vehicle.plate} ➔ HƯỚNG ĐI: {getFloorDisplayName(vehicle).toUpperCase()}
                        </marquee>
                      ) : (
                        <marquee scrollamount="4" className="font-mono text-[9px] font-bold text-emerald-400 tracking-wider w-full" style={{ textShadow: '0 0 4px rgba(52, 211, 153, 0.6)' }}>
                          BIỂN SỐ: {vehicle.plate} ➔ HƯỚNG ĐI: {getFloorDisplayName(vehicle).toUpperCase()}
                        </marquee>
                      )}
                    </div>
                  )}

                  {vehicle ? (
                    <div className={`absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent transition-all ${isSelected ? 'from-blue-900/90' : ''}`}>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className={`text-xl font-bold tracking-widest drop-shadow-md ${isSelected ? 'text-blue-100' : 'text-white'} flex items-center gap-1.5`}>
                            {vehicle.plate}
                            {vehicle.type === 'VIP' && (
                              <span className="text-amber-400 bg-amber-500/20 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className={`${vehicle.status === 'Hợp lệ' ? 'text-emerald-400' : 'text-red-400'} text-[10px] font-bold uppercase tracking-wider`}>
                            {vehicle.type === 'VIP' ? 'Khách VIP' : 'Khách Vãng Lai'} • {vehicle.type === 'Vé tháng' && vehicle.status === 'Lỗi thẻ' ? 'Khớp đặt chỗ: LỖI' : `Độ tin cậy: ${vehicle.confidence}`}
                          </div>
                        </div>
                        {getStatusBadge(vehicle.type, vehicle.status)}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-slate-400 font-medium tracking-wider">KHÔNG CÓ XE</div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Thao tác Nhanh</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button onClick={handleOpenManualBarrier} className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-3 h-32">
              <ExportOutlined className={`${isManualBarrierOpen ? "text-red-500 rotate-180" : "text-blue-600"} text-2xl transition-transform`} />
              <span className="text-sm font-bold text-slate-700 text-center whitespace-pre-line">
                {isManualBarrierOpen ? "Đóng Barrier\nThủ công" : "Mở Barrier\nThủ công"}
              </span>
            </button>
            
            <button onClick={handleCashCollection} className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-3 h-32">
              {currentVehicle?.gate?.toLowerCase().includes('vào') ? (
                currentVehicle.status === 'Lỗi thẻ' ? (
                  <>
                    <QrcodeOutlined className="text-blue-500 text-2xl" />
                    <span className="text-sm font-bold text-slate-700 text-center">Nhập thẻ<br/>Thủ công</span>
                  </>
                ) : (
                  <>
                    <CheckCircleFilled className="text-emerald-500 text-2xl" />
                    <span className="text-sm font-bold text-slate-700 text-center">Xác nhận<br/>Vào Bãi</span>
                  </>
                )
              ) : (
                <>
                  <WalletOutlined className="text-slate-600 text-2xl" />
                  <span className="text-sm font-bold text-slate-700 text-center">Thu Tiền Mặt<br/>& Thanh toán</span>
                </>
              )}
            </button>
            
            <button onClick={handleReportViolation} className="bg-white border border-slate-200 hover:border-red-500 hover:shadow-md transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-3 h-32">
              <WarningOutlined className="text-red-500 text-2xl" />
              <span className="text-sm font-bold text-slate-700 text-center">Đánh dấu<br/>Vi phạm</span>
            </button>
            
            <button onClick={handleReportLostCard} className="bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-3 h-32">
              <CreditCardOutlined className="text-slate-600 text-2xl" />
              <span className="text-sm font-bold text-slate-700 text-center">Báo Mất Thẻ</span>
            </button>
          </div>

          <div className="bg-[#051424] text-white p-5 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm mb-1">Trạng thái Hệ thống</h4>
              <p className="text-slate-400 text-xs m-0">Kết nối ổn định. Camera và Barrier hoạt động tốt.</p>
            </div>
            <CheckCircleFilled className="text-emerald-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Bottom Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Nhật ký Cổng Trực tiếp</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => notification.info({ message: 'Bộ lọc', description: 'Tính năng bộ lọc nâng cao đang được cập nhật.', placement: 'topRight' })}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"
            >
              <FilterOutlined />
            </button>
            <button 
              onClick={() => notification.success({ message: 'Tải xuống thành công', description: 'File nhat_ky_truc_tiep.xlsx đã được lưu.', placement: 'topRight' })}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"
            >
              <DownloadOutlined />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="p-4 border-b border-slate-100">Phương tiện</th>
                <th className="p-4 border-b border-slate-100">Loại</th>
                <th className="p-4 border-b border-slate-100">Làn</th>
                <th className="p-4 border-b border-slate-100">Hành động</th>
                <th className="p-4 border-b border-slate-100">Thời gian</th>
                <th className="p-4 border-b border-slate-100">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <Spin size="large" tip="Đang tải dữ liệu thực từ máy chủ..." />
                  </td>
                </tr>
              ) : displayLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : currentLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {log.image ? (
                        <div className="w-12 h-8 rounded overflow-hidden bg-slate-900 border border-slate-200 shadow-sm flex-shrink-0">
                          <img src={log.image} alt={log.plate} className="w-full h-full object-cover" />
                        </div>
                      ) : log.plate === 'N/A' ? (
                        <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <WarningOutlined className="text-yellow-500" />
                        </div>
                      ) : (
                        <div className={`font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 text-sm flex-shrink-0`}>
                          {log.plate.split('-')[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{log.plate}</div>
                        <div className="text-xs text-slate-500">{log.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 uppercase tracking-wider" style={{ color: log.typeColor }}>
                      {log.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700">{log.gate}</td>
                  <td className={`p-4 text-sm font-medium flex items-center gap-1.5 ${log.actionColor}`}>
                    {log.action === "Chặn Tự động" ? <WarningOutlined className="text-xs" /> : <ExportOutlined className={log.action === "Vào bãi" ? "rotate-90 text-xs" : "-rotate-90 text-xs"} />}
                    {log.action}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">{log.time}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${log.statusColor}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {displayLogs.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              Hiển thị {(currentLogPage - 1) * LOGS_PER_PAGE + 1} - {Math.min(currentLogPage * LOGS_PER_PAGE, displayLogs.length)} trong tổng số {displayLogs.length} bản ghi
            </span>
            <Pagination 
              current={currentLogPage} 
              pageSize={LOGS_PER_PAGE} 
              total={displayLogs.length} 
              onChange={(page) => setCurrentLogPage(page)}
              size="small"
              showSizeChanger={false}
            />
          </div>
        )}
        
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-center">
          <button onClick={() => navigate('/staff-transactions')} className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer">Xem tất cả hoạt động</button>
        </div>
      </div>

      {/* Violation Custom Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <WarningOutlined className="text-xl" />
            <span>Đánh dấu Vi phạm & Gửi An ninh</span>
          </div>
        }
        open={isViolationModalVisible}
        onCancel={() => setIsViolationModalVisible(false)}
        footer={[
          <button key="cancel" onClick={() => setIsViolationModalVisible(false)} className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 mr-2 text-slate-700 cursor-pointer">Hủy bỏ</button>,
          <button 
            key="submit" 
            onClick={() => {
              if(!violationPlate) {
                notification.error({ message: 'Lỗi', description: 'Vui lòng nhập biển số xe vi phạm', placement: 'topRight' });
                return;
              }
              notification.success({ 
                message: 'Đã gửi bộ phận An ninh', 
                description: `Hệ thống đã đưa xe ${violationPlate} vào Blacklist và đẩy cảnh báo trực tiếp sang màn hình của đội An ninh.`, 
                placement: 'topRight' 
              });
              setIsViolationModalVisible(false);
              const submittedPlate = violationPlate;
              const submittedReason = violationReason;
              setViolationPlate('');
              
              const matchedVehicle = activeVehicles?.find(v => v.plate === submittedPlate);
              
              addSecurityAlert({
                id: `blacklist-${Date.now()}`,
                type: 'BIỂN SỐ ĐEN',
                plate: submittedPlate,
                reason: submittedReason,
                time: 'Vừa xong',
                image: matchedVehicle?.image
              });
              
              navigate('/staff-security');
            }} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow-md font-bold cursor-pointer"
          >
            Đưa vào Blacklist & Gửi
          </button>
        ]}
      >
        <p className="mb-4 text-slate-600 text-sm">Điền thông tin xe vi phạm để hệ thống đưa vào danh sách đen và tự động đẩy cảnh báo sang màn hình của bộ phận An ninh.</p>
        
        <div className="mb-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Biển số xe vi phạm <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={violationPlate}
            onChange={(e) => setViolationPlate(e.target.value)}
            placeholder="VD: 51A-123.45"
            className="w-full border border-red-500 rounded px-3 py-2 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 uppercase"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Lý do vi phạm</label>
          <select 
            value={violationReason}
            onChange={(e) => setViolationReason(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="Đỗ sai quy định">Đỗ sai quy định / Lấn vạch</option>
            <option value="Trốn vé">Trốn vé / Vượt rào</option>
            <option value="Gây rối trật tự">Gây rối trật tự an ninh</option>
            <option value="Tai nạn">Gây tai nạn / Hư hỏng tài sản</option>
          </select>
        </div>
        
        <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-start gap-2">
          <InfoCircleOutlined className="text-blue-500 mt-0.5" />
          <span className="text-xs text-slate-600">Hình ảnh bằng chứng sẽ tự động được trích xuất từ Camera gần nhất (Cổng vào 1 / Lối đi khu A).</span>
        </div>
      
      </Modal>

      {/* Gate Config Modal */}
      <Modal
        title="Cấu hình hệ thống"
        open={isGateConfigModalVisible}
        onOk={() => {
          setTotalGates(newGateCount);
          setIsGateConfigModalVisible(false);
          notification.success({ message: 'Thành công', description: 'Đã cập nhật số lượng làn hoạt động.' });
        }}
        onCancel={() => setIsGateConfigModalVisible(false)}
        okText="Lưu cấu hình"
        cancelText="Hủy"
      >
        <div className="py-4">
          <label className="block text-slate-700 font-medium mb-2">Tổng số Làn/Cổng giám sát:</label>
          <input 
            type="number" 
            min="1" max="20"
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            value={newGateCount}
            onChange={(e) => setNewGateCount(parseInt(e.target.value) || 1)}
          />
        </div>
      </Modal>

      {/* Security Alerts Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <WarningOutlined />
            <span>Xử lý Cảnh báo An ninh</span>
          </div>
        }
        open={isAlertModalVisible}
        footer={null}
        onCancel={() => setIsAlertModalVisible(false)}
        width={700}
      >
        <div className="py-4">
          {securityAlerts && securityAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircleFilled className="text-4xl text-emerald-500 mb-3 block mx-auto" />
              Không có cảnh báo an ninh nào cần xử lý.
            </div>
          ) : (
            <div className="space-y-4">
              {securityAlerts && securityAlerts.map(alert => (
                <div key={alert.id} className="border border-red-200 rounded-lg p-4 bg-red-50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag color="error">{alert.type}</Tag>
                      <span className="font-bold text-slate-800">{alert.plate}</span>
                    </div>
                    <p className="text-slate-600 text-sm m-0">{alert.reason}</p>
                    <p className="text-slate-400 text-xs m-0 mt-1">{alert.time}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAlertModalVisible(false);
                      navigate('/staff-security');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                  >
                    Chuyển sang trang xử lý
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Vehicles in Lot Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <CarOutlined />
            <span>Danh sách Xe trong bãi ({vehiclesInLotCount})</span>
          </div>
        }
        open={isLotModalVisible}
        footer={null}
        onCancel={() => setIsLotModalVisible(false)}
        width={700}
      >
        <div className="py-4">
          <div className="mb-4">
            <Input.Search placeholder="Tìm biển số xe..." allowClear />
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-3 border-b border-slate-200">Biển số</th>
                  <th className="p-3 border-b border-slate-200">Loại vé</th>
                  <th className="p-3 border-b border-slate-200">Tầng đỗ</th>
                  <th className="p-3 border-b border-slate-200">Giờ vào</th>
                  <th className="p-3 border-b border-slate-200 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeVehicles && activeVehicles.filter(v => !v.gate).length > 0 ? (
                  activeVehicles.filter(v => !v.gate).map(v => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-700">{v.plate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${v.type === 'VIP' ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="p-3">
                        {v.assignedZoneCode ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            v.assignedZoneCode.toUpperCase() === 'F1' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            v.assignedZoneCode.toUpperCase() === 'F2' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            v.assignedZoneCode.toUpperCase() === 'B1' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            v.assignedZoneCode.toUpperCase() === 'G' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-slate-50 text-slate-700'
                          }`}>
                            {v.floorName || v.assignedZoneCode} ({v.assignedZoneCode.toUpperCase()})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Chưa gán</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 text-sm">{v.inTime}</td>
                      <td className="p-3 text-right">
                        <Button size="small" type="primary" ghost onClick={() => {
                          setIsLotModalVisible(false);
                          navigate('/staff-payment', { state: { lpr: v.plate } });
                        }}>
                          Thanh toán
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500">Bãi đang trống</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Vehicles Waiting for Payment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <CarOutlined />
            <span>Danh sách chờ thanh toán ({waitingPaymentCount})</span>
          </div>
        }
        open={isPaymentModalVisible}
        footer={null}
        onCancel={() => setIsPaymentModalVisible(false)}
        width={700}
      >
        <div className="py-4">
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-3 border-b border-slate-200">Biển số</th>
                  <th className="p-3 border-b border-slate-200">Vị trí</th>
                  <th className="p-3 border-b border-slate-200">Trạng thái</th>
                  <th className="p-3 border-b border-slate-200 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeVehicles && activeVehicles.filter(v => v.gate && (v.status === 'Chờ thanh toán' || v.status === 'Lỗi thẻ')).length > 0 ? (
                  activeVehicles.filter(v => v.gate && (v.status === 'Chờ thanh toán' || v.status === 'Lỗi thẻ'))
                  .sort((a, b) => a.gate.localeCompare(b.gate))
                  .map(v => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-700">{v.plate}</td>
                      <td className="p-3 text-slate-600 text-sm">{v.gate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${v.status === 'Lỗi thẻ' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button size="small" type="primary" ghost onClick={() => {
                          setIsPaymentModalVisible(false);
                          if (v.status === 'Lỗi thẻ') {
                            navigate('/staff-lost-card', { state: { lpr: v.plate } });
                          } else {
                            navigate('/staff-payment', { state: { lpr: v.plate } });
                          }
                        }}>
                          Xử lý ngay
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500">Không có xe nào đang chờ thanh toán</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

    </div>
  );
};

const EyeIcon = () => (
  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
