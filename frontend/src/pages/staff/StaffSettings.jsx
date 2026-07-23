import React, { useState, useEffect } from 'react';
import { 
  SwapOutlined, 
  DownloadOutlined, 
  LoadingOutlined
} from '@ant-design/icons';
import { Modal, notification, InputNumber } from 'antd';
import { useGlobalContext } from '../../context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { apiClient } from '../../api/apiClient';

export const StaffSettings = () => {
  const { shiftStats, setShiftStats, currentUser, shiftHistory, setShiftHistory } = useGlobalContext();
  const [shiftState, setShiftState] = useState('active');

  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [declaredCash, setDeclaredCash] = useState('');
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);
  const [isHandoverProcessing, setIsHandoverProcessing] = useState(false);

  // 1. Fetch real staff users from Backend DB
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const users = await apiClient.get('/users');
        if (Array.isArray(users) && users.length > 0) {
          const staffOnly = users.map(u => ({
            name: u.fullName || u.name || u.username,
            id: u.id ? String(u.id) : u.username,
            username: u.username
          }));
          setAvailableStaff(staffOnly);
        } else {
          setAvailableStaff([
            { name: 'Lê Hoàng Phong', id: 'NV012', username: 'NV012' },
            { name: 'Trần Vũ Mai', id: 'NV008', username: 'NV008' },
            { name: 'Nguyễn Văn An', id: 'NV010', username: 'NV010' }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch staff list from DB", err);
        setAvailableStaff([
          { name: 'Lê Hoàng Phong', id: 'NV012', username: 'NV012' },
          { name: 'Trần Vũ Mai', id: 'NV008', username: 'NV008' },
          { name: 'Nguyễn Văn An', id: 'NV010', username: 'NV010' }
        ]);
      }
    };

    fetchStaffList();
  }, []);

  // 2. Fetch real shift history from Backend DB
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const shifts = await apiClient.get('/shifts');
        if (Array.isArray(shifts) && shifts.length > 0) {
          const currentStaffDisplayName = (currentUser.fullName || currentUser.name || 'Phạm Hải Đăng');
          const currentStaffCode = currentUser.username === 'staff' ? 'NV015' : (currentUser.username || 'NV015');
          const mapped = shifts.map(d => ({
            id: d.id, 
            staff: d.isCurrent ? `${currentStaffDisplayName} (${currentStaffCode})` : (d.staffName || 'Nhân viên'), 
            shift: d.shiftType || 'Ca Sáng', 
            start: d.startTime ? new Date(d.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
            end: d.endTime ? new Date(d.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
            vehicles: d.isCurrent ? (shiftStats.transactions || d.vehiclesHandled || 0) : (d.vehiclesHandled || 0), 
            status: d.isCurrent ? 'ĐANG TRỰC' : (d.status === 'COMPLETED' ? 'HOÀN THÀNH' : (d.status || 'HOÀN THÀNH')), 
            isCurrent: d.isCurrent
          }));
          setShiftHistory(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch shift history from DB", err);
      }
    };

    fetchShifts();
  }, [setShiftHistory]);

  // 3. Handover Shift Action (POST to /api/shifts/handover)
  const handleHandover = () => {
    if (!selectedStaffId) {
      notification.warning({ message: 'Vui lòng chọn nhân viên tiếp nhận', placement: 'topRight' });
      return;
    }
    const nextStaff = availableStaff.find(s => s.id === selectedStaffId || s.username === selectedStaffId);
    if (!nextStaff) return;

    const declaredCashValue = parseFloat(declaredCash) || 0;

    Modal.confirm({
      title: 'Xác nhận chuyển ca trực',
      content: `Hệ thống sẽ chốt doanh thu ca hiện tại với tiền mặt thực tế là ${declaredCashValue.toLocaleString()}đ và bàn giao cho ${nextStaff.name}. Ứng dụng sẽ đăng xuất để nhân viên mới đăng nhập. Bạn có chắc chắn?`,
      okText: 'Chuyển ca & Đăng xuất',
      cancelText: 'Hủy',
      async onOk() {
        setIsHandoverProcessing(true);
        try {
          await apiClient.post('/shifts/handover', {
            nextStaffId: nextStaff.id || nextStaff.username,
            nextStaffName: nextStaff.name,
            nextShiftType: 'Ca Sáng',
            systemRevenue: shiftStats.revenue,
            systemCash: shiftStats.cash,
            systemTransfer: shiftStats.transfer,
            declaredCash: declaredCashValue,
            vehiclesHandled: shiftStats.transactions
          });
          
          notification.success({ 
            message: 'Bàn giao ca thành công', 
            description: `Đã chốt doanh thu và bàn giao ca cho ${nextStaff.name}. Đang đăng xuất...`, 
            placement: 'topRight' 
          });

          // Refresh shifts from DB
          try {
            const shifts = await apiClient.get('/shifts');
            if (Array.isArray(shifts) && shifts.length > 0) {
              const mapped = shifts.map(d => ({
                id: d.id, 
                staff: d.staffName || 'Nhân viên', 
                shift: d.shiftType || 'Ca Sáng', 
                start: d.startTime ? new Date(d.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
                end: d.endTime ? new Date(d.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
                vehicles: d.vehiclesHandled || 0, 
                status: d.status || (d.isCurrent ? 'ĐANG TRỰC' : 'HOÀN THÀNH'), 
                isCurrent: d.isCurrent
              }));
              setShiftHistory(mapped);
            }
          } catch (e) {}

          setShiftStats({ revenue: 0, cash: 0, transfer: 0, transactions: 0 });
          setSelectedStaffId('');
          setDeclaredCash('');
          
          setTimeout(() => {
            authService.logout();
            navigate('/login');
          }, 1500);

        } catch (error) {
          console.error("Handover error:", error);
          notification.error({ message: 'Lỗi bàn giao ca', description: 'Không thể chốt bàn giao ca vào hệ thống.' });
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
    }, 1500);
  };

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shift Handover (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
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
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl col-span-2">
                  <div className="text-[11px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Tổng Doanh thu</div>
                  <div className="text-2xl font-black text-blue-800">{shiftStats.revenue.toLocaleString()}đ</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-500 mb-1 font-medium">Tiền mặt</div>
                  <div className="text-base font-bold text-slate-800">{shiftStats.cash.toLocaleString()}đ</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-500 mb-1 font-medium">Chuyển khoản</div>
                  <div className="text-base font-bold text-slate-800">{shiftStats.transfer.toLocaleString()}đ</div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 mt-2">TIỀN MẶT THỰC TẾ (TRONG KÉT)</div>
              <div className="mb-6">
                <InputNumber
                  className="w-full text-lg"
                  size="large"
                  placeholder="Nhập số tiền mặt thực tế..."
                  value={declaredCash}
                  onChange={value => setDeclaredCash(value)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                />
                {(declaredCash !== '' && declaredCash !== null) && (
                  <div className={`text-xs mt-2 font-medium ${parseFloat(declaredCash) - shiftStats.cash < 0 ? 'text-red-500' : (parseFloat(declaredCash) - shiftStats.cash > 0 ? 'text-green-600' : 'text-slate-500')}`}>
                    Chênh lệch so với hệ thống: {(parseFloat(declaredCash) - shiftStats.cash) > 0 ? '+' : ''}{(parseFloat(declaredCash) - shiftStats.cash).toLocaleString()}đ
                  </div>
                )}
              </div>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">CHỌN CA TIẾP NHẬN</div>
              <select 
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg py-3 px-3.5 text-sm text-slate-800 font-medium bg-slate-50 mb-6 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Chọn nhân viên nhận ca --</option>
                {availableStaff.filter(s => s.id !== currentUser.id && s.username !== currentUser.username).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.username || s.id})</option>
                ))}
              </select>

              <div className="mt-auto flex flex-col gap-3 pt-2">
                <button onClick={handleHandover} disabled={isHandoverProcessing || !selectedStaffId} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                  {isHandoverProcessing && <LoadingOutlined spin />} TIẾN HÀNH CHUYỂN CA
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Shift History Full Height (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          
          {/* Shift History Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg m-0">Lịch sử Ca trực</h3>
            </div>
            
            <div className="overflow-x-auto flex-1 p-2">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-50 border-b border-slate-100">
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
                    { staff: `${currentUser.name || 'Phạm Hải Đăng'} (${currentUser.username || 'NV015'})`, shift: 'Ca Sáng', start: '06:00', end: '--:--', vehicles: shiftStats.transactions || 0, status: 'ĐANG TRỰC', isCurrent: true },
                    { staff: 'Lê Hoàng Phong (NV012)', shift: 'Ca Đêm', start: '22:00', end: '06:00', vehicles: 42, status: 'HOÀN THÀNH', isCurrent: false },
                    { staff: 'Trần Vũ Mai (NV008)', shift: 'Ca Chiều', start: '14:00', end: '22:00', vehicles: 318, status: 'HOÀN THÀNH', isCurrent: false }
                  ]).map((sh, i) => (
                    <tr key={i} className={`hover:bg-slate-50 transition-colors ${sh.isCurrent ? 'bg-blue-50/30 font-semibold' : ''}`}>
                      <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">{sh.staff}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{sh.shift}</td>
                      <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">{sh.start}</td>
                      <td className={`px-5 py-4 font-mono text-xs whitespace-nowrap ${sh.end === '--:--' ? 'text-slate-400' : ''}`}>{sh.end}</td>
                      <td className="px-5 py-4 font-medium whitespace-nowrap">{sh.vehicles}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {sh.status === 'ĐANG TRỰC' ? (
                          <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-200">ĐANG TRỰC</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">HOÀN THÀNH</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
