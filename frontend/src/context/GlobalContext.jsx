import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { WalletOutlined, CheckCircleFilled, CreditCardOutlined } from '@ant-design/icons';
import { apiClient } from '../api/apiClient';

const GlobalContext = createContext();

// ---------------------------------------------------------
// MOCK DATA FALLBACKS (Moved outside to keep component clean)
// ---------------------------------------------------------
const FALLBACK_TRANSACTIONS = [
  { id: "#TRX-8829", plate: "29A-123.45", type: "car", inTime: "08:15", outTime: "10:30", amount: "45,000 đ", paymentMethod: "Ví UrbanPark", status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700" }
];
const FALLBACK_LOGS = [
  { plate: "30G-123.45", model: "Hyundai Tucson", type: "VÉ THÁNG", gate: "Làn vào 1 - Cửa A", action: "Chặn Tự động", time: "Vừa xong", status: "Chưa Xử Lý", typeColor: "text-blue-600", statusColor: "bg-red-100 text-red-600", actionColor: "text-red-500", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" }
];
const FALLBACK_VEHICLES = [
  { id: 1, plate: "51A-123.45", type: "Vãng lai", confidence: "98.4%", status: "Hợp lệ", gate: "Cổng vào 1", inTime: "08:15", outTime: "--:--", image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80", model: "Kia Morning", duration: "Đang vào" },
  { id: 2, plate: "29C-445.11", type: "Vãng lai", confidence: "95.2%", status: "Chờ thanh toán", gate: "Cổng ra 1", inTime: "07:30", outTime: "08:22", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80", model: "Ford Ranger", duration: "52 phút" },
  { id: 3, plate: "30G-123.45", type: "VIP", confidence: "99.1%", status: "Hợp lệ", gate: "Cổng vào 2", inTime: "08:20", outTime: "--:--", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80", model: "Hyundai Tucson", duration: "Đang vào" },
  { id: 4, plate: "15B-008.88", type: "Vé tháng", confidence: "92.0%", status: "Lỗi thẻ", gate: "Cổng ra 2", inTime: "06:15", outTime: "08:25", image: "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=600&q=80", model: "Toyota Innova", duration: "2 giờ 10 phút" }
];
const FALLBACK_SECURITY_ALERTS = [
  { id: 'blacklist', type: 'BIỂN SỐ ĐEN', plate: '30G-123.45', reason: 'Nghi phạm trộm cắp', time: 'Vừa xong' },
  { id: 'wrong_zone', type: 'PHÁT HIỆN SAI KHU VỰC', plate: '29C-445.11', reason: 'Xe tải hạng nhẹ (Không có đặc quyền VIP)', time: '15 phút trước' },
  { id: 'alarm', type: 'KÍCH HOẠT CHỐNG TRỘM', plate: '51H-889.02', reason: 'Phát hiện chấn động mạnh và âm thanh báo động', time: '2 phút trước' }
];
const FALLBACK_CURRENT_USER = {
  name: "Trần Thị B",
  id: "NV-1088",
  station: "Làn Ra 02 (T-OUT-02)",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  shift: "Chiều"
};
const FALLBACK_SHIFT_HISTORY = [
  { id: 1, staff: "Trần Thị B", shift: "Chiều", start: "13:44", end: "--:--", vehicles: 0, status: "ĐANG TRỰC", isCurrent: true },
  { id: 2, staff: "Nguyễn Văn A", shift: "Sáng", start: "06:00", end: "13:44", vehicles: 452, status: "HOÀN THÀNH", isCurrent: false },
  { id: 3, staff: "Trần Thị B", shift: "Đêm", start: "22:00", end: "06:00", vehicles: 318, status: "HOÀN THÀNH", isCurrent: false }
];
const FALLBACK_SHIFT_STATS = {
  revenue: 12450000,
  cash: 5200000,
  transfer: 7250000,
  transactions: 482
};
const FALLBACK_DAILY_VOLUME = 1284;

export const GlobalProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");
  const [useMockData, setUseMockData] = useState(false); // Default to Real Data
  const [totalGates, setTotalGates] = useState(6);
  const [activeLocation, setActiveLocation] = useState("toan-he-thong");

  // User and Shift Tracking (Initially Empty/Loading)
  const [currentUser, setCurrentUser] = useState({ name: "Đang tải...", id: "", station: "", avatar: "", shift: "" });
  const [shiftHistory, setShiftHistory] = useState([]);

  // Data States (Initially Empty)
  const [transactions, setTransactions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  
  // Security Alerts & Stats (Initially Empty)
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [shiftStats, setShiftStats] = useState({ revenue: 0, cash: 0, transfer: 0, transactions: 0 });
  const [dailyVolume, setDailyVolume] = useState(0);

  // CENTRALIZED FETCH FUNCTION
  const fetchAllDataFromBackend = useCallback(async () => {
    if (useMockData) {
      setTransactions(FALLBACK_TRANSACTIONS);
      setActivityLogs(FALLBACK_LOGS);
      setActiveVehicles(FALLBACK_VEHICLES);
      setSecurityAlerts(FALLBACK_SECURITY_ALERTS);
      setShiftStats(FALLBACK_SHIFT_STATS);
      setDailyVolume(FALLBACK_DAILY_VOLUME);
      setCurrentUser(FALLBACK_CURRENT_USER);
      setShiftHistory(FALLBACK_SHIFT_HISTORY);
      return;
    }

    try {
      // 1. Fetch Logs
      const logsData = await apiClient.get('/logs');
      if (logsData && logsData.items && logsData.items.length > 0) {
        setActivityLogs(logsData.items);
      } else {
        setActivityLogs([]); // Empty data is fine, do not fallback
      }

      // 2. Fetch Transactions
      const txnData = await apiClient.get('/revenue/transactions');
      if (txnData && txnData.items && txnData.items.length > 0) {
        setTransactions(txnData.items);
      } else {
        setTransactions([]);
      }
      
      // 3. Fetch Shifts
      import('../services/shiftService').then(module => {
        module.shiftService.getShifts().then(data => {
          if (data && data.length > 0) {
            const mapped = data.map(d => ({
              id: d.id, staff: d.staffName, shift: d.shiftType, 
              start: new Date(d.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              end: d.endTime ? new Date(d.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
              vehicles: d.vehiclesHandled || 0, status: d.status, isCurrent: d.isCurrent
            }));
            setShiftHistory(mapped);
          } else {
            setShiftHistory(FALLBACK_SHIFT_HISTORY);
          }
        }).catch(() => setShiftHistory(FALLBACK_SHIFT_HISTORY));
      });

      // 4. Fetch Active Vehicles (Sessions without checkout)
      try {
        const sessionData = await apiClient.get('/sessions');
        
        let dataArray = [];
        if (Array.isArray(sessionData)) {
          dataArray = sessionData;
        } else if (sessionData && Array.isArray(sessionData.content)) {
          dataArray = sessionData.content;
        } else if (sessionData && Array.isArray(sessionData.items)) {
          dataArray = sessionData.items;
        } else if (sessionData && Array.isArray(sessionData.data)) {
          dataArray = sessionData.data;
        }

        if (dataArray && dataArray.length >= 0) {
          const active = dataArray
            .filter(s => s.sessionStatus === 'ACTIVE')
            .map((session, index) => ({
              id: session.id,
              plate: session.licensePlate || "Không rõ",
              type: session.isVip ? "VIP" : "Vãng lai",
              confidence: "99%",
              status: session.isSuspicious ? "Cảnh báo" : "Hợp lệ",
              gate: session.entryGate || `Cổng vào ${index + 1}`,
              inTime: session.checkInTime ? new Date(session.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
              outTime: "--:--",
              image: session.frontImage || "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80",
              model: session.vehicleModel || session.vehicleBrand || "Chưa xác định",
              duration: "Đang vào"
            }));
          setActiveVehicles(active);
        } else {
          console.error("sessionData does not contain an array:", sessionData);
          setActiveVehicles([]);
        }
        
      } catch (e) {
        console.error("Failed to fetch sessions for active vehicles", e);
        setActiveVehicles([]);
      } 
      setSecurityAlerts(FALLBACK_SECURITY_ALERTS);
      setShiftStats(FALLBACK_SHIFT_STATS);
      setDailyVolume(FALLBACK_DAILY_VOLUME);
      setCurrentUser(FALLBACK_CURRENT_USER);

    } catch (error) {
      console.error("Failed to fetch backend data, using mock data", error);
      setTransactions(FALLBACK_TRANSACTIONS);
      setActivityLogs(FALLBACK_LOGS);
      setActiveVehicles(FALLBACK_VEHICLES);
      setSecurityAlerts(FALLBACK_SECURITY_ALERTS);
      setShiftStats(FALLBACK_SHIFT_STATS);
      setDailyVolume(FALLBACK_DAILY_VOLUME);
      setCurrentUser(FALLBACK_CURRENT_USER);
      setShiftHistory(FALLBACK_SHIFT_HISTORY);
    }
  }, [useMockData]);

  // Use fetchAllDataFromBackend in useEffect
  useEffect(() => {
    fetchAllDataFromBackend();
  }, [fetchAllDataFromBackend]);

  // Actions
  const addTransaction = (newTx) => setTransactions(prev => [newTx, ...prev]);
  const addActivityLog = (newLog) => setActivityLogs(prev => [newLog, ...prev]);
  const addSecurityAlert = (newAlert) => setSecurityAlerts(prev => [newAlert, ...prev]);
  const removeSecurityAlert = (id) => setSecurityAlerts(prev => prev.filter(alert => alert.id !== id));
  const restoreSecurityAlerts = () => setSecurityAlerts(FALLBACK_SECURITY_ALERTS);

  const updateShiftStats = (amount, isCash = true) => {
    setShiftStats(prev => ({
      ...prev,
      revenue: prev.revenue + amount,
      cash: isCash ? prev.cash + amount : prev.cash,
      transfer: !isCash ? prev.transfer + amount : prev.transfer,
      transactions: prev.transactions + 1
    }));
  };

  const removeActiveVehicle = (plate) => {
    setActiveVehicles(prev => prev.filter(v => v.plate !== plate));
    if (currentVehicle?.plate === plate) {
      setCurrentVehicle(null);
    }
  };

  const addActiveVehicle = (newVehicle) => {
    setActiveVehicles(prev => {
      if (prev.find(v => v.plate === newVehicle.plate)) return prev;
      return [newVehicle, ...prev];
    });
  };

  return (
    <GlobalContext.Provider value={{ 
      searchValue, setSearchValue, activeLocation, setActiveLocation, totalGates, setTotalGates,
      useMockData, setUseMockData,
      currentUser, setCurrentUser, shiftHistory, setShiftHistory,
      transactions, addTransaction,
      activityLogs, addActivityLog,
      securityAlerts, addSecurityAlert, removeSecurityAlert, restoreSecurityAlerts,
      shiftStats, updateShiftStats, setShiftStats,
      dailyVolume, setDailyVolume,
      activeVehicles, currentVehicle, setCurrentVehicle, removeActiveVehicle, addActiveVehicle,
      fetchAllDataFromBackend
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);