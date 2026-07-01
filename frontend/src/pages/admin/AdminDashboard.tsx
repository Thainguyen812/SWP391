import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home,
  Car, 
  Calendar, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Search, 
  MapPin, 
  Check, 
  LogIn, 
  DollarSign, 
  Shield, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Clock, 
  FileText, 
  UploadCloud, 
  RefreshCw,
  Download,
  Plus,
  Bike,
  Sparkles,
  Info,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  Headphones,
  Mail,
  Activity,
  Users,
  Wrench,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Monitor,
  Printer,
  Compass,
  User,
  Layers,
  History,
  Archive,
  QrCode
} from 'lucide-react';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

import { VipApprovalPanel } from './VipApprovalPanel';
import { ParkingMonitorView } from './ParkingMonitorView';

interface DashboardProps {
  user: {
    name: string;
    phone: string;
    role: string;
  };
  accessToken: string | null;
  onRefreshToken: () => void;
  onLogout: () => void;
}

// Types for Manager Dashboard
interface ParkedVehicle {
  plate: string;
  type: 'OTO' | 'XEMAY' | 'VIP';
  zone: 'Khu A (Tầng 1)' | 'Khu B (Tầng 2)' | 'Khu C (Hầm B1)';
  slot: string;
  entryTime: string;
  ownerName?: string;
  phone?: string;
}

interface StaffMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  gate: string;
  swipes: number;
  status: 'ONLINE' | 'OFFLINE';
  leaveHours?: string;
  keyLabel?: string;
  reason?: string;
}

interface SystemNotice {
  id: string;
  type: 'ERROR' | 'WARNING' | 'SUCCESS';
  title: string;
  desc: string;
  time: string;
  actionText?: string;
  actionState?: 'IDLE' | 'PENDING' | 'RESOLVED';
}

interface BlacklistedVehicle {
  plate: string;
  reason: string;
  dateAdded: string;
}

const TopDownCarSVG = ({ color }: { color: string }) => {
  return (
    <svg viewBox="0 0 100 50" className="w-full h-8 select-none pointer-events-none drop-shadow-md">
      {/* Wheels */}
      <rect x="15" y="1" width="14" height="6" rx="2" fill="#1e293b" />
      <rect x="70" y="1" width="14" height="6" rx="2" fill="#1e293b" />
      <rect x="15" y="43" width="14" height="6" rx="2" fill="#1e293b" />
      <rect x="70" y="43" width="14" height="6" rx="2" fill="#1e293b" />
      
      {/* Car body */}
      <rect x="8" y="5" width="84" height="40" rx="10" fill={color} />
      
      {/* Roof outline */}
      <rect x="25" y="10" width="46" height="30" rx="6" fill="#111827" opacity="0.15" />
      
      {/* Windshields */}
      <path d="M 28,12 L 34,9 L 34,41 L 28,38 Z" fill="#e2e8f0" opacity="0.8" />
      <path d="M 68,12 L 62,9 L 62,41 L 68,38 Z" fill="#e2e8f0" opacity="0.8" />
      
      {/* Headlights */}
      <rect x="91" y="9" width="3" height="6" rx="1.5" fill="#fef08a" />
      <rect x="91" y="35" width="3" height="6" rx="1.5" fill="#fef08a" />
      
      {/* Taillights */}
      <rect x="7" y="10" width="3" height="5" rx="1" fill="#ef4444" />
      <rect x="7" y="35" width="3" height="5" rx="1" fill="#ef4444" />
    </svg>
  );
};

