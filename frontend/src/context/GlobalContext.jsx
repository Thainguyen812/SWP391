import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { WalletOutlined, CheckCircleFilled, CreditCardOutlined } from '@ant-design/icons';
import { apiClient } from '../api/apiClient';

const GlobalContext = createContext();

// No more mock data. Completely API driven.

export const GlobalProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");
  const [totalGates, setTotalGates] = useState(6);
  const [activeLocation, setActiveLocation] = useState("toan-he-thong");
  const [isEmergency, setIsEmergency] = useState(false); // Persistent emergency state

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
    try {
      // 1. Fetch Logs
      const logsData = await apiClient.get('/logs');
      if (logsData && logsData.items && logsData.items.length > 0) {
        setActivityLogs(logsData.items);
      } else {
        setActivityLogs([]);
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
            setShiftHistory([]);
          }
        }).catch(() => setShiftHistory([]));
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
              gate: session.exitGate || session.entryGate || null,
              inTime: session.checkInTime ? new Date(session.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
              outTime: "--:--",
              image: session.frontImage || "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80",
              model: session.vehicleModel || session.vehicleBrand || "Chưa xác định",
              duration: "Đang vào"
            }));
          setActiveVehicles(active);
        } else {
          setActiveVehicles([]);
        }
      } catch (e) {
        console.error("Failed to fetch sessions for active vehicles", e);
        setActiveVehicles([]);
      } 
      
      // 5. Fetch Current User Profile
      try {
        const userProfile = await apiClient.get('/auth/me');
        setCurrentUser(userProfile);
      } catch (e) {
        console.error("Failed to fetch user profile", e);
        setCurrentUser({ name: "Chưa đăng nhập", id: "N/A", station: "N/A", avatar: "", shift: "N/A" });
      }

      // 6. Fetch Security Alerts
      try {
        const alerts = await apiClient.get('/security/alerts');
        setSecurityAlerts(alerts || []);
      } catch (e) {
        console.error("Failed to fetch security alerts", e);
        setSecurityAlerts([]);
      }

      // 7. Fetch Shift Stats
      try {
        const stats = await apiClient.get('/revenue/shift-stats');
        setShiftStats(stats || { revenue: 0, cash: 0, transfer: 0, transactions: 0 });
      } catch (e) {
        console.error("Failed to fetch shift stats", e);
        setShiftStats({ revenue: 0, cash: 0, transfer: 0, transactions: 0 });
      }

      // 8. Fetch Daily Volume
      try {
        const volume = await apiClient.get('/sessions/daily-volume');
        setDailyVolume(volume?.volume || 0);
      } catch (e) {
        console.error("Failed to fetch daily volume", e);
        setDailyVolume(0);
      }

      // 9. Fetch System Settings
      try {
        const settings = await apiClient.get('/settings/system');
        if (settings?.totalGates) {
          setTotalGates(parseInt(settings.totalGates, 10));
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }

    } catch (error) {
      console.error("Failed to fetch backend data", error);
    }
  }, []);

  // Use fetchAllDataFromBackend in useEffect
  useEffect(() => {
    fetchAllDataFromBackend();
  }, [fetchAllDataFromBackend]);

  // Actions
  const addTransaction = (newTx) => setTransactions(prev => [newTx, ...prev]);
  const addActivityLog = (newLog) => setActivityLogs(prev => [newLog, ...prev]);
  const addSecurityAlert = (newAlert) => setSecurityAlerts(prev => [newAlert, ...prev]);
  const removeSecurityAlert = (id) => setSecurityAlerts(prev => prev.filter(alert => alert.id !== id));
  const restoreSecurityAlerts = () => fetchAllDataFromBackend();

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
    <GlobalContext.Provider value={{        searchValue, setSearchValue, activeLocation, setActiveLocation, totalGates, setTotalGates,
        isEmergency, setIsEmergency,
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