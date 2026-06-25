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
  CreditCardOutlined
} from '@ant-design/icons';
import { Tag, Modal, notification, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { logService } from '../../services/logService';
import { useGlobalContext } from '../../context/GlobalContext';

export const StaffDashboard = () => {
  const navigate = useNavigate();
  const [manualBarrierStates, setManualBarrierStates] = useState({});
  
  // States for Violation Modal
  const [isViolationModalVisible, setIsViolationModalVisible] = useState(false);
  const [violationPlate, setViolationPlate] = useState('');
  const [violationReason, setViolationReason] = useState('Đỗ sai quy định');

  const { activityLogs, addActivityLog, addSecurityAlert, securityAlerts, currentVehicle, setCurrentVehicle, activeVehicles, totalGates, setTotalGates, removeSecurityAlert, isEmergency } = useGlobalContext();

  const isManualBarrierOpen = currentVehicle ? manualBarrierStates[currentVehicle.id] || false : false;

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isGateConfigModalVisible, setIsGateConfigModalVisible] = useState(false);
  const [newGateCount, setNewGateCount] = useState(totalGates);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);

  // Auto-select first active vehicle on load
  useEffect(() => {
    if (activeVehicles && activeVehicles.length > 0 && !currentVehicle) {
      setCurrentVehicle(activeVehicles[0]);
    }
  }, [activeVehicles, currentVehicle, setCurrentVehicle]);

  // Combine local global context logs (for live interactions) with backend logs
  const displayLogs = [...activityLogs, ...logs];

  const vehiclesInLotCount = activeVehicles ? activeVehicles.length : 0;
  const pendingProcessingCount = activeVehicles ? activeVehicles.filter(v => v.status !== 'Hợp lệ').length : 0;
  const waitingPaymentCount = activeVehicles ? activeVehicles.filter(v => v.status === 'Chờ thanh toán' || v.status === 'Lỗi thẻ').length : 0;
  const alertsCount = securityAlerts ? securityAlerts.length : 0;


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingLogs(true);
        const data = await logService.getParkingSessions();
        if (data && Array.isArray(data)) {
          const mappedLogs = data.map((session, index) => {
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
    if (!isManualBarrierOpen) {
      Modal.confirm({
        title: 'Mở Barrier Thủ Công',
        icon: <WarningOutlined className="text-yellow-500" />,
        content: 'Bạn đang yêu cầu mở Barrier thủ công. Hành động này sẽ được lưu vào nhật ký.',
        okText: 'Xác nhận Mở',
        cancelText: 'Hủy bỏ',
        okButtonProps: { type: 'primary', className: 'bg-blue-600' },
        onOk() {
          if (currentVehicle) setManualBarrierStates(prev => ({ ...prev, [currentVehicle.id]: true }));
          addActivityLog({
            plate: currentVehicle ? currentVehicle.plate : 'N/A',
            model: currentVehicle ? currentVehicle.model : 'Thủ công',
            type: 'MỞ BARRIER',
            gate: currentVehicle ? currentVehicle.gate : 'Cổng Khẩn Cấp',
            action: 'Mở Thủ công',
            time: 'Vừa xong',
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
    notification.info({ message: 'Hệ thống', description: 'Đang mở giao diện máy POS thu phí...', placement: 'topRight' });
    navigate('/staff-payment');
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
              <span className="text-4xl font-extrabold text-slate-800">{isEmergency ? 0 : totalGates}</span>
              <span className="text-xl text-slate-400 font-medium">/ {totalGates}</span>
            </div>
            <div className="flex gap-1">
              {isEmergency ? (
                [...Array(totalGates)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-red-500"></div>)
              ) : (
                [...Array(totalGates)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-emerald-500"></div>)
              )}
            </div>
          </div>
        </div>

        {/* Xe chờ xử lý */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Xe chờ xử lý</h4>
          <div className="text-4xl font-extrabold text-slate-800 mb-2">{pendingProcessingCount}</div>
          <div className="text-xs text-emerald-500 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            +3 xe/phút
          </div>
        </div>

        {/* Chờ thanh toán */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
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
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'CAM-01', name: 'CỔNG VÀO 1', defaultImage: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80' },
              { id: 'CAM-02', name: 'CỔNG VÀO 2', defaultImage: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80' },
              { id: 'CAM-03', name: 'CỔNG RA 1', defaultImage: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80' },
              { id: 'CAM-04', name: 'CỔNG RA 2', defaultImage: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80' }
            ].map((cam, index) => {
              const vehicle = activeVehicles[index];
              const isSelected = vehicle && currentVehicle?.id === vehicle.id;
              
              // Helper to map status to color
              const getStatusBadge = (type, status) => {
                if (type === 'VIP') return <span className="bg-slate-800 border border-slate-600 text-white text-[10px] font-bold px-2 py-1 rounded">VIP</span>;
                if (status === 'Lỗi thẻ' || status === 'Chờ thanh toán') return <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">{status}</span>;
                return <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">HỢP LỆ</span>;
              };

              return (
                <div 
                  key={cam.id}
                  onClick={() => vehicle && setCurrentVehicle(vehicle)}
                  className={`relative rounded-lg overflow-hidden border-2 aspect-[16/9] bg-slate-900 group ${vehicle ? 'cursor-pointer' : ''} transition-all ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-[1.02] z-10' : 'border-slate-200 hover:border-slate-400 opacity-90 hover:opacity-100'}`}
                >
                  <img 
                    src={vehicle?.image || cam.defaultImage} 
                    onError={(e) => { e.target.onerror = null; e.target.src = cam.defaultImage; }}
                    alt={cam.name} 
                    className={`w-full h-full object-cover ${vehicle ? 'opacity-80' : 'opacity-40 grayscale'}`} 
                  />
                  
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                    {cam.id}: {cam.name}
                  </div>
                  
                  {/* Bounding Box Mock based on index to simulate variety */}
                  {vehicle && index === 0 && (
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

                  {vehicle ? (
                    <div className={`absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent transition-all ${isSelected ? 'from-blue-900/90' : ''}`}>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className={`text-xl font-bold tracking-widest drop-shadow-md ${isSelected ? 'text-blue-100' : 'text-white'}`}>{vehicle.plate}</div>
                          <div className={`${vehicle.status === 'Hợp lệ' ? 'text-emerald-400' : 'text-red-400'} text-[10px] font-bold uppercase tracking-wider`}>
                            {vehicle.type === 'Vé tháng' && vehicle.status === 'Lỗi thẻ' ? 'Khớp đặt chỗ: LỖI' : `Độ tin cậy: ${vehicle.confidence}`}
                          </div>
                        </div>
                        {getStatusBadge(vehicle.type, vehicle.status)}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex justify-between items-end">
                        <div className="text-slate-400 font-medium tracking-wider text-sm">KHÔNG CÓ XE</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
              <WalletOutlined className="text-slate-600 text-2xl" />
              <span className="text-sm font-bold text-slate-700 text-center">Thu Tiền Mặt</span>
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
              ) : displayLogs.map((log, i) => (
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
              
              addSecurityAlert({
                id: `blacklist-${Date.now()}`,
                type: 'BIỂN SỐ ĐEN',
                plate: submittedPlate,
                reason: submittedReason,
                time: 'Vừa xong'
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
                      removeSecurityAlert(alert.id);
                      notification.success({ message: 'Đã xử lý', description: `Đã xác nhận và gỡ cảnh báo cho xe ${alert.plate}` });
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Xử lý
                  </button>
                </div>
              ))}
            </div>
          )}
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
