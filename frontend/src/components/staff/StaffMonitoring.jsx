import React, { useState, useEffect } from 'react';
import { 
  WarningOutlined, 
  CheckCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  ExpandAltOutlined
} from '@ant-design/icons';
import { notification, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';

export const StaffMonitoring = () => {
  const navigate = useNavigate();
  const { activeVehicles, securityAlerts, totalGates } = useGlobalContext();
  
  const totalCapacity = 500;
  const vehiclesInLot = activeVehicles ? activeVehicles.length : 0;
  const availableSpots = Math.max(0, totalCapacity - vehiclesInLot);
  const occupancyRate = ((vehiclesInLot / totalCapacity) * 100).toFixed(1);
  const alertsCount = securityAlerts ? securityAlerts.length : 0;
  
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Cao', time: '08:44:05', title: 'Phát hiện xe không biển số', desc: 'Cổng ra 1 • Yêu cầu kiểm tra thủ công', actionable: true },
    { id: 2, type: 'Trung bình', time: '08:30:12', title: 'Cảnh báo đỗ sai vị trí', desc: 'Tầng hầm B1, Khu C • Đỗ lấn vạch', actionable: true },
    { id: 3, type: 'Thấp', time: '08:15:00', title: 'Khởi động lại Camera Cổng 2', desc: 'Hệ thống • Đã hoàn thành (15s)', actionable: false },
    { id: 4, type: 'Thấp', time: '07:55:22', title: 'Thay đổi ca trực', desc: 'Quản trị viên • Nhận ca sáng', actionable: false }
  ]);

  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    const entryCount = Math.ceil(totalGates / 2);
    const exitCount = totalGates - entryCount;
    const dynamicCams = [];
    
    const timeNow = new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit', second:'2-digit'});

    for (let i = 1; i <= entryCount; i++) {
      const gateName = `CỔNG VÀO ${i}`;
      const processingVehicle = activeVehicles?.find(v => v.gate && v.gate.toUpperCase() === gateName);
      dynamicCams.push({
        id: `IN-${i}`,
        name: gateName,
        location: `LPR Camera - ${gateName}`,
        status: processingVehicle && (processingVehicle.status === 'Cảnh báo' || processingVehicle.status === 'Lỗi thẻ') ? 'WARNING' : 'NORMAL',
        statusText: processingVehicle ? `Nhận diện: ${processingVehicle.plate}` : 'Đang hoạt động - Trống',
        time: timeNow,
        image: processingVehicle ? (processingVehicle.image || 'https://images.unsplash.com/photo-1510443697925-eb43fb60341e?auto=format&fit=crop&w=600&q=80') : 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80',
        plate: processingVehicle ? processingVehicle.plate : ''
      });
    }
    
    for (let i = 1; i <= exitCount; i++) {
      const gateName = `CỔNG RA ${i}`;
      const processingVehicle = activeVehicles?.find(v => v.gate && v.gate.toUpperCase() === gateName);
      dynamicCams.push({
        id: `OUT-${i}`,
        name: gateName,
        location: `LPR Camera - ${gateName}`,
        status: processingVehicle && (processingVehicle.status === 'Cảnh báo' || processingVehicle.status === 'Lỗi thẻ') ? 'WARNING' : 'NORMAL',
        statusText: processingVehicle ? `Nhận diện: ${processingVehicle.plate}` : 'Đang hoạt động - Trống',
        time: timeNow,
        image: processingVehicle ? (processingVehicle.image || 'https://images.unsplash.com/photo-1510443697925-eb43fb60341e?auto=format&fit=crop&w=600&q=80') : 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80',
        plate: processingVehicle ? processingVehicle.plate : ''
      });
    }
    
    setCameras(dynamicCams);
  }, [activeVehicles, totalGates]);

  const handleFixCamera = (id) => {
    Modal.confirm({
      title: 'Khôi phục Camera',
      content: 'Hệ thống sẽ thử khởi động lại bộ đọc OCR và hiệu chỉnh tiêu cự camera.',
      okText: 'Chẩn đoán',
      cancelText: 'Hủy',
      onOk() {
        notification.success({
          message: 'Xử lý thành công',
          description: 'Đã thiết lập lại thuật toán nhận diện cho Camera.',
          placement: 'topRight'
        });
        setCameras(prev => prev.map(c => 
          c.id === id ? { ...c, status: 'NORMAL', statusText: 'Đã khôi phục nhận diện' } : c
        ));
      }
    });
  };

  const handleIgnore = (id) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bỏ qua cảnh báo này?',
      okText: 'Bỏ qua',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        setAlerts(prev => prev.filter(a => a.id !== id));
        notification.info({ message: 'Đã bỏ qua cảnh báo', placement: 'topRight' });
      }
    });
  };

  const handleProcess = (id) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Tiếp nhận yêu cầu điều phối An ninh?',
      okText: 'Tiếp nhận',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-emerald-600' },
      onOk() {
        setAlerts(prev => prev.filter(a => a.id !== id));
        notification.success({ message: 'Đang xử lý cảnh báo', description: 'Đã tiếp nhận yêu cầu và điều phối An ninh.', placement: 'topRight' });
      }
    });
  };

  const newAlertsCount = alerts.filter(a => a.type === 'Cao' || a.type === 'Trung bình').length;
  const [isSystemActive, setIsSystemActive] = useState(true);
  return (
    <div className="p-6 w-full">
      <div className="flex justify-end mb-6">
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSystemActive(!isSystemActive)}
            className={`border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              isSystemActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isSystemActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
            {isSystemActive ? 'Hệ thống đang hoạt động' : 'Hệ thống đang bảo trì'}
          </button>
          <button 
            onClick={() => notification.success({message: 'Đã tải lại hệ thống', description: 'Đã cập nhật luồng Camera và dữ liệu mới nhất.', placement: 'topRight'})}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Tải lại trang
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Tổng chỗ đỗ</h4>
            <span className="font-serif font-bold text-slate-400">P</span>
          </div>
          <div className="text-4xl font-extrabold text-slate-800">{totalCapacity}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Đang trống</h4>
            <CheckCircleOutlined className="text-slate-400" />
          </div>
          <div className="text-4xl font-extrabold text-emerald-600">{availableSpots}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Tỷ lệ lấp đầy</h4>
            <InfoCircleOutlined className="text-slate-400" />
          </div>
          <div className="text-4xl font-extrabold text-blue-600 mb-2">{occupancyRate}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
          </div>
        </div>
        <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-red-800 text-xs font-bold mb-2">Cảnh báo hiện tại</h4>
            <WarningOutlined className="text-red-500" />
          </div>
          <div className="text-4xl font-extrabold text-red-600">{newAlertsCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cameras Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.map(cam => (
              <div 
                key={cam.id} 
                className={`border-2 rounded-xl overflow-hidden shadow-sm flex flex-col h-[280px] transition-colors ${
                  cam.status === 'WARNING' ? 'bg-red-50 border-red-400' : 'bg-white border-slate-200'
                }`}
              >
                <div className="relative h-[160px] bg-black flex-shrink-0 group">
                  <img src={cam.image} alt={cam.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3 flex gap-0.5">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-l flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </span>
                    <span className="bg-white/90 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded-r">{cam.name}</span>
                  </div>
                  <div className="absolute top-3 right-3 text-white text-[10px] font-mono drop-shadow-md bg-black/40 px-1.5 py-0.5 rounded">{cam.time}</div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold text-sm leading-tight ${cam.status === 'WARNING' ? 'text-red-600' : 'text-slate-800'}`}>
                      {cam.location}
                    </h4>
                    {cam.status === 'NORMAL' && (
                      <ExpandAltOutlined className="text-slate-400 cursor-pointer hover:text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className={`text-[11px] font-bold flex items-center gap-1.5 leading-tight flex-1 mt-auto ${
                    cam.status === 'WARNING' ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {cam.status === 'WARNING' ? <WarningOutlined className="mt-0.5 flex-shrink-0" /> : <CheckCircleOutlined className="mt-0.5 flex-shrink-0" />}
                    <span>{cam.statusText}</span>
                  </div>

                  {cam.status === 'WARNING' && (
                    <button 
                      onClick={() => handleFixCamera(cam.id)}
                      className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold w-12 h-10 rounded shadow-sm transition-colors flex-shrink-0 flex items-center justify-center text-center leading-tight cursor-pointer"
                    >
                      Xử<br/>lý
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Alert Logs */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 m-0">Nhật ký Cảnh báo</h3>
              {newAlertsCount > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">{newAlertsCount} Mới</span>}
            </div>

            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
              
              {alerts.map(alert => {
                if (alert.type === 'Cao') {
                  return (
                    <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                          <WarningOutlined /> {alert.type}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">{alert.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{alert.desc}</p>
                      {alert.actionable && (
                        <div className="flex gap-2">
                          <button onClick={() => handleIgnore(alert.id)} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer">
                            Bỏ qua
                          </button>
                          <button onClick={() => handleProcess(alert.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white border border-red-600 py-1.5 rounded text-xs font-bold shadow-sm transition-colors cursor-pointer">
                            Xử lý ngay
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
                if (alert.type === 'Trung bình') {
                  return (
                    <div key={alert.id} className="bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
                          <InfoCircleOutlined /> {alert.type}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">{alert.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{alert.desc}</p>
                      {alert.actionable && (
                        <div className="flex gap-2">
                          <button onClick={() => handleIgnore(alert.id)} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer">
                            Bỏ qua
                          </button>
                          <button onClick={() => handleProcess(alert.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 py-1.5 rounded text-xs font-bold shadow-sm transition-colors cursor-pointer">
                            Xử lý
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={alert.id} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                        <SyncOutlined /> {alert.type}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">{alert.time}</span>
                    </div>
                    <h4 className="font-medium text-slate-700 text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-slate-400 m-0">{alert.desc}</p>
                  </div>
                );
              })}

            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
              <button 
                onClick={() => navigate('/staff-security')}
                className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Xem toàn bộ lịch sử
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
