import { 
  LockOutlined, 
  ToolOutlined, 
  CheckCircleFilled, 
  CloseCircleOutlined,
  VideoCameraOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { notification, Modal, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { useGlobalContext } from '../../context/GlobalContext';

export const StaffGateControl = () => {
  const navigate = useNavigate();
  const { addActivityLog, activeVehicles, currentVehicle, setCurrentVehicle, addActiveVehicle, dailyVolume, setDailyVolume, fetchAllDataFromBackend, totalGates, isEmergency, setIsEmergency } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('Tất cả');
  const [logs, setLogs] = useState([]);

  const [manualPlate, setManualPlate] = useState('');
  const [manualCardCode, setManualCardCode] = useState('');
  const [manualType, setManualType] = useState('Ô tô gầm thấp 4-5 chỗ');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // AI Simulator State
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiPlate, setAiPlate] = useState('30G-123.45');
  const [aiConfidence, setAiConfidence] = useState(98.5);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiImagePreview, setAiImagePreview] = useState('https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80');

  const handleAiImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAiImagePreview(URL.createObjectURL(file));
    }
  };

  const handleManualCheckIn = async () => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể check-in lúc này.' });
      return;
    }
    if (!manualPlate || !manualCardCode) {
      notification.error({ message: 'Lỗi', description: 'Vui lòng nhập đầy đủ biển số xe và mã thẻ!' });
      return;
    }
    setIsCheckingIn(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      // Map local Vietnamese labels to backend allowed_sizes
      let mappedType = 'SEDAN_HATCHBACK';
      if (manualType === 'Ô tô gầm thấp 4-5 chỗ') mappedType = 'SEDAN_HATCHBACK';
      if (manualType === 'Xe 7 chỗ') mappedType = 'SUV_CUV_MPV';
      if (manualType === 'Xe 9 chỗ') mappedType = 'LARGE_VAN_MINIBUS';
      if (manualType === 'Xe 16 chỗ') mappedType = 'LARGE_VAN_MINIBUS';

      // Using apiClient so the Bearer token is automatically attached!
      const response = await apiClient.post(`/v1/parking/check-in/visitor`, {
        plate: manualPlate,
        vehicle_type: mappedType,
        card_code: manualCardCode,
        image_url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80'
      });
      notification.success({ message: 'Thành công', description: `Đã check-in cho xe ${manualPlate} với thẻ ${manualCardCode}` });
      addLog(`[MANUAL_CHECKIN] Success: Plate ${manualPlate}, Type: ${manualType}, Card: ${manualCardCode}`, 'SUCCESS');
      
      // Fetch latest data from backend to sync globally!
      if (fetchAllDataFromBackend) {
        fetchAllDataFromBackend();
      }
      
      // Tăng biến đếm tổng lượt lên 1
      setDailyVolume(prev => prev + 1);

      setManualPlate('');
      setManualCardCode('');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Không thể check-in lúc này';
      notification.error({ message: 'Thất bại', description: errorMsg });
      addLog(`[ERROR] Check-in thất bại: ${errorMsg}`, 'ERROR');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleAiCheckIn = async () => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể check-in lúc này.' });
      return;
    }
    if (!aiPlate) {
      notification.error({ message: 'Lỗi', description: 'Vui lòng nhập biển số xe!' });
      return;
    }
    setIsAiProcessing(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      
      const response = await apiClient.post(`/v1/parking/check-in/ai`, {
        plate: aiPlate.toUpperCase(),
        vehicle_type: 'SEDAN_HATCHBACK',
        camera_id: "CAM-01-IN",
        confidence_score: parseFloat(aiConfidence),
        image_url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80'
      });
      
      notification.success({ message: 'AI Nhận diện Thành công', description: `Biển số ${aiPlate} hợp lệ.` });
      addLog(`[AI_LPR] Success: Plate ${aiPlate}, Conf: ${aiConfidence}%`, 'OK');
      setIsAiModalVisible(false);
      setAiPlate('');
      setAiConfidence(98.5);
      
      addActivityLog({
        plate: aiPlate,
        model: "Nhận diện Camera",
        type: "VIP",
        gate: "CAM-01-IN",
        action: "Vào Cổng (AI)",
        time: "Vừa xong",
        status: "Thành Công",
        typeColor: "text-amber-600",
        statusColor: "bg-emerald-100 text-emerald-700",
        actionColor: "text-emerald-600"
      });
      setDailyVolume(prev => prev + 1);

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'AI Nhận diện thất bại';
      // MÔ PHỎNG LOGIC NGOẠI LỆ < 70%
      if (aiConfidence < 70 || errorMsg.includes("mờ")) {
         notification.warning({ 
           message: 'Cảnh báo AI', 
           description: errorMsg,
           duration: 8
         });
         addLog(`[AI_LPR] Failed: Conf ${aiConfidence}%. Reason: ${errorMsg}`, 'WARN');
      } else {
         notification.error({ message: 'Lỗi', description: errorMsg });
         addLog(`[ERROR] AI Check-in: ${errorMsg}`, 'ERROR');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const INITIAL_GATES = [
    { id: 'L-VÀO 1', type: 'TRỐNG', typeColor: 'bg-slate-100 text-slate-400', plate: '---', barrier: 'ĐÓNG', barrierColor: 'text-red-500', mode: 'Tự động', actions: ['lock', 'wrench'], vehicleId: null },
    { id: 'L-VÀO 2', type: 'TRỐNG', typeColor: 'bg-slate-100 text-slate-400', plate: '---', barrier: 'ĐÓNG', barrierColor: 'text-red-500', mode: 'Tự động', actions: ['lock', 'wrench'], vehicleId: null },
    { id: 'L-VÀO 3', type: 'TRỐNG', typeColor: 'bg-slate-100 text-slate-400', plate: '---', barrier: 'ĐÓNG', barrierColor: 'text-red-500', mode: 'Tự động', actions: ['lock', 'wrench'], vehicleId: null },
    { id: 'L-RA 1', type: 'TRỐNG', typeColor: 'bg-slate-100 text-slate-400', plate: '---', barrier: 'ĐÓNG', barrierColor: 'text-red-500', mode: 'Tự động', actions: ['lock', 'wrench'], vehicleId: null },
    { id: 'L-RA 2', type: 'TRỐNG', typeColor: 'bg-slate-100 text-slate-400', plate: '---', barrier: 'ĐÓNG', barrierColor: 'text-red-500', mode: 'Tự động', actions: ['lock', 'wrench'], vehicleId: null },
    { id: 'L-RA 3', type: 'TRỐNG', typeColor: 'bg-slate-100 text-slate-400', plate: '---', barrier: 'ĐÓNG', barrierColor: 'text-red-500', mode: 'Tự động', actions: ['lock', 'wrench'], vehicleId: null }
  ];

  const [gates, setGates] = useState(INITIAL_GATES);

  useEffect(() => {
    setGates(prevGates => {
      // We map over the previous gates so we don't lose maintenance states.
      // But we need to make sure we clear the vehicles for gates that no longer have a vehicle.
      let newGates = prevGates.map(g => {
        // Keep maintenance state, but clear out vehicle if it's not maintained
        if (g.mode === 'Bảo trì') return g;
        return { ...g, type: 'TRỐNG', typeColor: 'bg-slate-100 text-slate-400', plate: '---', barrier: 'ĐÓNG', barrierColor: 'text-red-500', mode: 'Tự động', actions: ['lock', 'wrench'], vehicleId: null };
      });

      if (activeVehicles && activeVehicles.length > 0) {
        activeVehicles.forEach(v => {
          let gateId = v.gate.replace('Cổng', 'L').replace(' ', '-').toUpperCase();
          
          let gateIndex = newGates.findIndex(g => g.id === gateId);
          // If a new dynamic gate appears (like L-VÀO 4), we append it to the list
          if (gateIndex === -1) {
            newGates.push({ id: gateId, mode: 'Tự động' });
            gateIndex = newGates.length - 1;
          }

          let g = newGates[gateIndex];
          if (g.mode === 'Bảo trì') return;

          g.type = v.type.toUpperCase();
          g.typeColor = "bg-slate-200 text-slate-700";
          g.plate = v.plate;
          
          g.mode = v.status === 'Chờ thanh toán' ? 'Thủ công' : 'Tự động';
          g.barrier = v.status === 'Chờ thanh toán' ? 'ĐANG CHỜ' : (v.status === 'Cảnh báo' || v.status === 'Lỗi thẻ' ? 'ĐÓNG' : 'MỞ');
          g.barrierColor = g.barrier === 'MỞ' ? 'text-emerald-500' : (g.barrier === 'ĐÓNG' ? 'text-red-500' : 'text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded');
          g.actions = g.mode === 'Thủ công' ? ["approve", "reject"] : ["lock", "wrench"];
          g.vehicleId = v.id;
        });
      }
      return newGates;
    });
  }, [activeVehicles]);

  const addLog = (msg, type = 'INFO') => {
    let colorClass = "text-slate-300";
    if (type === 'OK') colorClass = "text-emerald-400";
    if (type === 'WARN') colorClass = "text-yellow-400";
    if (type === 'ERROR') colorClass = "text-red-400";
    setLogs(prev => [`<span class="${colorClass}"><span class="opacity-70">[${type}]</span> ${msg}</span>`, ...prev].slice(0, 20));
  };

  const handleApprove = (id, plate) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể mở cổng lúc này.' });
      return;
    }
    Modal.confirm({
      title: 'Xác nhận mở cổng',
      content: `Mở cổng ${id} cho xe ${plate}?`,
      okText: 'Mở cổng',
      cancelText: 'Hủy',
      onOk() {
        setGates(prev => prev.map(g => {
          if (g.id === id) {
            return { ...g, barrier: "MỞ", barrierColor: "text-emerald-500", actions: ["lock", "wrench"] };
          }
          return g;
        }));
        addLog(`${id}: Phê duyệt thủ công, Barrier MỞ cho xe ${plate}`, 'OK');
        
        // Update Global Context
        addActivityLog({
          plate: plate,
          model: "Mở Thủ Công",
          type: "VÃNG LAI",
          gate: id,
          action: "Mở Thủ Công",
          time: "Vừa xong",
          status: "Thành Công",
          typeColor: "text-blue-600",
          statusColor: "bg-emerald-100 text-emerald-700",
          actionColor: "text-emerald-600"
        });

        notification.success({
          message: 'Đã phê duyệt',
          description: `Barrier đã được mở cho xe ${plate}.`,
          placement: 'topRight'
        });
      }
    });
  };

  const handleReject = (id, plate) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thao tác lúc này.' });
      return;
    }
    Modal.confirm({
      title: 'Từ chối mở cổng',
      content: `Bạn chắc chắn muốn từ chối xe ${plate} đi qua cổng ${id}?`,
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        setGates(prev => prev.map(g => {
          if (g.id === id) {
            return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", actions: ["lock", "wrench"] };
          }
          return g;
        }));
        addLog(`${id}: Từ chối mở cổng cho xe ${plate}`, 'WARN');
        notification.error({
          message: 'Từ chối mở cổng',
          description: `Đã từ chối xe ${plate} qua cổng.`,
          placement: 'topRight'
        });
      }
    });
  };

  const handleLock = (id) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thao tác lúc này.' });
      return;
    }
    const gate = gates.find(g => g.id === id);
    if (!gate) return;
    
    const isLocked = gate.mode === "Khóa";
    
    Modal.confirm({
      title: isLocked ? 'Xác nhận mở khóa làn' : 'Xác nhận khóa làn',
      content: isLocked ? `Bạn muốn mở khóa làn ${id}?` : `Bạn có chắc chắn muốn khóa khẩn cấp làn ${id}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: !isLocked },
      onOk() {
        if (isLocked) {
           addLog(`${id}: Mở khóa làn`, 'INFO');
        } else {
           addLog(`${id}: Đã khóa làn khẩn cấp`, 'ERROR');
        }

        setGates(prev => prev.map(g => {
          if (g.id === id) {
            if (isLocked) {
               return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", mode: "Tự động" };
            } else {
               return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", mode: "Khóa" };
            }
          }
          return g;
        }));
        notification.success({message: isLocked ? 'Đã mở khóa' : 'Đã khóa', placement: 'topRight'});
      }
    });
  };

  const handleMaintenance = (id) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thao tác lúc này.' });
      return;
    }
    setGates(prev => prev.map(g => {
      if (g.id === id) {
        const isCurrentlyMaintenance = g.mode === "Bảo trì";
        if (isCurrentlyMaintenance) {
          addLog(`${id}: Đã tắt chế độ bảo trì, chuyển về Tự động`, 'SUCCESS');
          return { ...g, mode: "Tự động" };
        } else {
          addLog(`${id}: Chuyển sang chế độ bảo trì`, 'WARN');
          return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", mode: "Bảo trì" };
        }
      }
      return g;
    }));
  };

  const handleEmergencyStop = () => {
    if (isEmergency) {
      setIsEmergency(false);
      notification.success({
        message: 'KHÔI PHỤC HỆ THỐNG',
        description: 'Tất cả các Barrier đã được cấp điện lại. Chế độ vận hành bình thường đã được khôi phục.',
        placement: 'topRight'
      });
      return;
    }

    Modal.confirm({
      title: 'Xác nhận Dừng khẩn cấp',
      icon: <ExclamationCircleFilled style={{ color: '#ef4444' }} />,
      content: 'Hành động này sẽ ngắt điện toàn bộ hệ thống Barrier và khóa các cổng đang mở. Bạn có chắc chắn không?',
      okText: 'KÍCH HOẠT DỪNG KHẨN CẤP',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk() {
        setIsEmergency(true);
        notification.error({
          message: 'HỆ THỐNG ĐÃ BỊ DỪNG KHẨN CẤP',
          description: 'Toàn bộ Barrier đã bị khóa. Vui lòng liên hệ bộ phận Kỹ thuật để mở lại.',
          placement: 'topRight',
          duration: 10
        });
      },
    });
  };

  return (
    <div className="p-6 w-full">
      {/* Top Stats & Emergency */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* Xe trong bãi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Xe trong bãi</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-800">{activeVehicles ? activeVehicles.length : 0}</span>
              <span className="text-xl text-slate-400 font-medium">xe</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Tổng lượt vào/ra hôm nay</h4>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-800">{dailyVolume.toLocaleString()}</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">+12%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Số làn đang hoạt động</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-800">
                {(() => {
                  if (isEmergency) return 0;
                  const gatesInMaintenance = gates.filter(g => g.mode === 'Bảo trì').length;
                  return Math.max(0, totalGates - gatesInMaintenance);
                })()}
              </span>
              <span className="text-xl text-slate-400 font-medium">/ {totalGates}</span>
            </div>
            <div className="flex gap-1">
              {(() => {
                const gatesInMaintenance = gates.filter(g => g.mode === 'Bảo trì').length;
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

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Trạng thái hệ thống</h4>
          <div className="flex items-center gap-2 mt-1">
            {isEmergency ? (
              <>
                <CloseCircleOutlined className="text-red-500 text-2xl" />
                <span className="text-xl font-bold text-red-600">Dừng khẩn cấp</span>
              </>
            ) : (
              <>
                <CheckCircleFilled className="text-emerald-500 text-2xl" />
                <span className="text-xl font-bold text-emerald-600">Bình thường</span>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={handleEmergencyStop}
          className={`active:scale-[0.98] transition-all p-5 rounded-xl flex flex-col items-center justify-center cursor-pointer group ${
            isEmergency 
              ? 'bg-slate-800 border-2 border-slate-700 text-white shadow-md hover:bg-slate-700'
              : 'bg-white border-2 border-red-500 hover:bg-red-50 shadow-[0_4px_15px_rgba(239,68,68,0.2)] text-red-600'
          }`}
        >
          <span className="text-4xl font-bold mb-1 group-hover:scale-110 transition-transform">*</span>
          <span className="text-sm font-bold uppercase tracking-widest text-center leading-snug">
            {isEmergency ? 'Tắt dừng khẩn cấp' : 'Dừng khẩn cấp'}
          </span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Gate Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-lg font-bold text-slate-800">Quản lý làn xe trực tuyến</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Tìm tên, biển số, ..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 w-[220px]"
              />
              <Dropdown menu={{ 
                items: [
                  { key: 'Tất cả', label: 'Tất cả trạng thái' },
                  { key: 'Tự động', label: 'Chế độ Tự động' },
                  { key: 'Thủ công', label: 'Chế độ Thủ công' },
                  { key: 'Khóa', label: 'Làn bị Khóa' },
                  { key: 'Bảo trì', label: 'Đang Bảo trì' }
                ], 
                onClick: (e) => setFilterMode(e.key) 
              }} trigger={['click']}>
                <button className="border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer">Lọc: {filterMode}</button>
              </Dropdown>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('Tất cả');
                  notification.success({message: 'Tải lại thành công', description: 'Đã cập nhật trạng thái làn xe mới nhất.', placement: 'topRight'});
                }}
                className="border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Tải lại
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-4 border-b border-slate-200 w-[15%]">Mã Làn</th>
                  <th className="p-4 border-b border-slate-200 w-[15%]">Loại Xe</th>
                  <th className="p-4 border-b border-slate-200 w-[20%]">Biển Số</th>
                  <th className="p-4 border-b border-slate-200 w-[15%]">Barrier</th>
                  <th className="p-4 border-b border-slate-200 w-[10%]">Chế độ</th>
                  <th className="p-4 border-b border-slate-200 w-[25%]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {gates
                  .filter(gate => filterMode === 'Tất cả' || gate.mode === filterMode)
                  .filter(gate => 
                    gate.plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    gate.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    gate.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((gate, i) => {
                    const isSelected = currentVehicle?.id === gate.vehicleId;
                    return (
                  <tr 
                    key={i} 
                    className={`border-b hover:bg-slate-50 transition-colors last:border-0 ${isSelected ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'border-slate-100'}`}
                  >
                    <td className="p-4 font-bold text-slate-800">{gate.id}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${gate.typeColor}`}>
                        {gate.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 tracking-wider">
                      {gate.plate}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {gate.barrier === "MỞ" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                        {gate.barrier === "ĐÓNG" && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                        <span className={`text-[11px] font-bold ${gate.barrierColor}`}>
                          {gate.barrier}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {gate.mode}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {gate.actions.includes("lock") && (
                          <button onClick={() => handleLock(gate.id)} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${gate.mode === "Khóa" ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                            <LockOutlined />
                          </button>
                        )}
                        {gate.actions.includes("wrench") && (
                          <button onClick={() => handleMaintenance(gate.id)} className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${gate.mode === "Bảo trì" ? "bg-orange-50 border-orange-200 text-orange-500" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}>
                            <ToolOutlined />
                          </button>
                        )}
                        {gate.actions.includes("approve") && (
                          <button 
                            onClick={() => handleApprove(gate.id, gate.plate)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircleFilled className="text-white" />
                            PHÊ DUYỆT
                          </button>
                        )}
                        {gate.actions.includes("reject") && (
                          <button 
                            onClick={() => handleReject(gate.id, gate.plate)}
                            className="w-8 h-8 rounded border border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                          >
                            <CloseCircleOutlined />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                    );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 text-center bg-slate-50 mt-auto">
            <button 
              onClick={() => navigate('/staff-monitoring')}
              className="text-slate-700 text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
            >
              Xem thêm báo cáo lưu lượng
            </button>
          </div>
        </div>

        {/* Right Column: Cameras & Logs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Camera Monitor */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <VideoCameraOutlined /> Giám sát Camera (LIVE)
              </h3>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div className="p-2 flex flex-col gap-2 bg-slate-50">
              {activeVehicles && activeVehicles.slice(0, 2).map((vehicle, index) => (
                <div key={vehicle.id} className={`relative rounded overflow-hidden aspect-[16/9] bg-slate-900 border border-slate-200 cursor-pointer transition-all ${currentVehicle?.id === vehicle.id ? 'border-blue-500 shadow-md ring-2 ring-blue-500' : ''}`} onClick={() => setCurrentVehicle(vehicle)}>
                  <img src={vehicle.image || "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80"} alt={`Cam ${index + 1}`} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    CAM 0{index + 1} - {vehicle.gate.toUpperCase()}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                    {vehicle.plate}
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setIsAiModalVisible(true)}
                className="mt-1 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-sm"
              >
                <VideoCameraOutlined /> MÔ PHỎNG LPR CAMERA
              </button>
            </div>
          </div>

          {/* Manual Check-In */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col p-4 mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
              <CheckCircleFilled className="text-emerald-500" /> Nhập xe thủ công
            </h3>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Biển số xe (VD: 30A-123.45)" 
                value={manualPlate}
                onChange={(e) => setManualPlate(e.target.value)}
                className="border border-slate-200 p-2 rounded text-sm focus:outline-none focus:border-blue-500 uppercase"
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Mã thẻ (Quẹt thẻ...)" 
                  value={manualCardCode}
                  onChange={(e) => setManualCardCode(e.target.value)}
                  className="border border-slate-200 p-2 rounded text-sm focus:outline-none focus:border-blue-500 flex-1"
                />
                <button 
                  onClick={() => setManualCardCode(String(Math.floor(Math.random() * 50) + 1).padStart(6, '0'))}
                  title="Giả lập máy quét thẻ"
                  className="bg-slate-100 border border-slate-200 px-3 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  💳 Quét mẫu
                </button>
              </div>
              <select 
                value={manualType} 
                onChange={(e) => setManualType(e.target.value)}
                className="border border-slate-200 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Ô tô gầm thấp 4-5 chỗ">Ô tô gầm thấp 4-5 chỗ (Sedan/Hatchback)</option>
                <option value="Xe 7 chỗ">Xe 7 chỗ (SUV/CUV/MPV)</option>
                <option value="Xe 9 chỗ">Xe 9 chỗ (Minibus/Van)</option>
                <option value="Xe 16 chỗ">Xe 16 chỗ (Minibus)</option>
              </select>
              <button 
                onClick={handleManualCheckIn}
                disabled={isCheckingIn}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-blue-400"
              >
                {isCheckingIn ? 'Đang xử lý...' : 'CHECK-IN KHÁCH'}
              </button>
            </div>
          </div>

          {/* System Terminal Log */}
          <div className="bg-[#0f172a] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 border border-slate-800 min-h-[250px]">
            <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-[#0b1121]">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhật ký Hệ thống</h3>
              <span className="text-[9px] font-mono text-slate-500">14:45:22 GMT+7</span>
            </div>
            <div className="p-4 font-mono text-[10px] sm:text-xs text-slate-300 flex flex-col gap-2 overflow-auto custom-scrollbar">
              {logs.map((log, i) => (
                 <div key={i} dangerouslySetInnerHTML={{ __html: log }} />
              ))}
              {/* Fake cursor */}
              <div className="w-2 h-3.5 bg-slate-400 animate-pulse mt-1"></div>
            </div>
          </div>

        </div>
      </div>
      
      {/* AI LPR Simulator Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 uppercase tracking-wider font-bold">
            <VideoCameraOutlined className="text-blue-600" /> Mô phỏng AI LPR Scanner
          </div>
        }
        open={isAiModalVisible}
        onCancel={() => setIsAiModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <div className="flex flex-col gap-5 mt-4">
          {/* Mock Camera Image Area */}
          <label htmlFor="ai-image-upload" className="border-2 border-dashed border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group cursor-pointer hover:border-blue-400 transition-colors">
             <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <img src={aiImagePreview} alt="Xe mẫu" className="w-full h-40 object-cover rounded mb-2 opacity-80" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider absolute bottom-4 bg-white/80 px-3 py-1 rounded backdrop-blur-sm group-hover:text-blue-600 transition-colors shadow-sm">TẢI ẢNH XE LÊN (BẤM ĐỂ CHỌN)</span>
             <input type="file" id="ai-image-upload" accept="image/*" className="hidden" onChange={handleAiImageUpload} />
          </label>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nhận diện Biển số</label>
            <input 
              type="text" 
              value={aiPlate}
              onChange={(e) => setAiPlate(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-lg font-mono text-xl text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase text-center"
              placeholder="VD: 30G-123.45"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>Độ tin cậy (Confidence Score)</span>
              <span className={`text-base ${aiConfidence < 70 ? 'text-red-500' : 'text-emerald-500'}`}>{aiConfidence}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" step="0.1"
              value={aiConfidence}
              onChange={(e) => setAiConfidence(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            {aiConfidence < 70 ? (
              <p className="text-[11px] text-red-500 mt-3 font-semibold flex items-center gap-1 bg-red-50 p-2 rounded">
                <ExclamationCircleFilled /> Hệ thống Backend sẽ từ chối nhận diện do độ tin cậy dưới ngưỡng (70%).
              </p>
            ) : (
              <p className="text-[11px] text-emerald-600 mt-3 font-semibold flex items-center gap-1 bg-emerald-50 p-2 rounded">
                <CheckCircleFilled /> Độ tin cậy đạt yêu cầu để mở cổng tự động.
              </p>
            )}
          </div>

          <button
            onClick={handleAiCheckIn}
            disabled={isAiProcessing}
            className={`w-full font-bold py-3.5 px-4 rounded-lg transition-colors shadow-md mt-2 flex items-center justify-center gap-2 uppercase tracking-wider ${aiConfidence < 70 ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'} disabled:opacity-70`}
          >
            {isAiProcessing ? 'Đang gửi Backend xử lý...' : (aiConfidence < 70 ? 'Quét (Bị từ chối)' : 'Quét Camera LPR')}
          </button>
        </div>
      </Modal>

    </div>
  );
};
