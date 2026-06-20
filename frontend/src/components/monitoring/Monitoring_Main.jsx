import React from 'react';
import { 
  WarningOutlined, 
  CheckCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  ExpandAltOutlined
} from '@ant-design/icons';

export const MonitoringPage = () => {
  return (
    <div className="p-6 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-end items-end pt-6">
          <div className="flex gap-3">
            <button className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Hệ thống đang hoạt động
            </button>
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Tải lại trang
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Tổng chỗ đỗ</h4>
            <span className="font-serif font-bold text-slate-400">P</span>
          </div>
          <div className="text-4xl font-extrabold text-slate-800">500</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Đang trống</h4>
            <CheckCircleOutlined className="text-slate-400" />
          </div>
          <div className="text-4xl font-extrabold text-emerald-600">124</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-bold mb-2">Tỷ lệ lấp đầy</h4>
            <InfoCircleOutlined className="text-slate-400" />
          </div>
          <div className="text-4xl font-extrabold text-blue-600 mb-2">75%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-red-800 text-xs font-bold mb-2">Cảnh báo hiện tại</h4>
            <WarningOutlined className="text-red-500" />
          </div>
          <div className="text-4xl font-extrabold text-red-600">2</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cameras Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Camera 1 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[280px]">
              <div className="relative h-[160px] bg-black flex-shrink-0">
                <div className="absolute top-3 left-3 flex gap-0.5">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-l flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                  <span className="bg-white/90 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded-r">Cổng vào 1</span>
                </div>
                <div className="absolute top-3 right-3 text-white text-[10px] font-mono drop-shadow-md">08:45:12</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-slate-800 leading-tight">LPR Camera - Lối vào chính</h4>
                  <ExpandAltOutlined className="text-slate-400 cursor-pointer hover:text-blue-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-auto">
                  <CheckCircleOutlined /> Nhận diện BSX ổn định
                </div>
              </div>
            </div>

            {/* Camera 2 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[280px]">
              <div className="relative h-[160px] bg-black flex-shrink-0">
                <div className="absolute top-3 left-3 flex gap-0.5">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-l flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                  <span className="bg-white/90 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded-r">Cổng vào 2</span>
                </div>
                <div className="absolute top-3 right-3 text-white text-[10px] font-mono drop-shadow-md">08:45:12</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-slate-800 leading-tight">LPR Camera - Lối vào phụ</h4>
                  <ExpandAltOutlined className="text-slate-400 cursor-pointer hover:text-blue-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-auto">
                  <CheckCircleOutlined /> Trạng thái bình thường
                </div>
              </div>
            </div>

            {/* Camera 3 (Warning) */}
            <div className="bg-red-50 border-2 border-red-400 rounded-xl overflow-hidden shadow-md flex flex-col h-[280px]">
              <div className="relative h-[160px] bg-black flex-shrink-0">
                <div className="absolute top-3 left-3 flex gap-0.5">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-l flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                  <span className="bg-white/90 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded-r">Cổng ra 1</span>
                </div>
                <div className="absolute top-3 right-3 text-white text-[10px] font-mono drop-shadow-md">08:45:12</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-sm text-red-700 leading-tight mb-2">LPR Camera - Lối ra chính</h4>
                
                <div className="flex justify-between items-end mt-auto gap-2">
                  <div className="text-[11px] text-red-600 font-bold flex items-start gap-1.5 leading-tight flex-1">
                    <WarningOutlined className="mt-0.5 flex-shrink-0" />
                    <span>CẢNH BÁO: Không thể đọc BSX</span>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold w-12 h-10 rounded shadow-sm transition-colors flex-shrink-0 flex items-center justify-center text-center leading-tight">
                    Xử<br/>lý
                  </button>
                </div>
              </div>
            </div>

            {/* Camera 4 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[280px]">
              <div className="relative h-[160px] bg-black flex-shrink-0">
                <div className="absolute top-3 left-3 flex gap-0.5">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-l flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                  <span className="bg-white/90 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded-r">Cổng ra 2</span>
                </div>
                <div className="absolute top-3 right-3 text-white text-[10px] font-mono drop-shadow-md">08:45:12</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-slate-800 leading-tight">LPR Camera - Lối ra phụ</h4>
                  <ExpandAltOutlined className="text-slate-400 cursor-pointer hover:text-blue-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-auto">
                  <CheckCircleOutlined /> Giao thông thông suốt
                </div>
              </div>
            </div>

            {/* Camera 5 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[280px]">
              <div className="relative h-[160px] bg-black flex-shrink-0">
                <div className="absolute top-3 left-3 flex gap-0.5">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-l flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                  <span className="bg-white/90 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded-r">Tầng hầm B1</span>
                </div>
                <div className="absolute top-3 right-3 text-white text-[10px] font-mono drop-shadow-md">08:45:12</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-slate-800 leading-tight">Camera Toàn cảnh - Khu A B1</h4>
                  <ExpandAltOutlined className="text-slate-400 cursor-pointer hover:text-blue-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-auto">
                  <CheckCircleOutlined /> Quan sát bình thường
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Alert Logs */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 m-0">Nhật ký Cảnh báo</h3>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">2 Mới</span>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
              
              {/* High Alert */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                    <WarningOutlined /> Cao
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono">08:44:05</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Phát hiện xe không biển số</h4>
                <p className="text-xs text-slate-500 mb-3">Cổng ra 1 • Yêu cầu kiểm tra thủ công</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 rounded text-xs font-bold transition-colors">
                    Bỏ qua
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white border border-red-600 py-1.5 rounded text-xs font-bold shadow-sm transition-colors">
                    Xử lý ngay
                  </button>
                </div>
              </div>

              {/* Medium Alert */}
              <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
                    <InfoCircleOutlined /> Trung bình
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono">08:30:12</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Cảnh báo đỗ sai vị trí</h4>
                <p className="text-xs text-slate-500 m-0">Tầng hầm B1, Khu C • Đỗ lấn vạch</p>
              </div>

              {/* Low Alert 1 */}
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                    <SyncOutlined /> Thấp
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">08:15:00</span>
                </div>
                <h4 className="font-medium text-slate-700 text-sm mb-1">Khởi động lại Camera Cổng 2</h4>
                <p className="text-xs text-slate-400 m-0">Hệ thống • Đã hoàn thành (15s)</p>
              </div>

              {/* Low Alert 2 */}
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                    <SyncOutlined /> Thấp
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">07:55:22</span>
                </div>
                <h4 className="font-medium text-slate-700 text-sm mb-1">Thay đổi ca trực</h4>
                <p className="text-xs text-slate-400 m-0">Quản trị viên • Nhận ca sáng</p>
              </div>

            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">
                Xem toàn bộ lịch sử
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