export function Dashboard({ user, accessToken, onRefreshToken, onLogout }: DashboardProps) {
  // Navigation
  const [activeMenu, setActiveMenu] = useState<'overview' | 'monitoring' | 'guard_gate' | 'revenue' | 'staff' | 'customers' | 'technical' | 'security' | 'system_log'>('guard_gate');
  
  // App settings
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('urbanpark_manager_dark_mode');
    return saved === 'true';
  });
  
  // Active facility tab ('all' | 'cs1' | 'cs2')
  const [activeFacility, setActiveFacility] = useState<'all' | 'cs1' | 'cs2'>('all');
  
  // Search query from top header
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive UI trigger states
  const [currentTime, setCurrentTime] = useState('24/10/2023 14:30');
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLprRunning, setIsLprRunning] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [editingStaffGateId, setEditingStaffGateId] = useState<string | null>(null);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [branches, setBranches] = useState<any[]>(() => {
    const saved = localStorage.getItem('urbanpark_manager_branches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= 2) return parsed;
        if (parsed.length === 1 && parsed[0].id === 'br-1') {
          return [
            parsed[0],
            {
              id: 'br-2',
              name: 'Cơ sở Landmark 81 (CS 02)',
              address: '208 Nguyễn Hữu Cảnh, Bình Thạnh',
              status: 'Hoạt động',
              capacity: 600,
              occupied: 546,
              cars: '200 / 250',
              motorbikes: '346 / 350',
              updateTime: 'Cập nhật 2 phút trước'
            }
          ];
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'br-1',
        name: 'Cơ sở Vincom Center',
        address: '72 Lê Thánh Tôn, Quận 1',
        status: 'Hoạt động',
        capacity: 400,
        occupied: 342,
        cars: '120 / 150',
        motorbikes: '222 / 250',
        updateTime: 'Cập nhật 1 phút trước'
      },
      {
        id: 'br-2',
        name: 'Cơ sở Landmark 81 (CS 02)',
        address: '208 Nguyễn Hữu Cảnh, Bình Thạnh',
        status: 'Hoạt động',
        capacity: 600,
        occupied: 546,
        cars: '200 / 250',
        motorbikes: '346 / 350',
        updateTime: 'Cập nhật 2 phút trước'
      }
    ];
  });

  // Gate Control Live API States
  const [gatePlate, setGatePlate] = useState('');
  const [gateCardCode, setGateCardCode] = useState('');
  const [gateQrToken, setGateQrToken] = useState('');
  const [gateActiveName, setGateActiveName] = useState('Cổng vào 1');
  const [liveScanLogs, setLiveScanLogs] = useState<any[]>([]);
  const [isSecurityLockTriggered, setIsSecurityLockTriggered] = useState(false);
  const [securityViolatorPlate, setSecurityViolatorPlate] = useState('');
  const [isProcessingGateScan, setIsProcessingGateScan] = useState(false);

  const fetchGateScanLogs = async () => {
    try {
      const r = await fetch('/api/logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const d = await r.json();
      if (d && Array.isArray(d.items)) {
        setLiveScanLogs(d.items);
      }
    } catch (e) {
      console.warn("Error background polling gate logs:", e);
    }
  };

  useEffect(() => {
    fetchGateScanLogs();
    const interval = setInterval(fetchGateScanLogs, 3500);
    return () => clearInterval(interval);
  }, []);

  const handlePerformGateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatePlate.trim() && !gateCardCode.trim() && !gateQrToken.trim()) {
      triggerToast("Vui lòng điền biển số xe hoặc mã thẻ/chữ ký QR!", "error");
      return;
    }
    setIsProcessingGateScan(true);
    try {
      const response = await fetch('/api/gate/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plate: gatePlate.trim(),
          cardCode: gateCardCode.trim(),
          qrToken: gateQrToken.trim(),
          gate: gateActiveName
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(data.message, "success");
        // Reset local gate values
        setGatePlate('');
        setGateCardCode('');
        setGateQrToken('');
        fetchGateScanLogs();
      } else {
        if (data.error === "VEHICLE_LOCKED") {
          setIsSecurityLockTriggered(true);
          setSecurityViolatorPlate(data.data?.vehicle?.plate || gatePlate);
          triggerToast("🚨 BẢO ĐỘNG AN NINH: PHÁT HIỆN ĐỘT NHẬP XE ĐANG KHÓA!", "error");
        } else if (data.error === "QR_FALLBACK_REQUIRED") {
          triggerToast("Vui lòng xuất trình mã QR dự phòng để ra cổng!", "warning");
        } else {
          triggerToast(`Không thành công: ${data.message || data.error}`, "error");
        }
        fetchGateScanLogs();
      }
    } catch (err) {
      triggerToast("Lỗi kết nối API cổng trực Backend!", "error");
    } finally {
      setIsProcessingGateScan(false);
    }
  };

  const handleClearGateLogs = async () => {
    try {
      const response = await fetch('/api/gate/clear', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setLiveScanLogs([]);
        triggerToast("Đã dọn sạch nhật ký kiểm soát cổng trực!", "success");
      }
    } catch (e) {
      triggerToast("Lỗi dọn sạch logs!", "error");
    }
  };

  // Real-time monitoring floor & facility selectors
  const [monitoringFacility, setMonitoringFacility] = useState('Cơ sở chính (HQ)');
  const [monitoringFloor, setMonitoringFloor] = useState('Tầng hầm B1');
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);

  // Modern recent movements activity feed (matching screenshot values)
  const [recentActivities, setRecentActivities] = useState<any[]>([
    { id: 'act-1', plate: '51A-892.44', type: 'Sedan', gate: 'Cổng vào 1', time: '10:42:15', action: 'Vào' },
    { id: 'act-2', plate: '29C-123.99', type: 'SUV', gate: 'Cổng ra 2', time: '10:40:05', action: 'Ra' },
    { id: 'act-3', plate: '30F-999.99', type: 'Sang trọng', gate: 'VIP Làn 1', time: '10:38:22', action: 'Vào', vip: true },
    { id: 'act-4', plate: '60A-112.33', type: 'Hatchback', gate: 'Cổng vào 2', time: '10:35:10', action: 'Vào' }
  ]);

  // Integrated blueprint Interactive Slots
  const [blueprintSlots, setBlueprintSlots] = useState<any[]>(() => {
    return [
      { id: 'B1-01', label: 'A01', status: 'CÒN' },
      { id: 'B1-02', label: 'A02', status: 'CÒN' },
      { id: 'B1-03', label: 'A03', status: 'CÒN' },
      { id: 'B1-04', label: 'A04', status: 'ĐÃ ĐỖ', vehicleType: 'Sedan', plate: '30E-245.89', entryTime: '10:12:00' },
      { id: 'B1-05', label: 'A05', status: 'CÒN' },
      { id: 'B1-06', label: 'A06', status: 'XE VIP', vehicleType: 'Sang trọng', plate: '30F-999.78', entryTime: '08:30:00' },
      { id: 'B1-07', label: 'A07', status: 'CÒN' },
      { id: 'B1-08', label: 'A08', status: 'ĐÃ ĐỖ', vehicleType: 'SUV', plate: '29A-888.88', entryTime: '09:12:00', isElectric: true },
      { id: 'B1-09', label: 'A09', status: 'BẢO TRÌ' },
      { id: 'B1-10', label: 'A10', status: 'CÒN' },
      { id: 'B1-11', label: 'A11', status: 'CÒN' },
      
      // Middle slots
      { id: 'B1-12', label: 'B01', status: 'CÒN' },
      { id: 'B1-13', label: 'B02', status: 'ĐÃ ĐỖ', vehicleType: 'Sedan', plate: '30F-555.22', entryTime: '09:40:00' },
      { id: 'B1-14', label: 'B03', status: 'CÒN' },
      { id: 'B1-15', label: 'B04', status: 'XE VIP', vehicleType: 'Sang trọng', plate: '30F-999.99', entryTime: '10:38:22' },
      { id: 'B1-16', label: 'B05', status: 'CÒN' },
      { id: 'B1-17', label: 'B06', status: 'CÒN' },
      { id: 'B1-18', label: 'B07', status: 'ĐÃ ĐỖ', vehicleType: 'SUV', plate: '29C-123.99', entryTime: '10:05:00' },
      { id: 'B1-19', label: 'B08', status: 'BẢO TRÌ' },

      // Bottom slots
      { id: 'B1-20', label: 'C01', status: 'CÒN' },
      { id: 'B1-21', label: 'C02', status: 'CÒN' },
      { id: 'B1-22', label: 'C03', status: 'ĐÃ ĐỖ', vehicleType: 'Hatchback', plate: '60A-112.33', entryTime: '10:35:10' },
      { id: 'B1-23', label: 'C04', status: 'CÒN' },
      { id: 'B1-24', label: 'C05', status: 'ĐÃ ĐỖ', vehicleType: 'Sedan', plate: '51A-892.44', entryTime: '10:42:15' },
      { id: 'B1-25', label: 'C06', status: 'CÒN' },
      { id: 'B1-26', label: 'C07', status: 'CÒN' },
      { id: 'B1-27', label: 'C08', status: 'XE VIP', vehicleType: 'Sang trọng', plate: '30K-111.44', entryTime: '09:55:00' }
    ];
  });

  // Check-in and out interactive modal managers
  const [selectedSlotForCheckIn, setSelectedSlotForCheckIn] = useState<any | null>(null);
  const [checkInPlate, setCheckInPlate] = useState('');
  const [checkInCardCode, setCheckInCardCode] = useState('');
  const [checkInVehicleType, setCheckInVehicleType] = useState<'Sedan' | 'SUV' | 'Hatchback' | 'Sang trọng'>('Sedan');
  const [checkInIsVip, setCheckInIsVip] = useState(false);

  // Detailed selected slot state info card overlay
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<any | null>(null);

  // Dynamic system toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => { setToast(null); }, 4000);
  };

  // Live Timer Mocking
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatNum = (n: number) => n.toString().padStart(2, '0');
      setCurrentTime(`${formatNum(now.getDate())}/${formatNum(now.getMonth() + 1)}/${now.getFullYear()} ${formatNum(now.getHours())}:${formatNum(now.getMinutes())}`);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save dark mode state
  useEffect(() => {
    localStorage.setItem('urbanpark_manager_dark_mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Databases initialized with rich mock data
  const [vehicles, setVehicles] = useState<ParkedVehicle[]>(() => {
    const saved = localStorage.getItem('urbanpark_manager_parked');
    if (saved) return JSON.parse(saved);
    const initial: ParkedVehicle[] = [
      { plate: '30F-999.78', type: 'VIP', zone: 'Khu A (Tầng 1)', slot: 'A10', entryTime: '24/10/2023 08:30', ownerName: 'Nguyễn Tiến Đạt', phone: '0901234567' },
      { plate: '29A-888.88', type: 'OTO', zone: 'Khu A (Tầng 1)', slot: 'A12', entryTime: '24/10/2023 09:12', ownerName: 'Lê Hoàng Hải', phone: '0978222111' },
      { plate: '30A-123.45', type: 'OTO', zone: 'Khu B (Tầng 2)', slot: 'B04', entryTime: '24/10/2023 11:45', ownerName: 'Bùi Minh Phương', phone: '0902222222' },
      { plate: '29M1-678.90', type: 'XEMAY', zone: 'Khu C (Hầm B1)', slot: 'C22', entryTime: '24/10/2023 12:05', ownerName: 'Lê Văn Cường', phone: '0903333333' },
      { plate: '30E-245.89', type: 'OTO', zone: 'Khu A (Tầng 1)', slot: 'A03', entryTime: '24/10/2023 13:10', ownerName: 'Phạm Minh Toàn', phone: '0983777555' },
      { plate: '30K-111.44', type: 'VIP', zone: 'Khu B (Tầng 2)', slot: 'B18', entryTime: '24/10/2023 13:40', ownerName: 'Nguyễn Thị Hoa', phone: '0912444333' },
      { plate: '29Y5-958.82', type: 'XEMAY', zone: 'Khu C (Hầm B1)', slot: 'C05', entryTime: '24/10/2023 14:02', ownerName: 'Vũ Quốc Trung', phone: '0945999888' },
    ];
    localStorage.setItem('urbanpark_manager_parked', JSON.stringify(initial));
    return initial;
  });

  // Keep synced
  useEffect(() => {
    localStorage.setItem('urbanpark_manager_parked', JSON.stringify(vehicles));
  }, [vehicles]);

  // System Logs Database
  const [logs, setLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('urbanpark_manager_logs');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: 'LOG-001', time: '14:28:10', type: 'SUCCESS', message: 'Xe VIP [30F-999.78] checkout an toàn qua cổng Ra 01. Chi phí: 0 VNĐ (Vé tháng VIP).' },
      { id: 'LOG-002', time: '14:20:15', type: 'SUCCESS', message: 'Cấp thẻ từ mới cho nhân viên quét ca: Lê Văn C.' },
      { id: 'LOG-003', time: '14:15:22', type: 'WARNING', message: 'Hệ thống nhận diện (LPR) vạch cảnh báo biển số lấm bẩn tại Cổng Vào 02.' },
      { id: 'LOG-004', time: '13:58:40', type: 'SUCCESS', message: 'Xe vãng lai [30A-123.45] check-in thành công tại Cổng Vào 01. Vị trí cấp: B04.' },
      { id: 'LOG-005', time: '13:10:02', type: 'SUCCESS', message: 'Xe [30E-245.89] check-in thành công tại Cổng Vào 02. Vị trí cấp: A03.' },
      { id: 'LOG-006', time: '13:00:15', type: 'INFO', message: 'Hệ thống tự động đồng bộ giờ NTP bốt đỗ xe toàn khu.' }
    ];
    localStorage.setItem('urbanpark_manager_logs', JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('urbanpark_manager_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('urbanpark_manager_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    if (activeFacility === 'cs2') {
      setGateActiveName('Cổng vào 3');
    } else {
      setGateActiveName('Cổng vào 1');
    }
  }, [activeFacility]);

  // HR Staff List and live performance metrics (Screenshot 5 Replication)
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 'STF-01', name: 'Trần Thị Bé', avatar: 'B', role: 'Giám sát Cổng vào 1', gate: 'Cổng Vào 01', swipes: 342, status: 'ONLINE', leaveHours: '06:00 - 14:00', keyLabel: '8892' },
    { id: 'STF-02', name: 'Lê Văn Cường', avatar: 'C', role: 'Nhân viên Cổng ra 2', gate: 'Cổng Ra 02', swipes: 315, status: 'ONLINE', leaveHours: '06:00 - 14:00', keyLabel: '4415' },
    { id: 'STF-03', name: 'Phạm Đức Duy', avatar: 'D', role: 'Đội trưởng Tuần tra', gate: 'Tuần tra hầm B1', swipes: 289, status: 'OFFLINE', leaveHours: 'Ca tiếp: 14:00', keyLabel: '1188', reason: 'Nghỉ ca' },
    { id: 'STF-04', name: 'Hoàng Yến', avatar: 'Y', role: 'Hỗ trợ Khách hàng', gate: 'Bốt Trung Tâm', swipes: 154, status: 'OFFLINE', leaveHours: 'Ốm (1 ngày)', reason: 'Ốm (1 ngày)' }
  ]);

  // System Notices in the right-bottom box
  const [notices, setNotices] = useState<SystemNotice[]>([
    { 
      id: 'NTC-01', 
      type: 'ERROR', 
      title: 'Mất kết nối Camera LPR Cổng 03', 
      desc: 'Hệ thống không nhận được tín hiệu từ Camera C03 trong 5 phút qua. Yêu cầu kiểm tra kỹ thuật ngay lập tức.', 
      time: '10 phút trước', 
      actionText: 'Chỉ định kỹ thuật',
      actionState: 'IDLE'
    },
    { 
      id: 'NTC-02', 
      type: 'WARNING', 
      title: 'Cảnh báo đầy bãi - Khu vực Tầng hầm 1', 
      desc: 'Công suất hiện tại đạt 95%. Hệ thống tự động chuyển hướng xe mới xuống Tầng hầm 2.', 
      time: '45 phút trước' 
    },
    { 
      id: 'NTC-03', 
      type: 'SUCCESS', 
      title: 'Cập nhật phần mềm Barrier v2.1 hoàn tất', 
      desc: 'Tất cả các cổng kiểm soát đã được đồng bộ phiên bản mới nhất.', 
      time: '2 giờ trước' 
    }
  ]);

  // Hardware switches status for Technical Config
  const [gateBarriers, setGateBarriers] = useState([
    { gateId: 'GATE-IN-01', name: 'CS1 - Cổng Vào 01 (LPR-C01)', open: false, isOperating: false, branchId: 'cs1' },
    { gateId: 'GATE-IN-02', name: 'CS1 - Cổng Vào 02 (LPR-C02)', open: false, isOperating: false, branchId: 'cs1' },
    { gateId: 'GATE-OUT-01', name: 'CS1 - Cổng Ra 01 (LPR-C03)', open: true, isOperating: false, branchId: 'cs1' },
    { gateId: 'GATE-OUT-02', name: 'CS1 - Cổng Ra 02 (LPR-C04)', open: false, isOperating: false, branchId: 'cs1' },
    { gateId: 'GATE-IN-03', name: 'CS2 - Landmark Cổng A1', open: false, isOperating: false, branchId: 'cs2' },
    { gateId: 'GATE-IN-04', name: 'CS2 - Landmark Cổng B2', open: false, isOperating: false, branchId: 'cs2' },
    { gateId: 'GATE-OUT-03', name: 'CS2 - Landmark Cổng Ra', open: false, isOperating: false, branchId: 'cs2' }
  ]);

  // Blacklist Database
  const [blacklist, setBlacklist] = useState<BlacklistedVehicle[]>([
    { plate: '19A-999.11', reason: 'Xe liên quan đến vụ tranh chấp tài sản chưa giải quyết', dateAdded: '12/10/2023' },
    { plate: '30F-443.12', reason: 'Nghi ngờ giả mạo phôi thẻ từ VIP tháng nhiều lần', dateAdded: '20/10/2023' }
  ]);

  // Simulated live billing ledger for Revenue tab
  const [transactions, setTransactions] = useState([
    { id: '#TRX-8924', time: '14:32:05 Hôm nay', plate: '30G-123.45', type: 'Ô tô - Vãng lai', cost: '25,000đ', paymentMethod: 'VNPAY', status: 'THÀNH CÔNG', invoiceNo: 'VAT-8924', note: '' },
    { id: '#TRX-8923', time: '14:28:11 Hôm nay', plate: '29A-999.99', type: 'Vé tháng (VIP)', cost: '0đ', paymentMethod: 'Thẻ từ Auto', status: 'ĐÃ GHI NHẬN', invoiceNo: 'VAT-8923', note: '' },
    { id: '#TRX-8922', time: '14:15:00 Hôm nay', plate: '15B-678.90', type: 'Xe máy', cost: '5,000đ', paymentMethod: 'Lỗi kết nối', status: 'CẦN XỬ LÝ', invoiceNo: 'VAT-8922', note: 'Lỗi kết nối' },
    { id: '#TRX-8921', time: '14:10:22 Hôm nay', plate: '30E-555.22', type: 'Ô tô - Vãng lai', cost: '35,000đ', paymentMethod: 'Tiền mặt', status: 'THÀNH CÔNG', invoiceNo: 'VAT-8921', note: '' }
  ]);

  // Customer Management Database
  interface Customer {
    id: string;
    name: string;
    phone: string;
    plate: string;
    cardType: 'VIP' | 'Tháng' | 'Guest';
    status: 'ACTIVE' | 'EXPIRED' | 'IN_PARK';
    expiryDate: string;
  }

  const [customerList, setCustomerList] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('urbanpark_customers_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((c: any) => c.expiryDate === '31/12/2024' || c.expiryDate === '15/11/2023' || c.expiryDate === '01/10/2023')) {
          localStorage.removeItem('urbanpark_customers_list');
        } else {
          return parsed;
        }
      } catch (err) {
        console.error("Failed parsing custom customers list:", err);
      }
    }
    const dFuture1 = new Date(); dFuture1.setMonth(dFuture1.getMonth() + 6);
    const dFuture2 = new Date(); dFuture2.setMonth(dFuture2.getMonth() + 3);
    const dPast = new Date(); dPast.setMonth(dPast.getMonth() - 2);
    
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    
    return [
      { id: 'CUST-001', name: 'Nguyễn Văn An', phone: '090 123 4567', plate: '51F-123.45', cardType: 'VIP', status: 'ACTIVE', expiryDate: fmt(dFuture1) },
      { id: 'CUST-002', name: 'Trần Thị Bích', phone: '091 987 6543', plate: '30A-987.65', cardType: 'Tháng', status: 'ACTIVE', expiryDate: fmt(dFuture2) },
      { id: 'CUST-003', name: 'Lê Hữu Trí', phone: '093 765 4321', plate: '43C-112.22', cardType: 'Tháng', status: 'EXPIRED', expiryDate: fmt(dPast) },
      { id: 'CUST-004', name: 'Vãng lai (Ticket #99281)', phone: '-', plate: '60B-555.44', cardType: 'Guest', status: 'IN_PARK', expiryDate: 'N/A' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('urbanpark_customers_list', JSON.stringify(customerList));
  }, [customerList]);

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'Tất cả' | 'Tháng' | 'VIP'>('Tất cả');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerTab, setCustomerTab] = useState<'list' | 'approvals'>('list');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState<'Tất cả' | 'Đang trực' | 'Nghỉ phép'>('Tất cả');

  // Security Panel States
  const [enable2FA, setEnable2FA] = useState(true);
  const [desktopTimeout, setDesktopTimeout] = useState('30 Phút');
  const [mobileTimeout, setMobileTimeout] = useState('4 Giờ');
  const [passwordMinLength, setPasswordMinLength] = useState(12);
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);

  // System Audit Logs States
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('Tất cả');
  const [auditStatusFilter, setAuditStatusFilter] = useState('Tất cả');
  const [selectedLogId, setSelectedLogId] = useState<string | null>('AUD-003');

  // Facilities data filter multipliers (for total responsiveness when tabs are clicked)
  const statsMultiplier = activeFacility === 'cs1' ? 0.45 : activeFacility === 'cs2' ? 0.55 : 1.0;
  
  const formattedRevenue = (45.2 * statsMultiplier).toFixed(1);
  const formattedCarsCount = Math.round(1248 * statsMultiplier).toLocaleString();
  const formattedFullCapacityPercent = activeFacility === 'cs1' ? 78 : activeFacility === 'cs2' ? 91 : 85;

  const filteredBranches = branches.filter(branch => {
    if (activeFacility === 'cs1') {
      return branch.id === 'br-1' || branch.name.toLowerCase().includes('vincom') || branch.name.toLowerCase().includes('cs 01') || branch.name.toLowerCase().includes('cs1') || branch.name.toLowerCase().includes('cơ sở 01') || branch.name.toLowerCase().includes('cơ sở 1');
    } else if (activeFacility === 'cs2') {
      return branch.id === 'br-2' || branch.name.toLowerCase().includes('landmark') || branch.name.toLowerCase().includes('cs 02') || branch.name.toLowerCase().includes('cs2') || branch.name.toLowerCase().includes('cơ sở 02') || branch.name.toLowerCase().includes('cơ sở 2');
    }
    return true;
  });

  const totalCapacity = filteredBranches.reduce((sum, b) => sum + (b.capacity || 0), 0);
  const totalOccupied = filteredBranches.reduce((sum, b) => sum + (b.occupied || 0), 0);
  const overallPercentage = totalCapacity === 0 ? 0 : Math.round((totalOccupied / totalCapacity) * 100);
  const activeCount = activeFacility === 'all' ? 11 : activeFacility === 'cs1' ? 5 : 6;
  const maintenanceCount = activeFacility === 'all' ? 1 : activeFacility === 'cs1' ? 0 : 1;

  const filteredScanLogs = liveScanLogs.filter(log => {
    const gateName = log.gate || '';
    if (activeFacility === 'cs1') {
      return gateName.toLowerCase().includes('cổng trực') || gateName.toLowerCase().includes('cổng vào') || gateName.toLowerCase().includes('cổng ra') || gateName.toLowerCase().includes('cs1');
    } else if (activeFacility === 'cs2') {
      return gateName.toLowerCase().includes('landmark') || gateName.toLowerCase().includes('cs2');
    }
    return true;
  });

  const filteredBarriers = gateBarriers.filter(b => {
    if (activeFacility === 'cs1') return b.branchId === 'cs1';
    if (activeFacility === 'cs2') return b.branchId === 'cs2';
    return true;
  });

  // LPR Automatic Vehicle Simulation runner (adds / removes cars interactively)
  const [mockLprPlateInput, setMockLprPlateInput] = useState('');
  const [mockLprType, setMockLprType] = useState<'OTO' | 'XEMAY' | 'VIP'>('OTO');

  const executeLprCheckIn = async (customPlate?: string) => {
    let chosenPlate = (customPlate || mockLprPlateInput).trim().toUpperCase();
    if (!chosenPlate) {
      // Generate realistic Vietnamese random license plate
      const firstNum = Math.floor(29 + Math.random() * 3); // 29, 30, 31
      const alpha = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      const sub = Math.floor(100 + Math.random() * 900); // 100-999
      const end = Math.floor(10 + Math.random() * 90); // 10-99
      chosenPlate = `${firstNum}${alpha}-${sub}.${end}`;
    }

    try {
      await parkingService.aiCheckIn({
        plate: chosenPlate,
        cameraId: 'CAM-IN-01' // Mock camera ID
      });
      triggerToast(`Đã nhận diện & mở barie cho xe ${chosenPlate} bằng API AI!`, 'success');
      
      const newLog = {
        id: `LOG-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'SUCCESS',
        message: `API AI Check-in thành công xe [${chosenPlate}].`
      };
      setLogs([newLog, ...logs]);
      setNotificationsCount(prev => prev + 1);
      setMockLprPlateInput('');
      
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || `Lỗi AI Check-in xe [${chosenPlate}]`;
      triggerToast(errMsg, 'error');
      const newNotice: SystemNotice = {
        id: `NTC-${Date.now()}`,
        type: 'ERROR',
        title: `Phát hiện xe lỗi: ${chosenPlate}`,
        desc: errMsg,
        time: 'Vừa xong'
      };
      setNotices([newNotice, ...notices]);
    }
  };

  const executeLprCheckOut = async (plateToRelease: string) => {
    try {
      await parkingService.checkoutByCode('TEMP_' + plateToRelease);
      triggerToast(`Đã gọi API Check-out LPR thành công cho xe ${plateToRelease}!`, 'success');
      setVehicles(vehicles.filter(v => v.plate !== plateToRelease));
    } catch (error: any) {
      triggerToast(error?.response?.data?.message || `Lỗi gọi API Checkout cho xe ${plateToRelease}`, 'error');
    }
  };

  const handleManualCheckIn = async () => {
    if (!checkInPlate.trim()) {
      triggerToast('Vui lòng nhập biển số xe hợp lệ!', 'error');
      return;
    }
    if (!checkInCardCode.trim()) {
      triggerToast('Vui lòng nhập mã thẻ (VD: 000001)!', 'error');
      return;
    }
    try {
      await parkingService.visitorCheckIn({
        plate: checkInPlate.trim().toUpperCase(),
        vehicle_type: checkInVehicleType,
        card_code: checkInCardCode.trim(),
        image_url: 'https://example.com/fake-lpr.jpg' // Fake image
      });
      triggerToast(`Đã gọi API Check-in xe ${checkInPlate.toUpperCase()} thành công!`, 'success');
      setSelectedSlotForCheckIn(null);
      setCheckInPlate('');
      setCheckInCardCode('');
    } catch (error: any) {
      triggerToast(error?.response?.data?.message || 'Lỗi khi gọi API Check-in', 'error');
    }
  };

  const handleManualCheckOut = async (slotId: string, label: string) => {
    const targetSlot = blueprintSlots.find(s => s.id === slotId);
    if (!targetSlot || (targetSlot.status !== 'ĐÃ ĐỖ' && targetSlot.status !== 'XE VIP')) return;

    const releasedPlate = targetSlot.plate;
    
    try {
      // Dùng biển số làm cardCode tạm thời để khớp với Backend Check-in trước đó
      await parkingService.checkoutByCode('TEMP_' + releasedPlate);
      
      triggerToast(`Đã xuất bến cho xe ${releasedPlate} từ ô đỗ ${label}!`, 'success');
      
      // Xóa xe khỏi giao diện
      const updatedSlots = blueprintSlots.map(s => {
        if (s.id === slotId) {
          return { ...s, id: s.id, label: s.label, status: 'CÒN' };
        }
        return s;
      });
      setBlueprintSlots(updatedSlots);
      setVehicles(vehicles.filter(v => v.plate !== releasedPlate));
      setSelectedSlotDetails(null);
    } catch (error: any) {
      triggerToast(error?.response?.data?.message || `Lỗi API Check-out xe [${releasedPlate}]`, 'error');
    }
  };

  const handleManualActionNotice = (noticeId: string) => {
    setNotices(prev => prev.map(notice => {
      if (notice.id === noticeId) {
        return { ...notice, actionState: 'PENDING' };
      }
      return notice;
    }));
    triggerToast('Đang kết nối tổng đài để chỉ định kỹ thuật viên khẩn cấp...', 'info');

    setTimeout(() => {
      setNotices(prev => prev.map(notice => {
        if (notice.id === noticeId) {
          return { ...notice, actionState: 'RESOLVED', desc: 'Đã hoàn tất khôi phục kết nối. Kỹ thuật viên Nguyễn Hoàng Minh đã sửa chữa phần cứng camera.' };
        }
        return notice;
      }));
      triggerToast('Kỹ thuật viên đã xử lý lỗi Camera C03 thành công! Trạng thái kết nối: Hoạt động', 'success');
      
      const newLog = {
        id: `LOG-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'SUCCESS',
        message: 'Trạng thái Camera LPR Cổng 03 đã khôi phục. Đồng bộ luồng hình ảnh về phòng giám sát.'
      };
      setLogs([newLog, ...logs]);
    }, 2500);
  };

  const handleExportSystemReport = () => {
    setIsGeneratingReport(true);
    triggerToast('Đang biên dịch tệp báo cáo vận hành toàn diện...', 'info');
    
    setTimeout(() => {
      setIsGeneratingReport(false);
      triggerToast('Đã tải xuống thành công báo cáo: UrbanPark_CS01_24_10_2023.xml (PDF Format)', 'success');
    }, 1500);
  };

  // Recharts Chart Mock Data
  const chartRevenueData = [
    { name: 'T2', amount: 35 },
    { name: 'T3', amount: 50 },
    { name: 'T4', amount: 45 },
    { name: 'T5', amount: 58 },
    { name: 'T6', amount: 40 },
    { name: 'T7', amount: 52 },
    { name: 'CN', amount: 62 }
  ].map(item => ({
    ...item,
    amount: Math.round(item.amount * statsMultiplier)
  }));

  const pieVehicleData = [
    { name: 'Ô tô', value: Math.round(748 * statsMultiplier), color: '#0f172a' },
    { name: 'Xe vãng lai', value: Math.round(312 * statsMultiplier), color: '#3b82f6' },
    { name: 'Xe VIP', value: Math.round(188 * statsMultiplier), color: '#10b981' }
  ];

  return (
    <div id="manager-urbanpark-root" className={`min-h-screen font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors ${isDarkMode ? 'bg-[#030712] text-slate-150' : 'bg-[#f1f5f9] text-slate-850'}`}>
      
      {/* Dynamic Toast Notifications */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-slide-in text-white transition-all bg-slate-900 border-slate-700 dark:bg-slate-950 dark:border-slate-800">
          <div className={`p-1.5 rounded-lg ${toast.type === 'error' ? 'bg-rose-500/20 text-rose-400' : toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold font-sans">{toast.text}</span>
        </div>
      )}

      {/* EMERGENCY LOCKDOWN OVERLAY ALERT UI */}
      {emergencyLockdown && (
        <div className="fixed inset-0 bg-red-650/95 dark:bg-red-950/95 z-55 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center space-y-6">
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-24 h-24 bg-red-800 rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-red-500/50"
          >
            <ShieldAlert className="w-12 h-12 text-white animate-pulse" />
          </motion.div>
          
          <div className="space-y-2 max-w-xl">
            <h2 className="text-4xl font-extrabold uppercase tracking-tight">KÍCH HOẠT PHONG TỎA KHẨN CẤP!</h2>
            <p className="text-slate-200 text-sm font-semibold tracking-wide leading-relaxed">
              CHẾ ĐỘ AN NINH KIỂM SOÁT BAO VỆ MAX ĐÃ ĐƯỢC CHỈ ĐỊNH. HỆ THỐNG ĐÃ TỰ ĐỘNG KHÓA CỨNG TOÀN BỘ CỔNG PHƯƠNG TIỆN BARIE HẠ TRÌNH. CÒI BÁO ĐỘNG QUÉT TOÀN KHU ĐANG HOẠT ĐỘNG.
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setEmergencyLockdown(false);
                triggerToast('Đã dừng chế độ phong tỏa khẩn cấp thiết lập an toàn!', 'success');
              }}
              className="px-8 py-3 bg-white text-red-900 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow-lg uppercase tracking-wider scale-98 active:scale-95 transition-all"
            >
              Hủy chế độ phong tỏa
            </button>
            <button 
              onClick={() => triggerToast('Đang gửi tín hiệu yêu cầu hỗ trợ lực lượng phản ứng cơ động 113...', 'info')}
              className="px-6 py-3 bg-slate-900 border border-slate-700 text-white font-extrabold text-xs rounded-xl uppercase hover:bg-slate-800 transition-colors"
            >
              Liên hệ An ninh khu vực
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER LAYOUT */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* SIDEBAR PANEL (MATCHING THE SCREENSHOT EXACTLY!) */}
        <aside className="w-full lg:w-[260px] shrink-0 bg-[#090f1d] text-white flex flex-col justify-between p-6 border-r border-[#152033] shadow-lg relative z-20">
          <div className="space-y-6">
            
            {/* BRAND LOGO DESIGN (UrbanPark + blue round icon 'P') */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#14233c]">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-md border border-blue-500/20 flex items-center justify-center shrink-0">
                <span className="font-sans font-black text-white text-[19px] leading-tight">P</span>
              </div>
              <div className="leading-tight block">
                <h2 className="text-[19px] font-black tracking-tight text-white font-sans">UrbanPark</h2>
                <span className="text-[10px] text-slate-400 font-bold block tracking-tight">Hệ thống đỗ xe thông minh</span>
              </div>
            </div>

            {/* Sidebar menu items mapping the requested lists */}
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Tổng quan', icon: <Home className="w-4.5 h-4.5" /> },
                { id: 'monitoring', label: 'Giám sát bãi xe', icon: <Car className="w-4.5 h-4.5" /> },
                { id: 'guard_gate', label: 'Thông xe Cổng trực', icon: <ShieldAlert className="w-4.5 h-4.5" /> },
                { id: 'revenue', label: 'Doanh thu & Báo cáo', icon: <CreditCard className="w-4.5 h-4.5" /> },
                { id: 'staff', label: 'Quản lý nhân sự', icon: <Users className="w-4.5 h-4.5" /> },
                { id: 'customers', label: 'Khách hàng', icon: <Sparkles className="w-4.5 h-4.5" /> },
                { id: 'technical', label: 'Cấu hình kỹ thuật', icon: <Wrench className="w-4.5 h-4.5" /> },
                { id: 'security', label: 'Bảo mật', icon: <Shield className="w-4.5 h-4.5" /> },
                { id: 'system_log', label: 'Nhật ký hệ thống', icon: <FileText className="w-4.5 h-4.5" /> }
              ].map(item => {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id as any);
                      setSearchQuery('');
                      triggerToast(`Mở trang: ${item.label}`, 'info');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-tight transition-all text-left cursor-pointer ${
                      activeMenu === item.id 
                        ? 'bg-blue-600/15 text-blue-400 border-l-4 border-blue-500 shadow-md shadow-blue-500/5' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${activeMenu === item.id ? 'text-blue-400' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* BOTTOM RAIL BUTTONS */}
          <div className="space-y-3 pt-6 border-t border-[#14233c] mt-8">
            {/* Added facility trigger */}
            <button 
              onClick={() => {
                const name = `Bãi Xe Phụ ${Math.floor(Math.random() * 100)}`;
                if (name) {
                  triggerToast(`Đã ghi nhận yêu cầu cấp phép bốt cho chi nhánh: ${name}! Quy trình đang kiểm duyệt...`, 'info');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all duration-200 rounded-xl cursor-pointer shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm cơ sở mới</span>
            </button>

            <button 
              onClick={() => {
                setActiveMenu('technical');
                triggerToast('Chuyển hướng đến mục Hướng Dẫn Kỹ Thuật!', 'info');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800/40 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Hỗ trợ</span>
            </button>

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* TOP NAVBAR (COMPREHENSIVELY REPLICATED FROM SCREENSHOT) */}
          <header className={`px-6 py-4 border-b flex items-center justify-between gap-4 select-none relative z-10 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            {activeMenu === 'monitoring' ? (
              <>
                {/* Real-time Monitoring view header: left aligned title */}
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white font-sans flex items-center gap-2">
                    Giám sát bãi xe thời gian thực
                  </h1>
                </div>

                {/* Right side controls matching screenshot exactly */}
                <div className="flex items-center gap-4 ml-auto">
                  {/* System Status */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span className="text-slate-400">Hệ thống:</span>
                    <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-white">
                      Hoạt động
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    </span>
                  </div>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                  {/* Notification Bell Icon */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowNotificationsList(!showNotificationsList);
                        setNotificationsCount(0);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative"
                    >
                      <Bell className="w-4 h-4" />
                      {notificationsCount > 0 && (
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </button>

                    {/* Notification Alert Popover */}
                    <AnimatePresence>
                      {showNotificationsList && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl p-4 space-y-3 z-30 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-black">Thông báo khẩn</span>
                            <button onClick={() => setShowNotificationsList(false)} className="text-[10px] text-blue-500 hover:underline">Đóng</button>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 space-y-1">
                              <strong className="text-rose-500 font-bold">Mất tín hiệu camera C03</strong>
                              <p className="text-[10.5px] text-slate-400">Thiết bị camera Cổng Ra 03 tự ngắt kết nối vào khoảng 10 phút trước.</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 space-y-1">
                              <strong className="text-blue-500 font-bold font-sans">Đồng bộ phiên bản mới v2.1</strong>
                              <p className="text-[10.5px] text-slate-400">Các bốt cổng đã cập nhật lệnh nâng barie tự động mượt mà.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Settings Icon (Toggles Dark Mode in this replication) */}
                  <button 
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
                      triggerToast(`Đã chuyển sang chế độ ${!isDarkMode ? 'Tối' : 'Sáng'}!`, 'info');
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Cấu hình hệ thống"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {/* Profile Avatar Icon */}
                  <button 
                    onClick={() => triggerToast(`Đang truy cập tài khoản: ${user.name}`, 'info')}
                    className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* LEFT SEARCH BAR */}
                <div className="relative w-full max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Tìm số xe, vé, nhân viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs font-medium outline-hidden transition-all placeholder:text-slate-400`}
                  />
                </div>

                {/* SEGMENT BRANCH TABS ("Cơ sở 01", "Cơ sở 02", "Toàn hệ thống") */}
                <div className="flex bg-slate-100 dark:bg-[#030712] p-1 rounded-2xl gap-1 items-center shrink-0">
                  {[
                    { id: 'cs1', label: 'Cơ sở 01' },
                    { id: 'cs2', label: 'Cơ sở 02' },
                    { id: 'all', label: 'Toàn hệ thống' }
                  ].map(tab => {
                    const isActive = activeFacility === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveFacility(tab.id as any);
                          triggerToast(`Đang hiển thị thông tin: ${tab.label}`, 'info');
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-sm font-extrabold' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* RIGHT BUTTONS GROUP */}
                <div className="flex items-center gap-4 ml-auto">
                  {/* SYSTEM HEALTH STATUS BADGE */}
                  <button 
                    onClick={() => triggerToast(`Tất cả các máy chủ UrbanPark đều hoạt động ổn định. Ping: 24ms`, 'success')}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-tight"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Trạng thái Hệ thống</span>
                  </button>

                  {/* NOTIFICATION BELL */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowNotificationsList(!showNotificationsList);
                        setNotificationsCount(0);
                      }}
                      className="p-2.5 rounded-xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-250 dark:border-slate-800 text-slate-550 dark:text-slate-400 relative"
                    >
                      <Bell className="w-4 h-4" />
                      {notificationsCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </button>

                    {/* Dropdown notification alerts */}
                    <AnimatePresence>
                      {showNotificationsList && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl p-4 space-y-3 z-30 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-black">Thông báo khẩn</span>
                            <button onClick={() => setShowNotificationsList(false)} className="text-[10px] text-blue-500 hover:underline">Đóng</button>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 space-y-1">
                              <strong className="text-rose-500 font-bold">Mất tín hiệu camera C03</strong>
                              <p className="text-[10.5px] text-slate-400">Thiết bị camera Cổng Ra 03 tự ngắt kết nối vào khoảng 10 phút trước.</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 space-y-1">
                              <strong className="text-blue-500 font-bold font-sans">Đồng bộ phiên bản mới v2.1</strong>
                              <p className="text-[10.5px] text-slate-400">Các bốt cổng đã cập nhật lệnh nâng barie tự động mượt mà.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Settings Icon (Toggles Dark Mode in this replication) */}
                  <button 
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
                      triggerToast(`Đã chuyển sang chế độ ${!isDarkMode ? 'Tối' : 'Sáng'}!`, 'info');
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Cấu hình hệ thống"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {/* Profile Avatar Icon */}
                  <button 
                    onClick={() => triggerToast(`Đang truy cập tài khoản: ${user.name}`, 'info')}
                    className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </header>

          {/* ACTIVE CONTENT WORKSPACE */}
          <div className="p-6 lg:p-8 flex-1 overflow-y-auto space-y-8">
            
            {['revenue', 'staff', 'technical', 'security', 'system_log'].includes(activeMenu) && user?.role !== 'ADMIN' ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-xl mx-auto space-y-6 animate-fade-in">
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full animate-bounce">
                  <Shield className="w-12 h-12 stroke-[1.5]" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                    Quyền Truy Cập Bị Hạn Chế
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold leading-relaxed">
                    Chức năng <span className="font-extrabold text-rose-550 dark:text-rose-455">"{
                      activeMenu === 'revenue' ? 'Doanh thu & Báo cáo' :
                      activeMenu === 'staff' ? 'Quản lý nhân sự' :
                      activeMenu === 'technical' ? 'Cấu hình kỹ thuật' :
                      activeMenu === 'security' ? 'Bảo mật' :
                      activeMenu === 'system_log' ? 'Nhật ký hệ thống' : activeMenu
                    }"</span> yêu cầu quyền tài khoản <span className="text-blue-500 font-extrabold text-sm uppercase">ADMIN</span>.
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                    Tài khoản hiện tại của bạn là <strong className="text-slate-600 dark:text-slate-300">"{user?.role}" ({user?.name})</strong> không có đầy đủ thẩm quyền trực tiếp.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/45 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-left w-full space-y-3.5">
                  <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">💡 Cách kiểm tra nhanh quyền ADMIN:</span>
                  <p className="text-[12px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                    Vui lòng sử dụng tính năng đăng xuất hoặc truy cập quản lý hệ thống bằng tài khoản phù hợp để dùng tính năng.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <button
                    onClick={onLogout}
                    className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Đăng xuất ngay
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu('overview');
                      triggerToast('Quay lại Tổng quan', 'info');
                    }}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer"
                  >
                    Quay lại Tổng quan
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ----------------- SECURITY SIREN EMERGENCY ALARM MODAL OVERLAY ----------------- */}
                <AnimatePresence>
                  {isSecurityLockTriggered && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans text-white">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 relative overflow-hidden shadow-2xl"
                      >
                        {/* Red pulsating flashing background circles */}
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-650/40 rounded-full blur-xl animate-pulse" />
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-600/40 rounded-full blur-xl animate-pulse" />
                        
                        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/40 animate-bounce">
                          <ShieldAlert className="w-12 h-12 stroke-[2]" />
                        </div>

                        <div className="space-y-2 relative z-10">
                          <h2 className="text-2xl font-black uppercase tracking-widest text-red-500 font-sans">
                            🚨 PHÁT HIỆN ĐỘT NHẬP TRỘM XE!
                          </h2>
                          <div className="text-5xl font-mono font-black py-2 bg-slate-950/80 rounded-xl border border-red-500/30 text-rose-455 tracking-widest select-all">
                            {securityViolatorPlate || "30G-123.45"}
                          </div>
                          <p className="text-xs font-black text-rose-300 uppercase tracking-widest">TRẠNG THÁI: XE ĐANG KHÓA CHỐNG TRỘM</p>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                          Xe mang biển kiểm soát trên đang kích hoạt khóa chống trộm thông minh tại ứng dụng Tài xế, nhưng đã cố ý di chuyển đứt barrier bốt gác! Hệ thống đã tự động khóa cứng phành hơi khẩn cấp, chặn rào chắn và kích hoạt báo động.
                        </p>

                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-left space-y-2">
                          <span className="text-[9px] font-black uppercase text-slate-500 block">Quy trình xử lý sự cố cổng trực:</span>
                          <span className="text-[11px] text-slate-300 block">✓ 1. Bảo an trực tiếp xuất bốt áp sát kiểm tra chủ xe</span>
                          <span className="text-[11px] text-slate-300 block">✓ 2. Xác thực thẻ định danh / Căn cước công dân khớp vé tháng</span>
                          <span className="text-[11px] text-slate-300 block">✓ 3. Yêu cầu chủ xe mở khóa trên Driver App hoặc ấn tắt chuông cưỡng chế</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsSecurityLockTriggered(false);
                            setSecurityViolatorPlate('');
                            triggerToast("🔓 Đã xác nhận tắt chuông cảnh báo cổng trực cưỡng chế và thông barie thành công.", "info");
                          }}
                          className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-650 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                          Tắt Còi & Giải Trừ Cảnh Báo (Mở Khóa Khẩn Cấp)
                        </button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* ----------------- CORE GUARD GATE CHECKPOINT PAGE RENDER ----------------- */}
                {activeMenu === 'guard_gate' && (
                  <div className="space-y-6 animate-fade-in text-slate-850 dark:text-slate-150" id="guard-checkpoint-view">
                    
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-150 dark:border-slate-800 text-left">
                      <div className="space-y-1 block">
                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                          Bốt điều hành &gt; {activeFacility === 'cs1' ? 'Cơ sở 01' : activeFacility === 'cs2' ? 'Cơ sở 02' : 'Toàn hệ thống'}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
                          <ShieldAlert className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          Tiểu Khu Trực Cổng & Kiểm Soát Phương Tiện
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold font-sans">
                          Thiết kế giao diện nhập liệu thông minh cho nhân viên gác cổng - {
                            activeFacility === 'cs1' ? 'Cơ sở 01 (Vincom Center)' : activeFacility === 'cs2' ? 'Cơ sở 02 (Landmark 81)' : 'Toàn hệ thống'
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200/40 text-xs font-black">
                        GATE AGENT ACTIVE
                      </div>
                    </div>

                    {/* Main content grid split */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Left Column: Swipe Form Gate controller */}
                      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm text-left">
                        <div className="space-y-5">
                          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 block">VẬN HÀNH</span>
                            <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wide">Nhập thông tin biển số / Mã thẻ</h3>
                          </div>

                          <form onSubmit={handlePerformGateScan} className="space-y-4">
                            {/* Gate Select */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Chọn Bốt Gác Cổng Trực</label>
                              <select
                                value={gateActiveName}
                                onChange={(e) => setGateActiveName(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-250 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                {(activeFacility === 'all' || activeFacility === 'cs1') && (
                                  <>
                                    <option value="Cổng vào 1">CS1 - Bốt Gác Cổng Vào chính B1 (HQ)</option>
                                    <option value="Cổng vào 2">CS1 - Bốt Gác Cổng Vào phụ G2</option>
                                    <option value="Cổng ra 1">CS1 - Bốt Gác Cổng Ra chính v1</option>
                                  </>
                                )}
                                {(activeFacility === 'all' || activeFacility === 'cs2') && (
                                  <>
                                    <option value="Cổng vào 3">CS2 - Bốt Gác Landmark Cổng Vào A1</option>
                                    <option value="Cổng ra 2">CS2 - Bốt Gác Landmark Cổng Ra B2</option>
                                    <option value="Cổng ra 3">CS2 - Bốt Gác Landmark Cổng Ra chính</option>
                                  </>
                                )}
                              </select>
                            </div>

                            {/* License Plate Textbox */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">
                                Nhập Biển Số Xe (LPR Backup / Manual)
                              </label>
                              <input
                                type="text"
                                value={gatePlate}
                                onChange={(e) => setGatePlate(e.target.value)}
                                placeholder="Ví dụ: 30G-123.45 hoặc 29M1-678.90"
                                className="w-full p-3 font-mono font-bold tracking-widest bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-250 uppercase placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            {/* Card Code (Rfid/Physical RFID key option) */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">
                                Quét / Nhập mã thẻ từ (RFID Key Code)
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={gateCardCode}
                                  onChange={(e) => setGateCardCode(e.target.value)}
                                  placeholder="Nhập mã thẻ, ví dụ: 8892 (Camry), 1188 (SH)..."
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-250 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <div className="absolute right-2.5 top-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setGateCardCode("8892");
                                      triggerToast("🔒 Đã dán mã thẻ thử nghiệm Camry VIP (8892)", "info");
                                    }}
                                    className="px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded text-[9.5px] font-extrabold text-slate-600 dark:text-slate-300"
                                  >
                                    Mẫu thẻ
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* QR Token copy placeholder */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">
                                Dán mã QR Vé (Sao chép từ App tài xế)
                              </label>
                              <input
                                type="text"
                                value={gateQrToken}
                                onChange={(e) => setGateQrToken(e.target.value)}
                                placeholder="Dán chuỗi mã QR (Ví dụ: 30G-123.45|VÀO|1718919191)"
                                className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-250 placeholder-slate-450 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isProcessingGateScan}
                              className="w-full py-4 text-white font-extrabold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {isProcessingGateScan ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Đang liên kết API cổng bốt...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>THỰC HIỆN THÔNG XE CỔNG CHÍNH</span>
                                </>
                              )}
                            </button>
                          </form>
                        </div>

                        <div className="text-[10px] text-slate-550 dark:text-slate-450 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 block">
                          📢 <strong>Yêu cầu kiểm thử API Thật:</strong> Quét biển số xe <strong>"30F-999.78"</strong> có sẵn trong hệ thống (đang bật Khóa chống trộm mặc định) để tận mắt trông thấy tiếng siren hú bảo động đỏ nứt bốt điều hành!
                        </div>
                      </div>

                      {/* Right Column: Dynamic scanning feeds */}
                      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm text-left">
                        <div className="space-y-4 w-full">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 block">NHẬT KÝ KIỂM SOÁT</span>
                              <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 uppercase tracking-wide">Nhật ký quét thực tế tự động từ API</h3>
                            </div>
                            <button
                              type="button"
                              onClick={handleClearGateLogs}
                              className="text-[10.5px] font-black text-red-500 hover:text-red-650 flex items-center gap-1 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Dọn nhật ký
                            </button>
                          </div>

                          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                            {filteredScanLogs.length === 0 ? (
                              <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-550 space-y-2">
                                <QrCode className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto" />
                                <p>Chưa có dữ liệu thông xe nào trong bão gác chính của cơ sở ngày hôm nay.</p>
                              </div>
                            ) : (
                              filteredScanLogs.map(log => {
                                const isBlocked = log.status === "Bị chặn (Khóa)";
                                return (
                                  <div
                                    key={log.id}
                                    className={`p-4 rounded-2xl border transition-all ${
                                      isBlocked 
                                        ? "bg-red-50/70 border-red-200 dark:bg-red-950/15 dark:border-red-900" 
                                        : "bg-slate-50 border-slate-200/60 dark:bg-slate-950 dark:border-slate-850"
                                    } flex flex-col sm:flex-row justify-between items-start gap-4`}
                                  >
                                    <div className="space-y-1.5 flex-1 select-none">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold ${
                                          log.action === "VÀO" 
                                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" 
                                            : "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                                        }`}>
                                          {log.action === "VÀO" ? "CHIỀU VÀO" : "CHIỀU RA"}
                                        </span>
                                        <span className="text-[11.5px] font-mono font-black text-slate-805 dark:text-slate-205">
                                          {log.plate}
                                        </span>
                                        
                                        {/* Status badge */}
                                        <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded ${
                                          isBlocked 
                                            ? "bg-rose-500 text-white animate-pulse" 
                                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-305"
                                        }`}>
                                          {log.status}
                                        </span>
                                      </div>
                                      <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                                        {log.message}
                                      </p>
                                      <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-2 font-mono">
                                        <span>📍 {log.gate}</span>
                                        <span>•</span>
                                        <span>🕒 {log.time}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="text-[10.5px] font-medium text-slate-450 dark:text-slate-550 border-t border-slate-100 dark:border-slate-800 pt-4 text-left leading-normal italic">
                          🔄 <strong>Tự động đồng bộ:</strong> Nhật ký cổng trực đang liên tục đồng bộ với máy chủ Backend bãi đỗ UrbanPark theo chu kỳ 3.5 giây để luôn cập nhật chuẩn xác nhất các trường hợp sự cố và thông barie.
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {activeMenu === 'overview' && (
                  <div className="space-y-6 animate-fade-in text-slate-850 dark:text-slate-100" id="facility-overview-view">
                    
                    {/* BREADCRUMB HEADER BANNER */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none pb-2 border-b border-slate-150 dark:border-slate-800">
                      <div className="space-y-1 text-left block">
                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                          Trang chủ &gt; Quản lý Cơ sở
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                          Quản lý Cơ sở
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold font-sans">
                          Tổng quan 12 bãi xe đang hoạt động trong hệ thống
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setShowAddBranchModal(true)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+ THÊM CƠ SỞ MỚI</span>
                        </button>
                      </div>
                    </div>

                    {/* MAIN TWO-COLUMN CONTAINER */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* LEFT RAIL: MAP & OVERALL HEALTH (col-span-4) */}
                      <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* MAP CONTAINER */}
                        <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left flex flex-col justify-between">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Bản đồ hệ thống
                            </span>
                            <button 
                              onClick={() => triggerToast('Mở rộng toàn bản đồ vệ tinh!', 'info')}
                              className="text-[10.5px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              Mở rộng
                            </button>
                          </div>

                          {/* HIGH CONTRAST STYLIZED VECTOR MAP PLACEHOLDER */}
                          <div className="relative h-48 bg-[#151c2c] rounded-xl my-4 overflow-hidden shadow-inner flex items-center justify-center">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:14px_24px] opacity-20" />
                            
                            {/* Vector Landmass Shapes */}
                            <div className="absolute w-20 h-20 rounded-full bg-slate-805/40 -top-4 -left-4 blurred-2xl" />
                            <div className="absolute w-32 h-20 rounded-3xl bg-slate-805/20 bottom-2 right-4 blurred-2xl" />

                            {/* Street pathways */}
                            <div className="absolute top-1/2 w-full h-1 bg-slate-700/30 transform -translate-y-1/2" />
                            <div className="absolute left-1/3 h-full w-1 bg-slate-700/30" />
                            <div className="absolute right-1/4 h-full w-1 bg-slate-700/30 transform rotate-12" />

                            {/* MAP MARKERS (SCREENSHOT 1 SPECIFICS) */}
                            {/* Marker 1: Q1-A (Blue, Active) */}
                            <div className="absolute top-[25%] left-[28%] text-center cursor-pointer transform -translate-y-1/2 -translate-x-1/2 scale-100 hover:scale-110 transition-all select-none" onClick={() => triggerToast('Cơ sở Quận 1 (A) hoạt động ổn định', 'success')}>
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute top-1.5 left-1.5 animate-ping" />
                              <div className="px-2 py-1 bg-blue-600 text-white font-mono text-[9px] font-black rounded-md shadow-md border border-blue-450 z-10 relative">
                                Q1-A
                              </div>
                            </div>

                            {/* Marker 2: Q3-B (Blue, Active) */}
                            <div className="absolute bottom-[35%] right-[32%] text-center cursor-pointer transform -translate-y-1/2 -translate-x-1/2 scale-100 hover:scale-110 transition-all select-none" onClick={() => triggerToast('Cơ sở Quận 3 (B) hoạt động ổn định', 'success')}>
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute top-1.5 left-1.5 animate-ping" />
                              <div className="px-2 py-1 bg-blue-600 text-white font-mono text-[9px] font-black rounded-md shadow-md border border-blue-450 z-10 relative">
                                Q3-B
                              </div>
                            </div>

                            {/* Marker 3: Q5-C (Red, Alert / Maintenance) */}
                            <div className="absolute top-[45%] right-[15%] text-center cursor-pointer transform -translate-y-1/2 -translate-x-1/2 scale-100 hover:scale-110 transition-all select-none" onClick={() => triggerToast('Cơ sở Quận 5 (C) SC VivoCity đang bảo trì LPR!', 'error')}>
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 left-1.5 animate-ping" />
                              <div className="px-2 py-1 bg-rose-600 text-white font-mono text-[9px] font-black rounded-md shadow-md border border-rose-450 z-10 relative">
                                Q5-C
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-400 font-bold block text-center">
                            📡 Hệ thống định vị trạm thời gian thực (LBS) GPS
                          </span>
                        </div>

                        {/* OVERALL HEALTH CONTAINER */}
                        <div className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 text-left block">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                            Trạng thái Tổng thể
                          </span>

                          <div className="space-y-4 block">
                            <div className="flex justify-between items-end">
                              <span className="text-xs font-bold text-slate-500">Sức chứa toàn hệ thống</span>
                              <strong className="text-base font-black text-slate-850 dark:text-white">72%</strong>
                            </div>

                            {/* Indigo Progress gauge bar */}
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '72%' }} />
                            </div>

                            {/* Grid of total Active vs Maintenance indicators */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              {/* Box 1: Active */}
                              <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hoạt động</span>
                                </div>
                                <h4 className="text-xl font-black font-mono tracking-tight mt-1">11</h4>
                              </div>
                              
                              {/* Box 2: Maintenance */}
                              <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bảo trì</span>
                                </div>
                                <h4 className="text-xl font-black font-mono tracking-tight mt-1">01</h4>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* BOTTOM PAGINATION CONTROLS */}
                        <div className="flex items-center justify-center gap-1.5 pt-4 font-sans select-none">
                          <button onClick={() => triggerToast('Trang trước', 'info')} className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 text-xs font-extrabold">&lt;</button>
                          <button onClick={() => triggerToast('Trang 1', 'info')} className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">1</button>
                          <button onClick={() => triggerToast('Sang trang 2', 'info')} className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 bg-white dark:bg-slate-900 rounded-xl text-xs font-extrabold text-slate-500">2</button>
                          <button onClick={() => triggerToast('Sang trang 3', 'info')} className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 bg-white dark:bg-slate-900 rounded-xl text-xs font-extrabold text-slate-500">3</button>
                          <button onClick={() => triggerToast('Trang sau', 'info')} className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 text-xs font-extrabold">&gt;</button>
                        </div>

                      </div>

                      {/* RIGHT RAIL: BRANCH LIST (col-span-8) */}
                      <div className="lg:col-span-8">
                        {/* GRID OF COMPREHENSIVE CARD SCHEMES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {branches.map(branch => {
                            const percentage = branch.capacity === 0 ? 0 : Math.round((branch.occupied / branch.capacity) * 100);
                            return (
                              <div key={branch.id} className="bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-805 rounded-2xl p-5 text-left block hover:border-blue-500/50 hover:shadow-lg transition-all space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="leading-tight block text-left">
                                    <h3 className="text-base font-black text-slate-850 dark:text-white">{branch.name}</h3>
                                    <span className="text-[11px] text-slate-400 font-bold block mt-1 text-left">{branch.address}</span>
                                  </div>
                                  <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-55 px-2 py-0.5 rounded uppercase tracking-wider block">
                                    ● {branch.status}
                                  </span>
                                </div>

                                <div className="space-y-2 block">
                                  <div className="flex justify-between text-xs font-bold text-slate-505">
                                    <span>Sức chứa xe</span>
                                    <span className="text-slate-850 dark:text-white">{branch.occupied} / {branch.capacity} ({percentage}%)</span>
                                  </div>
                                  {/* Blue bar progress */}
                                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }} />
                                  </div>
                                  {/* Sub details column */}
                                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-1 font-sans">
                                    <span>Ô tô: {branch.cars}</span>
                                    <span>Xe máy: {branch.motorbikes}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-450">
                                  <span>{branch.updateTime}</span>
                                  <button 
                                    onClick={() => {
                                      setActiveMenu('monitoring');
                                      triggerToast(`Xem bến bãi ${branch.name}!`, 'info');
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-black cursor-pointer"
                                  >
                                    <span>CHI TIẾT</span>
                                    <span>&rarr;</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* BOTTOM PAGINATION CONTROLS */}
                        <div className="flex items-center justify-center gap-1.5 pt-4 font-sans select-none">
                          <button onClick={() => triggerToast('Trang trước', 'info')} className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 text-xs font-extrabold">&lt;</button>
                          <button onClick={() => triggerToast('Trang 1', 'info')} className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">1</button>
                          <button onClick={() => triggerToast('Sang trang 2', 'info')} className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 bg-white dark:bg-slate-900 rounded-xl text-xs font-extrabold text-slate-500">2</button>
                          <button onClick={() => triggerToast('Sang trang 3', 'info')} className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 bg-white dark:bg-slate-900 rounded-xl text-xs font-extrabold text-slate-500">3</button>
                          <button onClick={() => triggerToast('Trang sau', 'info')} className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 text-xs font-extrabold">&gt;</button>
                        </div>

                      </div>

                    </div>

                  </div>
                )}
                        {activeMenu === 'monitoring' && (
              <ParkingMonitorView 
                blueprintSlots={blueprintSlots}
                setBlueprintSlots={setBlueprintSlots}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
                vehicles={vehicles}
                setVehicles={setVehicles}
                triggerToast={triggerToast}
                isDarkMode={isDarkMode}
                setActiveMenu={setActiveMenu}
                handleManualCheckIn={handleManualCheckIn}
                handleManualCheckOut={handleManualCheckOut}
                checkInPlate={checkInPlate}
                setCheckInPlate={setCheckInPlate}
                checkInVehicleType={checkInVehicleType}
                setCheckInVehicleType={setCheckInVehicleType}
                checkInIsVip={checkInIsVip}
                setCheckInIsVip={setCheckInIsVip}
                selectedSlotForCheckIn={selectedSlotForCheckIn}
                setSelectedSlotForCheckIn={setSelectedSlotForCheckIn}
                selectedSlotDetails={selectedSlotDetails}
                setSelectedSlotDetails={setSelectedSlotDetails}
                monitoringFacility={monitoringFacility}
                setMonitoringFacility={setMonitoringFacility}
                monitoringFloor={monitoringFloor}
                setMonitoringFloor={setMonitoringFloor}
                showFacilityDropdown={showFacilityDropdown}
                setShowFacilityDropdown={setShowFacilityDropdown}
                showFloorDropdown={showFloorDropdown}
                setShowFloorDropdown={setShowFloorDropdown}
              />
            )}
            {(activeMenu as string) === 'monitoring_DEPRECATED' && (
              <div className="space-y-6 animate-fade-in" id="monitoring-sub-view">
                
                {/* SYSTEM LEVEL QUICK BAR FILTERS */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* FACILITY DROPDOWN SELECTOR */}
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Cơ sở chi nhánh</label>
                      <button 
                        onClick={() => {
                          setShowFacilityDropdown(!showFacilityDropdown);
                          setShowFloorDropdown(false);
                        }}
                        className={`px-4 py-2 bg-white dark:bg-slate-950 border rounded-xl text-xs font-black flex items-center gap-2 select-none min-w-[180px] justify-between shadow-xs transition-colors ${
                          showFacilityDropdown ? 'border-blue-500' : 'border-slate-200 dark:border-slate-850'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          {monitoringFacility}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>
                      
                      <AnimatePresence>
                        {showFacilityDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-xl z-30 overflow-hidden"
                          >
                            {['Cơ sở chính (HQ)', 'Cơ sở Bắc Từ Liêm', 'Cơ sở Quận 1 (HCMC)'].map(fac => (
                              <button
                                key={fac}
                                onClick={() => {
                                  setMonitoringFacility(fac);
                                  setShowFacilityDropdown(false);
                                  triggerToast(`Chuyển khu vực quản lý sang: ${fac}`, 'info');
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-slate-700 dark:text-slate-300 transition-colors block"
                              >
                                {fac}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* MOVEMENT FLOOR LEVEL SELECTOR */}
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Phân khu đỗ xe</label>
                      <button 
                        onClick={() => {
                          setShowFloorDropdown(!showFloorDropdown);
                          setShowFacilityDropdown(false);
                        }}
                        className={`px-4 py-2 bg-white dark:bg-slate-950 border rounded-xl text-xs font-black flex items-center gap-2 select-none min-w-[140px] justify-between shadow-xs transition-colors ${
                          showFloorDropdown ? 'border-blue-500' : 'border-slate-200 dark:border-slate-850'
                        }`}
                      >
                        <span>{monitoringFloor}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>
                      
                      <AnimatePresence>
                        {showFloorDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-xl z-30 overflow-hidden"
                          >
                            {['Tầng hầm B1', 'Tầng hầm B2', 'Tầng trệt G'].map(flr => (
                              <button
                                key={flr}
                                onClick={() => {
                                  setMonitoringFloor(flr);
                                  setShowFloorDropdown(false);
                                  triggerToast(`Bộ lọc sơ đồ hầm đỗ: ${flr}`, 'success');
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-slate-700 dark:text-slate-300 transition-colors block"
                              >
                                {flr}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  {/* QUICK SUMMARY BULLET METRICS */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-550 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-850">
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Tổng: <strong>24 ô</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Trống: <strong>{blueprintSlots.filter(s => s.status === 'CÒN').length} ô</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Đẫ đỗ: <strong>{blueprintSlots.filter(s => s.status === 'ĐÃ ĐỖ' || s.status === 'XE VIP').length} ô</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Bảo trì: <strong>{blueprintSlots.filter(s => s.status === 'BẢO TRÌ').length} ô</strong></span>
                    </div>
                  </div>
                </div>

                {/* TWO-COLUMN MONITOR SCREEN WORKSPACE */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT 8 SHIELDS: SMART BLUEPRINT MATRIX GEOMETRY MAP */}
                  <div className={`xl:col-span-8 p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-200/70 shadow-sm'} space-y-4`}>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
                      <div>
                        <strong className="text-xs font-black uppercase text-slate-400 tracking-wider block">Bản đồ số bàn giao bến đỗ {monitoringFloor}</strong>
                        <span className="text-[10px] text-slate-400 block font-semibold">Tự động đồng bộ với hệ thống thông báo cổng vào-ra (Nhấn vào ô để tương tác nhanh)</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const resetSlots = blueprintSlots.map(s => ({
                            id: s.id,
                            label: s.label,
                            status: s.status === 'BẢO TRÌ' ? 'BẢO TRÌ' : 'CÒN'
                          }));
                          setBlueprintSlots(resetSlots);
                          setVehicles([]);
                          triggerToast('Đã dọn dẹp trống toàn bộ ô đỗ tầng hầm', 'info');
                        }}
                        className="px-3 py-1.5 text-[10.5px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-xl transition-all select-none"
                      >
                        Reset trống bến
                      </button>
                    </div>

                    {/* BLUEPRINT SUBSECTION GRID BY LONES */}
                    <div className="space-y-6 pt-2">
                      
                      {/* ZONE A PARKING LANES */}
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2.5">
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded text-[9px]">LÀN A</span>
                          <span>Bốt xe Ô tô Du lịch (Sedan, Wagon, Coupes)</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {blueprintSlots.filter(s => s.id.includes('B1-01') || s.id.includes('B1-02') || s.id.includes('B1-03') || s.id.includes('B1-04') || s.id.includes('B1-05') || s.id.includes('B1-06') || s.id.includes('B1-07') || s.id.includes('B1-08') || s.id.includes('B1-09') || s.id.includes('B1-10') || s.id.includes('B1-11')).map(slot => {
                            const isOccupied = slot.status === 'ĐÃ ĐỖ' || slot.status === 'XE VIP';
                            const isVip = slot.status === 'XE VIP';
                            const isMaint = slot.status === 'BẢO TRÌ';
                            return (
                              <button 
                                key={slot.id}
                                onClick={() => {
                                  if (isMaint) {
                                    triggerToast(`Ô ${slot.label} đang được kỹ thuật bảo hành hệ thống cảm biến!`, 'error');
                                  } else if (isOccupied) {
                                    setSelectedSlotDetails(slot);
                                    setSelectedSlotForCheckIn(null);
                                  } else {
                                    setSelectedSlotForCheckIn(slot);
                                    setSelectedSlotDetails(null);
                                    setCheckInPlate('');
                                  }
                                }}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative select-none min-h-[90px] outline-hidden ${
                                  isOccupied 
                                    ? isVip 
                                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:ring-2 hover:ring-yellow-400/20 shadow-xs' 
                                      : 'bg-blue-600/10 border-blue-600/30 text-blue-600 dark:text-blue-400 hover:ring-2 hover:ring-blue-500/20 shadow-xs'
                                    : isMaint
                                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 cursor-not-allowed opacity-80'
                                      : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-850 hover:border-blue-500 hover:scale-102 text-slate-500'
                                }`}
                              >
                                <span className="text-[10px] font-black opacity-60 leading-none">{slot.label}</span>
                                <div className="my-2 select-none h-6 flex items-center justify-center">
                                  {isOccupied ? (
                                    <strong className="text-xs font-mono font-black tracking-tight leading-none text-slate-700 dark:text-white uppercase px-1 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-900">{slot.plate}</strong>
                                  ) : isMaint ? (
                                    <span className="text-[9px] font-extrabold uppercase text-amber-500">Maint</span>
                                  ) : (
                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wide font-sans flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                      TRỐNG
                                    </span>
                                  )}
                                </div>
                                {isOccupied && (
                                  <span className={`text-[8px] font-black uppercase tracking-wider leading-none ${isVip ? 'text-yellow-500' : 'text-blue-500'}`}>
                                    {isVip ? '★ VIP Card' : slot.vehicleType || 'Sedan'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* PHYSICAL LANE CARRIAGEWAY ACCENT */}
                      <div className="relative py-2 font-sans overflow-hidden select-none">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t-2 border-dashed border-slate-150 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-none">
                          <span className="bg-white dark:bg-[#0b0f19] px-4 font-mono flex items-center gap-2">
                            <span>◀ Làn di chuyển chính - Lối Vào ⬆</span>
                            <span className="text-[8px]">•</span>
                            <span>Lối Ra ⬇ ▶</span>
                          </span>
                        </div>
                      </div>

                      {/* ZONE B PARKING LANES */}
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2.5">
                          <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 rounded text-[9px]">LÀN B</span>
                          <span>Hạ tầng đỗ xe có cổng sạc thông minh (EV Charging Ready)</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {blueprintSlots.filter(s => s.id.includes('B1-12') || s.id.includes('B1-13') || s.id.includes('B1-14') || s.id.includes('B1-15') || s.id.includes('B1-16') || s.id.includes('B1-17') || s.id.includes('B1-18') || s.id.includes('B1-19')).map(slot => {
                            const isOccupied = slot.status === 'ĐÃ ĐỖ' || slot.status === 'XE VIP';
                            const isVip = slot.status === 'XE VIP';
                            const isMaint = slot.status === 'BẢO TRÌ';
                            return (
                              <button 
                                key={slot.id}
                                onClick={() => {
                                  if (isMaint) {
                                    triggerToast(`Ô ${slot.label} đang được bảo dưỡng an toàn sạc pin!`, 'error');
                                  } else if (isOccupied) {
                                    setSelectedSlotDetails(slot);
                                    setSelectedSlotForCheckIn(null);
                                  } else {
                                    setSelectedSlotForCheckIn(slot);
                                    setSelectedSlotDetails(null);
                                    setCheckInPlate('');
                                  }
                                }}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative select-none min-h-[90px] outline-hidden ${
                                  isOccupied 
                                    ? isVip 
                                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:ring-2 hover:ring-yellow-400/20 shadow-xs' 
                                      : 'bg-blue-600/10 border-blue-600/30 text-blue-600 dark:text-blue-400 hover:ring-2 hover:ring-blue-500/20 shadow-xs'
                                    : isMaint
                                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 cursor-not-allowed opacity-80'
                                      : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-850 hover:border-blue-500 hover:scale-102 text-slate-550'
                                }`}
                              >
                                <span className="absolute top-1 right-2 text-[7px] font-black bg-emerald-500/10 text-emerald-600 rounded px-1 scale-85">⚡ CHARGE</span>
                                <span className="text-[10px] font-black opacity-60 leading-none">{slot.label}</span>
                                <div className="my-2 select-none h-6 flex items-center justify-center">
                                  {isOccupied ? (
                                    <strong className="text-xs font-mono font-black tracking-tight leading-none text-slate-700 dark:text-white uppercase px-1 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-900">{slot.plate}</strong>
                                  ) : isMaint ? (
                                    <span className="text-[9px] font-extrabold uppercase text-amber-500">Maint</span>
                                  ) : (
                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wide font-sans flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                      TRỐNG
                                    </span>
                                  )}
                                </div>
                                {isOccupied && (
                                  <span className={`text-[8px] font-black uppercase tracking-wider leading-none ${isVip ? 'text-yellow-500' : 'text-blue-500'}`}>
                                    {isVip ? '★ VIP Card' : slot.vehicleType || 'Sedan'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ZONE C PARKING LANES */}
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2.5">
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded text-[9px]">LÀN C</span>
                          <span>Bốt xe Chuyên dụng & Đa dụng cỡ lớn (SUV, Vans, Pick-ups)</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {blueprintSlots.filter(s => s.id.includes('B1-20') || s.id.includes('B1-21') || s.id.includes('B1-22') || s.id.includes('B1-23') || s.id.includes('B1-24') || s.id.includes('B1-25') || s.id.includes('B1-26') || s.id.includes('B1-27')).map(slot => {
                            const isOccupied = slot.status === 'ĐÃ ĐỖ' || slot.status === 'XE VIP';
                            const isVip = slot.status === 'XE VIP';
                            const isMaint = slot.status === 'BẢO TRÌ';
                            return (
                              <button 
                                key={slot.id}
                                onClick={() => {
                                  if (isMaint) {
                                    triggerToast(`Ô ${slot.label} đang được bảo dưỡng lắp đặt lại camera thông minh!`, 'error');
                                  } else if (isOccupied) {
                                    setSelectedSlotDetails(slot);
                                    setSelectedSlotForCheckIn(null);
                                  } else {
                                    setSelectedSlotForCheckIn(slot);
                                    setSelectedSlotDetails(null);
                                    setCheckInPlate('');
                                  }
                                }}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative select-none min-h-[90px] outline-hidden ${
                                  isOccupied 
                                    ? isVip 
                                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:ring-2 hover:ring-yellow-400/20 shadow-xs' 
                                      : 'bg-blue-600/10 border-blue-600/30 text-blue-600 dark:text-blue-400 hover:ring-2 hover:ring-blue-500/20 shadow-xs'
                                    : isMaint
                                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 cursor-not-allowed opacity-80'
                                      : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-850 hover:border-blue-500 hover:scale-102 text-slate-500'
                                }`}
                              >
                                <span className="text-[10px] font-black opacity-60 leading-none">{slot.label}</span>
                                <div className="my-2 select-none h-6 flex items-center justify-center">
                                  {isOccupied ? (
                                    <strong className="text-xs font-mono font-black tracking-tight leading-none text-slate-700 dark:text-white uppercase px-1 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-900">{slot.plate}</strong>
                                  ) : isMaint ? (
                                    <span className="text-[9px] font-extrabold uppercase text-amber-500">Maint</span>
                                  ) : (
                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wide font-sans flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                      TRỐNG
                                    </span>
                                  )}
                                </div>
                                {isOccupied && (
                                  <span className={`text-[8px] font-black uppercase tracking-wider leading-none ${isVip ? 'text-yellow-500' : 'text-blue-500'}`}>
                                    {isVip ? '★ VIP Card' : slot.vehicleType || 'SUV'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* INTERACTIVE CONTROLS OVERLAY FOR CHECKIN/OUT */}
                    <AnimatePresence mode="wait">
                      {selectedSlotForCheckIn && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-3"
                        >
                          <div className="flex bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-left">
                            <Plus className="w-5 h-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                            <div className="w-full text-xs space-y-3">
                              <div className="flex justify-between items-center">
                                <strong className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">KÍCH HOẠT ĐỖ XE THỦ CÔNG TẠI Ô [{selectedSlotForCheckIn.label}]</strong>
                                <button onClick={() => setSelectedSlotForCheckIn(null)} className="text-slate-400 hover:text-red-500 font-bold">Hủy bỏ</button>
                              </div>
                              <p className="text-slate-550 dark:text-slate-300">Vui lòng nhập thông tin xe thực tế đỗ tại vị trí đỗ này để lập biên bản.</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-1">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Biển số kiểm soát</label>
                                  <input 
                                    type="text"
                                    placeholder="Ví dụ: 30A-999.88"
                                    value={checkInPlate}
                                    onChange={(e) => setCheckInPlate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-mono text-xs uppercase font-extrabold focus:border-blue-500 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Mã thẻ (000001-000050)</label>
                                  <input 
                                    type="text"
                                    placeholder="Ví dụ: 000001"
                                    value={checkInCardCode}
                                    onChange={(e) => setCheckInCardCode(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-mono text-xs uppercase font-extrabold focus:border-blue-500 outline-none"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Hạng mục dòng xe</label>
                                  <div className="flex bg-white dark:bg-slate-950 rounded-xl border border-slate-205 dark:border-slate-850 p-0.5">
                                    {(['Sedan', 'SUV', 'Sang trọng'] as const).map(type => (
                                      <button
                                        key={type}
                                        type="button"
                                        onClick={() => setCheckInVehicleType(type)}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                                          checkInVehicleType === type 
                                            ? 'bg-blue-600 text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        {type}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* VIP TICKET CHIP TOGGLE */}
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                      type="checkbox"
                                      checked={checkInIsVip}
                                      onChange={(e) => setCheckInIsVip(e.target.checked)}
                                      className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">Nhãn VIP Membership</span>
                                  </label>

                                  <button 
                                    onClick={handleManualCheckIn}
                                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black tracking-wide uppercase hover:bg-blue-700 transition-colors"
                                  >
                                    Đỗ Xe Ngay
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {selectedSlotDetails && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-3"
                        >
                          <div className="flex bg-yellow-500/5 dark:bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 text-left">
                            <Info className="w-5 h-5 text-yellow-500 mr-2 shrink-0 mt-0.5" />
                            <div className="w-full text-xs space-y-3">
                              <div className="flex justify-between items-center">
                                <strong className="text-yellow-600 dark:text-yellow-400 font-extrabold text-sm">CHI TIẾT PHIÊN XE ĐANG ĐỖ: Ô ĐỖ [{selectedSlotDetails.label}]</strong>
                                <button onClick={() => setSelectedSlotDetails(null)} className="text-slate-400 hover:text-red-500 font-bold">Đóng chi tiết</button>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-sans">
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase">Biển kiểm soát xe</span>
                                  <strong className="text-sm font-mono font-black text-slate-800 dark:text-white uppercase">{selectedSlotDetails.plate}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold text-slate-400">Kiểu dáng xe</span>
                                  <strong className="text-xs text-slate-700 dark:text-slate-200 block font-bold">{selectedSlotDetails.vehicleType || 'Sedan'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase">Giờ đỗ bến chính</span>
                                  <strong className="text-xs text-slate-705 dark:text-slate-200 block font-bold">{selectedSlotDetails.entryTime || '10:12 AM'} (Vừa xong)</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase">Cảm biến sạc EV</span>
                                  <strong className="text-xs text-emerald-500 block font-extrabold">Đang ổn định ✔</strong>
                                </div>
                              </div>

                              <div className="pt-2 flex justify-end gap-2">
                                <button 
                                  onClick={() => handleManualCheckOut(selectedSlotDetails.id, selectedSlotDetails.label)}
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black tracking-wide uppercase transition-colors"
                                >
                                  Lệnh xuất barie (Xe ra khỏi bãi)
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                  {/* RIGHT 4 SHIELDS: HARDWARE OCR CAMERA & DOCK LOG timeline */}
                  <div className="xl:col-span-4 space-y-6">
                    
                    {/* CCTV LIVE VIEW OCR MONITOR DEVICE */}
                    <div className="p-4 rounded-2xl bg-black border border-slate-900 overflow-hidden relative text-left">
                      
                      {/* SCANNING GRID LINES */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-500/25 animate-bounce shadow-cyan-500 shadow-md z-10" />
                      
                      <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-emerald-500 font-bold mb-2.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          CAM_GATE_01_LPR_OCR : LIVE FEED
                        </span>
                        <span>FHD 1080P • 30FPS</span>
                      </div>

                      {/* DISPLAY DIGITAL PLATTER SCREEN */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/40 text-center font-mono py-6 space-y-3 relative overflow-hidden">
                        
                        <div className="absolute inset-0 bg-[radial-gradient(#052e16_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                        
                        <div className="space-y-1 relative z-10">
                          <span className="text-[10px] text-zinc-500 block uppercase tracking-wide">Nhận diện chuyển động</span>
                          {isLprRunning ? (
                            <motion.div 
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                              className="text-base text-yellow-400 font-black tracking-widest"
                            >
                              PARSING OCR BARCODE...
                            </motion.div>
                          ) : (
                            <strong className="text-xl font-extrabold tracking-widest text-cyan-400 block pr-1">
                              {mockLprPlateInput ? mockLprPlateInput.toUpperCase() : 'NO VEHICLE DETECTED'}
                            </strong>
                          )}
                        </div>

                        {/* MOCK PLATE FRAME */}
                        <div className="mx-auto max-w-[160px] p-2 py-3 bg-white border-2 border-slate-800 rounded-lg shadow-inner relative z-10 select-none">
                          <div className="absolute top-1 left-1.5 text-[6.5px] scale-80 font-black tracking-tight leading-none text-slate-500 block">VN REGISTRY</div>
                          <span className="text-slate-900 font-mono text-sm tracking-widest font-black uppercase text-center block pt-1.5">
                            {mockLprPlateInput ? mockLprPlateInput.toUpperCase() : '30A-888.88'}
                          </span>
                        </div>

                      </div>

                      {/* AUTO TRIGGER BUTTONS */}
                      <div className="text-[10px] font-bold text-slate-400 block pt-3">Simulate Random Vehicle Entrance Scans:</div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {[
                          { plate: '30G-888.88', desc: 'Mercedes S450 (VIP)', type: 'VIP' },
                          { plate: '29D1-333.33', desc: 'Honda SH', type: 'XEMAY' },
                          { plate: '30H-567.89', desc: 'Hyundai SantaFe', type: 'OTO' },
                          { plate: '51F-111.22', desc: 'Audi R8 Super', type: 'VIP' }
                        ].map(pre => (
                          <button
                            key={pre.plate}
                            onClick={() => {
                              setMockLprPlateInput(pre.plate);
                              setMockLprType(pre.type as any);
                              setIsLprRunning(true);
                              triggerToast(`Đang nạp phân tích biển số: ${pre.plate}`, 'info');
                              setTimeout(() => {
                                setIsLprRunning(false);
                                executeLprCheckIn(pre.plate);
                              }, 1200);
                            }}
                            className="p-2 border border-slate-800 bg-[#0d121f] text-left hover:bg-slate-900 transition-colors rounded-xl font-mono text-[9px] block"
                          >
                            <span className="text-cyan-400 font-extrabold text-[10px] block">{pre.plate}</span>
                            <span className="text-zinc-500 text-[8px] font-bold block truncate">{pre.desc}</span>
                          </button>
                        ))}
                      </div>

                    </div>

                    {/* LIVE ACTIVE DOCK LOG TIMELINE */}
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-205'} space-y-3 text-left`}>
                      <div className="flex justify-between items-center pb-1">
                        <strong className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Hành trình Giao dịch Mới ({recentActivities.length})</strong>
                        <button 
                          onClick={() => {
                            setRecentActivities([
                              { id: 'act-1', plate: '51A-892.44', type: 'Sedan', gate: 'Cổng vào 1', time: '10:42:15', action: 'Vào' },
                              { id: 'act-2', plate: '29C-123.99', type: 'SUV', gate: 'Cổng ra 2', time: '10:40:05', action: 'Ra' }
                            ]);
                            triggerToast('Đã dọn dẹp trống lịch sử hoạt động', 'info');
                          }}
                          className="text-[9px] text-blue-500 font-bold hover:underline"
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        <AnimatePresence initial={false}>
                          {recentActivities.map(act => {
                            const isEntry = act.action === 'Vào' || act.action === 'IN';
                            return (
                              <motion.div 
                                key={act.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80"
                              >
                                <div className="flex items-center gap-2">
                                  {isEntry ? (
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black">
                                      IN
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] font-black">
                                      OUT
                                    </div>
                                  )}
                                  <div>
                                    <strong className="text-xs font-mono font-black text-slate-800 dark:text-white uppercase block leading-none">{act.plate}</strong>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-1">{act.type} • {act.gate}</span>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <span className="text-[10px] font-mono text-slate-400 font-bold block">{act.time}</span>
                                  {act.vip && (
                                    <span className="inline-block text-[7.5px] bg-amber-500/10 text-amber-600 rounded px-1 font-black uppercase tracking-wider mt-0.5 scale-90">VIP CARD</span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* SUB-VIEW 3: DOANH THU & VAT DIGITAL E-RECEIPTS (Screenshot 3 Replication) */}
            {activeMenu === 'revenue' && (
              <div className="space-y-6 animate-fade-in" id="revenue-sub-view">
                
                {/* HEADER ROW WITH FACILITIES AND SELECTORS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black font-sans text-slate-900 dark:text-white flex items-center gap-2">
                      Báo cáo Doanh thu
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Phân tích dòng tiền và hiệu suất hệ thống toàn diện</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Month selector */}
                    <div className="relative">
                      <select 
                        defaultValue="10/2023"
                        className={`px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        onChange={() => triggerToast("Đã thay đổi bộ lọc chu kỳ báo cáo", "info")}
                      >
                        <option value="10/2023">Tháng 10, 2023</option>
                        <option value="11/2023">Tháng 11, 2023</option>
                        <option value="12/2023">Tháng 12, 2023</option>
                        <option value="all">Cả năm 2023</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        triggerToast("Đang kết xuất báo cáo dòng tiền PDF dạng kế toán...", "success");
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Xuất báo cáo</span>
                    </button>
                  </div>
                </div>

                {/* STATS OVERVIEW CARDS (HOM NAY, THANG NAY, DU KIEN NAM 2023) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none font-sans">
                  
                  {/* CARD 1: HÔM NAY */}
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-905 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">HÔM NAY</span>
                        <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">18.4M</h3>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-slate-800 rounded-xl text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <ChevronUp className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>+12.5% so với hôm qua</span>
                      </span>
                    </div>
                  </div>

                  {/* CARD 2: THÁNG NÀY */}
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-905 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">THÁNG NÀY</span>
                        <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">452M</h3>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                        <Layers className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                        <ChevronDown className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>-2.1% so với tháng trước</span>
                      </span>
                    </div>
                  </div>

                  {/* CARD 3: DỰ KIẾN NĂM 2023 */}
                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-905 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">DỰ KIẾN NĂM 2023</span>
                        <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">5.4B</h3>
                      </div>
                      <div className="p-2 bg-[#f0f9ff] dark:bg-slate-800 rounded-xl text-blue-500">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Đạt 92% KPI</span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* RECENTS TRANSACTION LEDGER (REPLICATED CARD WITH FILTERS & PAGINATOR) */}
                <div className={`p-6 bg-white dark:bg-slate-905 border rounded-2xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200/60 shadow-xs'} space-y-4`}>
                  
                  {/* LEDGER BAR FOR TRANSACTION SEARCH AND CONTROLS */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <strong className="text-base font-black tracking-tight text-slate-850 dark:text-white font-sans">
                      Giao dịch gần đây
                    </strong>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Mã GD, Biển số..." 
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/50 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          onChange={(e) => {
                            // Can filter simulated transactions list locally
                            setCustomerSearch(e.target.value);
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => triggerToast("Mở bộ lọc nâng cao", "info")}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-450" />
                        <span>Lọc</span>
                      </button>
                    </div>
                  </div>

                  {/* HIGH RESOLUTION TRANSACTION TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-3">MÃ GD</th>
                          <th className="py-3 px-3">THỜI GIAN</th>
                          <th className="py-3 px-2">BIỂN SỐ</th>
                          <th className="py-3 px-3">LOẠI VÉ</th>
                          <th className="py-3 px-3">SỐ TIỀN</th>
                          <th className="py-3 px-3">PHƯƠNG THỨC</th>
                          <th className="py-3 px-3">TRẠNG THÁI</th>
                          <th className="py-3 px-3 text-right">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {transactions
                          .filter(item => {
                            if (!customerSearch) return true;
                            const query = customerSearch.toLowerCase();
                            return item.id.toLowerCase().includes(query) || item.plate.toLowerCase().includes(query);
                          })
                          .map(item => {
                            const isSuccess = item.status === 'THÀNH CÔNG';
                            const isGhiNhan = item.status === 'ĐÃ GHI NHẬN';
                            const isCanXuLy = item.status === 'CẦN XỬ LÝ';
                            
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                                <td className="py-3 px-3 font-mono font-black text-slate-650 dark:text-slate-350">{item.id}</td>
                                <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-medium">{item.time}</td>
                                <td className="py-3 px-2">
                                  <span className={`inline-block px-2.5 py-1 font-mono font-black rounded-lg uppercase tracking-wider text-[11px] ${
                                    isGhiNhan 
                                      ? 'bg-slate-950 dark:bg-slate-900 border border-slate-800 text-yellow-500' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 border border-slate-200/50 dark:border-slate-750'
                                  }`}>
                                    {item.plate}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">{item.type}</td>
                                <td className="py-3 px-3 text-slate-900 dark:text-white font-extrabold text-sm">{item.cost}</td>
                                <td className="py-3 px-3">
                                  {item.paymentMethod === 'Lỗi kết nối' ? (
                                    <span className="flex items-center gap-1 text-rose-500 font-bold">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
                                      <span>Lỗi kết nối</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-505 dark:text-slate-400 font-medium">{item.paymentMethod}</span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                    isSuccess 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                                      : isCanXuLy 
                                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border-rose-100 dark:border-rose-900/30' 
                                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-150 dark:border-slate-800'
                                  }`}>
                                    ● {item.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {isCanXuLy ? (
                                    <button 
                                      onClick={() => {
                                        setTransactions(prev => prev.map(t => t.id === item.id ? { ...t, status: 'THÀNH CÔNG', paymentMethod: 'QR-Pay Khắc Phục' } : t));
                                        triggerToast(`Đã xử lý thông luồng thủ công cho giao dịch ${item.id}`, "success");
                                      }}
                                      className="px-2.5 py-1 text-[10px] font-black tracking-wide text-white bg-blue-600 hover:bg-blue-700 rounded-lg uppercase"
                                    >
                                      Xử lý
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        setSelectedReceipt(item);
                                        triggerToast(`Hiển thị hóa đơn ${item.id}`, "info");
                                      }}
                                      className="px-2 py-1 text-slate-455 hover:text-blue-600 dark:hover:text-blue-400 font-extrabold hover:underline"
                                    >
                                      In/Chi tiết
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* ACCURATE PAGINATION BAR FOOTER IN REVENUE CARD */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-850 gap-4 select-none font-sans text-xs">
                    <span className="text-slate-500 font-medium">Hiển thị 1 - {transactions.length} trên 248 giao dịch</span>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1 px-2.5 border rounded-lg bg-white dark:bg-slate-950 font-semibold hover:bg-slate-50">&lt;</button>
                      <button className="px-3 py-1 font-extrabold bg-blue-600 text-white rounded-lg">1</button>
                      <button className="px-3 py-1 font-bold border hover:bg-slate-50 rounded-lg" onClick={() => triggerToast("Mở trang 2", "info")}>2</button>
                      <button className="px-3 py-1 font-bold border hover:bg-slate-50 rounded-lg" onClick={() => triggerToast("Mở trang 3", "info")}>3</button>
                      <span className="text-slate-400">...</span>
                      <button className="p-1 px-2.5 border rounded-lg bg-white dark:bg-slate-950 font-semibold hover:bg-slate-50">&gt;</button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SUB-VIEW 4: QUAN LY NHAN SỰ RASTER (Screenshot 5 Replication) */}
            {activeMenu === 'staff' && (
              <div className="space-y-6 animate-fade-in text-left" id="staff-sub-view">
                
                {/* HEADER SUBTITLE AND CONTROLS */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div>
                    <h2 className="text-2.5xl font-black font-sans text-slate-900 dark:text-white">
                      Quản lý Nhân sự & Ca trực
                    </h2>
                    <p className="text-slate-550 dark:text-slate-400 text-xs font-bold font-sans">
                      Cơ sở: Trung tâm thương mại Vincom Center (Cơ sở 01)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto font-sans">
                    {/* Search bar inside staff page banner */}
                    <div className="relative flex-1 sm:w-60 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm nhân viên..." 
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-white dark:bg-slate-950 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={() => {
                        triggerToast("Đang lập kế hoạch tự động cho tuần tới...", "info");
                      }}
                      className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-455" />
                      <span>Sắp xếp ca</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAddStaffModal(true);
                      }}
                      className="px-4 py-2 bg-slate-955 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Thêm nhân viên</span>
                    </button>
                  </div>
                </div>

                {/* TABS SELECTORS */}
                <div className="flex items-center gap-2 select-none border-b border-slate-100 dark:border-slate-850 pb-1 font-sans text-xs">
                  {(['Tất cả', 'Đang trực', 'Nghỉ phép'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStaffFilter(tab)}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-colors ${
                        staffFilter === tab 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                          : 'text-slate-400 hover:text-slate-650'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* TWO COLUMN GRID LAYOUT (LEFT LISTING, RIGHT SIDEBAR ASSIGNMENTS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                  
                  {/* LEFT STAFF GRID COLUMN (SPAN 8) */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {staff
                        .filter(member => {
                          const query = staffSearch.toLowerCase();
                          const matchesSearch = member.name.toLowerCase().includes(query) || member.role.toLowerCase().includes(query);
                          
                          if (!matchesSearch) return false;
                          if (staffFilter === 'Tất cả') return true;
                          if (staffFilter === 'Đang trực') return member.status === 'ONLINE';
                          if (staffFilter === 'Nghỉ phép') return member.status === 'OFFLINE';
                          return true;
                        })
                        .map(member => {
                          const isOnline = member.status === 'ONLINE';
                          return (
                            <div 
                              key={member.id} 
                              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-905 border-slate-850 hover:border-slate-750' 
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-205 dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white font-extrabold text-sm shadow-xs shrink-0">
                                    {member.name === 'Trần Thị Bé' ? (
                                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
                                    ) : member.name === 'Lê Văn Cường' ? (
                                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover text-xs" />
                                    ) : member.name === 'Phạm Đức Duy' ? (
                                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
                                    ) : member.name === 'Hoàng Yến' ? (
                                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{member.avatar}</span>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-[13.5px] font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-1.5">
                                      {member.name}
                                    </h4>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-450 font-bold mt-0.5">{member.role}</p>
                                  </div>
                                </div>

                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border flex items-center gap-1.5 ${
                                  isOnline 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/60 dark:border-emerald-900/30' 
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-450 dark:text-slate-400 border-slate-150 dark:border-slate-800'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                  <span>{isOnline ? 'Đăng trực' : 'Nghỉ phép'}</span>
                                </span>
                              </div>

                              <div className="space-y-1.5 text-xs pb-3 border-b border-dashed border-slate-100 dark:border-slate-850">
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/30 px-2.5 py-1 rounded-lg">
                                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Trạm / Cổng</span>
                                  <strong className="text-slate-700 dark:text-slate-200 text-xs">{member.gate}</strong>
                                </div>

                                {member.reason ? (
                                  <div className="flex justify-between items-center text-rose-500 dark:text-rose-400 font-bold px-2.5 py-1">
                                    <span>Lý do vắng mặt:</span>
                                    <span>{member.reason}</span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center px-2.5 py-1 text-slate-500 dark:text-slate-400">
                                    <span>Ca trực hiện hành:</span>
                                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{member.leaveHours || 'N/A'}</span>
                                  </div>
                                )}
                              </div>

                              {/* Card action controls footer */}
                              <div className="flex items-center justify-between text-[11px] pt-1">
                                <span className="flex items-center gap-1 font-mono text-slate-400 font-bold">
                                  <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>ID: ...{member.keyLabel || 'N/A'}</span>
                                </span>

                                <div className="flex items-center gap-3">
                                  {editingStaffGateId === member.id ? (
                                    <select
                                      autoFocus
                                      value={member.gate}
                                      onChange={(e) => {
                                        const nextGate = e.target.value;
                                        setStaff(staff.map(s => s.id === member.id ? { ...s, gate: nextGate } : s));
                                        triggerToast(`Đã điều phối địa điểm đồn trú cho ${member.name} sang: ${nextGate}`, "success");
                                        setEditingStaffGateId(null);
                                      }}
                                      onBlur={() => setEditingStaffGateId(null)}
                                      className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md px-1 py-0.5 text-[11px] outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                      <option value="" disabled>Chọn trạm/cổng...</option>
                                      <option value="Cổng Vào 01">Cổng Vào 01</option>
                                      <option value="Cổng Ra 02">Cổng Ra 02</option>
                                      <option value="Cổng Chính">Cổng Chính</option>
                                      <option value="Bốt Trung Tâm">Bốt Trung Tâm</option>
                                      <option value="Tuần Tra Khu A">Tuần Tra Khu A</option>
                                      <option value="Tuần Tra Khu B">Tuần Tra Khu B</option>
                                    </select>
                                  ) : (
                                    <button
                                      onClick={() => setEditingStaffGateId(member.id)}
                                      className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold cursor-pointer"
                                    >
                                      Đổi ca/trạm
                                    </button>
                                  )}
                                  <span className="text-slate-200">|</span>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn muốn ghi nhận xin nghỉ phép của nhân sự ${member.name}?`)) {
                                        setStaff(staff.map(s => s.id === member.id ? { ...s, status: 'OFFLINE', reason: 'Nghỉ phép gia đình' } : s));
                                        triggerToast(`Ký duyệt nghỉ phép cho ${member.name} hôm nay.`, "error");
                                      }
                                    }}
                                    className="text-rose-500 hover:underline font-extrabold"
                                  >
                                    Báo nghỉ
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN SIDEBAR WIDGETS (SPAN 4) */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* SHIFTS CONFIGURATIONS PLANNER (Phân ca hôm nay) */}
                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-905 border-slate-850' : 'bg-white border-slate-200/80 shadow-xs'} space-y-4`}>
                      <div className="flex justify-between items-center">
                        <strong className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Phân ca hôm nay (14/11)</strong>
                        <button 
                          onClick={() => triggerToast("Mở biểu đồ tuần đầy đủ", "info")}
                          className="text-[11px] text-[#2563eb] font-bold hover:underline"
                        >
                          Chi tiết tuần &rarr;
                        </button>
                      </div>

                      <div className="space-y-3.5 text-xs text-left">
                        {/* Headers */}
                        <div className="grid grid-cols-3 text-[10px] text-slate-405 font-bold uppercase pb-1.5 border-b border-slate-100 dark:border-slate-850">
                          <div>TRẠM / CỔNG</div>
                          <div>CA SÁNG <span className="text-[8px] font-medium block">06:00-14:00</span></div>
                          <div>CA CHIỀU <span className="text-[8px] font-medium block">14:00-22:00</span></div>
                        </div>

                        {/* Row 1 */}
                        <div className="grid grid-cols-3 py-2 border-b border-dashed border-slate-100 dark:border-slate-850 items-center">
                          <strong className="text-slate-800 dark:text-slate-200">Cổng vào 1</strong>
                          <span className="text-slate-700 dark:text-slate-400 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" /> T.T. Bé
                          </span>
                          <span className="text-slate-550 dark:text-slate-450">P.A. Duy</span>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-3 py-2 border-b border-dashed border-slate-100 dark:border-slate-850 items-center">
                          <strong className="text-slate-800 dark:text-slate-200">Cổng ra 1</strong>
                          <span className="text-slate-550 dark:text-slate-450">N.V. An</span>
                          <span className="text-slate-550 dark:text-slate-450">L.T. Hoa</span>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-3 py-2 border-b border-dashed border-slate-100 dark:border-slate-850 items-center">
                          <strong className="text-slate-800 dark:text-slate-200">Cổng ra 2 (VIP)</strong>
                          <span className="text-slate-700 dark:text-slate-400 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" /> L.V. Cường
                          </span>
                          <span className="text-amber-500 bg-amber-500/10 dark:bg-amber-500/5 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] text-center">Trống ca</span>
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-3 py-1 items-center">
                          <strong className="text-slate-800 dark:text-slate-200">Tuần tra hầm B1</strong>
                          <span className="text-slate-550 dark:text-slate-450">K.T. Long</span>
                          <span className="text-slate-550 dark:text-slate-450">A.M. Quân</span>
                        </div>
                      </div>
                    </div>

                    {/* SHIFT HANDOVER DIALOG LEDGER (Bàn giao ca gần nhất) */}
                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-905 border-slate-850' : 'bg-white border-slate-200/80 shadow-xs'} space-y-4`}>
                      <div className="flex justify-between items-center">
                        <strong className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>Bàn giao ca gần nhất</span>
                        </strong>
                        <span className="text-[10px] text-slate-400 font-bold">Hôm nay, 06:05</span>
                      </div>

                      {/* Visual sender -> receiver */}
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-xs">
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">NGƯỜI GIAO (Ca Đêm)</p>
                          <strong className="text-slate-800 dark:text-white">Hoàng Kim</strong>
                        </div>
                        
                        <div className="p-1 px-2.5 bg-blue-50 dark:bg-slate-900 border text-blue-600 rounded-lg font-bold font-mono text-[11px] select-none animate-pulse">
                          &larr;&rarr;
                        </div>

                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">NGƯỜI NHẬN (Ca Sáng)</p>
                          <strong className="text-slate-800 dark:text-white">Trần Thị Bé</strong>
                        </div>
                      </div>

                      {/* Handover comments content block */}
                      <div className="space-y-2 block text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">GHI CHÚ BÀN GIAO:</span>
                        <div className="p-3 bg-blue-50/30 dark:bg-slate-950/20 border border-blue-50 dark:border-slate-850/50 rounded-xl leading-relaxed text-slate-650 dark:text-slate-300 space-y-2.5 text-left text-[11px]">
                          <p>• Hệ thống barrier Cổng ra 1 thỉnh thoảng phản hồi chậm, đã báo kỹ thuật.</p>
                          <p>• Tiền mặt bàn giao trong két: <strong className="text-slate-900 dark:text-white">1,250,000 VND</strong>.</p>
                          <p>• Có 2 xe VIP gửi qua đêm (Biển số: <strong className="text-blue-600 dark:text-blue-400 font-mono">30G-123.45</strong>, <strong className="font-mono text-emerald-600">51H-987.65</strong>).</p>
                        </div>
                      </div>

                      {/* Verification status indicators */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] select-none">
                        <span className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 rounded-lg font-extrabold flex items-center justify-center gap-1 border border-emerald-100/40 dark:border-emerald-950/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Đã xác nhận (HKja_8413)</span>
                        </span>
                        <span className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 rounded-lg font-extrabold flex items-center justify-center gap-1 border border-emerald-100/40 dark:border-emerald-950/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Đã ký nhận (TTB_8412)</span>
                        </span>
                      </div>

                    </div>

                  </div>

                </div>

                {/* MODAL ADD STAFF DIALOG (CONSERVED ORIGINAL CORE FORM) */}
                <AnimatePresence>
                  {showAddStaffModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className={`w-full max-w-sm rounded-[24px] p-6 border text-slate-850 ${isDarkMode ? 'bg-[#0f172a] border-slate-850 text-white' : 'bg-white border-slate-200'}`}>
                        <div className="space-y-4 block text-left font-sans text-xs">
                          <strong className="text-base font-black tracking-tight block">Tuyển dụng thành viên ca trực</strong>
                          
                          <div className="space-y-3">
                            <div className="space-y-1 block">
                              <label className="text-[10px] font-extrabold uppercase text-slate-450">Họ và tên nhân viên</label>
                              <input id="staff-name-input" type="text" placeholder="Nguyễn Văn X" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                            </div>
                            <div className="space-y-1 block">
                              <label className="text-[10px] font-extrabold uppercase text-slate-450">Bốt phân chỉ định</label>
                              <input id="staff-gate-input" type="text" placeholder="Bốt ra/vào số 3" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setShowAddStaffModal(false)}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-850 rounded-lg font-bold"
                            >
                              Hủy bỏ
                            </button>
                            <button
                              onClick={() => {
                                const nameEl = document.getElementById('staff-name-input') as HTMLInputElement;
                                const gateEl = document.getElementById('staff-gate-input') as HTMLInputElement;
                                if (nameEl && nameEl.value.trim() && gateEl && gateEl.value.trim()) {
                                  const nameVal = nameEl.value.trim();
                                  const gateVal = gateEl.value.trim();
                                  const nextId = `STF-${Math.floor(10 + Math.random() * 90)}`;
                                  const newS: StaffMember = {
                                    id: nextId,
                                    name: nameVal,
                                    avatar: nameVal.split(' ').pop()?.[0] || 'X',
                                    role: 'Nhân viên bốt gác',
                                    gate: gateVal,
                                    swipes: 0,
                                    status: 'ONLINE',
                                    leaveHours: '08:00 - 17:00',
                                    keyLabel: Math.floor(1000 + Math.random() * 9000).toString()
                                  };
                                  setStaff([...staff, newS]);
                                  setShowAddStaffModal(false);
                                  triggerToast(`Đã chiêu mộ thành công tuyển dụng mới: ${nameVal}. Sắp xếp bốt: ${gateVal}.`, 'success');
                                } else {
                                  triggerToast('Vui lòng điền họ tên và bốt chỉ định.', 'error');
                                }
                              }}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-extrabold uppercase tracking-wide text-[10.5px]"
                            >
                              Đồng ý chỉ định
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>

              </div>
            )}

            {/* SUB-VIEW 5: VIP VERIFICATION PANEL INTEGRATION & CUSTOMER MANAGEMENT TABLE (Screenshot 4 Replication) */}
            {activeMenu === 'customers' && (
              <div className="space-y-6 animate-fade-in text-left" id="customers-sub-view">
                
                {/* DUAL-TAB SEGMENT HEADERS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2.5xl font-black font-sans text-slate-900 dark:text-white flex items-center gap-2">
                      Quản lý khách hàng
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {customerTab === 'list' 
                        ? 'Báo cáo chi tiết và quản lý thông tin khách hàng sở hữu thẻ' 
                        : 'Phê duyệt thẻ thành viên VIP bằng quy trình OCR tự động'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-sans text-xs">
                    <button
                      onClick={() => setCustomerTab('list')}
                      className={`px-3.5 py-2 rounded-xl font-bold border transition-all ${
                        customerTab === 'list'
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                          : 'bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      Danh sách khách hàng
                    </button>
                    
                    <button
                      onClick={() => setCustomerTab('approvals')}
                      className={`px-3.5 py-2 rounded-xl font-bold border transition-all flex items-center gap-1 ${
                        customerTab === 'approvals'
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                          : 'bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Duyệt hồ sơ VIP (OCR)</span>
                    </button>
                  </div>
                </div>

                {/* CONDITIONAL RENDER OF CUSTOMERS SUB-TABS */}
                {customerTab === 'list' ? (
                  <div className={`p-6 bg-white dark:bg-slate-905 border rounded-2xl ${isDarkMode ? 'border-slate-800 animate-fade-in' : 'border-slate-200/60 shadow-xs animate-fade-in'} space-y-4`}>
                    
                    {/* SEARCH FILTERS AND REGISTER BAR */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Search keyword input */}
                        <div className="relative flex-1 sm:w-64">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Tìm kiếm tên, biển số, SĐT..." 
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950/50 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Card type filter */}
                        <select
                          value={customerFilter}
                          onChange={(e) => setCustomerFilter(e.target.value as any)}
                          className="px-2 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-white dark:bg-slate-950 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Tất cả">Tất cả loại thẻ</option>
                          <option value="VIP">Thành viên VIP</option>
                          <option value="Tháng">Vé tháng thường</option>
                        </select>
                      </div>

                      <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Đăng ký thẻ mới</span>
                      </button>
                    </div>

                    {/* TABLE OF CUSTOMERS */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-3">HỌ VÀ TÊN</th>
                            <th className="py-3 px-3">BIỂN SỐ</th>
                            <th className="py-3 px-3">LOẠI THẺ</th>
                            <th className="py-3 px-3">HẠN SỬ DỤNG</th>
                            <th className="py-3 px-3">TRẠNG THÁI</th>
                            <th className="py-3 px-3 text-right">THAO TÁC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {customerList
                            .filter(cust => {
                              const query = customerSearch.toLowerCase();
                              const matchesSearch = cust.name.toLowerCase().includes(query) || cust.plate.toLowerCase().includes(query) || cust.phone.includes(query);
                              
                              if (!matchesSearch) return false;
                              if (customerFilter === 'Tất cả') return true;
                              return cust.cardType === customerFilter;
                            })
                            .map(cust => {
                              const isActive = cust.status === 'ACTIVE';
                              const isExpired = cust.status === 'EXPIRED';
                              const isInPark = cust.status === 'IN_PARK';
                              
                              return (
                                <tr key={cust.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                                  <td className="py-3.5 px-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center border border-slate-200/50 dark:border-slate-750">
                                        {cust.name.split(' ').pop()?.[0] || 'U'}
                                      </div>
                                      <div>
                                        <strong className="text-slate-850 dark:text-white block font-black">{cust.name}</strong>
                                        <span className="text-[10px] text-slate-400 font-medium">{cust.phone}</span>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  <td className="py-3.5 px-3">
                                    <span className="inline-block px-2.5 py-1 font-mono font-black bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-[11px] tracking-wider uppercase">
                                      {cust.plate}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                      cust.cardType === 'VIP' 
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                                        : cust.cardType === 'Tháng'
                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                      {cust.cardType}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-3 font-medium text-slate-650 dark:text-slate-300">
                                    {isExpired ? (
                                      <span className="text-rose-500 font-extrabold flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                        <span>Đã hết hạn</span>
                                      </span>
                                    ) : (
                                      <span>{cust.expiryDate}</span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                      isActive 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                                        : isExpired
                                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border-rose-100 dark:border-rose-900/30' 
                                        : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                                    }`}>
                                      ● {isActive ? 'Hoạt động' : isExpired ? 'Ngừng cấp' : 'Trong bãi'}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-3 text-right">
                                    <div className="flex justify-end gap-3.5 text-[11px] font-bold">
                                      <button 
                                        onClick={() => {
                                           const d = new Date();
                                           d.setFullYear(d.getFullYear() + 1);
                                           const nextExpiry = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                          if (nextExpiry && nextExpiry.trim()) {
                                            setCustomerList(prev => prev.map(c => c.id === cust.id ? { ...c, expiryDate: nextExpiry.trim(), status: 'ACTIVE' } : c));
                                            triggerToast(`Gia hạn thành công tài khoản thẻ cho ${cust.name} đến ngày ${nextExpiry.trim()}`, "success");
                                          }
                                        }}
                                        className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                      >
                                        Gia hạn
                                      </button>
                                      
                                      <span className="text-slate-205 dark:text-slate-800">|</span>

                                      <button 
                                        onClick={() => {
                                          if (confirm(`Bạn muốn tước quyền sử dụng và xóa tài khoản thẻ này của khách: ${cust.plate}?`)) {
                                            setCustomerList(prev => prev.filter(c => c.id !== cust.id));
                                            triggerToast(`Đã thu hồi hủy thẻ ${cust.plate} thành công.`, "error");
                                          }
                                        }}
                                        className="text-rose-500 hover:text-rose-600 hover:underline cursor-pointer font-extrabold"
                                      >
                                        Thu hồi
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINATOR FOR TABLE CUSTOMERS */}
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-850 gap-4 select-none font-sans text-xs">
                      <span className="text-slate-500 font-medium">Hiển thị 1 - {customerList.length} trên 2,154 khách hàng</span>
                      <div className="flex items-center gap-1.5">
                        <button className="p-1 px-2.5 border rounded-lg bg-white dark:bg-slate-950 font-semibold hover:bg-slate-50">&lt;</button>
                        <button className="px-3 py-1 font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg">1</button>
                        <button className="px-3 py-1 font-bold border hover:bg-slate-50 rounded-lg">2</button>
                        <button className="px-3 py-1 font-bold border hover:bg-slate-50 rounded-lg">3</button>
                        <span className="text-slate-400">...</span>
                        <button className="p-1 px-2.5 border rounded-lg bg-white dark:bg-slate-950 font-semibold hover:bg-slate-50">&gt;</button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/20 dark:bg-slate-950/20 border border-blue-50 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-left text-slate-650 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white block font-black font-sans">Chuỗi phê duyệt thông minh (Hệ thống AI OCR)</strong>
                        <span>Hệ thống tự động trích xuất thông tin giấy đăng ký xe (Cà vẹt) và giấy tờ tùy thân của khách hàng từ ảnh tải lên để duyệt cấp tài khoản VIP hoặc vé tháng trực tuyến mà không cần giấy tờ hành chính thủ công.</span>
                      </div>
                    </div>
                    
                    {/* VIP OCR panel component */}
                    <VipApprovalPanel isDarkMode={isDarkMode} triggerToast={triggerToast} />
                  </div>
                )}

                {/* MODAL REGISTER NEW CUSTOMER CARD DIALOG */}
                <AnimatePresence>
                  {showAddCustomerModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className={`w-full max-w-md rounded-[24px] p-6 border text-slate-850 ${isDarkMode ? 'bg-[#0f172a] border-slate-850 text-white' : 'bg-white border-slate-200 shadow-xl'}`}>
                        <div className="space-y-4 block text-left font-sans text-xs">
                          <strong className="text-base font-black tracking-tight block text-slate-900 dark:text-white">Đăng ký thông viên thẻ tháng mới</strong>
                          
                          <div className="space-y-3">
                            <div className="space-y-1 block">
                              <label className="text-[10px] font-extrabold uppercase text-slate-450">Tên chủ thẻ xe</label>
                              <input id="cust-name" type="text" placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1 block">
                                <label className="text-[10px] font-extrabold uppercase text-slate-450">Số điện thoại</label>
                                <input id="cust-phone" type="text" placeholder="090 ..." className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                              </div>
                              <div className="space-y-1 block">
                                <label className="text-[10px] font-extrabold uppercase text-slate-450">Biển kiểm soát</label>
                                <input id="cust-plate" type="text" placeholder="30A-..." className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold uppercase" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1 block">
                                <label className="text-[10px] font-extrabold uppercase text-slate-450">Loại thẻ</label>
                                <select id="cust-type" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                                  <option value="Tháng">Vé tháng thường</option>
                                  <option value="VIP">Thành viên VIP</option>
                                </select>
                              </div>
                              <div className="space-y-1 block">
                                <label className="text-[10px] font-extrabold uppercase text-slate-450">Hạn sử dụng</label>
                                <input id="cust-expiry" type="text" defaultValue={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; })()} className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setShowAddCustomerModal(false)}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-850 rounded-lg font-bold hover:bg-slate-200"
                            >
                              Hủy bỏ
                            </button>
                            <button
                              onClick={() => {
                                const nameEl = document.getElementById('cust-name') as HTMLInputElement;
                                const phoneEl = document.getElementById('cust-phone') as HTMLInputElement;
                                const plateEl = document.getElementById('cust-plate') as HTMLInputElement;
                                const typeEl = document.getElementById('cust-type') as HTMLSelectElement;
                                const expiryEl = document.getElementById('cust-expiry') as HTMLInputElement;

                                if (nameEl?.value.trim() && plateEl?.value.trim() && phoneEl?.value.trim()) {
                                  const nameVal = nameEl.value.trim();
                                  const plateVal = plateEl.value.trim();
                                  const phoneVal = phoneEl.value.trim();
                                  const typeVal = typeEl.value as 'VIP' | 'Tháng';
                                  const expiryVal = expiryEl.value.trim();

                                  const newCust: Customer = {
                                    id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
                                    name: nameVal,
                                    phone: phoneVal,
                                    plate: plateVal.toUpperCase(),
                                    cardType: typeVal,
                                    status: 'ACTIVE',
                                    expiryDate: expiryVal
                                  };

                                  setCustomerList([...customerList, newCust]);
                                  setShowAddCustomerModal(false);
                                  triggerToast(`Đăng ký thành công hội viên mới: ${nameVal} [${plateVal.toUpperCase()}]`, 'success');
                                } else {
                                  triggerToast('Vui lòng điền họ tên, số điện thoại và biển kiểm soát.', 'error');
                                }
                              }}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-extrabold uppercase tracking-wide text-[10.5px]"
                            >
                              Phát hành thẻ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>

              </div>
            )}

            {/* SUB-VIEW 6: CẤU HÌNH KỸ THUẬT HARDWARE SWITCH CHATTER */}
            {activeMenu === 'technical' && (
              <div className="space-y-6 animate-fade-in" id="tech-sub-view">
                <div>
                  <h2 className="text-2xl font-black font-sans">Điều khiển phần cứng Barrier</h2>
                  <p className="text-slate-550 dark:text-slate-400 text-xs font-bold">Kích hạ trình khẩn cấp, cài lực dẻo xoay bốt hoặc kiểm soát tín hiệu luồng camera.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch text-left font-sans text-xs">
                  
                  {/* Gate overrides */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-905 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                    <strong className="text-base font-black tracking-tight block">Kích hoat đóng mở Barie cưỡng bức (Manual Override)</strong>
                    
                    <div className="space-y-3.5">
                      {gateBarriers.map(b => (
                        <div key={b.gateId} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                          <div>
                            <strong className="text-xs font-bold font-sans text-slate-850 dark:text-white block">{b.name}</strong>
                            <span className="text-[10px] text-slate-400 font-bold block">{b.open ? 'BARRIER ĐANG MỞ (NÂNG)' : 'BARRIER ĐANG ĐÓNG (HẠ TRÌNH)'}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setGateBarriers(prev => prev.map(gate => {
                                if (gate.gateId === b.gateId) {
                                  return { ...gate, open: !gate.open };
                                }
                                return gate;
                              }));
                              triggerToast(`Đã cưỡng bức kích hoạt ${b.open ? 'HẠ' : 'NÂNG'} Barie bốt ${b.name}!`, 'info');
                              const newLog = {
                                id: `LOG-${Date.now()}`,
                                time: new Date().toLocaleTimeString(),
                                type: 'WARNING',
                                message: `⚠️ Cảnh báo cưỡng bức: Quản trị viên thay đổi cơ cấu nâng hành trình bốt phanh [${b.name}].`
                              };
                              setLogs([newLog, ...logs]);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wider uppercase transition-colors select-none cursor-pointer ${
                              b.open 
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {b.open ? 'Hạ barie (Close)' : 'Nâng Barie (Open)'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live animated mock screens */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-905 border-slate-800' : 'bg-white border-slate-200'} space-y-4 flex flex-col justify-between`}>
                    <strong className="text-base font-black tracking-tight block">Luồng Camera OCR cổng kiểm soát (Live Streams)</strong>
                    
                    <div className="grid grid-cols-2 gap-3 pb-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-video bg-neutral-900 rounded-xl relative overflow-hidden border border-slate-850 flex items-center justify-center text-white">
                          <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono">Camera {i+1}</span>
                          <span className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-slate-400">REC</span>
                          </span>
                          <div className="absolute inset-0 border border-emerald-500/10 pointer-events-none animate-pulse" />
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => triggerToast('Tất cả luồng streaming camera đạt độ trễ tuyệt hảo: 14ms', 'success')}
                      className="w-full py-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider select-none active:scale-98 transition-colors"
                    >
                      Kiểm nghiệm tín hiệu Ping
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* SUB-VIEW 7: TRUNG TÂM BẢO MẬT & ĐỀ PHÒNG TRỘM XE CC */}
            {activeMenu === 'security' && (
              <div className="space-y-6 animate-fade-in text-left" id="security-sub-view">
                
                {/* HEADER ROW (Screenshot 1 Replication) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2.5xl font-black font-sans text-slate-900 dark:text-white flex items-center gap-2">
                      Bảo mật Hệ thống
                    </h2>
                    <p className="text-slate-550 dark:text-slate-400 text-xs">
                      Quản lý chính sách an toàn, quyền truy cập và giám sát cảnh báo toàn cục.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-sans text-xs">
                    <button
                      onClick={() => triggerToast("Đã xuất báo cáo an ninh định kỳ!", "success")}
                      className="px-4 py-2 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Báo Cáo</span>
                    </button>
                    
                    <button
                      onClick={() => triggerToast("Tất cả cấu hình bảo mật đã được lưu thành công!", "success")}
                      className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-850 dark:hover:bg-slate-100 rounded-xl font-extrabold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Lưu Thay Đổi</span>
                    </button>
                  </div>
                </div>

                {/* RED ALERT DIALOG BANNER (Screenshot 1 Replication) */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 border-l-4 border-l-rose-500 rounded-r-2xl flex items-start justify-between gap-3 animate-pulse">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-550 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-black text-rose-900 dark:text-rose-400 font-sans block">
                        Phát hiện 3 lần đăng nhập thất bại liên tiếp
                      </strong>
                      <span className="text-xs text-rose-700 dark:text-rose-350 mt-1 block">
                        Tài khoản <code className="bg-rose-100 dark:bg-rose-950 px-1 py-0.5 rounded font-bold font-mono">"nhanvien_bc02"</code> tại IP <code className="bg-rose-150 dark:bg-rose-950 px-1 py-0.5 rounded font-bold font-mono">192.168.1.45</code>. Cần xác minh ngay.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAuditSearch('nhanvien_bc02');
                      setAuditStatusFilter('FAILED');
                      setActiveMenu('system_log');
                      triggerToast("Đã lọc chi tiết sự kiện cho tài khoản 'nhanvien_bc02'", "info");
                    }}
                    className="text-rose-650 dark:text-rose-400 font-black hover:underline text-[10.5px] cursor-pointer shrink-0 uppercase tracking-wider bg-rose-100/50 dark:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-200/40 dark:border-rose-800/40"
                  >
                    XEM CHI TIẾT
                  </button>
                </div>

                {/* TWO-COLUMN CONFIGURATION CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* LEFT SIDE: CONFIG SYSTEM POLICY CARD (col-span 7/8 in mockup) */}
                  <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-6">
                    
                    {/* CARD TITLE & CAPTION */}
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <strong className="text-base font-black text-slate-850 dark:text-white font-sans">
                        Chính sách & Đăng nhập
                      </strong>
                    </div>

                    {/* SETTING ITEM 1: 2FA */}
                    <div className="flex justify-between items-start gap-4 pb-4 border-b border-dashed border-slate-100 dark:border-slate-850">
                      <div>
                        <strong className="text-sm font-black text-slate-850 dark:text-white block">
                          Xác thực 2 Yếu tố (2FA)
                        </strong>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                          Bắt buộc đối với toàn bộ nhân viên cấp Quản lý và Kỹ thuật viên hệ thống.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setEnable2FA(!enable2FA);
                          triggerToast(`Đã ${!enable2FA ? 'kích hoạt' : 'vô hiệu hóa'} bắt buộc xác thực 2FA.`, 'info');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 focus:outline-none shrink-0 ${
                          enable2FA ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enable2FA ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* SETTING ITEM 2: SESSION TIMEOUTS */}
                    <div className="space-y-3 pb-4 border-b border-dashed border-slate-100 dark:border-slate-850">
                      <strong className="text-sm font-black text-slate-850 dark:text-white block mb-1">
                        Thời gian chờ Phiên làm việc (Session Timeout)
                      </strong>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 block">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            DESKTOP (ADMIN)
                          </label>
                          <select
                            value={desktopTimeout}
                            onChange={(e) => {
                              setDesktopTimeout(e.target.value);
                              triggerToast(`Thời gian chờ Desktop được đổi thành: ${e.target.value}`, 'success');
                            }}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950/50 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="15 Phút">15 Phút</option>
                            <option value="30 Phút">30 Phút</option>
                            <option value="1 Giờ">1 Giờ</option>
                            <option value="2 Giờ">2 Giờ</option>
                          </select>
                        </div>

                        <div className="space-y-1 block">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            MOBILE (STAFF PWA)
                          </label>
                          <select
                            value={mobileTimeout}
                            onChange={(e) => {
                              setMobileTimeout(e.target.value);
                              triggerToast(`Thời gian chờ Mobile được đổi thành: ${e.target.value}`, 'success');
                            }}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950/50 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="1 Giờ">1 Giờ</option>
                            <option value="2 Giờ">2 Giờ</option>
                            <option value="4 Giờ">4 Giờ</option>
                            <option value="8 Giờ">8 Giờ</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SETTING ITEM 3: PASSWORD POLICIES */}
                    <div className="space-y-4">
                      <strong className="text-sm font-black text-slate-850 dark:text-white block mb-1">
                        Yêu cầu Mật khẩu
                      </strong>

                      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850/60">
                        <span className="text-xs font-bold text-slate-650 dark:text-slate-300">
                          Độ dài tối thiểu (ký tự)
                        </span>
                        
                        <input
                          type="number"
                          min="6"
                          max="32"
                          value={passwordMinLength}
                          onChange={(e) => {
                            const val = Math.max(6, parseInt(e.target.value) || 12);
                            setPasswordMinLength(val);
                          }}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-right font-black text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2.5 font-bold text-xs">
                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-650 dark:text-slate-350 select-none">
                          <input
                            type="checkbox"
                            checked={requireSpecialChar}
                            onChange={() => {
                              setRequireSpecialChar(!requireSpecialChar);
                              triggerToast(`Đã thay đổi tùy chọn ký tự đặc biệt tài khoản`, 'info');
                            }}
                            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span>Bắt buộc ký tự đặc biệt (!@#$%^&*)</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-650 dark:text-slate-350 select-none">
                          <input
                            type="checkbox"
                            checked={requireNumber}
                            onChange={() => {
                              setRequireNumber(!requireNumber);
                              triggerToast(`Đã thay đổi tùy chọn chữ số bắt buộc`, 'info');
                            }}
                            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span>Bắt buộc chữ số</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT SIDE: RBAC & TIMELINE (col-span 4/5 in mockup) */}
                  <div className="lg:col-span-4 flex flex-col gap-6 justify-between items-stretch">
                    
                    {/* CARD 1: RBAC OVERVIEW */}
                    <div className="p-5 bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-4">
                      
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                        <strong className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Kiểm soát Truy cập (RBAC)</span>
                        </strong>
                        <button
                          onClick={() => triggerToast("Trình chỉnh sửa phân quyền nâng cấp đang khóa. Liên hệ Admin cao cấp.", "info")}
                          className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          {/* Minimalist pencil edit button icon */}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>

                      {/* RBAC Header Columns */}
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase select-none">
                        <span>VAI TRÒ</span>
                        <span>TÀI KHOẢN</span>
                      </div>

                      <div className="space-y-2 text-xs font-bold leading-relaxed text-slate-650 dark:text-slate-350">
                        {/* Row Admin */}
                        <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100 dark:border-slate-850/50">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0" />
                            <span className="text-slate-850 dark:text-white">Admin (Quyền tối cao)</span>
                          </span>
                          <span className="font-mono text-slate-450 dark:text-slate-450 bg-slate-50 dark:bg-slate-950/60 px-1.5 py-0.5 rounded">1</span>
                        </div>
                        {/* Row User */}
                        <div className="flex justify-between items-center py-1.5">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0" />
                            <span className="text-slate-850 dark:text-white">User (Vận hành & Bốt gác)</span>
                          </span>
                          <span className="font-mono text-slate-450 dark:text-slate-450 bg-slate-50 dark:bg-slate-950/60 px-1.5 py-0.5 rounded">1</span>
                        </div>
                      </div>

                      {/* BOTTOM RBAC DETAILS BUTTON */}
                      <button
                        onClick={() => triggerToast("Đang tải dữ liệu thiết lập vai trò chi tiết & Phân quyền ứng dụng PWA...", "info")}
                        className="w-full text-center py-2.5 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl uppercase tracking-wider block"
                      >
                        Quản lý phân quyền chi tiết
                      </button>

                    </div>

                    {/* CARD 2: TIMELINE GENERAL SUMMARY */}
                    <div className="p-5 bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-4 flex-1 flex flex-col justify-between">
                      <strong className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-850">
                        <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Nhật ký Gần đây</span>
                      </strong>

                      <div className="space-y-4 text-xs block text-left flex-1 py-1">
                        
                        {/* Timeline item 1 */}
                        <div className="relative pl-5 border-l border-emerald-500/30 pb-1">
                          <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute -left-[5.5px] top-1 inline-block shrink-0" />
                          <strong className="text-slate-800 dark:text-slate-200 block text-[11px]-leading-snug">
                            Admin NguyenV đã cập nhật chính sách mật khẩu.
                          </strong>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            10:45 AM - Hôm nay
                          </span>
                        </div>

                        {/* Timeline item 2 */}
                        <div className="relative pl-5 border-l border-transparent">
                          <span className="w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full absolute -left-[5.5px] top-1 inline-block shrink-0 animate-ping" />
                          <span className="w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full absolute -left-[5.5px] top-1 inline-block shrink-0" />
                          <strong className="text-slate-800 dark:text-slate-200 block text-[11px]-leading-snug text-rose-500 dark:text-rose-455">
                            Đăng nhập thất bại (x3) tài khoản nhanvien_bc02.
                          </strong>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            09:12 AM - Hôm nay
                          </span>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* SUB-VIEW 8: NHẬT KÝ TELEMETRY AUDIT LOGS (Screenshot 2 Replication) */}
            {activeMenu === 'system_log' && (() => {
              
              {/* STATIC LOGS POOL CORRESPONDING TO SCREENSHOT 2 REPLICATION */}
              const mockAuditLogs = [
                {
                  id: 'AUD-001',
                  time: '14:23:05',
                  date: '12/10/2023',
                  actor: 'Nguyen Van A',
                  actorId: 'U-8923',
                  avatar: 'NV',
                  action: 'Cập nhật cấu hình phí đỗ xe',
                  desc: 'Mô-đun: /api/v1/billing/rates',
                  ip: '192.168.1.15',
                  device: 'Chrome / Windows',
                  status: 'SUCCESS',
                  payload: {
                    timestamp: "2023-10-12T14:23:05Z",
                    level: "INFO",
                    actor: {
                      type: "user",
                      id: "U-8923",
                      name: "Nguyen Van A"
                    },
                    action: "billing.update_rates",
                    resource: "/api/v1/billing/rates",
                    context: {
                      ip_address: "192.168.1.15",
                      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0",
                      rate_multiplier: 1.25
                    },
                    response: {
                      status: 200,
                      bytes: 1420
                    }
                  }
                },
                {
                  id: 'AUD-002',
                  time: '14:15:22',
                  date: '12/10/2023',
                  actor: 'Unknown',
                  actorId: 'admin_test',
                  avatar: '?',
                  action: 'Cố gắng đăng nhập sai mật khẩu (Lần 3)',
                  desc: 'Mô-đun: /api/v1/login',
                  ip: '203.205.23.44',
                  device: 'Python-urllib/3.0',
                  status: 'FAILED',
                  payload: {
                    timestamp: "2023-10-12T14:15:22Z",
                    level: "WARN",
                    actor: {
                      type: "system",
                      id: "admin_test"
                    },
                    action: "user.auth",
                    resource: "/api/v1/login",
                    context: {
                      ip_address: "203.205.23.44",
                      attempt_sequence: 3,
                      failure_reason: "password_mismatch"
                    },
                    response: {
                      status: 401,
                      error: "Unauthorized"
                    }
                  }
                },
                {
                  id: 'AUD-003',
                  time: '13:45:10',
                  date: '12/10/2023',
                  actor: 'System Auto',
                  actorId: 'SYS-001',
                  avatar: 'SA',
                  action: 'Đóng barrier khẩn cấp - Làn vào CS2',
                  desc: 'Mô-đun: /dev/iot/barrier/lane_in_02/force_close',
                  ip: '10.0.0.52',
                  device: 'Edge Node',
                  status: 'WARNING',
                  payload: {
                    timestamp: "2023-10-12T05:45:10Z",
                    level: "WARN",
                    actor: {
                      type: "system",
                      id: "SYS-001"
                    },
                    action: "barrier.force_close",
                    resource: "Lane_In_02",
                    context: {
                      ip_address: "10.0.0.52",
                      trigger_reason: "vehicle_tailgating_detected",
                      confidence_score: 0.94
                    },
                    response: {
                      status: 200,
                      latency_ms: 142
                    }
                  }
                },
                {
                  id: 'AUD-004',
                  time: '11:02:40',
                  date: '12/10/2023',
                  actor: 'Le Van Cuong',
                  actorId: 'U-4813',
                  avatar: 'LC',
                  action: 'Kích hoạt thẻ từ vãng lai',
                  desc: 'Mô-đun: /api/v1/guest/issue_ticket',
                  ip: '10.0.0.52',
                  device: 'Edge Node P5',
                  status: 'SUCCESS',
                  payload: {
                    timestamp: "2023-10-12T11:02:40Z",
                    level: "INFO",
                    actor: {
                      type: "staff",
                      id: "U-4813",
                      name: "Le Van Cuong"
                    },
                    action: "ticket.issue",
                    context: {
                      terminal_id: "BOOT_01",
                      card_rfid: "99A1054C",
                      assigned_zone: "B1_ZONE_A"
                    },
                    response: {
                      status: 200,
                      ticket_id: "TKT-4412"
                    }
                  }
                },
                {
                  id: 'AUD-005',
                  time: '09:12:00',
                  date: '12/10/2023',
                  actor: 'Tran Thi Be',
                  actorId: 'U-8212',
                  avatar: 'TB',
                  action: 'Gia hạn thẻ tháng thành công',
                  desc: 'Mô-đun: /api/v1/customers/renew_pass',
                  ip: '192.168.1.18',
                  device: 'Chrome / macOS',
                  status: 'SUCCESS',
                  payload: {
                    timestamp: "2023-10-12T09:12:00Z",
                    level: "SUCCESS",
                    actor: {
                      type: "staff",
                      id: "U-8212",
                      name: "Tran Thi Be"
                    },
                    action: "customer.pass_renew",
                    context: {
                      ip_address: "192.168.1.18",
                      plate: "29F-441.52",
                      renew_months: 3,
                      price_vnpay: 300000
                    },
                    response: {
                      status: 200,
                      serial_id: "S-55102"
                    }
                  }
                }
              ];

              {/* FILTERED POOL CALCS */}
              const filteredAuditLogs = mockAuditLogs.filter(log => {
                const query = auditSearch.toLowerCase();
                const matchesSearch = log.actor.toLowerCase().includes(query) || log.actorId.toLowerCase().includes(query) || log.action.toLowerCase().includes(query) || log.ip.includes(query);
                
                if (!matchesSearch) return false;
                
                if (auditModuleFilter !== 'Tất cả') {
                  if (auditModuleFilter === 'Người dùng' && !log.actorId.startsWith('U-')) return false;
                  if (auditModuleFilter === 'Barrier' && !log.desc.includes('barrier')) return false;
                  if (auditModuleFilter === 'Thanh toán' && !log.desc.includes('billing') && !log.desc.includes('renew')) return false;
                }

                if (auditStatusFilter !== 'Tất cả') {
                  if (auditStatusFilter === 'SUCCESS' && log.status !== 'SUCCESS') return false;
                  if (auditStatusFilter === 'FAILED' && log.status !== 'FAILED') return false;
                  if (auditStatusFilter === 'WARNING' && log.status !== 'WARNING') return false;
                }

                return true;
              });

              const selectedLogPayload = mockAuditLogs.find(log => log.id === selectedLogId);

              return (
                <div className="space-y-6 animate-fade-in text-left font-sans" id="audit-logs-sub-view">
                  
                  {/* HEADER ROW WITH CSV EXPORT BUTTON (Screenshot 2 Replication) */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2.5xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        Nhật ký hệ thống (Audit Logs)
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Giám sát và theo dõi mọi hoạt động trong hệ thống quản trị.
                      </p>
                    </div>

                    <button
                      onClick={() => triggerToast("Đã trích xuất và tải xuống tập tin Audit_Logs.csv thành công!", "success")}
                      className="px-4 py-2 bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 text-xs"
                    >
                      {/* Minimalist export csv icon */}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Xuất CSV</span>
                    </button>
                  </div>

                  {/* SEARCH FILTERS AND MODULE DROP-DOWNS (Screenshot 2 Replication) */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Search query input */}
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm IP, User ID, hoặc hành động..." 
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-white dark:bg-slate-950 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Module Filter Dropdown */}
                    <div className="min-w-[130px]">
                      <select
                        value={auditModuleFilter}
                        onChange={(e) => setAuditModuleFilter(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-white dark:bg-slate-950 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Tất cả">Tất cả Mô-đun</option>
                        <option value="Người dùng">Mô-đun Người dùng</option>
                        <option value="Barrier">Mô-đun Barrier (IoT)</option>
                        <option value="Thanh toán">Mô-đun Thanh toán</option>
                      </select>
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="min-w-[130px]">
                      <select
                        value={auditStatusFilter}
                        onChange={(e) => setAuditStatusFilter(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-white dark:bg-slate-950 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Tất cả">Tất cả Trạng thái</option>
                        <option value="SUCCESS">Thành công</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="WARNING">Cảnh báo</option>
                      </select>
                    </div>

                    {/* Advanced filter toggles button */}
                    <button
                      onClick={() => {
                        setAuditSearch('');
                        setAuditModuleFilter('Tất cả');
                        setAuditStatusFilter('Tất cả');
                        triggerToast("Đã thiết lập lại bộ lọc trạng thái!", "info");
                      }}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs"
                    >
                      {/* Advanced filter custom slider icon */}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span>Bộ lọc nâng cao</span>
                    </button>
                  </div>

                  {/* LOGS LIST DATA TABLE (Screenshot 2 Replication) */}
                  <div className={`bg-white dark:bg-slate-905 border rounded-2xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200/60 shadow-xs'} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider select-none">
                            <th className="py-3 px-4">THỜI GIAN</th>
                            <th className="py-3 px-4">NGƯỜI THỰC HIỆN</th>
                            <th className="py-3 px-4">MÔ-ĐUN & HÀNH ĐỘNG</th>
                            <th className="py-3 px-4">IP / THIẾT BỊ</th>
                            <th className="py-3 px-4">KẾT QUẢ</th>
                            <th className="py-3 px-4 text-center">CHI TIẾT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {filteredAuditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 px-4 text-center text-slate-400 font-medium">
                                Không tìm thấy sự kiện audit nào phù hợp bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            filteredAuditLogs.map(log => {
                              const isSuccess = log.status === 'SUCCESS';
                              const isFailed = log.status === 'FAILED';
                              const isWarning = log.status === 'WARNING';
                              const isSelected = selectedLogId === log.id;
                              
                              return (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                                  
                                  {/* TIME COLUMN */}
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px]">
                                    <span className="block">{log.time}</span>
                                    <span className="text-[9px] text-slate-400 font-medium tracking-tight block mt-0.5">{log.date}</span>
                                  </td>

                                  {/* ACTOR COLUMN */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 border uppercase ${
                                        isWarning 
                                          ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30' 
                                          : isFailed 
                                          ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-455 border-rose-200/50 dark:border-rose-900/30' 
                                          : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30'
                                      }`}>
                                        {log.avatar}
                                      </div>
                                      <div>
                                        <strong className="text-slate-850 dark:text-white block font-black">{log.actor}</strong>
                                        <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">ID: {log.actorId}</span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* ACTION & MODULE COLUMN */}
                                  <td className="py-3.5 px-4 leading-normal">
                                    <strong className={`block font-black ${isFailed ? 'text-rose-500' : 'text-slate-850 dark:text-white'}`}>
                                      {log.action}
                                    </strong>
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded font-mono font-medium text-[9.5px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-500">
                                      {log.desc}
                                    </span>
                                  </td>

                                  {/* IP / DEVICE COLUMN */}
                                  <td className="py-3.5 px-4 font-mono">
                                    <strong className="text-slate-750 dark:text-slate-300 block text-[10.5px] font-black">{log.ip}</strong>
                                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{log.device}</span>
                                  </td>

                                  {/* STATUS BADGE COLUMN */}
                                  <td className="py-3.5 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                                      isSuccess 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                                        : isFailed 
                                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border-rose-100 dark:border-rose-900/30'
                                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                                    }`}>
                                      {isSuccess ? 'THÀNH CÔNG' : isFailed ? 'THẤT BẠI' : 'CẢNH BÁO'}
                                    </span>
                                  </td>

                                  {/* ACTIONS TOGGLE PAYLOAD COLUMN */}
                                  <td className="py-3.5 px-4 text-center select-none">
                                    <button
                                      onClick={() => {
                                        setSelectedLogId(isSelected ? null : log.id);
                                        triggerToast(`Đang hiển thị payload JSON cho mã ID: ${log.id}`, 'info');
                                      }}
                                      className={`p-1.5 rounded-lg border font-mono font-bold transition-all duration-150 ${
                                        isSelected 
                                          ? 'bg-blue-600 border-transparent text-white shadow-xs' 
                                          : 'bg-white dark:bg-slate-950 hover:bg-slate-105 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400'
                                      }`}
                                      title="Xem chi tiết Payload JSON"
                                    >
                                      {"{ }"}
                                    </button>
                                  </td>

                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINATION CHAT BAR (Screenshot 2 Replication) */}
                    <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-850 gap-4 select-none text-xs">
                      <span className="text-slate-450 dark:text-slate-400 font-medium font-sans">
                        Hiển thị 1-5 trong 12,450 bản ghi
                      </span>
                      
                      <div className="flex items-center gap-1.5 font-sans">
                        <button className="p-1 px-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 font-bold hover:bg-slate-50">&lt;</button>
                        <button className="px-3 py-1 font-extrabold bg-blue-600 text-white rounded-lg">1</button>
                        <button className="px-3 py-1 font-bold border border-slate-201 dark:border-slate-800 hover:bg-slate-50 rounded-lg bg-white dark:bg-slate-950">2</button>
                        <button className="px-3 py-1 font-bold border border-slate-201 dark:border-slate-800 hover:bg-slate-50 rounded-lg bg-white dark:bg-slate-950">3</button>
                        <span className="text-slate-400 font-medium">...</span>
                        <button className="px-3 py-1 font-bold border border-slate-201 dark:border-slate-800 hover:bg-slate-50 rounded-lg bg-white dark:bg-slate-950">249</button>
                        <button className="p-1 px-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 font-bold hover:bg-slate-50">&gt;</button>
                      </div>
                    </div>

                  </div>

                  {/* EXPANDABLE JSON PAYLOAD CODE VIEWER (Screenshot 2 Replication) */}
                  <AnimatePresence>
                    {selectedLogPayload && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 15 }} 
                        className="rounded-2xl bg-[#0b0f19] border border-slate-850/80 p-5 shadow-xl font-mono text-[11px] leading-relaxed relative text-left overflow-hidden w-full"
                      >
                        
                        {/* TERMINAL HEADER & BUTTONS */}
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 select-none">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                            <span className="text-slate-450 uppercase font-black text-[10px] tracking-widest pl-2">
                              Chi tiết Payload (JSON) — ID: {selectedLogPayload.id}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => setSelectedLogId(null)}
                            className="text-slate-500 hover:text-white font-extrabold text-xs bg-slate-850/40 p-1 px-2 rounded-md border border-slate-800 hover:bg-slate-800 transition-colors"
                          >
                            Đóng ✕
                          </button>
                        </div>

                        {/* HIGHLY COMPREHENSIVE RECONSTRUCTED JSON HIGHLIGHTING */}
                        <pre className="text-slate-300 max-h-[350px] overflow-y-auto select-text py-1 block">
                          <code>
                            {"{\n"}
                            {"  "}
                            <span className="text-blue-400">"timestamp"</span>: <span className="text-amber-300">"{selectedLogPayload.payload.timestamp}"</span>,
                            {"\n"}
                            {"  "}
                            <span className="text-blue-400">"level"</span>: <span className="text-amber-300">"{selectedLogPayload.payload.level}"</span>,
                            {"\n"}
                            {"  "}
                            <span className="text-blue-400">"actor"</span>: {"{\n"}
                            {"    "}
                            <span className="text-blue-400">"type"</span>: <span className="text-amber-300">"{selectedLogPayload.payload.actor.type}"</span>,
                            {"\n"}
                            {"    "}
                            <span className="text-blue-400">"id"</span>: <span className="text-amber-300">"{selectedLogPayload.payload.actor.id}"</span>
                            {selectedLogPayload.payload.actor.name ? (
                              <>
                                ,{"\n"}
                                {"    "}
                                <span className="text-blue-400">"name"</span>: <span className="text-amber-300">"{selectedLogPayload.payload.actor.name}"</span>
                              </>
                            ) : ""}
                            {"\n"}
                            {"  }"},
                            {"\n"}
                            {"  "}
                            <span className="text-blue-400">"action"</span>: <span className="text-amber-300">"{selectedLogPayload.payload.action}"</span>,
                            {"\n"}
                            {"  "}
                            <span className="text-blue-400">"resource"</span>: <span className="text-amber-300">"{selectedLogPayload.desc}"</span>,
                            {"\n"}
                            {"  "}
                            <span className="text-blue-400">"context"</span>: {"{\n"}
                            {Object.entries(selectedLogPayload.payload.context).map(([key, val], idx, arr) => {
                              const isStr = typeof val === 'string';
                              const isObj = typeof val === 'object';
                              return (
                                <span key={key}>
                                  {"    "}
                                  <span className="text-blue-400">"{key}"</span>:{" "}
                                  {isObj ? (
                                    <>
                                      {"{\n"}
                                      {Object.entries(val).map(([subK, subV], sIdx, sArr) => (
                                        <span key={subK}>
                                          {"      "}
                                          <span className="text-blue-400">"{subK}"</span>:{" "}
                                          {typeof subV === 'string' ? (
                                            <span className="text-amber-300">"{subV}"</span>
                                          ) : (
                                            <span className="text-amber-500">{String(subV)}</span>
                                          )}
                                          {sIdx < sArr.length - 1 ? "," : ""}
                                          {"\n"}
                                        </span>
                                      ))}
                                      {"    }"}
                                    </>
                                  ) : isStr ? (
                                    <span className="text-amber-300">"{val}"</span>
                                  ) : (
                                    <span className="text-amber-500">{String(val)}</span>
                                  )}
                                  {idx < arr.length - 1 ? "," : ""}
                                  {"\n"}
                                </span>
                              );
                            })}
                            {"  }"},
                            {"\n"}
                            {"  "}
                            <span className="text-blue-400">"response"</span>: {"{\n"}
                            {Object.entries(selectedLogPayload.payload.response).map(([key, val], idx, arr) => {
                              const isStr = typeof val === 'string';
                              return (
                                <span key={key}>
                                  {"    "}
                                  <span className="text-blue-400">"{key}"</span>:{" "}
                                  {isStr ? (
                                    <span className="text-amber-300">"{val}"</span>
                                  ) : (
                                    <span className="text-amber-300">{String(val)}</span>
                                  )}
                                  {idx < arr.length - 1 ? "," : ""}
                                  {"\n"}
                                </span>
                              );
                            })}
                            {"  }"}
                            {"\n"}
                            {"}"}
                          </code>
                        </pre>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })()}
          </>)}
          </div>

          {/* SYSTEM WIDE INTEGRATED FOOTER */}
          <footer className={`px-6 py-4 border-t select-none text-xs font-sans mt-auto leading-none ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <span>© 2026 UrbanPark Infrastructure Management Corporation. Toàn bộ thông tin được bảo mật.</span>
              <div className="flex gap-4">
                <a href="#" className="hover:underline">Điều khoản dịch vụ</a>
                <a href="#" className="hover:underline">An ninh chính phủ</a>
                <a href="#" className="hover:underline">Trợ giúp kỹ thuật</a>
              </div>
            </div>
          </footer>

        {/* MODAL ADD BRANCH DIALOG */}
        <AnimatePresence>
          {showAddBranchModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-sm rounded-[24px] p-6 border text-slate-850 ${isDarkMode ? 'bg-[#0f172a] border-slate-850 text-white' : 'bg-white border-slate-200'}`}>
                <div className="space-y-4 block text-left font-sans text-xs">
                  <strong className="text-base font-black tracking-tight block">Thêm cơ sở đỗ xe mới</strong>
                  
                  <div className="space-y-3">
                    <div className="space-y-1 block">
                      <label className="text-[10px] font-extrabold uppercase text-slate-455">Tên cơ sở</label>
                      <input id="branch-name-input" type="text" placeholder="Bãi xe ngầm Vincom" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                    </div>
                    <div className="space-y-1 block">
                      <label className="text-[10px] font-extrabold uppercase text-slate-455">Địa chỉ</label>
                      <input id="branch-address-input" type="text" placeholder="72 Lê Thánh Tôn, Quận 1, TP.HCM" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 block">
                        <label className="text-[10px] font-extrabold uppercase text-slate-455">Sức chứa tối đa</label>
                        <input id="branch-capacity-input" type="number" defaultValue="400" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                      </div>
                      <div className="space-y-1 block">
                        <label className="text-[10px] font-extrabold uppercase text-slate-455">Số xe hiện tại</label>
                        <input id="branch-occupied-input" type="number" defaultValue="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-180 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => setShowAddBranchModal(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-850 rounded-lg font-bold"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={() => {
                        const nameEl = document.getElementById('branch-name-input') as HTMLInputElement;
                        const addressEl = document.getElementById('branch-address-input') as HTMLInputElement;
                        const capEl = document.getElementById('branch-capacity-input') as HTMLInputElement;
                        const occEl = document.getElementById('branch-occupied-input') as HTMLInputElement;
                        
                        if (nameEl && nameEl.value.trim() && addressEl && addressEl.value.trim()) {
                          const nameVal = nameEl.value.trim();
                          const addressVal = addressEl.value.trim();
                          const capacityVal = parseInt(capEl.value, 10) || 400;
                          const occupiedVal = parseInt(occEl.value, 10) || 0;
                          
                          const newB = {
                            id: `br-${Date.now()}`,
                            name: nameVal,
                            address: addressVal,
                            status: 'Hoạt động',
                            capacity: capacityVal,
                            occupied: occupiedVal,
                            cars: `${Math.round(occupiedVal * 0.4)} / ${Math.round(capacityVal * 0.4)}`,
                            motorbikes: `${Math.round(occupiedVal * 0.6)} / ${Math.round(capacityVal * 0.6)}`,
                            updateTime: 'Cập nhật vừa xong'
                          };
                          
                          setBranches([...branches, newB]);
                          setShowAddBranchModal(false);
                          triggerToast(`Thêm cơ sở "${nameVal}" thành công và đang hoạt động!`, 'success');
                        } else {
                          triggerToast('Vui lòng điền đầy đủ tên cơ sở và địa chỉ.', 'error');
                        }
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-extrabold uppercase tracking-wide text-[10.5px]"
                    >
                      Thêm cơ sở
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        </main>

      </div>
    </div>
  );
}
