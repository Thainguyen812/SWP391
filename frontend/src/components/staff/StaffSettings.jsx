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

  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHandoverProcessing, setIsHandoverProcessing] = useState(false);

  const allChecked = checks.printer && checks.camera && checks.gate;

  const handleTakeover = () => {
    if (!selectedStaffId) {
      notification.warning({ message: 'Vui lòng chọn nhân viên tiếp nhận', placement: 'topRight' });
      return;
    }
    const nextStaff = availableStaff.find(s => s.id === selectedStaffId);

    Modal.confirm({
      title: 'Xác nhận tiếp nhận ca',
      content: `Bạn (${nextStaff.name}) xác nhận đã kiểm tra đủ thiết bị và tiền mặt để tiếp nhận ca trực này?`,
      okText: 'Tiếp nhận',
      cancelText: 'Hủy',
      onOk() {
        setIsHandoverProcessing(true);
        return new Promise(resolve => {
          setTimeout(() => {
            setIsHandoverProcessing(false);
            setShiftState('active');
            setCurrentUser({...nextStaff, shift: 'Sáng', station: "Làn Ra 02 (T-OUT-02)"});
            setShiftHistory(prev => [
              { id: Date.now(), staff: nextStaff.name, shift: 'Sáng', start: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), end: '--:--', vehicles: 0, status: 'ĐANG TRỰC', isCurrent: true },
              ...prev.map(sh => ({...sh, isCurrent: false}))
            ]);
            setShiftStats({ revenue: 0, cash: 0, transfer: 0, transactions: 0 });
            setChecks({ printer: false, camera: false, gate: false });
            setSelectedStaffId('');
            notification.success({ message: 'Tiếp nhận ca thành công', description: `Ca trực mới đã bắt đầu cho ${nextStaff.name}.`, placement: 'topRight' });
            resolve();
          }, 1500);
        });
      }
    });
  };

  const handleHandover = () => {
    Modal.confirm({
      title: 'Xác nhận bàn giao ca',
      content: 'Hệ thống sẽ chốt doanh thu và in báo cáo bàn giao. Bạn có chắc chắn?',
      okText: 'Bàn giao & In',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        setShiftState('handed_over');
        setShiftHistory(prev => {
          const newHistory = [...prev];
          if (newHistory.length > 0 && newHistory[0].status === 'ĐANG TRỰC') {
            newHistory[0].status = 'HOÀN THÀNH';
            newHistory[0].end = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            newHistory[0].vehicles = shiftStats.transactions;
            newHistory[0].isCurrent = false;
          }
          return newHistory;
        });
        notification.success({ message: 'Bàn giao thành công', description: 'Đang in báo cáo chốt ca... Vui lòng chọn nhân viên tiếp nhận.', placement: 'topRight' });
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
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${shiftState === 'handed_over' ? 'text-amber-500' : 'text-blue-600'}`}>
                {shiftState === 'handed_over' ? 'CHỜ TIẾP NHẬN' : 'ĐANG TRỰC CA'}
              </div>
              <h3 className="text-lg font-bold text-slate-800 m-0 leading-tight">{shiftState === 'handed_over' ? '---' : currentUser.name}</h3>
              <div className="text-xs text-slate-500 mt-1">Mã NV: {shiftState === 'handed_over' ? '---' : currentUser.id} • Trạm: T-OUT-02</div>
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
                  <div className="text-lg font-bold text-slate-800">{shiftStats.revenue.toLocaleString()}đ</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Tiền mặt</div>
                  <div className="text-lg font-bold text-slate-800">{shiftStats.cash.toLocaleString()}đ</div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">NHÂN VIÊN TIẾP NHẬN</div>
              <select 
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                disabled={shiftState !== 'handed_over'}
                className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-800 font-medium bg-slate-50 mb-6 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">-- Chọn nhân viên mới --</option>
                {availableStaff.filter(s => s.id !== currentUser.id).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">KIỂM TRA THIẾT BỊ (NHÂN VIÊN MỚI)</div>
              <div className="flex flex-col gap-3 mb-8">
                <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setChecks(p => ({...p, printer: !p.printer})); }}>
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${checks.printer ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 group-hover:border-blue-500'}`}>
                    {checks.printer && <CheckOutlined className="text-[10px]" />}
                  </div>
                  <span className="text-sm text-slate-700">Máy in hoạt động tốt</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setChecks(p => ({...p, camera: !p.camera})); }}>
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${checks.camera ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 group-hover:border-blue-500'}`}>
                    {checks.camera && <CheckOutlined className="text-[10px]" />}
                  </div>
                  <span className="text-sm text-slate-700">Camera LPR rõ nét</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setChecks(p => ({...p, gate: !p.gate})); }}>
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${checks.gate ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 group-hover:border-blue-500'}`}>
                    {checks.gate && <CheckOutlined className="text-[10px]" />}
                  </div>
                  <span className="text-sm text-slate-700">Cổng chắn (Gate) ổn định</span>
                </label>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button onClick={handleTakeover} disabled={isHandoverProcessing || !allChecked || shiftState === 'active'} className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-xs tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isHandoverProcessing && <LoadingOutlined spin />} TIẾP NHẬN CA (NV MỚI)
                </button>
                <button onClick={handleHandover} disabled={shiftState === 'handed_over'} className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-lg text-xs tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
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
              <button onClick={handleExport} disabled={isExporting} className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50">
                {isExporting ? <LoadingOutlined spin /> : <DownloadOutlined />} XUẤT BÁO CÁO
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
                  {shiftHistory.map((sh, i) => (
                    <tr key={i} className={`hover:bg-slate-50 transition-colors ${sh.isCurrent ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-5 py-4 font-bold text-slate-800">{sh.staff}</td>
                      <td className="px-5 py-4">{sh.shift}</td>
                      <td className="px-5 py-4 font-mono text-xs">{sh.start}</td>
                      <td className={`px-5 py-4 font-mono text-xs ${sh.end === '--:--' ? 'text-slate-400' : ''}`}>{sh.end}</td>
                      <td className="px-5 py-4 font-medium">{sh.vehicles}</td>
                      <td className="px-5 py-4">
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

                <button onClick={handleSaveConfig} disabled={isSaving} className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs tracking-wide transition-colors mt-auto flex items-center justify-center gap-2 disabled:opacity-70">
                  {isSaving && <LoadingOutlined spin />} LƯU THAY ĐỔI
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
