import React, { useState } from 'react';
import { 
  SwapOutlined, 
  DownloadOutlined, 
  DesktopOutlined, 
  SettingOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Switch, Modal, notification, Spin } from 'antd'; // Using antd for components
import { useGlobalContext } from '../../context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import apiClient from '../../api/apiClient';

export const StaffSettings = () => {
  const { shiftStats, setShiftStats, currentUser, setCurrentUser, shiftHistory, setShiftHistory } = useGlobalContext();
  const [shiftState, setShiftState] = useState('active'); // 'active', 'handed_over'
  const [checks, setChecks] = useState({ printer: false, camera: false, gate: false });
  
  const availableStaff = [
    { name: 'Nguyễn Văn A', id: 'NV-1042', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Trần Thị B', id: 'NV-1088', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Lê Hoàng C', id: 'NV-1102', avatar: 'https://randomuser.me/api/portraits/men/65.jpg' },
  ];
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [declaredCash, setDeclaredCash] = useState('');
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHandoverProcessing, setIsHandoverProcessing] = useState(false);

  const allChecked = checks.printer && checks.camera && checks.gate;

  const handleHandover = () => {
    if (!selectedStaffId) {
      notification.warning({ message: 'Vui lòng chọn nhân viên tiếp nhận', placement: 'topRight' });
      return;
    }
    const nextStaff = availableStaff.find(s => s.id === selectedStaffId);
    const declaredCashValue = parseFloat(declaredCash) || 0;

    Modal.confirm({
      title: 'Xác nhận chuyển ca trực',
      content: `Hệ thống sẽ chốt doanh thu ca hiện tại với tiền mặt thực tế là ${declaredCashValue.toLocaleString()}đ và bàn giao cho ${nextStaff.name}. Ứng dụng sẽ đăng xuất để nhân viên mới đăng nhập. Bạn có chắc chắn?`,
      okText: 'Chuyển ca & Đăng xuất',
      cancelText: 'Hủy',
      async onOk() {
        setIsHandoverProcessing(true);
        try {
          await apiClient.post('/v1/parking/shifts/handover', {
            nextStaffId: nextStaff.id,
            nextStaffName: nextStaff.name,
            nextShiftType: 'Ca Sáng', // Example
            systemRevenue: shiftStats.revenue,
            systemCash: shiftStats.cash,
            systemTransfer: shiftStats.transfer,
            declaredCash: declaredCashValue,
            vehiclesHandled: shiftStats.transactions
          });
          
          notification.success({ 
            message: 'Bàn giao ca thành công', 
            description: `Đã chốt doanh thu cho ${nextStaff.name}. Đang đăng xuất...`, 
            placement: 'topRight' 
          });

          // Reset everything and logout
          setShiftStats({ revenue: 0, cash: 0, transfer: 0, transactions: 0 });
          setSelectedStaffId('');
          setDeclaredCash('');
          
          setTimeout(() => {
            authService.logout();
            navigate('/login');
          }, 1500);

        } catch (error) {
          notification.error({ message: 'Lỗi bàn giao ca', description: 'Không thể kết nối đến máy chủ.' });
        } finally {
          setIsHandoverProcessing(false);
        }
      }
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      notification.success({ message: 'Xuất báo cáo thành công', description: 'File excel đã được tải xuống.' });
    }, 2000);
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      notification.success({ message: 'Lưu cấu hình thành công', description: 'Các cài đặt thiết bị đã được cập nhật.' });
    }, 1000);
  };
  return (
    <div className="p-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shift Handover */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active User Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 shadow-sm border border-slate-100">
              <img src={(currentUser.username === 'staff' || currentUser.name === 'Operations Staff') ? 'https://i.pravatar.cc/150?img=11' : (currentUser.avatar || 'https://i.pravatar.cc/150?img=11')} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${shiftState === 'handed_over' ? 'text-amber-500' : 'text-blue-600'}`}>
                {shiftState === 'handed_over' ? 'CHỜ TIẾP NHẬN' : 'ĐANG TRỰC CA'}
              </div>
              <h3 className="text-lg font-bold text-slate-800 m-0 leading-tight">
                {shiftState === 'handed_over' ? '---' : ((currentUser.name === 'Operations Staff' || currentUser.fullName === 'Operations Staff' || !currentUser.name) ? 'Phạm Hải Đăng' : (currentUser.fullName || currentUser.name))}
              </h3>
              <div className="text-xs text-slate-500 mt-1">Mã NV: {shiftState === 'handed_over' ? '---' : (currentUser.username === 'staff' ? 'NV015' : (currentUser.username || (currentUser.id ? currentUser.id.substring(0,8).toUpperCase() : '---')))} • Trạm: T-OUT-02</div>
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
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg col-span-2">
                  <div className="text-[11px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Tổng Doanh thu</div>
                  <div className="text-xl font-black text-blue-800">{shiftStats.revenue.toLocaleString()}đ</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div className="text-[11px] text-slate-500 mb-1">Tiền mặt</div>
                  <div className="text-sm font-bold text-slate-800">{shiftStats.cash.toLocaleString()}đ</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div className="text-[11px] text-slate-500 mb-1">Chuyển khoản</div>
                  <div className="text-sm font-bold text-slate-800">{shiftStats.transfer.toLocaleString()}đ</div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 mt-4">TIỀN MẶT THỰC TẾ (TRONG KÉT)</div>
              <input 
                type="number" 
                placeholder="Nhập số tiền mặt thực tế..."
                value={declaredCash}
                onChange={e => setDeclaredCash(e.target.value)}
                className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 font-medium bg-slate-50 mb-6 focus:outline-none focus:border-blue-500"
              />

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">CHỌN CA TIẾP NHẬN</div>
              <select 
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 font-medium bg-slate-50 mb-6 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Chọn nhân viên nhận ca --</option>
                {availableStaff.filter(s => s.id !== currentUser.id).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>

              <div className="mt-auto flex flex-col gap-3">
                <button onClick={handleHandover} disabled={isHandoverProcessing || !selectedStaffId} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                  {isHandoverProcessing && <LoadingOutlined spin />} TIẾN HÀNH CHUYỂN CA
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
              <button onClick={handleExport} disabled={isExporting} className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50">
                {isExporting ? <LoadingOutlined spin /> : <DownloadOutlined />} XUẤT BÁO CÁO
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 font-bold whitespace-nowrap">NHÂN VIÊN</th>
                    <th className="px-5 py-4 font-bold whitespace-nowrap">CA</th>
                    <th className="px-5 py-4 font-bold whitespace-nowrap">BẮT ĐẦU</th>
                    <th className="px-5 py-4 font-bold whitespace-nowrap">KẾT THÚC</th>
                    <th className="px-5 py-4 font-bold whitespace-nowrap">SỐ XE</th>
                    <th className="px-5 py-4 font-bold whitespace-nowrap">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(shiftHistory && shiftHistory.length > 0 ? shiftHistory : [
                    { staff: `${currentUser.name || 'Phạm Hải Đăng'} (${currentUser.username || 'NV015'})`, shift: 'Ca Sáng', start: '06:00', end: '--:--', vehicles: 156, status: 'ĐANG TRỰC', isCurrent: true },
                    { staff: 'Lê Hoàng Phong (NV012)', shift: 'Ca Đêm', start: '22:00', end: '06:00', vehicles: 42, status: 'HOÀN THÀNH', isCurrent: false },
                    { staff: 'Trần Vũ Mai (NV008)', shift: 'Ca Chiều', start: '14:00', end: '22:00', vehicles: 318, status: 'HOÀN THÀNH', isCurrent: false }
                  ]).map((sh, i) => (
                    <tr key={i} className={`hover:bg-slate-50 transition-colors ${sh.isCurrent ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">{sh.staff}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{sh.shift}</td>
                      <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">{sh.start}</td>
                      <td className={`px-5 py-4 font-mono text-xs whitespace-nowrap ${sh.end === '--:--' ? 'text-slate-400' : ''}`}>{sh.end}</td>
                      <td className="px-5 py-4 font-medium whitespace-nowrap">{sh.vehicles}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {sh.status === 'ĐANG TRỰC' ? (
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">ĐANG TRỰC</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">HOÀN THÀNH</span>
                        )}
                      </td>
                    </tr>
                  ))}
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
                    <option>Làn Vào 01 (T-IN-01)</option>
                    <option>Làn Vào 02 (T-IN-02)</option>
                    <option>Làn Vào 03 (T-IN-03)</option>
                    <option>Làn Ra 01 (T-OUT-01)</option>
                    <option>Làn Ra 02 (T-OUT-02)</option>
                    <option>Làn Ra 03 (T-OUT-03)</option>
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

                <div className="mt-auto flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      notification.info({ message: 'Đang kiểm tra...', description: 'Đang gửi tín hiệu kiểm tra đến các thiết bị.' });
                      setTimeout(() => notification.success({ message: 'Kiểm tra thành công', description: 'Máy in, Loa và Camera đang hoạt động tốt!' }), 1500);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors flex justify-center items-center gap-2"
                  >
                    <InfoCircleOutlined /> KIỂM TRA HỆ THỐNG
                  </button>
                  <button onClick={handleSaveConfig} disabled={isSaving} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                    {isSaving && <LoadingOutlined spin />} LƯU THAY ĐỔI
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
