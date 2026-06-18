import { 
  LockOutlined, 
  ToolOutlined, 
  CheckCircleFilled, 
  CloseCircleOutlined,
  VideoCameraOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';
import { useState } from 'react';
import { notification, Modal, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';

export const StaffGateControl = () => {
  const navigate = useNavigate();
  const [isEmergency, setIsEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('Tất cả');
  const [logs, setLogs] = useState([
    "[OK] L-IN-01: Thẻ VIP xác nhận thành công",
    "[INFO] L-OUT-01: Chế độ chuyển sang THỦ CÔNG",
    "[WARN] Cảm biến làn L-IN-02 có độ trễ 200ms",
    "[INFO] Hệ thống: Sẵn sàng."
  ]);

  const [gates, setGates] = useState([
    {
      id: "L-IN-01",
      type: "Ô TÔ VIP",
      typeColor: "bg-slate-200 text-slate-700",
      plate: "30F - 999.88",
      barrier: "MỞ",
      barrierColor: "text-emerald-500",
      mode: "Tự động",
      actions: ["lock", "wrench"]
    },
    {
      id: "L-IN-02",
      type: "VÃNG LAI",
      typeColor: "bg-slate-200 text-slate-700",
      plate: "29A - 456.12",
      barrier: "ĐÓNG",
      barrierColor: "text-red-500",
      mode: "Tự động",
      actions: ["lock", "wrench"]
    },
    {
      id: "L-OUT-01",
      type: "XE TẢI",
      typeColor: "bg-slate-200 text-slate-700",
      plate: "51D - 123.45",
      barrier: "ĐANG CHỜ",
      barrierColor: "text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded",
      mode: "Thủ công",
      actions: ["approve", "reject"]
    }
  ]);

  const addLog = (msg, type = 'INFO') => {
    let colorClass = "text-slate-300";
    if (type === 'OK') colorClass = "text-emerald-400";
    if (type === 'WARN') colorClass = "text-yellow-400";
    if (type === 'ERROR') colorClass = "text-red-400";
    setLogs(prev => [`<span class="${colorClass}"><span class="opacity-70">[${type}]</span> ${msg}</span>`, ...prev].slice(0, 20));
  };

  const handleApprove = (id, plate) => {
    setGates(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, barrier: "MỞ", barrierColor: "text-emerald-500", actions: ["lock", "wrench"] };
      }
      return g;
    }));
    addLog(`${id}: Phê duyệt thủ công, Barrier MỞ cho xe ${plate}`, 'OK');
    notification.success({
      message: 'Đã phê duyệt',
      description: `Barrier đã được mở cho xe ${plate}.`,
      placement: 'topRight'
    });
  };

  const handleReject = (id, plate) => {
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
  };

  const handleLock = (id) => {
    const gate = gates.find(g => g.id === id);
    if (!gate) return;
    
    const isLocked = gate.mode === "Khóa";
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
  };

  const handleMaintenance = (id) => {
    addLog(`${id}: Chuyển sang chế độ bảo trì`, 'WARN');
    setGates(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", mode: "Bảo trì" };
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
    <div className="p-6 max-w-[1400px] mx-auto w-full">
      {/* Top Stats & Emergency */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Tổng lượt vào/ra hôm nay</h4>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-800">1,284</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">+12%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Số làn đang hoạt động</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-800">4</span>
              <span className="text-xl text-slate-400 font-medium">/ 6</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>)}
              {[1, 2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-red-500"></div>)}
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
                  .map((gate, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
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
                ))}
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
              <div className="relative rounded overflow-hidden aspect-[16/9] bg-slate-900 border border-slate-200">
                <img src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80" alt="Cam 1" className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  CAM 01 - CỔNG VÀO 1
                </div>
              </div>
              
              <div className="relative rounded overflow-hidden aspect-[16/9] bg-slate-900 border border-slate-200">
                <img src="https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=600&q=80" alt="Cam 4" className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  CAM 04 - CỔNG RA 1
                </div>
              </div>
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
      
    </div>
  );
};
