import React from 'react';
import { 
  SwapOutlined, 
  DownloadOutlined, 
  DesktopOutlined, 
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Switch } from 'antd'; // Using antd Switch for nice toggles

export const StaffSettings = () => {
  return (
    <div className="p-6 max-w-[1200px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shift Handover */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active User Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">ĐANG TRỰC CA</div>
              <h3 className="text-lg font-bold text-slate-800 m-0 leading-tight">Nguyễn Văn A</h3>
              <div className="text-xs text-slate-500 mt-1">Mã NV: NV-1042 • Trạm: T-OUT-02</div>
            </div>
          </div>

          {/* Handover Process */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <SwapOutlined className="text-slate-600" />
              <h3 className="font-bold text-slate-800 m-0 text-base">Quy trình Bàn giao</h3>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">THỐNG KÊ PHIÊN TRỰC</div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Doanh thu</div>
                  <div className="text-lg font-bold text-slate-800">4.520.000đ</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Tiền mặt</div>
                  <div className="text-lg font-bold text-slate-800">1.200.000đ</div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">KIỂM TRA THIẾT BỊ (NHÂN VIÊN MỚI)</div>
              <div className="flex flex-col gap-3 mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center group-hover:border-blue-500 transition-colors"></div>
                  <span className="text-sm text-slate-700">Máy in hoạt động tốt</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center group-hover:border-blue-500 transition-colors"></div>
                  <span className="text-sm text-slate-700">Camera LPR rõ nét</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center group-hover:border-blue-500 transition-colors"></div>
                  <span className="text-sm text-slate-700">Cổng chắn (Gate) ổn định</span>
                </label>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-xs tracking-wide transition-colors">
                  TIẾP NHẬN CA (NV MỚI)
                </button>
                <button className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-lg text-xs tracking-wide transition-colors">
                  XÁC NHẬN BÀN GIAO
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: History & Config */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Shift History */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg m-0">Lịch sử Ca trực</h3>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                <DownloadOutlined /> XUẤT BÁO CÁO
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 font-bold">NHÂN VIÊN</th>
                    <th className="px-5 py-4 font-bold">CA</th>
                    <th className="px-5 py-4 font-bold">BẮT ĐẦU</th>
                    <th className="px-5 py-4 font-bold">KẾT THÚC</th>
                    <th className="px-5 py-4 font-bold">SỐ XE</th>
                    <th className="px-5 py-4 font-bold">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800">Nguyễn Văn A</td>
                    <td className="px-5 py-4">Sáng</td>
                    <td className="px-5 py-4 font-mono text-xs">06:00</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">--:--</td>
                    <td className="px-5 py-4 font-medium">452</td>
                    <td className="px-5 py-4">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">ĐANG TRỰC</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800">Trần Thị B</td>
                    <td className="px-5 py-4">Đêm</td>
                    <td className="px-5 py-4 font-mono text-xs">22:00</td>
                    <td className="px-5 py-4 font-mono text-xs">06:00</td>
                    <td className="px-5 py-4 font-medium">318</td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">HOÀN THÀNH</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Terminal Config */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <DesktopOutlined className="text-blue-600" />
                <h3 className="font-bold text-slate-800 m-0 text-base">Cấu hình Trạm</h3>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mã Trạm (Terminal ID)</label>
                <div className="relative mb-4">
                  <select className="appearance-none w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Làn Ra 02 (T-OUT-02)</option>
                    <option>Làn Vào 01 (T-IN-01)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>

                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-3 flex gap-2 mt-auto">
                  <InfoCircleOutlined className="text-slate-400 mt-0.5" />
                  <p className="text-xs text-slate-500 m-0 leading-relaxed">Việc đổi trạm sẽ yêu cầu đồng bộ lại dữ liệu LPR cục bộ.</p>
                </div>
              </div>
            </div>

            {/* Devices Config */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <SettingOutlined className="text-blue-600" />
                <h3 className="font-bold text-slate-800 m-0 text-base">Thiết bị</h3>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700 font-medium">Máy in hóa đơn</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700 font-medium">Âm thanh cảnh báo</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700 font-medium">Camera LPR</span>
                  <Switch defaultChecked />
                </div>

                <button className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs tracking-wide transition-colors mt-auto">
                  LƯU THAY ĐỔI
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
