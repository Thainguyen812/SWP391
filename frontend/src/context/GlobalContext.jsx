import React, { createContext, useState, useContext, useEffect } from 'react';
import { WalletOutlined, CheckCircleFilled, CreditCardOutlined } from '@ant-design/icons';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");
  const [activeLocation, setActiveLocation] = useState("toan-he-thong");

  // User and Shift Tracking
  const [currentUser, setCurrentUser] = useState({
    name: "Trần Thị B",
    id: "NV-1088",
    station: "Làn Ra 02 (T-OUT-02)",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    shift: "Chiều"
  });

  const [shiftHistory, setShiftHistory] = useState([
    { id: 1, staff: "Trần Thị B", shift: "Chiều", start: "13:44", end: "--:--", vehicles: 0, status: "ĐANG TRỰC", isCurrent: true },
    { id: 2, staff: "Nguyễn Văn A", shift: "Sáng", start: "06:00", end: "13:44", vehicles: 452, status: "HOÀN THÀNH", isCurrent: false },
    { id: 3, staff: "Trần Thị B", shift: "Đêm", start: "22:00", end: "06:00", vehicles: 318, status: "HOÀN THÀNH", isCurrent: false }
  ]);

  // Fetch from backend on load
  useEffect(() => {
    import('../services/shiftService').then(module => {
      module.shiftService.getShifts().then(data => {
        if (data && data.length > 0) {
          // Map backend entities to UI state
          const mapped = data.map(d => ({
            id: d.id, staff: d.staffName, shift: d.shiftType, 
            start: new Date(d.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            end: d.endTime ? new Date(d.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
            vehicles: d.vehiclesHandled || 0, status: d.status, isCurrent: d.isCurrent
          }));
          setShiftHistory(mapped);
        }
      });
    });
  }, []);

  // 1. Transactions State
  const [transactions, setTransactions] = useState([
    { id: "#TRX-8829", plate: "29A-123.45", type: "car", inTime: "08:15", inDate: "24/05", outTime: "10:30", outDate: "24/05", duration: "2h 15m", amount: "45,000 đ", paymentMethod: "Ví UrbanPark", paymentIcon: <WalletOutlined className="text-blue-600" />, status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700", hasError: false },
    { id: "#TRX-8830", plate: "51G-999.01", type: "moto", inTime: "09:00", inDate: "24/05", outTime: "--:--", outDate: "", duration: "Đang đỗ", amount: "0 đ", paymentMethod: "Tiền mặt", paymentIcon: <WalletOutlined className="text-slate-600" />, status: "Đang xử lý", statusColor: "bg-slate-100 text-slate-600", hasError: false },
    { id: "#TRX-8831", plate: "30H-556.78", type: "car", inTime: "07:45", inDate: "24/05", outTime: "09:15", outDate: "24/05", duration: "1h 30m", amount: "30,000 đ", paymentMethod: "Thẻ VIP", paymentIcon: <CheckCircleFilled className="text-slate-800" />, status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700", hasError: false },
    { id: "#TRX-8832", plate: "15A-888.88", type: "car", inTime: "10:00", inDate: "24/05", outTime: "10:15", outDate: "24/05", duration: "15m", amount: "15,000 đ", paymentMethod: "Thẻ NH", paymentIcon: <CreditCardOutlined className="text-blue-500" />, status: "Thất bại", statusColor: "bg-red-100 text-red-600", hasError: true }
  ]);

  const addTransaction = (newTx) => setTransactions(prev => [newTx, ...prev]);

  // 2. Activity Logs State
  const [activityLogs, setActivityLogs] = useState([
    { plate: "30G-123.45", model: "Hyundai Tucson", type: "VÉ THÁNG", gate: "Làn vào 1 - Cửa A", action: "Chặn Tự động", time: "Vừa xong", status: "Chưa Xử Lý", typeColor: "text-blue-600", statusColor: "bg-red-100 text-red-600", actionColor: "text-red-500" },
    { plate: "51H-987.65", model: "VinFast VF8", type: "VÉ NGÀY", gate: "Làn ra 2 - Cửa B", action: "Ra bãi", time: "2 phút trước", status: "Thành Công", typeColor: "text-orange-600", statusColor: "bg-emerald-100 text-emerald-700", actionColor: "text-slate-500" },
    { plate: "29A-111.22", model: "Kia Morning", type: "VÉ THÁNG", gate: "Làn vào 1 - Cửa A", action: "Vào bãi", time: "5 phút trước", status: "Thành Công", typeColor: "text-blue-600", statusColor: "bg-emerald-100 text-emerald-700", actionColor: "text-slate-500" },
    { plate: "88C-555.55", model: "Ford Ranger", type: "VIP", gate: "Làn VIP - Cửa A", action: "Vào bãi", time: "10 phút trước", status: "Thành Công", typeColor: "text-purple-600", statusColor: "bg-emerald-100 text-emerald-700", actionColor: "text-slate-500" },
    { plate: "30F-999.99", model: "Mazda CX-5", type: "VÉ NGÀY", gate: "Làn vào 2 - Cửa A", action: "Lỗi Thẻ", time: "15 phút trước", status: "Cần Hỗ Trợ", typeColor: "text-orange-600", statusColor: "bg-orange-100 text-orange-600", actionColor: "text-orange-500" }
  ]);

  const addActivityLog = (newLog) => setActivityLogs(prev => [newLog, ...prev]);

  // 3. Security Alerts State
  const [securityAlerts, setSecurityAlerts] = useState([
    { id: 'blacklist', type: 'BIỂN SỐ ĐEN', plate: '30G-123.45', reason: 'Nghi phạm trộm cắp', time: 'Vừa xong' },
    { id: 'wrong_zone', type: 'PHÁT HIỆN SAI KHU VỰC', plate: '29C-445.11', reason: 'Xe tải hạng nhẹ (Không có đặc quyền VIP)', time: '15 phút trước' },
    { id: 'alarm', type: 'KÍCH HOẠT CHỐNG TRỘM', plate: '51H-889.02', reason: 'Phát hiện chấn động mạnh và âm thanh báo động', time: '2 phút trước' }
  ]);

  const addSecurityAlert = (newAlert) => setSecurityAlerts(prev => [newAlert, ...prev]);
  const removeSecurityAlert = (id) => setSecurityAlerts(prev => prev.filter(alert => alert.id !== id));
  const restoreSecurityAlerts = () => setSecurityAlerts([
    { id: 'blacklist', type: 'BIỂN SỐ ĐEN', plate: '30G-123.45', reason: 'Nghi phạm trộm cắp', time: 'Vừa xong' },
    { id: 'wrong_zone', type: 'PHÁT HIỆN SAI KHU VỰC', plate: '29C-445.11', reason: 'Xe tải hạng nhẹ (Không có đặc quyền VIP)', time: '15 phút trước' },
    { id: 'alarm', type: 'KÍCH HOẠT CHỐNG TRỘM', plate: '51H-889.02', reason: 'Phát hiện chấn động mạnh và âm thanh báo động', time: '2 phút trước' }
  ]);

  // 4. Shift Stats
  const [shiftStats, setShiftStats] = useState({
    revenue: 12450000,
    cash: 5200000,
    transfer: 7250000,
    transactions: 482
  });
  
  const [dailyVolume, setDailyVolume] = useState(1284);

  const updateShiftStats = (amount, isCash = true) => {
    setShiftStats(prev => ({
      ...prev,
      revenue: prev.revenue + amount,
      cash: isCash ? prev.cash + amount : prev.cash,
      transfer: !isCash ? prev.transfer + amount : prev.transfer,
      transactions: prev.transactions + 1
    }));
  };
  // 5. Active Vehicles (Live Feed) & Current Selected Vehicle
  const [activeVehicles, setActiveVehicles] = useState([
    { id: 1, plate: "51A-123.45", type: "Vãng lai", confidence: "98.4%", status: "Hợp lệ", gate: "Cổng vào 1", inTime: "08:15", outTime: "--:--", image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80", model: "Kia Morning", duration: "Đang vào" },
    { id: 2, plate: "72C-889.01", type: "VIP", confidence: "99.1%", status: "Hợp lệ", gate: "Cổng ra 1", inTime: "07:00", outTime: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}), image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80", model: "Fiat 500", duration: "3h 15m" },
    { id: 3, plate: "30E-555.55", type: "Vé tháng", confidence: "97.5%", status: "Lỗi thẻ", gate: "Cổng ra VIP", inTime: "09:30", outTime: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}), image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80", model: "Mazda 3", duration: "1h 45m" },
    { id: 4, plate: "51K-443.21", type: "Vãng lai", confidence: "95.2%", status: "Chờ thanh toán", gate: "Cổng ra Khách", inTime: "08:00", outTime: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}), image: "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=600&q=80", model: "Tesla Model Y", duration: "3h 30m" },
    { id: 5, plate: "99A-999.99", type: "Biển đen", confidence: "99.9%", status: "Cảnh báo", gate: "Cổng vào 2", inTime: "Vừa xong", outTime: "--:--", image: "", model: "Toyota Vios", duration: "0m" }
  ]);
  const [currentVehicle, setCurrentVehicle] = useState(activeVehicles[0]);

  const removeActiveVehicle = (plate) => {
    setActiveVehicles(prev => prev.filter(v => v.plate !== plate));
    if (currentVehicle?.plate === plate) {
      setCurrentVehicle(null);
    }
  };

  const addActiveVehicle = (newVehicle) => {
    setActiveVehicles(prev => {
      // Check if already exists to prevent duplicates
      if (prev.find(v => v.plate === newVehicle.plate)) return prev;
      return [newVehicle, ...prev];
    });
  };

  return (
    <GlobalContext.Provider value={{ 
      searchValue, setSearchValue, activeLocation, setActiveLocation,
      currentUser, setCurrentUser, shiftHistory, setShiftHistory,
      transactions, addTransaction,
      activityLogs, addActivityLog,
      securityAlerts, addSecurityAlert, removeSecurityAlert, restoreSecurityAlerts,
      shiftStats, updateShiftStats, setShiftStats,
      dailyVolume, setDailyVolume,
      activeVehicles, currentVehicle, setCurrentVehicle, removeActiveVehicle, addActiveVehicle
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
