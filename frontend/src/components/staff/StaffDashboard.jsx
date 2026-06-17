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
import { Tag, Modal, notification } from 'antd';

export const StaffDashboard = () => {
  const logs = [
    {
      plate: "51A-123.45",
      model: "Tesla Model S (Trắng)",
      type: "VIP",
      typeColor: "#000",
      gate: "Cổng vào 1",
      action: "Vào bãi",
      actionColor: "text-emerald-600",
      time: "14:45:22",
      status: "THÀNH CÔNG",
      statusColor: "bg-emerald-100 text-emerald-700"
    },
    {
      plate: "30E-882.11",
      model: "Toyota Camry (Xám)",
      type: "KHÁCH",
      typeColor: "#64748b",
      gate: "Cổng ra 2",
      action: "Ra bãi",
      actionColor: "text-blue-600",
      time: "14:42:10",
      status: "ĐÃ THU 30.000Đ",
      statusColor: "bg-blue-100 text-blue-700"
    },
    {
      plate: "-- KHÔNG RÕ --",
      model: "Lỗi nhận diện biển số",
      type: "LỖI",
      typeColor: "#ef4444",
      gate: "Cổng vào 1",
      action: "Chặn Tự động",
      actionColor: "text-red-600",
      time: "14:40:05",
      status: "CẦN XỬ LÝ",
      statusColor: "bg-red-100 text-red-700"
    },
    {
      plate: "51K-998.02",
      model: "Ford Ranger (Xanh)",
      type: "KHÁCH",
      typeColor: "#64748b",
      gate: "Cổng vào 2",
      action: "Vào bãi",
      actionColor: "text-emerald-600",
      time: "14:38:55",
      status: "THÀNH CÔNG",
      statusColor: "bg-emerald-100 text-emerald-700"
    }
  ];

  const handleOpenManualBarrier = () => {
    Modal.confirm({
      title: 'Mở Barrier Thủ Công',
      content: 'Bạn đang yêu cầu mở Barrier thủ công. Hành động này sẽ được lưu vào nhật ký.',
      okText: 'Xác nhận Mở',
      cancelText: 'Hủy bỏ',
      onOk() {
        notification.success({ message: 'Thành công', description: 'Lệnh mở Barrier đã được gửi đến thiết bị.', placement: 'topRight' });
      }
    });
  };

  const handleCashCollection = () => {
    Modal.info({
      title: 'Thu Tiền Mặt',
      content: 'Vui lòng quét thẻ hoặc nhập biển số xe để tra cứu phí đỗ xe cần thu.',
      okText: 'Xác nhận',
      onOk() {
        notification.info({ message: 'Hệ thống', description: 'Đang mở giao diện máy POS thu phí...', placement: 'topRight' });
      }
    });
  };

  const handleReportViolation = () => {
    Modal.warning({
      title: 'Đánh dấu Vi phạm',
      content: 'Chức năng này dùng để khóa biển số các xe đỗ sai quy định hoặc trốn vé.',
      okText: 'Đưa vào Blacklist',
      cancelText: 'Hủy bỏ',
      okType: 'danger',
      onOk() {
        notification.warning({ message: 'Đã cảnh báo', description: 'Biển số đã được thêm vào danh sách đen.', placement: 'topRight' });
      }
    });
  };

  const handleReportLostCard = () => {
    Modal.confirm({
      title: 'Báo Mất Thẻ',
      content: 'Bạn có chắc chắn muốn khóa thẻ bị mất và tiến hành quy trình phạt mất thẻ không?',
      okText: 'Khóa Thẻ',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        notification.error({ message: 'Thẻ đã bị khóa', description: 'Hệ thống đã khóa thẻ hiện tại và ghi nhận báo mất.', placement: 'topRight' });
      }
    });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto w-full">
      
      {/* Alert Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center mb-6">
        <div className="flex items-start gap-3">
          <InfoCircleOutlined className="text-red-500 mt-1" />
          <div>
            <h4 className="text-red-600 font-bold text-xs tracking-wider uppercase mb-1">Trạng thái: Lưu lượng cao</h4>
            <p className="text-slate-700 text-sm m-0">Cổng vào số 1 đang có dấu hiệu ùn tắc. Vui lòng hỗ trợ điều phối.</p>
          </div>
        </div>
        <button className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors">
          <SoundOutlined />
          Báo cáo Ùn tắc
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Làn hoạt động */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Làn hoạt động</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-800">4</span>
              <span className="text-xl text-slate-400 font-medium">/6</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Xe chờ xử lý */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Xe chờ xử lý</h4>
          <div className="text-4xl font-extrabold text-slate-800 mb-2">12</div>
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
          <div className="text-4xl font-extrabold text-slate-800 mb-2">05</div>
          <div className="text-xs text-slate-500">Cần hỗ trợ tại Cổng ra 2</div>
        </div>

        {/* Cảnh báo mở */}
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cảnh báo mở</h4>
            <span className="text-red-500 text-xl font-bold leading-none">*</span>
          </div>
          <div className="text-4xl font-extrabold text-red-600 mb-2">02</div>
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
            {/* Cam 1 */}
            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-900 group">
              <img src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80" alt="Cam 1" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">CAM-01: CỔNG VÀO 1</div>
              {/* Bounding Box Mock */}
              <div className="absolute top-[40%] left-[30%] w-[40%] h-[20%] border-2 border-emerald-400">
                <div className="absolute -top-6 left-0 bg-emerald-400 text-black text-[10px] font-bold px-1 py-0.5">NHẬN DIỆN BIỂN SỐ</div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-white text-xl font-bold tracking-widest drop-shadow-md">51A-123.45</div>
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Độ tin cậy: 98.4%</div>
                  </div>
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">HỢP LỆ</span>
                </div>
              </div>
            </div>

            {/* Cam 2 */}
            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-900 group">
              <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80" alt="Cam 2" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">CAM-02: CỔNG RA 1</div>
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-white text-xl font-bold tracking-widest drop-shadow-md">72C-889.01</div>
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Độ tin cậy: 99.1%</div>
                  </div>
                  <span className="bg-slate-800 border border-slate-600 text-white text-[10px] font-bold px-2 py-1 rounded">VIP</span>
                </div>
              </div>
            </div>

            {/* Cam 3 */}
            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-900 group">
              <img src="https://images.unsplash.com/photo-1503376713246-1e66cce2b164?auto=format&fit=crop&w=600&q=80" alt="Cam 3" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">CAM-03: CỔNG RA VIP</div>
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-white text-xl font-bold tracking-widest drop-shadow-md">30E-555.55</div>
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Khớp đặt chỗ: GOLD-01</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cam 4 */}
            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-900 group">
              <img src="https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=600&q=80" alt="Cam 4" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">CAM-04: CỔNG RA KHÁCH</div>
              {/* Red Bounding Box */}
              <div className="absolute top-[20%] left-[20%] w-[60%] h-[50%] border-2 border-red-500"></div>
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-white text-xl font-bold tracking-widest drop-shadow-md">51K-443.21</div>
                    <div className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Chờ thanh toán</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Thao tác Nhanh</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button onClick={handleOpenManualBarrier} className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-3 h-32">
              <ExportOutlined className="text-blue-600 text-2xl" />
              <span className="text-sm font-bold text-slate-700 text-center">Mở Barrier<br/>Thủ công</span>
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
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"><FilterOutlined /></button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"><DownloadOutlined /></button>
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
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 text-sm`}>
                        {log.plate.split('-')[0]}
                      </div>
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
        
        <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
          <button className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline">Xem tất cả hoạt động</button>
        </div>
      </div>
      
    </div>
  );
};

const EyeIcon = () => (
  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
