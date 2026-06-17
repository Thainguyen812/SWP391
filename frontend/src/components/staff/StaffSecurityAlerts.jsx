import React from 'react';
import { 
  FilterOutlined, 
  WarningFilled,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  AudioOutlined,
  TeamOutlined,
  MoreOutlined
} from '@ant-design/icons';

export const StaffSecurityAlerts = () => {
  return (
    <div className="p-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 m-0 mb-1">Cảnh báo An ninh</h2>
          <p className="text-slate-500 text-sm m-0">Theo dõi và xử lý các sự cố an ninh tại cơ sở.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <FilterOutlined /> Lọc
          </button>
          <span className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            3 Chưa xử lý
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Main Alert: BIỂN SỐ ĐEN */}
        <div className="bg-white border-2 border-red-500 rounded-xl overflow-hidden shadow-lg">
          {/* Header Banner */}
          <div className="bg-red-700 text-white px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold tracking-wider text-sm">
              <WarningFilled className="text-lg" />
              BIỂN SỐ ĐEN
            </div>
            <div className="text-xs font-medium opacity-90">Vừa xong</div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Images */}
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80" alt="Car plate 1" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 border-2 border-green-500/50 m-8 rounded"></div>
                  <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/60 px-2 py-1 rounded">Cam 04 - Cổng Bắc</div>
                </div>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80" alt="Car plate 2" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 border-2 border-green-500/50 m-8 rounded"></div>
                  <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/60 px-2 py-1 rounded">Cam 04 - Cổng Bắc</div>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Nhận diện Biển số</div>
                    <div className="inline-block border-2 border-slate-300 bg-slate-100 rounded text-xl font-bold px-3 py-1 tracking-widest text-slate-800">
                      30G-123.45
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Vị trí</div>
                      <div className="font-semibold text-slate-800">Làn vào 2</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Trạng thái xe</div>
                      <div className="font-bold text-red-600">Nghi phạm trộm cắp</div>
                    </div>
                  </div>

                  <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-6 border border-red-100">
                    Xe nằm trong danh sách đen từ ngày 12/10. Hệ thống barie đã tự động khóa.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-red-500/20">
                    <CheckCircleOutlined /> Xác nhận
                  </button>
                  <button className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <SafetyCertificateOutlined /> An ninh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Alerts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Wrong Zone Alert */}
          <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  PHÁT HIỆN SAI KHU VỰC
                </div>
                <div className="text-xs text-slate-500">15 phút trước • Lối vào VIP</div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreOutlined className="text-lg" /></button>
            </div>

            <div className="flex gap-4 mb-5">
              <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=200&q=80" alt="Van" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Biển số nhận diện</div>
                <div className="font-bold text-slate-800 text-base mb-1">29C-445.11</div>
                <div className="text-sm text-slate-600">Xe tải hạng nhẹ (Không có đặc quyền VIP)</div>
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-lg text-sm transition-colors">
                Bỏ qua (Khách vãng lai)
              </button>
              <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 rounded-lg flex items-center justify-center transition-colors">
                <AudioOutlined />
              </button>
            </div>
          </div>

          {/* Anti-theft Alert */}
          <div className="bg-white border-l-4 border-l-orange-500 border-y border-r border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  KÍCH HOẠT CHỐNG TRỘM
                </div>
                <div className="text-xs text-slate-500">2 phút trước • Khu vực B3</div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreOutlined className="text-lg" /></button>
            </div>

            <div className="relative aspect-[3/1] bg-black rounded-lg overflow-hidden mb-3">
              <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80" alt="Dark parking lot" className="w-full h-full object-cover opacity-70" />
            </div>

            <div className="text-sm text-slate-800 mb-5">
              Phát hiện chấn động mạnh và âm thanh báo động từ xe <span className="font-bold">51H-889.02</span>. Cần kiểm tra hiện trường ngay.
            </div>

            <div className="flex gap-3 mt-auto">
              <button className="flex-1 bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                <CheckCircleOutlined /> Đã nhận
              </button>
              <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                <TeamOutlined /> Đội tuần tra
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
