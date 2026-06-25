import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { WalletOutlined, CheckCircleFilled, CreditCardOutlined } from '@ant-design/icons';
import { apiClient } from '../api/apiClient';

const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

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

  // MOCK DATA FALLBACKS
  const FALLBACK_TRANSACTIONS = [
    { id: "#TRX-8829", plate: "29A-123.45", type: "car", inTime: "08:15", outTime: "10:30", amount: "45,000 đ", paymentMethod: "Ví UrbanPark", status: "Thành công", statusColor: "bg-emerald-100 text-emerald-700" }
  ];
  const FALLBACK_LOGS = [
    { plate: "30G-123.45", model: "Hyundai Tucson", type: "VÉ THÁNG", gate: "Làn vào 1 - Cửa A", action: "Chặn Tự động", time: "Vừa xong", status: "Chưa Xử Lý", typeColor: "text-blue-600", statusColor: "bg-red-100 text-red-600", actionColor: "text-red-500" }
  ];
  const FALLBACK_VEHICLES = [
    { id: 1, plate: "51A-123.45", type: "Vãng lai", confidence: "98.4%", status: "Hợp lệ", gate: "Cổng vào 1", inTime: "08:15", outTime: "--:--", image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80", model: "Kia Morning", duration: "Đang vào" }
  ];

  const [transactions, setTransactions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [currentVehicle, setCurrentVehicle] = useState(null);

  // CENTRALIZED FETCH FUNCTION
  const fetchAllDataFromBackend = useCallback(async () => {
    if (isMock) {
      setTransactions(FALLBACK_TRANSACTIONS);
      setActivityLogs(FALLBACK_LOGS);
      setActiveVehicles(FALLBACK_VEHICLES);
      return;
    }

    try {
      const logsRes = await apiClient.get('/logs');
      if (logsRes.data && logsRes.data.items && logsRes.data.items.length > 0) {
        setActivityLogs(logsRes.data.items);
      } else {
        setActivityLogs(FALLBACK_LOGS); // Mock UI for preview
      }

      const txnRes = await apiClient.get('/revenue/transactions');
      if (txnRes.data && txnRes.data.items && txnRes.data.items.length > 0) {
        setTransactions(txnRes.data.items);
      } else {
        setTransactions(FALLBACK_TRANSACTIONS);
      }
      
      // Need active vehicles from API (sessions)
      // activeVehicles can be mapped from logs or a dedicated /sessions endpoint
      setActiveVehicles(FALLBACK_VEHICLES); // Temporarily fall back to mockup

    } catch (error) {
      console.error("Failed to fetch backend data, using mock data", error);
      setTransactions(FALLBACK_TRANSACTIONS);
      setActivityLogs(FALLBACK_LOGS);
      setActiveVehicles(FALLBACK_VEHICLES);
    }
  }, []);

  // Use fetchAllDataFromBackend in useEffect
  useEffect(() => {
    fetchAllDataFromBackend();
  }, [fetchAllDataFromBackend]);

  const addTransaction = (newTx) => setTransactions(prev => [newTx, ...prev]);
  const addActivityLog = (newLog) => setActivityLogs(prev => [newLog, ...prev]);

  // 3. Security Alerts State

  return (
    <GlobalContext.Provider value={{ 
      searchValue, setSearchValue, activeLocation, setActiveLocation,
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
