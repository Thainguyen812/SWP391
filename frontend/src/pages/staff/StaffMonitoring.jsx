import React, { useState, useEffect } from 'react';
import { 
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExpandAltOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { notification, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';
import { apiClient } from '../../api/apiClient';

export const StaffMonitoring = () => {
  const navigate = useNavigate();
  const { activeVehicles, totalGates } = useGlobalContext();
  
  const [monitoringStats, setMonitoringStats] = useState({
    totalCapacity: 500,
    availableSpots: 498,
    occupancyRate: '0.4'
  });

  const [isSystemActive, setIsSystemActive] = useState(true);
  const [cameras, setCameras] = useState([]);

  // 1. Fetch Real Monitoring Stats from Backend API
  useEffect(() => {
    const fetchMonitoringStats = async () => {
      try {
        const data = await apiClient.get('/monitoring/status');
        if (data) {
          const capacity = data.totalCapacity > 0 ? data.totalCapacity : 500;
          const available = data.availableSpots !== undefined ? data.availableSpots : capacity;
          const parked = data.currentlyParked !== undefined ? data.currentlyParked : Math.max(0, capacity - available);
          const rate = capacity > 0 ? ((parked / capacity) * 100).toFixed(1) : '0.0';
          
          setMonitoringStats({
            totalCapacity: capacity,
            availableSpots: available,
            occupancyRate: rate
          });
        }
      } catch (err) {
        console.error("Failed to fetch real monitoring stats from backend", err);
      }
    };

    fetchMonitoringStats();
    const interval = setInterval(fetchMonitoringStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Camera Feeds & LPR Detection Status
  useEffect(() => {
    const entryCount = Math.ceil(totalGates / 2);
    const exitCount = totalGates - entryCount;
    const dynamicCams = [];
    
    const timeNow = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    for (let i = 1; i <= entryCount; i++) {
      const gateName = `CỔNG VÀO ${i}`;
      const processingVehicle = activeVehicles?.find(v => v.gate && v.gate.toUpperCase() === gateName);
      
      const isLowConfidence = (processingVehicle && (processingVehicle.confidence === '58%' || parseInt(processingVehicle.confidence || '99%', 10) < 70 || processingVehicle.status === 'Cảnh báo' || processingVehicle.status === 'Lỗi thẻ')) || (i === 1 && (!processingVehicle || processingVehicle.plate === '30H-12314'));
      const confidenceVal = isLowConfidence ? (processingVehicle?.confidence || '58%') : (processingVehicle?.confidence || '98%');
      const targetPlate = processingVehicle ? processingVehicle.plate : (i === 1 ? '30H-12314' : '');

      dynamicCams.push({
        id: `IN-${i}`,
        name: gateName,
        location: `LPR Camera - ${gateName}`,
        status: isLowConfidence ? 'WARNING' : 'NORMAL',
        statusText: isLowConfidence 
          ? `Cảnh báo độ tin cậy < 70% (${confidenceVal}): Nhận diện ${targetPlate}`
          : (processingVehicle ? `Nhận diện: ${processingVehicle.plate}` : 'Đang hoạt động - Trống'),
        time: timeNow,
        image: processingVehicle ? (processingVehicle.image || 'https://images.unsplash.com/photo-1510443697925-eb43fb60341e?auto=format&fit=crop&w=600&q=80') : (i === 1 ? 'https://images.unsplash.com/photo-1510443697925-eb43fb60341e?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80'),
        plate: targetPlate,
        confidence: confidenceVal
      });
    }
    
    for (let i = 1; i <= exitCount; i++) {
      const gateName = `CỔNG RA ${i}`;
      const processingVehicle = activeVehicles?.find(v => v.gate && v.gate.toUpperCase() === gateName);
      const isLowConfidence = processingVehicle && (processingVehicle.confidence === '58%' || parseInt(processingVehicle.confidence || '99%', 10) < 70 || processingVehicle.status === 'Cảnh báo' || processingVehicle.status === 'Lỗi thẻ');
      const confidenceVal = isLowConfidence ? (processingVehicle?.confidence || '58%') : (processingVehicle?.confidence || '98%');

      dynamicCams.push({
        id: `OUT-${i}`,
        name: gateName,
        location: `LPR Camera - ${gateName}`,
        status: isLowConfidence ? 'WARNING' : 'NORMAL',
        statusText: processingVehicle 
          ? (isLowConfidence ? `Cảnh báo độ tin cậy < 70% (${confidenceVal}): Nhận diện ${processingVehicle.plate}` : `Nhận diện: ${processingVehicle.plate}`)
          : 'Đang hoạt động - Trống',
        time: timeNow,
        image: processingVehicle ? (processingVehicle.image || 'https://images.unsplash.com/photo-1510443697925-eb43fb60341e?auto=format&fit=crop&w=600&q=80') : 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80',
        plate: processingVehicle ? processingVehicle.plate : '',
        confidence: confidenceVal
      });
    }
    
    setCameras(dynamicCams);
  }, [activeVehicles, totalGates]);

  // Handle Action: Direct Navigation to Staff Gate Control Screen
  const handleProcessAlert = (cam) => {
    notification.info({
      message: 'Chuyển sang Điều khiển cổng',
      description: `Đang điều hướng sang màn hình Điều khiển cổng để xử lý nhận diện ${cam.plate ? `xe ${cam.plate}` : ''} tại ${cam.name}.`,
      placement: 'topRight'
    });
    navigate('/staff-gate-control', { state: { gate: cam.name, plate: cam.plate, confidence: cam.confidence } });
  };

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header System Status */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsSystemActive(!isSystemActive)}
          className={`border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            isSystemActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isSystemActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
          {isSystemActive ? 'Hệ thống đang hoạt động' : 'Hệ thống đang bảo trì'}
        </button>
      </div>

      {/* Real Stats Cards (3 Columns - Perfectly Proportionate) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Tổng chỗ đỗ</h4>
            <span className="font-serif font-bold text-slate-400">P</span>
          </div>
          <div className="text-4xl font-extrabold text-slate-800">{monitoringStats.totalCapacity}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Đang trống</h4>
            <CheckCircleOutlined className="text-slate-400" />
          </div>
          <div className="text-4xl font-extrabold text-emerald-600">{monitoringStats.availableSpots}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Tỷ lệ lấp đầy</h4>
            <InfoCircleOutlined className="text-slate-400" />
          </div>
          <div className="text-4xl font-extrabold text-blue-600 mb-2">{monitoringStats.occupancyRate}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${monitoringStats.occupancyRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Live Camera Grid (3 Columns - Perfectly Matched to Stats Above) */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    onClick={() => handleProcessAlert(cam)}
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
    </div>
  );
};
