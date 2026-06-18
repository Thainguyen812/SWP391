import React from 'react';
import { 
  CarOutlined, 
  SearchOutlined, 
  CheckCircleFilled, 
  CameraOutlined, 
  WarningOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

export const StaffLostCard = () => {
  return (
    <div className="p-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 m-0 mb-1">Xử lý Mất thẻ</h2>
          <p className="text-slate-500 text-sm m-0">Tra cứu và xác minh phương tiện để cấp lại thẻ bị mất.</p>
        </div>
        <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
          <WarningOutlined /> CẢNH BÁO MẤT THẺ
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lookup and Image Comparison */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Step 1: Lookup */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100">1. Tra cứu Phương tiện</h3>
            
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">NHẬP BIỂN SỐ XE</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600 text-lg">
                    <CarOutlined />
                  </div>
                  <input 
                    type="text" 
                    value="30G-123.45" 
                    readOnly
                    className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg text-lg font-bold text-slate-800 tracking-widest bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                  <SearchOutlined /> Tìm kiếm Lịch sử
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <CheckCircleFilled className="text-base" /> TÌM THẤY 1 PHIÊN ĐANG HOẠT ĐỘNG
                </div>
                <div className="text-slate-500 text-xs font-medium">Mã phiên: #TRX-88291</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">THỜI GIAN VÀO</div>
                  <div className="font-bold text-slate-800">08:45 - 12/10/2023</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">CỬA VÀO</div>
                  <div className="font-bold text-slate-800">Làn ô tô - B1</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">LOẠI VÉ</div>
                  <div className="font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded inline-block">Khách vãng lai</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Image Comparison */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3">2. Đối chiếu Hình ảnh</h3>
            <p className="text-sm text-slate-500 mb-5 pb-4 border-b border-slate-100">So sánh phương tiện lúc vào và phương tiện đang đứng tại cổng ra hiện tại.</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Image 1 */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border border-slate-300">
                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80" alt="Front Left" className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-2 left-2 bg-slate-800/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  GÓC VÀO TRƯỚC TRÁI
                </div>
              </div>
              
              {/* Image 2 */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border border-slate-300">
                <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80" alt="Front Right" className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-2 left-2 bg-slate-800/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  GÓC VÀO TRƯỚC PHẢI
                </div>
              </div>

              {/* Image 3 (LIVE) */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border-2 border-red-300">
                <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80" alt="Rear Left Live" className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  CỔNG RA SAU TRÁI [LIVE]
                </div>
              </div>

              {/* Image 4 (LIVE) */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border-2 border-red-300">
                <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80" alt="Rear Right Live" className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  CỔNG RA SAU PHẢI [LIVE]
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Profile and Payment */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Step 3: Verification Profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">3. Hồ sơ Xác minh</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">Yêu cầu chụp lại giấy tờ tùy thân của người điều khiển phương tiện để lưu trữ báo cáo sự cố.</p>

            <div className="mb-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">CCCD / CMND / GPLX</label>
              <button className="w-full bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg aspect-[2.5/1] flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors cursor-pointer group">
                <CameraOutlined className="text-2xl mb-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">GIẤY ĐĂNG KÝ XE (Tùy chọn)</label>
              <button className="w-full bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg aspect-[2.5/1] flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors cursor-pointer group">
                <CameraOutlined className="text-2xl mb-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-50 border border-slate-200 border-t-4 border-t-blue-600 rounded-xl p-6 shadow-sm mt-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Tổng kết Xử lý</h3>
            
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-slate-600">Phí đỗ xe (tạm tính)</span>
              <span className="font-medium text-slate-800">50,000 đ</span>
            </div>
            <div className="flex justify-between items-center mb-5 text-sm">
              <span className="text-slate-600">Phí phạt mất thẻ</span>
              <span className="font-medium text-slate-800">150,000 đ</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG THU</span>
              <span className="text-2xl font-bold text-blue-600">200,000 đ</span>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/20 mb-3">
              <SafetyCertificateOutlined /> Xác nhận Xử lý Mất thẻ
            </button>
            
            <p className="text-[11px] text-center text-slate-500">Thao tác này sẽ mở cổng và ghi nhận sự cố vào hệ thống.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
