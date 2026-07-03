import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from 'antd';
import { 
  Home, 
  Car, 
  Calendar, 
  CreditCard, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Bell, 
  Search, 
  MapPin, 
  Activity, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Plus, 
  ChevronRight, 
  ArrowRight, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  X, 
  RefreshCw,
  Clock,
  QrCode,
  DollarSign,
  Download,
  Wrench,
  PhoneCall,
  Mail,
  MessageSquare,
  Paperclip,
  AlertTriangle,
  KeyRound,
  Coins,
  Sliders,
  Award
} from 'lucide-react';

interface DriverPwaProps {
  user: {
    name: string;
    phone: string;
    role: string;
    email?: string;
  };
  accessToken: string | null;
  onLogout: () => void;
  isDarkMode?: boolean;
}

interface UserVehicle {
  id: string;
  plate: string;
  name: string;
  type: string;
  regDate: string;
  isActive: boolean;
  image: string;
  isLocked: boolean;
  activeSubscription?: string;
  subscriptionExpiry?: string;
}

interface TransactionItem {
  id: string;
  date: string;
  type: string;
  plate: string;
  fee: string;
  isEntry: boolean;
  status: 'Thành công' | 'Đang xử lý' | 'Thất bại';
}

const isTxDateInFilter = (txDateStr: string, filter: string) => {
  if (!txDateStr || filter === 'Tất cả') return true;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let txDate: Date;
  if (txDateStr === 'Vừa xong') {
    txDate = today;
  } else {
    const datePart = txDateStr.split(' ')[0];
    const parts = datePart.split('/');
    if (parts.length !== 3) return true;
    txDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  }
  
  // Calculate difference in days (allowing same day to be 0)
  const diffTime = today.getTime() - txDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  switch (filter) {
    case 'Hôm nay':
      return diffDays === 0;
    case 'Hôm qua':
      return diffDays === 1;
    case '7 ngày qua':
      return diffDays >= 0 && diffDays <= 7;
    case 'Tháng này':
      return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
    case 'Tháng trước': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
    }
    case '3 tháng trước': {
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      return txDate >= threeMonthsAgo;
    }
    case 'Năm nay':
      return txDate.getFullYear() === today.getFullYear();
    case 'Năm ngoái':
      return txDate.getFullYear() === today.getFullYear() - 1;
    case 'Các năm trước':
      return txDate.getFullYear() < today.getFullYear();
    default:
      return true;
  }
};

const VEHICLE_PRICING: Record<string, { day: number; month: number; month3: number; month6: number; year: number }> = {
  'Ô tô gầm thấp 4-5 chỗ': {
    day: 50000,
    month: 1000000,
    month3: 2700000,
    month6: 5000000,
    year: 9000000
  },
  'Xe 7 chỗ': {
    day: 70000,
    month: 1400000,
    month3: 3800000,
    month6: 7000000,
    year: 12500000
  },
  'Xe 9 chỗ': {
    day: 70000,
    month: 1400000,
    month3: 3800000,
    month6: 7000000,
    year: 12500000
  },
  'Xe 16 chỗ': {
    day: 100000,
    month: 2000000,
    month3: 5400000,
    month6: 10000000,
    year: 18000000
  }
};

export function DriverPwa({ user, accessToken, onLogout, isDarkMode = false }: DriverPwaProps) {
  const getNowFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const parseExpiryDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  };

  const getRemainingDays = (expiryStr: string) => {
    try {
      const expiry = parseExpiryDate(expiryStr);
      const diffTime = expiry.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (e) {
      return 0;
    }
  };

  const getVipPrice = (sub: any) => {
    if (!sub) return 0;
    if (sub.price) return sub.price;
    const targetVeh = vehicles.find(v => v.plate === sub.vehicle_plate);
    const type = targetVeh ? targetVeh.type : 'Ô tô gầm thấp 4-5 chỗ';
    const pricing = VEHICLE_PRICING[type] || VEHICLE_PRICING['Ô tô gầm thấp 4-5 chỗ'];
    const subType = sub.type || '';
    if (subType.includes('Năm') || subType.includes('1 năm') || subType.includes('YEARLY')) {
      return pricing.year;
    } else if (subType.includes('6 Tháng') || subType.includes('6 tháng') || subType.includes('HALF_YEARLY')) {
      return pricing.month6;
    } else if (subType.includes('3 Tháng') || subType.includes('3 tháng') || subType.includes('QUARTERLY')) {
      return pricing.month3;
    } else {
      return pricing.month;
    }
  };

  // ----------------------------------------------------
  // --- CORE SYSTEM STATES & SEEDS ---
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState<'home' | 'driver_pnl' | 'vehicles' | 'vip_reg' | 'billing' | 'settings' | 'support'>('driver_pnl');
  const [isOffline, setIsOffline] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'vnpay'>('wallet');
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(`urbanpark_user_balance_${user?.phone || 'default'}`);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        if (parsed === 10) return 250000;
        if (parsed === 500010) return 750000;
        if (parsed < 1000 && parsed > 0) return parsed * 25000;
        return parsed;
      }
    }
    return 0; // Default to 0 for new users
  });

  const [selectedVehId, setSelectedVehId] = useState<string>('veh-1');
  const [qrDirection, setQrDirection] = useState<'VÀO' | 'RA'>('VÀO');
  const [isTogglingLock, setIsTogglingLock] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<UserVehicle[]>(() => {
    const saved = localStorage.getItem(`urbanpark_user_vehicles_${user?.phone || 'default'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    return [];
  });

  const [activeQrToken, setActiveQrToken] = useState<string>('');
  const [qrExpiryTime, setQrExpiryTime] = useState<number | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [countdownSec, setCountdownSec] = useState<number>(300);

  const generateQrToken = async (vehicleId: string, direction: 'VÀO' | 'RA') => {
    if (isOffline) return;
    if (!vehicleId || vehicleId.startsWith('veh-')) {
      const activeVeh = vehicles.find(v => v.id === vehicleId) || vehicles[0];
      const plateStr = activeVeh ? activeVeh.plate : '34G56789';
      setActiveQrToken(`MOCK_${plateStr}|${direction}|${Date.now()}`);
      setQrExpiryTime(Date.now() + 300000);
      return;
    }
    setIsGeneratingQr(true);
    try {
      const response = await fetch('/api/v1/driver/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vehicleId: vehicleId,
          purpose: direction === 'VÀO' ? 'CHECK_IN' : 'CHECK_OUT'
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.qrToken) {
          setActiveQrToken(data.qrToken);
          if (data.expiredAt) {
            setQrExpiryTime(new Date(data.expiredAt).getTime());
          } else {
            setQrExpiryTime(Date.now() + 300000);
          }
        }
      }
    } catch (e) {
      console.error("Error generating QR Token:", e);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const [isQrRequested, setIsQrRequested] = useState<boolean>(false);

  // Tự động generate/refresh token khi thay đổi
  useEffect(() => {
    if (isQrRequested) {
      const activeVeh = vehicles.find(v => v.id === selectedVehId) || vehicles[0];
      if (activeVeh) {
        generateQrToken(activeVeh.id, qrDirection);
      }
    }
  }, [selectedVehId, qrDirection, vehicles.length, isQrRequested]);

  useEffect(() => {
    if (!isQrRequested) {
      setActiveQrToken('');
      setQrExpiryTime(null);
    }
  }, [isQrRequested]);

  // Reset QR request state when vehicle or direction changes
  useEffect(() => {
    setIsQrRequested(false);
  }, [selectedVehId, qrDirection]);

  // Bộ đếm countdown và tự động làm mới
  useEffect(() => {
    const interval = setInterval(() => {
      if (isQrRequested && qrExpiryTime) {
        const diff = Math.max(0, Math.round((qrExpiryTime - Date.now()) / 1000));
        setCountdownSec(diff);
        if (diff <= 5 && !isGeneratingQr) {
          const activeVeh = vehicles.find(v => v.id === selectedVehId) || vehicles[0];
          if (activeVeh) {
            generateQrToken(activeVeh.id, qrDirection);
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [qrExpiryTime, selectedVehId, qrDirection, isGeneratingQr, vehicles, isQrRequested]);



  // Background synchronize with live backend
  const fetchVehiclesFromApi = async () => {
    if (isOffline) return; // Skip API calls when offline
    try {
      const response = await fetch('/api/vehicles', {
        headers: { 'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}` }
      });
      const data = await response.json();
      const vehicleList = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
      if (vehicleList) {
        setVehicles(prevVehicles => {
          const mapped: UserVehicle[] = vehicleList.map((v: any, index: number) => {
            const sizeType = v.vehicleSize || v.type || 'SEDAN_HATCHBACK';
            let sizeLabel = 'Ô tô gầm thấp 4-5 chỗ';
            if (v.bodyShape === 'SEDAN') {
              sizeLabel = 'Ô tô gầm thấp 4-5 chỗ';
            } else if (v.bodyShape === 'SUV') {
              sizeLabel = 'Xe 7 chỗ';
            } else if (v.bodyShape === 'VAN') {
              sizeLabel = 'Xe 9 chỗ';
            } else if (v.bodyShape === 'MINIBUS') {
              sizeLabel = 'Xe 16 chỗ';
            } else if (v.bodyShape && ['Ô tô gầm thấp 4-5 chỗ', 'Xe 7 chỗ', 'Xe 9 chỗ', 'Xe 16 chỗ'].includes(v.bodyShape)) {
              sizeLabel = v.bodyShape;
            } else {
              sizeLabel = sizeType === 'SUV_CUV_MPV' ? 'Xe 7 chỗ' : 
                          sizeType === 'LARGE_VAN_MINIBUS' ? 'Xe 16 chỗ' : 
                          'Ô tô gầm thấp 4-5 chỗ';
            }
            
            let regDate = '30/06/2026';
            if (v.createdAt) {
              try {
                const d = new Date(v.createdAt);
                regDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
              } catch (err) {}
            }
            
            // Tìm xe cục bộ hiện tại bằng cách dùng prevVehicles thay vì state vehicles bị dính closure
            const existingLocal = prevVehicles.find(lv => lv.plate === (v.licensePlate || v.plate));
            
            // Lookup latest subscription status from localStorage
            const savedSubs = localStorage.getItem('urbanpark_vip_subscriptions');
            let activeSub = undefined;
            let expiry = undefined;
            let subStatus = undefined;

            if (v.subscriptionStatus) {
              subStatus = v.subscriptionStatus === 'PENDING_APPROVAL' ? 'PENDING' : v.subscriptionStatus;
              if (v.subscriptionStatus === 'ACTIVE') {
                activeSub = v.subscriptionType;
                expiry = v.subscriptionExpiry ? new Date(v.subscriptionExpiry).toLocaleDateString('vi-VN') : undefined;
              }

              // Sync back to localStorage to keep other components/tabs in sync
              try {
                const subs = savedSubs ? JSON.parse(savedSubs) : [];
                let changed = false;
                let found = false;
                const updatedSubs = subs.map((s: any) => {
                  if (s.vehicle_plate === (v.licensePlate || v.plate)) {
                    found = true;
                    const newStatus = v.subscriptionStatus === 'PENDING_APPROVAL' ? 'PENDING' : v.subscriptionStatus;
                    if (s.status !== newStatus) {
                      changed = true;
                      return { 
                        ...s, 
                        status: newStatus,
                        endDate: v.subscriptionExpiry ? new Date(v.subscriptionExpiry).toLocaleDateString('vi-VN') : s.endDate
                      };
                    }
                  }
                  return s;
                });

                if (!found && v.subscriptionStatus) {
                  changed = true;
                  updatedSubs.push({
                    id: v.subscriptionId || `VIP-${Math.floor(1000 + Math.random() * 9000)}`,
                    vehicle_plate: v.licensePlate || v.plate,
                    type: v.subscriptionType || 'Thẻ Tháng VIP',
                    startDate: new Date().toLocaleDateString('vi-VN'),
                    endDate: v.subscriptionExpiry ? new Date(v.subscriptionExpiry).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
                    status: v.subscriptionStatus === 'PENDING_APPROVAL' ? 'PENDING' : v.subscriptionStatus
                  });
                }

                if (changed) {
                  localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(updatedSubs));
                }
              } catch (err) {}
            } else if (savedSubs) {
              try {
                const subs = JSON.parse(savedSubs);
                const matched = subs.filter((s: any) => s.vehicle_plate === (v.licensePlate || v.plate));
                if (matched.length > 0) {
                  const latest = matched[matched.length - 1];
                  subStatus = latest.status;
                  if (latest.status === 'ACTIVE') {
                    activeSub = latest.type;
                    expiry = latest.endDate;
                  }
                }
              } catch (err) {}
            }

            return {
              id: v.id || `veh-${v.licensePlate || v.plate}`,
              plate: v.licensePlate || v.plate,
              name: v.brand || v.name || 'Phương tiện',
              type: sizeLabel,
              regDate: regDate,
              isActive: v.isActive !== false && v.active !== false,
              image: index % 2 === 0 ? 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=450&auto=format&fit=crop&q=80' : '',
              isLocked: activeSub ? (v.isLocked !== undefined ? v.isLocked : (existingLocal ? existingLocal.isLocked : false)) : false,
              activeSubscription: activeSub,
              subscriptionExpiry: expiry,
              subscriptionStatus: subStatus,
              registrationDocUrl: v.registrationDocUrl,
              registrationPhotoUrl: v.registrationPhotoUrl
            };
          });

          // Cập nhật selectedVehId bên ngoài nhưng dựa trên mapped list
          if (mapped.length > 0 && (!selectedVehId || !mapped.some(mv => mv.id === selectedVehId))) {
            setTimeout(() => setSelectedVehId(mapped[0].id), 0);
          }

          return mapped;
        });
      }
    } catch (e) {
      console.warn("Backend not yet connected or starting:", e);
    }
  };

  useEffect(() => {
    fetchVehiclesFromApi();
    const timer = setInterval(fetchVehiclesFromApi, 3000);
    return () => clearInterval(timer);
  }, []);

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem(`urbanpark_user_transactions_${user?.phone || 'default'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.error(err);
      }
    }
    return [];
  });

  // Current parked vehicle mock details
  const [currentParked, setCurrentParked] = useState<{
    plate: string;
    status: string;
    location: string;
    isParked: boolean;
  } | null>(null);

  // Modal controls
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Ô tô gầm thấp 4-5 chỗ');

  // Edit Vehicle Modal controls
  const [editVehicleModalOpen, setEditVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editPlate, setEditPlate] = useState('');
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Ô tô gầm thấp 4-5 chỗ');

  // Documents
  const [newRegDoc, setNewRegDoc] = useState<string | null>(null);
  const [newRegPhoto, setNewRegPhoto] = useState<string | null>(null);
  const [editRegDoc, setEditRegDoc] = useState<string | null>(null);
  const [editRegPhoto, setEditRegPhoto] = useState<string | null>(null);

  // VIP Step Subscription State
  const [regStep, setRegStep] = useState<1 | 2 | 3>(2); // Default on select package for full mockup fidelity
  const [selectedVehicleForVIP, setSelectedVehicleForVIP] = useState('');
  const [selectedPackPrice, setSelectedPackPrice] = useState<number>(1000000); // 1,000,000₫ for monthly VIP
  const [selectedPackLabel, setSelectedPackLabel] = useState('Thẻ Tháng VIP');
  const [vnpayBank, setVnpayBank] = useState('Vietcombank');
  const [vnpayCardNo, setVnpayCardNo] = useState('9704198526314785');
  const [vnpayCardHolder, setVnpayCardHolder] = useState('NGUYEN VAN A');
  const [vnpayOtp, setVnpayOtp] = useState('');
  const [vnpayModalOpen, setVnpayModalOpen] = useState(false);
  const [vnpayStep, setVnpayStep] = useState<'info' | 'otp' | 'success'>('info');

  // Alarm & Security Breach state
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [isAlertOverlayShown, setIsAlertOverlayShown] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillator1Ref = useRef<OscillatorNode | null>(null);
  const oscillator2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Auto-initialize selected vehicle plate for VIP if empty
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleForVIP) {
      setSelectedVehicleForVIP(vehicles[0].plate);
    }
  }, [vehicles, selectedVehicleForVIP]);

  // Synchronize package price whenever selected vehicle, package label, or vehicles change
  useEffect(() => {
    if (!selectedVehicleForVIP) return;
    if (selectedPackLabel.includes('Nạp tiền')) return;
    
    const targetVeh = vehicles.find(v => v.plate === selectedVehicleForVIP);
    const type = targetVeh ? targetVeh.type : 'Ô tô gầm thấp 4-5 chỗ';
    const pricing = VEHICLE_PRICING[type] || VEHICLE_PRICING['Ô tô gầm thấp 4-5 chỗ'];
    
    if (selectedPackLabel.includes('1 Năm') || selectedPackLabel.includes('1 năm')) {
      setSelectedPackPrice(pricing.year);
    } else if (selectedPackLabel.includes('6 Tháng') || selectedPackLabel.includes('6 tháng')) {
      setSelectedPackPrice(pricing.month6);
    } else if (selectedPackLabel.includes('3 Tháng') || selectedPackLabel.includes('3 tháng')) {
      setSelectedPackPrice(pricing.month3);
    } else if (selectedPackLabel.includes('Tháng') || selectedPackLabel.includes('VIP')) {
      setSelectedPackPrice(pricing.month);
    } else {
      setSelectedPackPrice(pricing.day);
    }
  }, [selectedVehicleForVIP, selectedPackLabel, vehicles]);

  // Profile Edit
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem(`urbanpark_user_name_${user?.phone || 'default'}`) || user.name;
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    return localStorage.getItem(`urbanpark_user_phone_${user?.phone || 'default'}`) || user.phone;
  });
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    return localStorage.getItem(`urbanpark_phone_verified_${user?.phone || 'default'}`) === 'true';
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    return localStorage.getItem(`urbanpark_user_email_${user?.phone || 'default'}`) || user.email || '';
  });
  const [profileAddress, setProfileAddress] = useState(() => {
    return localStorage.getItem(`urbanpark_user_address_${user?.phone || 'default'}`) || '';
  });
  
  // Extra settings states for absolute design fidelity
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [emailNotifyGate, setEmailNotifyGate] = useState(true);
  const [smsNotifyGate, setSmsNotifyGate] = useState(true);
  const [emailNotifyReceipt, setEmailNotifyReceipt] = useState(true);
  const [smsNotifyReceipt, setSmsNotifyReceipt] = useState(false);

  // Billing Filters
  const [billingTimeFilter, setBillingTimeFilter] = useState<string>('Tháng này');
  const [billingTypeFilter, setBillingTypeFilter] = useState<'Tất cả' | 'Vé ngày' | 'Vé tháng' | 'Nạp tiền'>('Tất cả');

  // Support center interactive states
  const [searchSupportQuery, setSearchSupportQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketTopic, setTicketTopic] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketAttachedFiles, setTicketAttachedFiles] = useState<{name: string, size: string}[]>([]);

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedSubForDetail, setSelectedSubForDetail] = useState<any | null>(null);
  const [topupAmount, setTopupAmount] = useState<number>(500000);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`urbanpark_user_balance_${user?.phone || 'default'}`, balance.toString());
  }, [balance, user?.phone]);

  useEffect(() => {
    localStorage.setItem(`urbanpark_user_vehicles_${user?.phone || 'default'}`, JSON.stringify(vehicles));
  }, [vehicles, user?.phone]);

  useEffect(() => {
    localStorage.setItem(`urbanpark_user_transactions_${user?.phone || 'default'}`, JSON.stringify(transactions));
  }, [transactions, user?.phone]);

  // Auto-select first vehicle for VIP reg if none is selected or selection is invalid
  useEffect(() => {
    if (vehicles.length > 0) {
      const isSelectedValid = vehicles.some(v => v.plate === selectedVehicleForVIP);
      if (!isSelectedValid) {
        setSelectedVehicleForVIP(vehicles[0].plate);
      }
    } else {
      setSelectedVehicleForVIP('');
    }
  }, [vehicles, selectedVehicleForVIP]);

  // Audio synthezised siren
  const startSiren = () => {
    if (isSirenMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (oscillator1Ref.current) {
        oscillator1Ref.current.stop();
        oscillator1Ref.current.disconnect();
      }
      if (oscillator2Ref.current) {
        oscillator2Ref.current.stop();
        oscillator2Ref.current.disconnect();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const masterGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(350, ctx.currentTime);
      osc2.frequency.setValueAtTime(450, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.12, ctx.currentTime);

      lfo.start();
      osc1.start();
      osc2.start();

      oscillator1Ref.current = osc1;
      oscillator2Ref.current = osc2;
      gainNodeRef.current = masterGain;
    } catch (e) {
      console.warn('Audio synthesis warning', e);
    }
  };

  const stopSiren = () => {
    try {
      if (oscillator1Ref.current) {
        oscillator1Ref.current.stop();
        oscillator1Ref.current.disconnect();
        oscillator1Ref.current = null;
      }
      if (oscillator2Ref.current) {
        oscillator2Ref.current.stop();
        oscillator2Ref.current.disconnect();
        oscillator2Ref.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch (e) {
      // already stopped
    }
  };

  useEffect(() => {
    return () => stopSiren();
  }, []);

  const triggerSecurityTest = () => {
    setIsAlertOverlayShown(true);
    startSiren();
    triggerToast('CẢNH BÁO: Kích hoạt mô phỏng bẻ khoá trộm xe!', 'error');
  };

  // Add Vehicle helper
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) {
      triggerToast('Vui lòng điền biển số xe!', 'error');
      return;
    }
    const plateRegex = /^[0-9]{2}[A-Z]{1,2}[-]?([0-9]{4,5}|[0-9]{3}\.[0-9]{2})$/i;
    if (!plateRegex.test(newPlate.trim())) {
      triggerToast('Biển số xe không đúng định dạng (Ví dụ: 30G-123.45 hoặc 30A-99999)!', 'error');
      return;
    }

    const brandInput = newName.trim();
    if (!brandInput) {
      triggerToast('Vui lòng điền tên hãng xe / model!', 'error');
      return;
    }
    const unsignedRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!unsignedRegex.test(brandInput)) {
      triggerToast('Tên xe không được phép chứa dấu tiếng Việt hoặc ký tự đặc biệt!', 'error');
      return;
    }
    const validBrands = [
      'TOYOTA', 'HONDA', 'VINFAST', 'MAZDA', 'MERCEDES', 'BMW', 'HYUNDAI', 'KIA', 'FORD', 
      'AUDI', 'LEXUS', 'PORSCHE', 'MITSUBISHI', 'CHEVROLET', 'NISSAN', 'SUZUKI', 'PEUGEOT', 
      'VOLVO', 'LAND ROVER', 'JAGUAR', 'TESLA', 'VOLKSWAGEN', 'SUBARU', 'MG', 'BYD', 'JEEP', 
      'ROLLS ROYCE', 'BENTLEY', 'MINI', 'FIAT', 'FERRARI', 'LAMBORGHINI', 'ASTON MARTIN', 'MASERATI'
    ];
    const upperInput = brandInput.toUpperCase();
    const hasValidBrand = validBrands.some(brand => upperInput.includes(brand));
    if (!hasValidBrand) {
      triggerToast('Hãng xe/Dòng xe không tồn tại trên thị trường hoặc không hợp lệ!', 'error');
      return;
    }

    let ownerId = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        ownerId = JSON.parse(userStr).id;
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
    }

    if (!ownerId) {
      triggerToast('Phiên làm việc lỗi. Vui lòng đăng nhập lại!', 'error');
      return;
    }

    let sizeType = 'SEDAN_HATCHBACK';
    if (newType === 'Xe 7 chỗ' || newType === 'Xe 9 chỗ') {
      sizeType = 'SUV_CUV_MPV';
    } else if (newType === 'Xe 16 chỗ') {
      sizeType = 'LARGE_VAN_MINIBUS';
    }

    let bodyShapeDb = 'SEDAN';
    if (newType === 'Xe 7 chỗ') {
      bodyShapeDb = 'SUV';
    } else if (newType === 'Xe 9 chỗ') {
      bodyShapeDb = 'VAN';
    } else if (newType === 'Xe 16 chỗ') {
      bodyShapeDb = 'MINIBUS';
    }

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    const payload = {
      id: uuid,
      ownerId: ownerId,
      licensePlate: newPlate.toUpperCase().trim(),
      vehicleSize: sizeType,
      brand: newName.trim() || 'Phương tiện mới',
      color: 'WHITE',
      colorRgb: '#FFFFFF',
      bodyShape: bodyShapeDb,
      isActive: true,
      fuelType: 'GASOLINE',
      registrationDocUrl: newRegDoc,
      registrationPhotoUrl: newRegPhoto
    };

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMsg = 'Thêm xe thất bại. Biển số xe có thể đã tồn tại!';
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      const savedVehicle = await response.json();
      
      const modelItem: UserVehicle = {
        id: savedVehicle.id,
        plate: savedVehicle.licensePlate,
        name: savedVehicle.brand,
        type: newType,
        regDate: new Date().toLocaleDateString('vi-VN'),
        isActive: true,
        image: '',
        isLocked: false
      };

      setVehicles(prev => [...prev, modelItem]);
      setNewPlate('');
      setNewName('');
      setNewRegDoc(null);
      setNewRegPhoto(null);
      setAddVehicleModalOpen(false);
      triggerToast(`Đăng ký thêm phương tiện ${modelItem.plate} thành công!`, 'success');
      
      fetchVehiclesFromApi();
    } catch (error: any) {
      triggerToast(error.message || 'Thêm xe thất bại, vui lòng kiểm tra lại!', 'error');
    }
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicleId) return;
    if (!editPlate.trim()) {
      triggerToast('Vui lòng điền biển số xe!', 'error');
      return;
    }
    const plateRegex = /^[0-9]{2}[A-Z]{1,2}[-]?([0-9]{4,5}|[0-9]{3}\.[0-9]{2})$/i;
    if (!plateRegex.test(editPlate.trim())) {
      triggerToast('Biển số xe không đúng định dạng (Ví dụ: 30G-123.45 hoặc 30A-99999)!', 'error');
      return;
    }

    const brandInput = editName.trim();
    if (!brandInput) {
      triggerToast('Vui lòng điền tên hãng xe / model!', 'error');
      return;
    }
    const unsignedRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!unsignedRegex.test(brandInput)) {
      triggerToast('Tên xe không được phép chứa dấu tiếng Việt hoặc ký tự đặc biệt!', 'error');
      return;
    }
    const validBrands = [
      'TOYOTA', 'HONDA', 'VINFAST', 'MAZDA', 'MERCEDES', 'BMW', 'HYUNDAI', 'KIA', 'FORD', 
      'AUDI', 'LEXUS', 'PORSCHE', 'MITSUBISHI', 'CHEVROLET', 'NISSAN', 'SUZUKI', 'PEUGEOT', 
      'VOLVO', 'LAND ROVER', 'JAGUAR', 'TESLA', 'VOLKSWAGEN', 'SUBARU', 'MG', 'BYD', 'JEEP', 
      'ROLLS ROYCE', 'BENTLEY', 'MINI', 'FIAT', 'FERRARI', 'LAMBORGHINI', 'ASTON MARTIN', 'MASERATI'
    ];
    const upperInput = brandInput.toUpperCase();
    const hasValidBrand = validBrands.some(brand => upperInput.includes(brand));
    if (!hasValidBrand) {
      triggerToast('Hãng xe/Dòng xe không tồn tại trên thị trường hoặc không hợp lệ!', 'error');
      return;
    }

    let ownerId = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        ownerId = JSON.parse(userStr).id;
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
    }

    if (!ownerId) {
      triggerToast('Phiên làm việc lỗi. Vui lòng đăng nhập lại!', 'error');
      return;
    }

    let sizeType = 'SEDAN_HATCHBACK';
    if (editType === 'Xe 7 chỗ' || editType === 'Xe 9 chỗ') {
      sizeType = 'SUV_CUV_MPV';
    } else if (editType === 'Xe 16 chỗ') {
      sizeType = 'LARGE_VAN_MINIBUS';
    }

    let bodyShapeDb = 'SEDAN';
    if (editType === 'Xe 7 chỗ') {
      bodyShapeDb = 'SUV';
    } else if (editType === 'Xe 9 chỗ') {
      bodyShapeDb = 'VAN';
    } else if (editType === 'Xe 16 chỗ') {
      bodyShapeDb = 'MINIBUS';
    }

    const payload = {
      id: editingVehicleId,
      ownerId: ownerId,
      licensePlate: editPlate.toUpperCase().trim(),
      vehicleSize: sizeType,
      brand: editName.trim() || 'Phương tiện',
      color: 'WHITE',
      colorRgb: '#FFFFFF',
      bodyShape: bodyShapeDb,
      isActive: true,
      fuelType: 'GASOLINE',
      registrationDocUrl: editRegDoc,
      registrationPhotoUrl: editRegPhoto
    };

    if (isOffline) {
      setVehicles(prev => prev.map(v => {
        if (v.id === editingVehicleId) {
          return {
            ...v,
            plate: editPlate.toUpperCase().trim(),
            name: editName.trim() || 'Phương tiện',
            type: editType
          };
        }
        return v;
      }));
      setEditRegDoc(null);
      setEditRegPhoto(null);
      setEditVehicleModalOpen(false);
      triggerToast('Đã sửa phương tiện thành công (Chế độ Ngoại tuyến)!', 'success');
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${editingVehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedVehicle = await response.json();
        setVehicles(prev => prev.map(v => {
          if (v.id === editingVehicleId) {
            return {
              ...v,
              id: savedVehicle.id,
              plate: editPlate.toUpperCase().trim(),
              name: editName.trim() || 'Phương tiện',
              type: editType,
              registrationDocUrl: editRegDoc,
              registrationPhotoUrl: editRegPhoto
            };
          }
          return v;
        }));
        setEditRegDoc(null);
        setEditRegPhoto(null);
        setEditVehicleModalOpen(false);
        triggerToast('Cập nhật phương tiện thành công!', 'success');
      } else {
        let errMsg = 'Không thể cập nhật phương tiện. Vui lòng thử lại!';
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (e) {}
        triggerToast(errMsg, 'error');
      }
    } catch (err) {
      triggerToast('Lỗi kết nối API Backend!', 'error');
    }
  };

  // Lock/Unlock Anti-theft vehicle
  const toggleVehicleLock = (id: string, plate: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const nextState = !v.isLocked;
        triggerToast(
          nextState 
            ? `🔒 Đã kích hoạt kẹp phanh & khóa radar chống trộm cho xe ${plate}!`
            : `🔓 Đã mở khóa an ninh bảo vệ xe ${plate}.`, 
          nextState ? 'success' : 'info'
        );
        return { ...v, isLocked: nextState };
      }
      return v;
    }));
  };

  const handleToggleLockInPwa = async (vehicleId: string, plateStr: string, currentIsLocked: boolean) => {
    if (isOffline) {
      triggerToast('Lỗi: Không thể thực hiện khóa/mở khóa xe ở chế độ Ngoại tuyến!', 'error');
      return;
    }
    setIsTogglingLock(vehicleId);
    try {
      const response = await fetch('/api/vehicles/lock', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plate: plateStr, isLocked: !currentIsLocked })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(data.message, !currentIsLocked ? 'success' : 'info');
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, isLocked: !currentIsLocked } : v));
      } else {
        triggerToast(`Không thành công: ${data.message}`, 'error');
      }
    } catch (err) {
      triggerToast('Lỗi kết nối API Backend!', 'error');
    } finally {
      setIsTogglingLock(null);
    }
  };

  // Checkout VIP flow
  const handleStartVnpay = () => {
    if (isOffline) {
      triggerToast('Lỗi: Không thể đăng ký Thẻ Tháng VIP ở chế độ Ngoại tuyến!', 'error');
      return;
    }
    if (paymentMethod === 'wallet') {
      if (balance < selectedPackPrice) {
        triggerToast(`⚠️ Thất bại: Số dư ví không đủ! Cần ${selectedPackPrice.toLocaleString('vi-VN')}₫, Số dư hiện tại: ${balance.toLocaleString('vi-VN')}₫`, 'error');
        return;
      }
      setBalance(prev => prev - selectedPackPrice);
      const formattedPrice = selectedPackPrice.toLocaleString('vi-VN') + '₫';
      const newTx: TransactionItem = {
        id: `txn-${Date.now()}`,
        date: getNowFormatted(),
        type: `Đăng kí ${selectedPackLabel} (Ví UrbanPark)`,
        plate: selectedVehicleForVIP,
        fee: `-${formattedPrice}`,
        isEntry: false,
        status: 'Thành công'
      };
      setTransactions(prev => [newTx, ...prev]);
      
      // Calculate expiry date by checking if they already have an active subscription
      const targetVeh = vehicles.find(v => v.plate === selectedVehicleForVIP);
      let expiryDate = new Date();
      if (targetVeh && targetVeh.activeSubscription && targetVeh.subscriptionExpiry) {
        const parsedExpiry = parseExpiryDate(targetVeh.subscriptionExpiry);
        if (parsedExpiry.getTime() > Date.now()) {
          expiryDate = parsedExpiry;
        }
      }

      if (selectedPackLabel.includes('1 Năm') || selectedPackLabel.includes('1 năm')) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (selectedPackLabel.includes('3 Tháng') || selectedPackLabel.includes('3 tháng')) {
        expiryDate.setMonth(expiryDate.getMonth() + 3);
      } else if (selectedPackLabel.includes('6 Tháng') || selectedPackLabel.includes('6 tháng')) {
        expiryDate.setMonth(expiryDate.getMonth() + 6);
      } else if (selectedPackLabel.includes('Tháng') || selectedPackLabel.includes('VIP')) {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 1);
      }
      const expiryString = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;

      // Create subscription in localStorage with PENDING_APPROVAL status
      const savedSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
      const tempId = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newSub = {
        id: tempId,
        vehicle_plate: selectedVehicleForVIP,
        type: selectedPackLabel,
        startDate: new Date().toLocaleDateString('vi-VN'),
        endDate: expiryString,
        status: 'PENDING_APPROVAL',
        document_photos: (() => {
          const targetVeh = vehicles.find((v: any) => v.plate === selectedVehicleForVIP);
          return (window as any).lastUploadedPhotos || {
            registrationPaper: targetVeh?.registrationDocUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80',
            identityCard: targetVeh?.registrationPhotoUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
            frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
          };
        })(),
        explanation: (window as any).lastUploadedPhotos?.explanation || ''
      };
      // Call Backend API to register VIP subscription
      if (targetVeh?.id) {
        let subType = 'MONTHLY';
        if (selectedPackLabel.includes('3 Tháng')) {
          subType = 'QUARTERLY';
        } else if (selectedPackLabel.includes('6 Tháng')) {
          subType = 'HALF_YEARLY';
        } else if (selectedPackLabel.includes('1 Năm')) {
          subType = 'YEARLY';
        }

        fetch('/api/vip/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            vehicleId: targetVeh.id,
            subscriptionType: subType
          })
        }).then(res => {
          if (res.ok) {
            return res.json();
          }
        }).then(data => {
          if (data && data.id) {
            const currentSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
            const updated = currentSubs.map((s: any) => s.id === tempId ? { ...s, id: data.id } : s);
            localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          }
        }).catch(err => console.warn("Backend VIP registration failed:", err));
      }

      savedSubs.push(newSub);
      localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(savedSubs));
      window.dispatchEvent(new Event('storage'));

      setRegStep(3); // success step!
      triggerToast(`✉️ Đăng kí thành công! Đang chờ Manager phê duyệt hồ sơ VIP cho xe ${selectedVehicleForVIP}.`, 'success');
    } else {
      setVnpayStep('info');
      setVnpayModalOpen(true);
    }
  };

  const handleSendVnpayDomesticCard = () => {
    if (isOffline) {
      triggerToast('Lỗi: Mất kết nối mạng, không thể thực hiện giao dịch!', 'error');
      return;
    }
    if (!vnpayCardNo.trim() || !vnpayCardHolder.trim()) {
      triggerToast('Vui lòng điền đầy đủ số thẻ & tên chủ thẻ', 'error');
      return;
    }
    setVnpayStep('otp');
    setVnpayOtp('');
  };

  const handleConfirmVnpayPayment = () => {
    if (isOffline) {
      triggerToast('Lỗi: Mất kết nối mạng, không thể thực hiện giao dịch!', 'error');
      return;
    }
    if (vnpayOtp !== '2026' && vnpayOtp !== 'OTP-2026') {
      triggerToast('Vui lòng nhập đúng mã OTP Sandbox: OTP-2026', 'error');
      return;
    }

    setVnpayStep('success');

    const isTopUp = selectedPackLabel.includes('Nạp tiền');

    if (isTopUp) {
      setBalance(prev => prev + selectedPackPrice);
      const newTx: TransactionItem = {
        id: `txn-${Date.now()}`,
        date: getNowFormatted(),
        type: 'Nạp ví VNPAY',
        plate: '-',
        fee: `+${selectedPackPrice.toLocaleString('vi-VN')}₫`,
        isEntry: true,
        status: 'Thành công'
      };
      setTransactions(prev => [newTx, ...prev]);
      triggerToast(`Nạp thành công ${selectedPackPrice.toLocaleString('vi-VN')}₫ vào ví điện tử!`, 'success');
    } else {
      const formattedPrice = selectedPackPrice.toLocaleString('vi-VN') + '₫';
      const newTx: TransactionItem = {
        id: `txn-${Date.now()}`,
        date: getNowFormatted(),
        type: `Đăng kí ${selectedPackLabel}`,
        plate: selectedVehicleForVIP,
        fee: `-${formattedPrice}`,
        isEntry: false,
        status: 'Thành công'
      };
      setTransactions(prev => [newTx, ...prev]);
      
      // Calculate expiry date by checking if they already have an active subscription
      const targetVeh = vehicles.find(v => v.plate === selectedVehicleForVIP);
      let expiryDate = new Date();
      if (targetVeh && targetVeh.activeSubscription && targetVeh.subscriptionExpiry) {
        const parsedExpiry = parseExpiryDate(targetVeh.subscriptionExpiry);
        if (parsedExpiry.getTime() > Date.now()) {
          expiryDate = parsedExpiry;
        }
      }

      if (selectedPackLabel.includes('1 Năm') || selectedPackLabel.includes('1 năm')) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (selectedPackLabel.includes('3 Tháng') || selectedPackLabel.includes('3 tháng')) {
        expiryDate.setMonth(expiryDate.getMonth() + 3);
      } else if (selectedPackLabel.includes('6 Tháng') || selectedPackLabel.includes('6 tháng')) {
        expiryDate.setMonth(expiryDate.getMonth() + 6);
      } else if (selectedPackLabel.includes('Tháng') || selectedPackLabel.includes('VIP')) {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 1);
      }
      const expiryString = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;

      // Create subscription in localStorage with PENDING_APPROVAL status
      const savedSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
      const tempId = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newSub = {
        id: tempId,
        vehicle_plate: selectedVehicleForVIP,
        type: selectedPackLabel,
        startDate: new Date().toLocaleDateString('vi-VN'),
        endDate: expiryString,
        status: 'PENDING_APPROVAL',
        document_photos: (() => {
          const targetVeh = vehicles.find((v: any) => v.plate === selectedVehicleForVIP);
          return (window as any).lastUploadedPhotos || {
            registrationPaper: targetVeh?.registrationDocUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80',
            identityCard: targetVeh?.registrationPhotoUrl || 'https://images.unsplash.com/photo-1557804506-669a67955ba0?w=500&auto=format&fit=crop&q=80',
            frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
          };
        })(),
        explanation: (window as any).lastUploadedPhotos?.explanation || ''
      };
      // Call Backend API to register VIP subscription
      if (targetVeh?.id) {
        let subType = 'MONTHLY';
        if (selectedPackLabel.includes('3 Tháng')) {
          subType = 'QUARTERLY';
        } else if (selectedPackLabel.includes('6 Tháng')) {
          subType = 'HALF_YEARLY';
        } else if (selectedPackLabel.includes('1 Năm')) {
          subType = 'YEARLY';
        }

        fetch('/api/vip/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            vehicleId: targetVeh.id,
            subscriptionType: subType
          })
        }).then(res => {
          if (res.ok) {
            return res.json();
          }
        }).then(data => {
          if (data && data.id) {
            const currentSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
            const updated = currentSubs.map((s: any) => s.id === tempId ? { ...s, id: data.id } : s);
            localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          }
        }).catch(err => console.warn("Backend VIP registration failed:", err));
      }

      savedSubs.push(newSub);
      localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(savedSubs));
      window.dispatchEvent(new Event('storage'));

      triggerToast(`✉️ Đăng kí thành công! Đang chờ Manager phê duyệt hồ sơ VIP cho xe ${selectedVehicleForVIP}.`, 'success');
    }
  };

  const handleCloseVnpay = () => {
    setVnpayModalOpen(false);
    if (vnpayStep === 'success') {
      setRegStep(3); // move progress step to step 3
    }
  };

  const getBillingStats = () => {
    let sumThisMonth = 0;
    let sumLastMonth = 0;
    
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Last month calculations
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    if (lastMonth < 0) {
      lastMonth = 11;
      lastMonthYear = currentYear - 1;
    }
    
    transactions.forEach(tx => {
      if (tx.isEntry === false) {
        // Parse date DD/MM/YYYY HH:mm:ss
        const datePart = tx.date ? tx.date.split(' ')[0] : '';
        const parts = datePart ? datePart.split('/') : [];
        if (parts.length === 3) {
          const dMonth = parseInt(parts[1], 10) - 1; // 0-11
          const dYear = parseInt(parts[2], 10);
          
          const feeStr = tx.fee ? tx.fee.replace(/[-+$₫]/g, '').replace(/,/g, '').trim() : '';
          const value = parseFloat(feeStr);
          if (!isNaN(value)) {
            const valVND = tx.fee && tx.fee.includes('$') ? value * 25000 : value;
            
            if (dMonth === currentMonth && dYear === currentYear) {
              sumThisMonth += valVND;
            } else if (dMonth === lastMonth && dYear === lastMonthYear) {
              sumLastMonth += valVND;
            }
          }
        }
      }
    });
    
    let percentText = "0% so với tháng trước";
    let isDecrease = false;
    let isIncrease = false;
    
    if (sumLastMonth === 0) {
      if (sumThisMonth > 0) {
        percentText = "+100% so với tháng trước";
        isIncrease = true;
      } else {
        percentText = "Không thay đổi so với tháng trước";
      }
    } else {
      const diff = ((sumThisMonth - sumLastMonth) / sumLastMonth) * 100;
      const rounded = Math.round(diff);
      if (rounded < 0) {
        percentText = `${rounded}% so với tháng trước`;
        isDecrease = true;
      } else if (rounded > 0) {
        percentText = `+${rounded}% so với tháng trước`;
        isIncrease = true;
      } else {
        percentText = "0% so với tháng trước";
      }
    }
    
    return {
      sumThisMonth,
      percentText,
      isDecrease,
      isIncrease
    };
  };

  const handleFindCar = () => {
    if (currentParked && currentParked.isParked) {
      Modal.info({
        title: 'Định vị phương tiện của bạn',
        content: (
          <div className="space-y-3 mt-3 text-left">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">VỊ TRÍ ĐỖ XE</p>
                <strong className="text-lg font-black text-slate-800">{currentParked.location}</strong>
              </div>
            </div>
            <div className="text-xs text-slate-550 font-semibold space-y-1">
              <p>• Biển số xe: <strong className="font-mono text-slate-700">{currentParked.plate}</strong></p>
              <p>• Trạng thái: <span className="text-emerald-600 font-extrabold">{currentParked.status}</span></p>
              <p className="mt-2 text-slate-400">Chỉ dẫn: Bạn có thể đi bộ qua Lối đi bộ Zone A, bấm thang máy lên Tầng 2 để nhận xe.</p>
            </div>
          </div>
        ),
        okText: 'Đóng',
        centered: true,
        maskClosable: true,
      });
    } else {
      triggerToast('Hiện tại không có phương tiện nào của bạn đang đỗ trong bãi xe!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Dynamic Toast banner overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-10 right-10 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'error' 
                ? 'bg-rose-500 text-white border-rose-400' 
                : toast.type === 'info' 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-emerald-500 text-white border-emerald-400'
            }`}
          >
            <span className="font-extrabold text-sm">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIP Subscription Detail Modal */}
      <AnimatePresence>
        {selectedSubForDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden border border-slate-200 shadow-2xl flex flex-col font-sans"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                    Chi tiết đăng ký VIP
                  </span>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Xe {selectedSubForDetail.vehicle_plate}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedSubForDetail(null)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-left overflow-y-auto max-h-[70vh] leading-normal">
                {/* Status Section */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái</span>
                    <strong className="text-sm font-black text-slate-700">
                      {selectedSubForDetail.status === 'ACTIVE' ? 'Đã kích hoạt' : 
                       selectedSubForDetail.status === 'REJECTED' ? 'Bị từ chối' : 'Chờ duyệt'}
                    </strong>
                  </div>
                  <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
                    selectedSubForDetail.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-500/10' 
                      : selectedSubForDetail.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-100/80 text-amber-700 animate-pulse'
                  }`}>
                    {selectedSubForDetail.status === 'ACTIVE' ? 'Hoạt động' : 
                     selectedSubForDetail.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                  </span>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/60">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gói dịch vụ</span>
                    <strong className="text-xs font-black text-slate-800 block mt-0.5">
                      {selectedSubForDetail.type}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/60">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Giá cước</span>
                    <strong className="text-xs font-mono font-black text-slate-800 block mt-0.5">
                      {getVipPrice(selectedSubForDetail).toLocaleString('vi-VN')}₫
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/60">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ngày bắt đầu</span>
                    <strong className="text-xs font-black text-slate-800 block mt-0.5">
                      {selectedSubForDetail.startDate || 'N/A'}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/60">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hạn dùng</span>
                    <strong className="text-xs font-black text-slate-800 block mt-0.5">
                      {selectedSubForDetail.endDate || 'N/A'}
                      {selectedSubForDetail.status === 'ACTIVE' && (
                        <span className="text-[10px] ml-1.5 text-blue-600 font-bold">
                          (Còn {getRemainingDays(selectedSubForDetail.endDate)} ngày)
                        </span>
                      )}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hình thức thanh toán</span>
                  <strong className="text-xs font-black text-slate-800 block mt-0.5">
                    {selectedSubForDetail.paymentMethod || 'Ví điện tử'}
                  </strong>
                </div>

                {/* Proof documents if any */}
                {(selectedSubForDetail.regDoc || selectedSubForDetail.regPhoto) && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Tài liệu minh chứng đính kèm
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedSubForDetail.regDoc && (
                        <div className="group relative h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60">
                          <img 
                            src={selectedSubForDetail.regDoc} 
                            alt="Cà vẹt xe" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[9px] text-white font-black uppercase">Ảnh cà vẹt</span>
                          </div>
                        </div>
                      )}
                      {selectedSubForDetail.regPhoto && (
                        <div className="group relative h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60">
                          <img 
                            src={selectedSubForDetail.regPhoto} 
                            alt="Ảnh thực tế" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[9px] text-white font-black uppercase">Ảnh đầu xe</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedSubForDetail(null)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTRUSION / ALARM POPUP */}
      <AnimatePresence>
        {isAlertOverlayShown && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="max-w-xl w-full bg-slate-900 border-4 border-rose-600 rounded-3xl p-8 shadow-2xl relative space-y-6 text-white my-auto">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square rounded-full border border-rose-500/15 animate-ping pointer-events-none" />
              <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mx-auto animate-bounce border-4 border-white text-white shadow-xl shadow-rose-500/50">
                <ShieldAlert className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-black tracking-widest text-rose-500 bg-rose-500/10 py-1.5 px-4 rounded-full border border-rose-500/20 uppercase inline-block">
                  CẢNH BÁO BẢO VỆ CHỐNG TRỘM
                </span>
                <h1 className="text-3xl font-black text-white uppercase">Phát hiện Đột Nhập!</h1>
                <p className="text-rose-200 text-sm max-w-sm mx-auto leading-relaxed">
                  Thiết bị bảo vệ chống trộm đã phát hiện hành vi bẻ khoá, dời xe trái phép ra ngoài bốt gác! Hệ thống đã kích hoạt khóa kẹp phanh hơi cứng và chặn rào chắn tự động.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    stopSiren();
                    setIsAlertOverlayShown(false);
                    triggerToast('Đã dừng còi báo động an ninh.', 'info');
                  }}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs rounded-xl tracking-wide uppercase transition-all shadow-lg cursor-pointer"
                >
                  Tắt Báo Động & Reset Hệ Thống
                </button>
                <button
                  onClick={() => setIsSirenMuted(!isSirenMuted)}
                  className="px-4 py-3 bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSirenMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                  <span>{isSirenMuted ? 'Bật âm thanh' : 'Tắt tiếng chuông'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE DESKTOP EMBED CONTAINER CARD */}
      <div 
        id="driver-pwa-body-card" 
        className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row"
      >
        
        {/* ==================================================== */}
        {/* 1. LEFT SIDEBAR (EXACT PIXEL REPLICATION IN BLUE) */}
        {/* ==================================================== */}
        <aside className="w-full md:w-[260px] bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 p-6 min-h-[600px]">
          
          <div className="space-y-8">
            {/* Header branding */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-blue-600 font-sans tracking-tight leading-none">
                UrbanPark
              </h1>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Driver Portal
              </p>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1.5">
              {[
                { id: 'home', label: 'Trang chủ', icon: <Home className="w-4.5 h-4.5" /> },
                { id: 'driver_pnl', label: 'Khóa xe & Tạo QR', icon: <QrCode className="w-4.5 h-4.5" /> },
                { id: 'vehicles', label: 'Xe của tôi', icon: <Car className="w-4.5 h-4.5" /> },
                { id: 'vip_reg', label: 'Đăng ký hàng tháng', icon: <Calendar className="w-4.5 h-4.5" /> },
                { id: 'billing', label: 'Lịch sử thanh toán', icon: <CreditCard className="w-4.5 h-4.5" /> },
                { id: 'settings', label: 'Cài đặt tài khoản', icon: <Settings className="w-4.5 h-4.5" /> },
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      if (item.id === 'vip_reg') setRegStep(2); // reset layout step to 2
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs select-none transition-all active:scale-[0.98] ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5">
            <button 
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs select-none transition-all active:scale-[0.98] ${
                activeTab === 'support' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4.5 h-4.5" />
                <span>Hỗ trợ</span>
              </div>
              {activeTab === 'support' && <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:text-red-600 font-extrabold text-xs text-left cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5 text-red-400" />
              <span>Đăng xuất</span>
            </button>
          </div>

        </aside>

        {/* ==================================================== */}
        {/* 2. MAIN AREA WRAPPER */}
        {/* ==================================================== */}
        <main className="flex-1 flex flex-col bg-slate-50/50">
          
          {/* TOP BAR / NAVIGATION HEADER */}
          <header className="px-8 py-5 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            
            {/* Search segment mimicking placeholder */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'vehicles' ? 'Tìm biển số xe...' : 'Tìm dịch vụ bãi đỗ...'}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-full font-medium"
              />
            </div>

            {/* Right side user statistics */}
            <div className="flex items-center gap-5">
              {/* Wallet Balance representation */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-mono font-bold text-slate-700">
                <span className="text-[10px] text-slate-400 font-sans tracking-wide">Số dư ví:</span>
                <span className="text-blue-600 font-black">{balance.toLocaleString('vi-VN')}₫</span>
              </div>

              {/* Action bells */}
              <button 
                onClick={() => triggerToast('Không có thông báo mới nào hôm nay.', 'info')} 
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full relative"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </button>

              <button 
                onClick={() => triggerToast('Chi tiết phiên bản UrbanPark Driver Portal v1.0.8', 'info')}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </button>

              {/* User Identity widget */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 font-sans">
                <div className="w-8 h-8 rounded-full border border-blue-500/10 overflow-hidden flex items-center justify-center bg-blue-50 text-blue-600 font-black text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block leading-none text-left">
                  <strong className="text-xs font-black text-slate-800 tracking-tight block">
                    {user.name}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

          </header>

          {/* PAGE INNER LAYER WORKSPACE */}
          <div className="p-8 flex-1 overflow-y-auto max-h-[calc(100vh-100px)]">
            <AnimatePresence mode="wait">

              {/* TABS VIEW 0: DETAILED DRIVER CONTROL PANEL (QUICK ACTS & REAL API) */}
              {activeTab === 'driver_pnl' && (
                <motion.div
                  key="driver_pnl"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <KeyRound className="w-6 h-6 text-blue-600" />
                        Bảng Điều Khiển Tài Xế (Bật Khóa & Tạo Mã QR)
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold">
                        Giao diện tương tác và bảo mật tức thời kết nối trực tiếp đến Backend Cloud UrbanPark.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* LEFT PART: VEHICLE SELECTOR & SMART LOCK ENGINE */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">THIẾT BỊ</span>
                            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wide">Khóa Bảo Vệ Kẹp Phanh Xe</h3>
                          </div>
                          <Lock className="w-5 h-5 text-blue-600" />
                        </div>

                        {/* Dropdown vehicle selector */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Chọn phương tiện đang điều khiển</label>
                          <select
                            value={selectedVehId}
                            onChange={(e) => setSelectedVehId(e.target.value)}
                            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {vehicles.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.plate} - {v.name} ({v.isLocked ? "ĐÃ KHÓA" : "MỞ KHÓA"})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Big visual lock feedback area */}
                        {(() => {
                          const activeVeh = vehicles.find(v => v.id === selectedVehId) || vehicles[0];
                          if (!activeVeh) {
                            return (
                              <div className="p-8 text-center text-xs text-slate-400">
                                Chưa đăng ký bất kỳ chiếc xe nào. Vui lòng thêm xe ở tab "Xe của tôi"!
                              </div>
                            );
                          }
                          const isLocked = activeVeh.isLocked;
                          const isVip = activeVeh.activeSubscription;
                          if (!isVip) {
                            return (
                              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-450 from-amber-400 to-yellow-500" />
                                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 shadow-lg shadow-amber-100 flex items-center justify-center relative z-10">
                                  <Lock className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-black uppercase tracking-wider text-amber-800">
                                    DÀNH RIÊNG CHO HỘI VIÊN VIP
                                  </h4>
                                  <span className="text-[10px] bg-slate-200/60 font-mono text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-wider">
                                    {activeVeh.plate}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                                  Tính năng khoá bánh bảo vệ radar và kẹp phanh hơi thông minh chống trộm từ xa chỉ áp dụng cho phương tiện có vé tháng VIP đang hoạt động.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVehicleForVIP(activeVeh.plate);
                                    setActiveTab('vip_reg');
                                  }}
                                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-650 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer text-center"
                                >
                                  Đăng ký VIP ngay để kích hoạt
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isLocked ? 'from-rose-500 to-red-600' : 'from-emerald-400 to-teal-500'}`} />
                              
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-all ${
                                isLocked ? 'bg-red-50 text-red-600 shadow-lg shadow-red-200' : 'bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100'
                              }`}>
                                {isLocked ? (
                                  <Lock className="w-8 h-8 animate-pulse" />
                                ) : (
                                  <Unlock className="w-8 h-8" />
                                )}
                              </div>

                              <div className="space-y-1">
                                <h4 className={`text-sm font-black uppercase tracking-wider ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                                  {isLocked ? "Đang Khóa Chống Trộm" : "Mở Khóa - Sẵn Sàng Chạy"}
                                </h4>
                                <span className="text-[10px] bg-slate-200/60 font-mono text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-wider select-all">
                                  {activeVeh.plate}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                {isLocked 
                                  ? "Ví bốt và Barrier của bãi đỗ sẽ giữ rào đóng cứng và kẹp phanh hơi bánh xe nếu phát hiện xe di chuyển ra ngoài bốt gác lúc này."
                                  : "Bốt an ninh sẽ cho phép xe ra vào thoải mái, tự động đối khớp thông tin từ camera LPR và QR số."
                                }
                              </p>

                              <button
                                type="button"
                                disabled={isTogglingLock === activeVeh.id}
                                onClick={() => handleToggleLockInPwa(activeVeh.id, activeVeh.plate, isLocked)}
                                className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white shadow-md active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
                                  isLocked 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200' 
                                    : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-red-100'
                                }`}
                              >
                                {isTogglingLock === activeVeh.id ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Đang cấu hình khóa...</span>
                                  </>
                                ) : isLocked ? (
                                  <>
                                    <Unlock className="w-4 h-4" />
                                    <span>Bấm để Mở Khóa (Unlock Vehicle)</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    <span>Kích hoạt Khóa Bánh Radar Ô tô</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="text-[10px] text-slate-400 bg-slate-50 border border-slate-150 p-3 rounded-xl mt-4 leading-relaxed italic">
                        💡 <strong>Gợi ý kiểm thử lỗi (Bad flow):</strong> Bật <strong>"Kích hoạt Khóa Bánh"</strong> ở đây, sau đó sang <strong>Trực cổng (nhập biển số)</strong> và bấm thông quét xe có biển số này. Bạn sẽ kích hoạt ngay kịch bản báo động đột nhập bốt trực!
                      </div>
                    </div>


                    {/* RIGHT PART: DYNAMIC QR PASS CODE */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CHỨNG THƯ</span>
                            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wide">Mã QR Ra Vào Cổng Trực</h3>
                          </div>
                          <QrCode className="w-5 h-5 text-blue-600" />
                        </div>

                        {/* Flow direction selector */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Chiều Ra/Vào của Phương Tiện</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setQrDirection('VÀO')}
                              className={`py-2 text-center text-xs font-extrabold rounded-lg select-none transition-all ${
                                qrDirection === 'VÀO' 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              CHIỀU VÀO (GATE IN)
                            </button>
                            <button
                              type="button"
                              onClick={() => setQrDirection('RA')}
                              className={`py-2 text-center text-xs font-extrabold rounded-lg select-none transition-all ${
                                qrDirection === 'RA' 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              CHIỀU RA (GATE OUT)
                            </button>
                          </div>
                        </div>

                        {/* Rendering dynamic custom QR design vector mapping */}
                        {(() => {
                          const activeVeh = vehicles.find(v => v.id === selectedVehId) || vehicles[0];
                          if (!activeVeh) {
                            return (
                              <div className="bg-orange-50/50 rounded-2xl border border-dashed border-orange-200 p-8 flex flex-col items-center justify-center text-center space-y-3 mt-4 animate-fade-in">
                                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                  <QrCode className="w-8 h-8 animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Chưa có phương tiện</h4>
                                  <p className="text-[11px] text-slate-500 max-w-[240px] leading-relaxed">
                                    Vui lòng nhấn nút <strong>"Thêm xe mới"</strong> ở cột bên trái để đăng ký biển số xe của bạn và hiển thị mã QR.
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          const qrValueString = `${activeVeh.plate}|${qrDirection}|${Date.now()}`;
                          if (!isQrRequested) {
                            return (
                              <div className="bg-slate-50 rounded-2xl border border-slate-150 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 bg-blue-50 rounded-full text-blue-650 border border-blue-100/80">
                                  <QrCode className="w-10 h-10 opacity-75" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Mã QR đang ẩn</h4>
                                  <p className="text-[10.5px] text-slate-500 max-w-[260px] leading-relaxed">
                                    Để bảo mật thông tin ra vào, vui lòng nhấn nút bên dưới để tạo mã QR động có hiệu lực trong 5 phút.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsQrRequested(true)}
                                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                                >
                                  Yêu cầu xuất mã QR
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col items-center justify-center space-y-4">
                              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-inner w-44 h-44 flex flex-col items-center justify-center relative group">
                                {/* Simulated cool tech look camera scan target helper lines */}
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-600" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-600" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-600" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-600" />
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(activeQrToken || qrValueString)}`}
                                  alt="QR Code"
                                  className="w-28 h-28 object-contain"
                                />

                                <div className="text-[8px] text-blue-600 font-bold block bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-2">
                                  MÃ VÉ KHÁCH VIP
                                </div>
                              </div>

                              <div className="w-full text-center space-y-1">
                                <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">Chữ ký số bốt gác (Gate Token Hash)</span>
                                <strong className="text-xs font-mono font-black text-slate-800 tracking-wider block bg-white border border-slate-200 p-2 rounded-xl select-all shadow-inner break-all">
                                  {activeQrToken || qrValueString}
                                </strong>
                              </div>

                              <div className="w-full space-y-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(activeQrToken || qrValueString);
                                    triggerToast("📋 Sao chép mã chữ ký số bốt gác thành công!", "success");
                                  }}
                                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl active:scale-95 transition-all outline-none"
                                >
                                  Sao chép Mã QR văn bản
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsQrRequested(false)}
                                  className="w-full py-2 bg-rose-55 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl active:scale-95 transition-all outline-none border border-rose-200/50"
                                >
                                  Ẩn mã QR bảo mật
                                </button>
                              </div>

                              {qrExpiryTime && (
                                <p className="text-[10px] text-slate-400 text-center font-semibold pt-1">
                                  ⏱️ Mã QR động tự động làm mới sau <span className="text-blue-600 font-bold">{countdownSec} giây</span>
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="text-[10.5px] font-medium text-slate-500 leading-relaxed text-left p-3.5 bg-blue-50/55 rounded-2xl border border-blue-100">
                        📄 <strong>Nhập mã chữ ký trên ở bốt kiểm soát:</strong> Nhân viên bốt gác có thể trực tiếp sao chép mã chữ ký xe trên hoặc nhập tay biển số {vehicles.find(v => v.id === selectedVehId)?.plate || '"30G-123.45"'} của bạn để tạo dọn xe và nâng barie tự động một cách chân thực nhất!
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TABS VIEW 1: HOME PAGE */}
              {activeTab === 'home' && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8 text-left"
                >
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      Chào mừng trở lại, {user.name.split(' ').slice(-1)[0]}
                    </h2>
                    <p className="text-slate-400 text-xs">
                      Tổng quan hoạt động và trạng thái xe của bạn hôm nay.
                    </p>
                  </div>

                  {isOffline && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-red-50 text-red-800 rounded-2xl border border-red-200/60 p-5 space-y-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-red-950 uppercase font-sans">CHẾ ĐỘ NGOẠI TUYẾN GIAO THÔNG (OFFLINE RESCUE MODE)</h4>
                          <p className="text-xs text-red-700/90 leading-relaxed font-semibold">
                            Hệ thống tự động phát hiện mất mạng Internet bốt gác cổng. Để bảo toàn lưu thông và tránh kẹt barrier, vui lòng xuất trình Mã Vé Cứu Hộ Ngoại Tuyến dưới đây cho nhân viên bốt trực.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-red-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="text-[10px] text-slate-400 font-mono font-bold block">RESCUE TICKET TOKEN</span>
                          <strong className="text-xs font-mono font-black text-slate-800 tracking-wide uppercase select-all">
                            UP-OFFLINE-RESCUE-HASH-8812
                          </strong>
                          <span className="text-[10.5px] text-emerald-505 font-extrabold block">
                            ✓ Xác chuẩn mã cơ sở mã hoá cục bộ
                          </span>
                        </div>
                        <div className="w-20 h-20 bg-slate-50 border border-slate-150 p-1 rounded-lg flex items-center justify-center shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=120&auto=format&fit=crop&q=80" 
                            alt="Offline qr code representation" 
                            className="w-16 h-16 object-cover select-none filter contrast-125 saturate-0"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Top segment grid columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Card: Trạng thái hiện tại */}
                    <div className="lg:col-span-7 bg-blue-500/5 hover:bg-blue-500/10 rounded-2xl border border-blue-100 flex flex-col justify-between p-6 transition-all relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-400">TRỌNG ĐIỂM GIÁM SÁT</span>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Trạng Thái Hiện Tại</h3>
                        </div>
                        {currentParked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#10b981] font-bold text-xs rounded-full uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ĐANG ĐỖ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs rounded-full uppercase tracking-wide">
                            TRỐNG
                          </span>
                        )}
                      </div>

                      <p className="text-slate-500 text-xs mt-3">
                        {currentParked ? "Xe đang đỗ trong cơ sở bãi đỗ thông minh" : "Hiện tại không có xe nào đang đỗ trong bãi"}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white border border-slate-200/60 rounded-xl leading-snug">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">BIỂN SỐ NHẬN DIỆN</span>
                          <strong className="text-sm sm:text-base font-black text-slate-800 font-mono italic tracking-wide">{currentParked?.plate || 'Chưa ghi nhận'}</strong>
                        </div>
                        <div className="p-4 bg-white border border-slate-200/60 rounded-xl leading-snug flex items-center gap-3">
                          <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                            <MapPin className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">VỊ TRÍ ƯỚC TÍNH</span>
                            <strong className="text-xs sm:text-sm font-extrabold text-slate-850 block">{currentParked?.location || 'Chưa ghi nhận'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Card: Quick billing operations & shortcuts */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      
                      {/* Large Blue payment trigger */}
                      <button 
                        onClick={() => {
                          setActiveTab('vip_reg');
                          setRegStep(2);
                        }}
                        className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/10 cursor-pointer active:scale-[0.99] transition-all"
                      >
                        <CreditCard className="w-5 h-5 text-white" />
                        <span>Thanh Toán Ngay</span>
                      </button>

                      {/* Beneath grid */}
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        
                        <button 
                          onClick={handleFindCar}
                          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2 select-none group cursor-pointer active:scale-95 transition-all"
                        >
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-slate-700 tracking-tight leading-none">Tìm Xe Của Tôi</span>
                        </button>

                        <button 
                          onClick={() => {
                            setActiveTab('vip_reg');
                            setRegStep(2);
                          }}
                          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2 select-none group cursor-pointer active:scale-95 transition-all"
                        >
                          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-full group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-slate-700 tracking-tight leading-none">Gia Hạn Vé Tháng</span>
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* HOẠT ĐỘNG GẦN ĐÂY */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Hoạt Động Gần Đây
                      </h3>
                      <button 
                        onClick={() => setActiveTab('billing')}
                        className="text-xs font-extrabold text-blue-600 hover:underline cursor-pointer"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead>
                          <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/55 rounded-lg">
                            <th className="py-3 px-4">Thời Gian</th>
                            <th className="py-3 px-4">Sự Kiện</th>
                            <th className="py-3 px-4">Biển Số</th>
                            <th className="py-3 px-4 text-right">Phí</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/70">
                          {transactions.slice(0, 3).map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-medium text-slate-500">{tx.date}</td>
                              <td className="py-3.5 px-4 font-black">
                                <span className={`inline-flex items-center gap-1.5 ${tx.isEntry ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {tx.isEntry ? '➔ Xe vào' : '➔ Xe ra'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{tx.plate}</td>
                              <td className={`py-3.5 px-4 text-right font-bold ${tx.isEntry ? 'text-slate-400' : 'text-rose-600 font-mono'}`}>
                                {tx.fee}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>


                </motion.div>
              )}

              {/* TABS VIEW 2: VEHICLES COMPONENT */}
              {activeTab === 'vehicles' && (
                <motion.div 
                  key="vehicles"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-950 tracking-tight">Phương tiện của tôi</h2>
                      <p className="text-slate-400 text-xs">
                        Quản lý các phương tiện đã đăng ký để ra vào hệ thống UrbanPark.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setAddVehicleModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Thêm xe mới</span>
                    </button>
                  </div>

                  {/* Registered Vehicle Listings list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map(v => (
                      <div 
                        key={v.id} 
                        className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                          v.isLocked ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200/60'
                        }`}
                      >
                        
                        {/* Vehicle Photo Block */}
                        <div className="h-44 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                          {v.image ? (
                            <img 
                              src={v.image} 
                              alt={v.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                              <Car className="w-16 h-16 stroke-[1]" />
                              <span className="text-[10px] font-bold tracking-wider font-mono uppercase text-slate-400 bg-slate-200/40 px-2 py-0.5 rounded-md">BIKE NO REGCARD</span>
                            </div>
                          )}

                          {/* Anti-theft live scanner badge */}
                          <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                            {v.isActive ? (
                              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#10b981] font-bold text-[9px] rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                HOẠT ĐỘNG
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-amber-500 font-bold text-[9px] rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                CHỜ PHÊ DUYỆT XE
                              </span>
                            )}
                            {v.isLocked && (
                              <span className="px-2.5 py-1 bg-rose-500 text-white font-black text-[9px] rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                                SHIELD LOCK ON
                              </span>
                            )}
                          </div>

                        </div>

                        {/* Card metadata detail */}
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-xl font-black text-slate-850 font-mono tracking-wide">{v.plate}</strong>
                              <span className="text-xs text-slate-400 font-bold block mt-0.5">{v.name}</span>
                              {v.activeSubscription && (
                                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 bg-emerald-50 rounded-md uppercase tracking-wider">
                                  ✨ {v.activeSubscription}
                                </span>
                              )}
                            </div>
                            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                              <Car className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3.5 text-left leading-normal font-sans">
                            <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LOẠI XE</span>
                              <strong className="text-xs font-black text-slate-700 block mt-0.5">{v.type}</strong>
                            </div>
                            <div>
                              {v.activeSubscription ? (
                                <>
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">HẠN SỬ DỤNG</span>
                                  <strong className="text-xs font-black text-emerald-600 block mt-0.5">
                                    {v.subscriptionExpiry}
                                    <span className="text-[10px] ml-1.5 font-bold text-slate-500">
                                      (Còn {getRemainingDays(v.subscriptionExpiry || '')} ngày)
                                    </span>
                                  </strong>
                                </>
                              ) : (
                                <>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NGÀY ĐĂNG KÝ</span>
                                  <strong className="text-xs font-extrabold text-slate-700 block mt-0.5">{v.regDate}</strong>
                                </>
                              )}
                            </div>
                          </div>

                           {/* Lock Trigger Controller */}
                           <div className="flex items-center justify-between gap-3 pt-1">
                            {v.activeSubscription ? (
                               <button
                                 onClick={() => toggleVehicleLock(v.id, v.plate)}
                                 className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${
                                   v.isLocked 
                                     ? 'bg-rose-100 hover:bg-rose-200 text-rose-600' 
                                     : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                 }`}
                               >
                                 {v.isLocked ? (
                                   <>
                                     <Lock className="w-4 h-4 text-rose-500 animate-pulse" />
                                     <span>Mở khoá an ninh</span>
                                   </>
                                 ) : (
                                   <>
                                     <Unlock className="w-4 h-4 text-blue-500" />
                                     <span>Khoá an toàn xe</span>
                                   </>
                                 )}
                               </button>
                             ) : v.subscriptionStatus === 'PENDING_APPROVAL' ? (
                               <button
                                 disabled
                                 className="flex-1 py-2 bg-slate-50 text-slate-400 border border-slate-200/50 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                  <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                                  <span>Đang chờ duyệt VIP...</span>
                                </button>
                             ) : (
                               <button
                                 onClick={() => {
                                   setSelectedVehicleForVIP(v.plate);
                                   setActiveTab('vip_reg');
                                 }}
                                 className="flex-1 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all"
                               >
                                 <Lock className="w-3.5 h-3.5 text-slate-400" />
                                 <span>Đăng ký VIP để duyệt xe & khoá bánh</span>
                               </button>
                             )}

                            <button 
                              onClick={() => {
                                setEditingVehicleId(v.id);
                                setEditPlate(v.plate);
                                setEditName(v.name);
                                setEditType(v.type);
                                setEditRegDoc(v.registrationDocUrl || null);
                                setEditRegPhoto(v.registrationPhotoUrl || null);
                                setEditVehicleModalOpen(true);
                              }}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
                            >
                              Sửa
                            </button>
                          </div>

                        </div>

                      </div>
                    ))}

                    {/* Dotted empty slot widget */}
                    <button 
                      onClick={() => setAddVehicleModalOpen(true)}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/20 transition-all rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3 group select-none min-h-[300px] cursor-pointer"
                    >
                      <div className="p-3 bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 rounded-full transition-all">
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <strong className="text-xs font-black text-slate-800 tracking-tight group-hover:text-blue-600 block">Thêm xe mới</strong>
                        <p className="text-[10px] text-slate-400 font-medium max-w-[200px] mx-auto mt-0.5">
                          Đăng ký xe mới để sử dụng dịch vụ bãi đỗ tự động tiện lợi.
                        </p>
                      </div>
                    </button>

                  </div>

                </motion.div>
              )}

              {/* TABS VIEW 3: DĂNG KÝ HÀNG THÁNG FORM */}
              {activeTab === 'vip_reg' && (
                <motion.div 
                  key="vip_reg"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">Đăng ký dịch vụ</h2>
                    <p className="text-slate-400 text-xs text-left">
                      Thiết lập thẻ tháng hoặc thẻ ngày cho phương tiện của bạn.
                    </p>
                  </div>

                  {vehicles.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-lg text-center max-w-xl mx-auto space-y-6 mt-8"
                    >
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <Car className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800">Chưa có phương tiện đăng ký</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Bạn cần thêm ít nhất một phương tiện vào tài khoản trước khi thực hiện mua vé tháng VIP hoặc đăng ký gói dịch vụ.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewType('Ô tô gầm thấp 4-5 chỗ');
                            setAddVehicleModalOpen(true);
                          }}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
                        >
                          + Thêm xe mới ngay
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('vehicles')}
                          className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                        >
                          Quản lý xe của tôi
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>

                  {/* Progressive Horizontal steps */}
                  <div className="bg-white px-8 py-5 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-6 overflow-x-auto">
                    {[
                      { step: 1, label: 'Chọn xe', completed: regStep > 1, active: regStep === 1 },
                      { step: 2, label: 'Chọn gói', completed: regStep > 2, active: regStep === 2 },
                      { step: 3, label: 'Thanh toán', completed: regStep > 3, active: regStep === 3 }
                    ].map((step, idx, arr) => (
                      <React.Fragment key={step.step}>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            step.completed 
                              ? 'bg-blue-600 text-white font-extrabold' 
                              : step.active 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                                : 'bg-slate-200 text-slate-500'
                          }`}>
                            {step.completed ? '✓' : step.step}
                          </span>
                          <span className={`text-xs font-extrabold uppercase ${step.active ? 'text-blue-600' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        {idx !== arr.length - 1 && (
                          <div className="h-[2px] bg-slate-200 max-w-[200px] flex-1" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Side-by-Side checkout workspace modules */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT WORKSPACE: FORM INPUTS */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* Sub-section 1: Choose vehicle */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          🚙 Phương tiện áp dụng
                        </strong>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {vehicles.length === 0 ? (
                            <div className="col-span-full p-4 text-sm text-slate-500 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                              Chưa có phương tiện nào. Vui lòng quay lại tab "Xe của tôi" để thêm xe trước khi đăng ký dịch vụ!
                            </div>
                          ) : (
                            vehicles.map(v => {
                              const isChosen = selectedVehicleForVIP === v.plate;
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => setSelectedVehicleForVIP(v.plate)}
                                  className={`p-4 border rounded-2xl text-left flex items-center justify-between transition-all select-none cursor-pointer ${
                                    isChosen 
                                      ? 'border-blue-600 bg-blue-50/20 text-blue-800 font-extrabold ring-2 ring-blue-600/10' 
                                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                  }`}
                                >
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-semibold block">{v.type} - {v.name}</span>
                                    <strong className="text-sm font-black font-mono tracking-wider">{v.plate}</strong>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    isChosen ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {isChosen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>

                        <button 
                          onClick={() => {
                            setNewType('Ô tô gầm thấp 4-5 chỗ');
                            setAddVehicleModalOpen(true);
                          }}
                          className="pt-2 text-xs font-black text-blue-600 hover:underline inline-block cursor-pointer"
                        >
                          + Thêm xe mới
                        </button>
                      </div>

                      {/* Sub-section 2: Choose service package */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          ⭐ Gói dịch vụ
                        </strong>

                        <div className="space-y-3.5">
                          {(() => {
                            const selectedVehicleObj = vehicles.find(v => v.plate === selectedVehicleForVIP);
                            const selectedVehicleType = selectedVehicleObj ? selectedVehicleObj.type : 'Ô tô gầm thấp 4-5 chỗ';
                            const pricing = VEHICLE_PRICING[selectedVehicleType] || VEHICLE_PRICING['Ô tô gầm thấp 4-5 chỗ'];
                            return [
                              { 
                                id: 'pkg-1', 
                                label: 'Vé Ngày', 
                                price: pricing.day, 
                                desc: 'Giá trị trong 24 giờ kể từ thời điểm đăng ký.', 
                                badge: 'RA VÀO NHIỀU LẦN', 
                                features: [] 
                              },
                              { 
                                id: 'pkg-2', 
                                label: 'Thẻ Tháng VIP', 
                                price: pricing.month, 
                                desc: 'Giải pháp tối ưu cho cư dân và nhân viên văn phòng.', 
                                badge: 'PHỔ BIẾN', 
                                features: [
                                  'Chỗ đỗ xe cố định (Tầng B1)',
                                  'Rửa xe miễn phí 1 lần/tháng',
                                  'Hỗ trợ kỹ thuật 24/7 tức thì'
                                ] 
                              },
                              { 
                                id: 'pkg-3', 
                                label: 'Thẻ 3 Tháng VIP', 
                                price: pricing.month3, 
                                desc: 'Gói tiết kiệm 3 tháng cho hội viên thân thiết.', 
                                badge: 'TIẾT KIỆM', 
                                features: [
                                  'Chỗ đỗ xe cố định (Tầng B1)',
                                  'Rửa xe miễn phí 1 lần/tháng',
                                  'Hỗ trợ kỹ thuật 24/7 tức thì'
                                ] 
                              },
                              { 
                                id: 'pkg-4', 
                                label: 'Thẻ 6 Tháng VIP', 
                                price: pricing.month6, 
                                desc: 'Gói nửa năm với nhiều ưu đãi đặc quyền.', 
                                badge: 'ƯU ĐÃI LỚN', 
                                features: [
                                  'Chỗ đỗ xe cố định (Tầng B1)',
                                  'Rửa xe miễn phí 1 lần/tháng',
                                  'Hỗ trợ kỹ thuật 24/7 tức thì'
                                ] 
                              },
                              { 
                                id: 'pkg-5', 
                                label: 'Thẻ 1 Năm VIP', 
                                price: pricing.year, 
                                desc: 'Gói trọn gói 1 năm - giải pháp đỗ xe hoàn hảo.', 
                                badge: 'SIÊU TIẾT KIỆM', 
                                features: [
                                  'Chỗ đỗ xe cố định (Tầng B1)',
                                  'Rửa xe miễn phí 1 lần/tháng',
                                  'Hỗ trợ kỹ thuật 24/7 tức thì'
                                ] 
                              }
                            ];
                          })().map(pkg => {
                            const isSelected = selectedPackLabel === pkg.label;
                            return (
                              <div
                                key={pkg.id}
                                onClick={() => {
                                  setSelectedPackPrice(pkg.price);
                                  setSelectedPackLabel(pkg.label);
                                }}
                                className={`p-5 border rounded-2xl transition-all cursor-pointer relative overflow-hidden select-none ${
                                  isSelected 
                                    ? 'border-blue-600 bg-blue-50/10 ring-2 ring-blue-600/10' 
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {pkg.badge && (
                                  <span className={`absolute right-0 top-0 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {pkg.badge}
                                  </span>
                                )}

                                <div className="flex justify-between items-start">
                                  <div className="flex gap-3">
                                    <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${
                                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                    }`}>
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                      <strong className="text-sm font-black text-slate-900 block">{pkg.label}</strong>
                                      <p className="text-slate-400 text-xs mt-1 leading-normal max-w-md">{pkg.desc}</p>
                                    </div>
                                  </div>
                                  
                                  <span className="text-base font-black text-blue-600 font-mono">
                                    {pkg.price.toLocaleString('vi-VN')}đ
                                  </span>
                                </div>

                                {pkg.features.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-slate-100 text-slate-600 text-xs space-y-1.5 leading-none">
                                    {pkg.features.map(f => (
                                      <div key={f} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>{f}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT WORKSPACE: ORDER BILLING PANEL */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 space-y-6 text-left">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-widest block">
                          Tổng quan đơn hàng
                        </strong>

                        <div className="text-xs text-slate-500 space-y-3 leading-normal border-b border-slate-100 pb-5">
                          <div className="flex justify-between">
                            <span>Phương tiện:</span>
                            <strong className="text-slate-800 font-mono">{selectedVehicleForVIP}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Gói dịch vụ:</span>
                            <strong className="text-slate-800">{selectedPackLabel}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Thời hạn:</span>
                            <strong className="text-slate-800">01/11 - 30/11</strong>
                          </div>
                        </div>

                        <div className="flex justify-between items-center leading-none">
                          <span className="text-xs font-black text-slate-400">TỔNG THANH TOÁN:</span>
                          <strong className="text-2xl font-black text-blue-600 font-mono">
                            {selectedPackPrice.toLocaleString('vi-VN')}đ
                          </strong>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none mb-1.5">
                            Phương thức thanh toán
                          </label>
                          <select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as 'wallet' | 'vnpay')}
                            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-lg border border-slate-200 text-slate-850"
                          >
                            <option value="wallet">Ví UrbanPark (Số dư: {balance.toLocaleString('vi-VN')}₫)</option>
                            <option value="vnpay">Thẻ thanh toán nội địa VNPAY Sandbox</option>
                          </select>
                        </div>

                        <button 
                          onClick={handleStartVnpay}
                          className="w-full py-4 bg-slate-900 border border-slate-800 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4 text-white" />
                          <span>Xác nhận & Thanh toán</span>
                        </button>

                        <p className="text-[11px] text-slate-400 text-center leading-normal max-w-[200px] mx-auto pt-1">
                          Bằng việc xác nhận, bạn đồng ý với <strong className="text-blue-500 hover:underline cursor-pointer">Điều khoản dịch vụ</strong>.
                        </p>
                      </div>

                    </div>

                  </div>
                    </>
                  )}

                </motion.div>
              )}

              {/* TABS VIEW 4: BILLING HISTORY */}
              {activeTab === 'billing' && (
                <motion.div 
                  key="billing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">Lịch sử thanh toán</h2>
                    <p className="text-slate-400 text-xs font-semibold">
                      Xem lịch sử thanh toán và đăng ký gói tháng.
                    </p>
                  </div>

                  {/* Summary amount and Quick filter cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Amount card */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200/60 flex flex-col justify-between shadow-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block font-sans">
                          SỐ TIỀN THANH TOÁN THÁNG NÀY
                        </span>
                        <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                          {(() => {
                            const { sumThisMonth } = getBillingStats();
                            return sumThisMonth.toLocaleString('vi-VN') + '₫';
                          })()}
                        </div>
                      </div>
                      <div className="mt-3">
                        {(() => {
                          const { percentText, isDecrease, isIncrease } = getBillingStats();
                          let textColor = "text-slate-600 bg-slate-50 border border-slate-100";
                          let dotColor = "bg-slate-400";
                          if (isDecrease) {
                            textColor = "text-emerald-600 bg-emerald-50 border border-emerald-500/15";
                            dotColor = "bg-emerald-500";
                          } else if (isIncrease) {
                            textColor = "text-red-600 bg-red-50 border border-red-500/15";
                            dotColor = "bg-red-500";
                          }
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full ${textColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isDecrease || isIncrease ? 'animate-pulse' : ''}`} />
                              {percentText}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Filter controls cards (Span 2) */}
                    <div className="md:col-span-2 bg-white p-5 rounded-[24px] border border-slate-200/60 space-y-4">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-widest block font-sans">
                          Bộ Lọc Hoá Đơn
                        </strong>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">
                            Thời gian
                          </label>
                          <select 
                            value={billingTimeFilter}
                            onChange={(e) => setBillingTimeFilter(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 text-slate-850 outline-none transition-all cursor-pointer"
                          >
                            <option value="Tất cả">Tất cả thời gian</option>
                            <optgroup label="Gần đây">
                              <option value="Hôm nay">Hôm nay</option>
                              <option value="Hôm qua">Hôm qua</option>
                              <option value="7 ngày qua">7 ngày qua</option>
                            </optgroup>
                            <optgroup label="Theo tháng">
                              <option value="Tháng này">Tháng này</option>
                              <option value="Tháng trước">Tháng trước</option>
                              <option value="3 tháng trước">3 tháng trước</option>
                            </optgroup>
                            <optgroup label="Theo năm">
                              <option value="Năm nay">Năm nay</option>
                              <option value="Năm ngoái">Năm ngoái</option>
                              <option value="Các năm trước">Các năm trước</option>
                            </optgroup>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">
                            Loại giao dịch
                          </label>
                          <select 
                            value={billingTypeFilter}
                            onChange={(e) => setBillingTypeFilter(e.target.value as any)}
                            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 text-slate-800 outline-none transition-all"
                          >
                            <option value="Tất cả">Tất cả</option>
                            <option value="Vé ngày">Vé ngày</option>
                            <option value="Vé tháng">Vé tháng</option>
                            <option value="Nạp ví">Nạp ví</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* VIP Subscriptions status and expiry card */}
                  {(() => {
                    const savedSubsStr = localStorage.getItem('urbanpark_vip_subscriptions');
                    let mySubs: any[] = [];
                    if (savedSubsStr) {
                      try {
                        mySubs = JSON.parse(savedSubsStr);
                      } catch (e) {}
                    }
                    
                    const activeOrPendingSubs = mySubs.filter((s: any) => 
                      s.status === 'ACTIVE' || s.status === 'PENDING' || s.status === 'PENDING_APPROVAL'
                    );
                    
                    if (activeOrPendingSubs.length === 0) return null;
                    
                    return (
                      <div className="space-y-3">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-widest block font-sans">
                          Gói VIP đang sử dụng & Đang chờ duyệt
                        </strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeOrPendingSubs.map((sub: any) => {
                            const isPending = sub.status === 'PENDING' || sub.status === 'PENDING_APPROVAL';
                            const remainingDays = isPending ? 0 : getRemainingDays(sub.endDate);
                            
                            return (
                              <div 
                                onClick={() => setSelectedSubForDetail(sub)}
                                key={sub.id} 
                                className={`p-4 rounded-[22px] border transition-all cursor-pointer hover:shadow-md ${
                                  isPending 
                                    ? 'bg-amber-50/50 border-amber-200/60 hover:border-amber-300' 
                                    : 'bg-white border-slate-200/60 shadow-xs hover:border-slate-300'
                                } flex items-start gap-3.5`}
                              >
                                <div className={`p-2.5 rounded-xl shrink-0 ${
                                  isPending ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  <Award className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-1 font-sans">
                                  <div className="flex items-center justify-between gap-2">
                                    <strong className="text-xs font-black text-slate-800 uppercase">
                                      {sub.vehicle_plate}
                                    </strong>
                                    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${
                                      isPending 
                                        ? 'bg-amber-100/80 text-amber-700' 
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-500/10'
                                    }`}>
                                      {isPending ? 'Chờ duyệt' : 'Hoạt động'}
                                    </span>
                                  </div>
                                  
                                  <p className="text-[11px] text-slate-500 font-bold leading-normal">
                                    Gói đăng ký: <span className="text-slate-800">{sub.type}</span>
                                  </p>
                                  
                                  {isPending ? (
                                    <p className="text-[10px] text-amber-600 font-bold leading-normal animate-pulse">
                                      ⏱️ Hồ sơ đang được Manager xác thực...
                                    </p>
                                  ) : (
                                    <div className="space-y-1 pt-0.5">
                                      <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-400 font-bold">Hạn dùng: {sub.endDate}</span>
                                        <span className={`font-black uppercase ${
                                          remainingDays <= 5 ? 'text-rose-600 animate-pulse' : 'text-blue-600'
                                        }`}>
                                          Còn {remainingDays} ngày
                                        </span>
                                      </div>
                                      
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            remainingDays <= 5 ? 'bg-rose-500' : 'bg-blue-500'
                                          }`} 
                                          style={{ width: `${Math.min(100, (remainingDays / 30) * 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Main Grid Data Table */}
                  <div className="bg-white rounded-[24px] border border-slate-250/60 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/60">
                            <th className="py-4 px-5">Mã GD</th>
                            <th className="py-4 px-5">Ngày thực hiện</th>
                            <th className="py-4 px-5">Loại dịch vụ</th>
                            <th className="py-4 px-5">Biển số xe</th>
                            <th className="py-4 px-5">Số tiền</th>
                            <th className="py-4 px-5">Trạng thái</th>
                            <th className="py-4 px-5 text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/70 text-slate-700 font-sans">
                          {transactions
                            .filter(tx => {
                              // Filter by date range
                              if (!isTxDateInFilter(tx.date, billingTimeFilter)) return false;
                              
                              // Filter by type
                              if (billingTypeFilter === 'Tất cả') return true;
                              const typeLower = tx.type.toLowerCase();
                              if (billingTypeFilter === 'Vé ngày') {
                                return typeLower.includes('vé ngày') || typeLower.includes('ngày') || typeLower.includes('daily');
                              }
                              if (billingTypeFilter === 'Vé tháng') {
                                return typeLower.includes('vé tháng') || typeLower.includes('tháng') || typeLower.includes('vip') || typeLower.includes('monthly');
                              }
                              if (billingTypeFilter === 'Nạp tiền') {
                                return typeLower.includes('nạp') || typeLower.includes('topup') || typeLower.includes('top up');
                              }
                              return typeLower.includes(billingTypeFilter.toLowerCase().trim());
                            })
                            .map(tx => {
                              const statusStyle = 
                                tx.status === 'Thành công' 
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/10' 
                                  : tx.status === 'Đang xử lý' 
                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/10' 
                                    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/10';

                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 px-5 font-bold font-mono text-slate-900">{tx.id}</td>
                                  <td className="py-4 px-5 font-semibold text-slate-500">{tx.date}</td>
                                  <td className="py-4 px-5 font-bold">
                                    <span className="text-slate-800">{tx.type}</span>
                                  </td>
                                  <td className="py-4 px-5 font-mono font-bold text-slate-500">
                                    {tx.plate === '-' ? <span className="text-slate-350">—</span> : tx.plate}
                                  </td>
                                  <td className="py-4 px-5 font-bold font-mono text-slate-900">{tx.fee}</td>
                                  <td className="py-4 px-5">
                                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black rounded-full uppercase leading-none ${statusStyle}`}>
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-5 text-right font-bold">
                                    {tx.status === 'Thành công' ? (
                                      <button 
                                        onClick={() => triggerToast(`Đang chuẩn bị tải hoá đơn ${tx.id}...`, 'info')}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Tải HĐ</span>
                                      </button>
                                    ) : tx.status === 'Thất bại' ? (
                                      <button 
                                        onClick={() => triggerToast('Đang kết nối lại tới cổng thanh toán...', 'info')}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[11px] cursor-pointer"
                                      >
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        <span>Thử lại</span>
                                      </button>
                                    ) : (
                                      <span className="text-slate-450">Đang chờ</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination area */}
                    <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono">
                        Hiển thị 1-4 trong số 42 giao dịch
                      </span>
                      <div className="flex gap-2 font-black">
                        <button 
                          type="button"
                          onClick={() => triggerToast('Tính năng chuyển trang đang được xây dựng!', 'info')}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600 rounded-lg bg-white cursor-pointer"
                        >
                          Trang trước
                        </button>
                        <button 
                          type="button"
                          onClick={() => triggerToast('Tính năng chuyển trang đang được xây dựng!', 'info')}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600 rounded-lg bg-white cursor-pointer"
                        >
                          Trang sau
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TABS VIEW 5: SETTINGS */}
              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-950 tracking-tight">Cài đặt tài khoản</h2>
                      <p className="text-slate-400 text-xs font-semibold">
                        Quản lý thông tin cá nhân, bảo mật và tùy chọn thanh toán.
                      </p>
                    </div>                    <button 
                      onClick={() => {
                        localStorage.setItem(`urbanpark_user_name_${user?.phone || 'default'}`, profileName);
                        localStorage.setItem(`urbanpark_user_phone_${user?.phone || 'default'}`, profilePhone);
                        localStorage.setItem(`urbanpark_user_email_${user?.phone || 'default'}`, profileEmail);
                        localStorage.setItem(`urbanpark_user_address_${user?.phone || 'default'}`, profileAddress);
                        
                        const savedUserStr = localStorage.getItem('user');
                        if (savedUserStr) {
                          try {
                            const parsed = JSON.parse(savedUserStr);
                            parsed.fullName = profileName;
                            parsed.phone = profilePhone;
                            parsed.email = profileEmail;
                            localStorage.setItem('user', JSON.stringify(parsed));
                          } catch (e) {
                            console.error(e);
                          }
                        }
                        
                        triggerToast('Đã lưu mọi thay đổi thiết lập tài khoản thành công!', 'success');
                      }}
                      className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer self-stretch sm:self-auto"
                    >
                      Lưu thay đổi
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* LEFT / CENTER: ACCOUNT PROFILE & PREFERENCES */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Personal Info Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-5">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                          <div className="w-14 h-14 rounded-full bg-blue-600/10 text-blue-600 border border-blue-200 text-xl flex items-center justify-center font-black">
                            {profileName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-sm font-black text-slate-900 block">{profileName}</strong>
                            <span className="text-xs text-slate-400 font-semibold uppercase font-mono tracking-wider">Tài xế UrbanPark VIP</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Họ và tên</label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={e => setProfileName(e.target.value)}
                              className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Số điện thoại</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={profilePhone}
                                onChange={e => {
                                  setProfilePhone(e.target.value);
                                  setIsPhoneVerified(false);
                                  localStorage.setItem('urbanpark_phone_verified', 'false');
                                }}
                                className="w-full p-3 pr-24 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                              />
                              {isPhoneVerified ? (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/15">
                                  ✓ Đã xác thực
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsPhoneVerified(true);
                                    localStorage.setItem('urbanpark_phone_verified', 'true');
                                    triggerToast('Xác thực số điện thoại thành công!', 'success');
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-500/15 transition-colors cursor-pointer"
                                >
                                  ⚠ Chưa xác thực
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Địa chỉ Email</label>
                            <input
                              type="email"
                              value={profileEmail}
                              onChange={e => setProfileEmail(e.target.value)}
                              className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Địa chỉ thường trú</label>
                            <input
                              type="text"
                              value={profileAddress}
                              onChange={e => setProfileAddress(e.target.value)}
                              className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notifications settings */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          Tùy chọn thông báo
                        </strong>

                        <div className="divide-y divide-slate-100 font-sans text-xs">
                          {/* Row 1 */}
                          <div className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="space-y-0.5">
                              <strong className="text-slate-800 font-extrabold">Sự kiện vào/ra bãi xe</strong>
                              <p className="text-slate-400 text-[11px] font-semibold leading-normal">
                                Nhận thông báo thời gian thực khi xe đi qua trạm kiểm soát rào chắn.
                              </p>
                            </div>
                            <div className="flex gap-4 font-black text-[11px]">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={emailNotifyGate} 
                                  onChange={(e) => setEmailNotifyGate(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>Email</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={smsNotifyGate} 
                                  onChange={(e) => setSmsNotifyGate(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>SMS</span>
                              </label>
                            </div>
                          </div>

                          {/* Row 2 */}
                          <div className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="space-y-0.5">
                              <strong className="text-slate-800 font-extrabold">Biên lai thanh toán</strong>
                              <p className="text-slate-400 text-[11px] font-semibold leading-normal">
                                Tự động gửi biên lai hóa đơn thuế điện tử về tài khoản sau hành trình.
                              </p>
                            </div>
                            <div className="flex gap-4 font-black text-[11px]">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={emailNotifyReceipt} 
                                  onChange={(e) => setEmailNotifyReceipt(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>Email</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                                <input 
                                  type="checkbox" 
                                  checked={smsNotifyReceipt} 
                                  onChange={(e) => setSmsNotifyReceipt(e.target.checked)}
                                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                />
                                <span>SMS</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: WALLET CARD AND SECURITY */}
                    <div className="space-y-6">
                      
                      {/* UrbanPark Wallet Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-5 text-left">
                        <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans leading-none">
                          Ví UrbanPark
                        </strong>

                        {/* Glossy Balance Visual Card */}
                        <div className="bg-slate-900 bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl relative overflow-hidden text-white shadow-lg shadow-slate-900/10">
                          <div className="absolute right-[-15px] bottom-[-15px] opacity-10">
                            <QrCode className="w-28 h-28" />
                          </div>
                          
                          <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
                            Số dư khả dụng
                          </span>
                          <strong className="text-3xl font-black font-mono tracking-tight block mt-1">
                            {balance.toLocaleString('vi-VN')}₫
                          </strong>
                        </div>

                        {/* Topup Amount Interactive Controls */}
                        <div className="space-y-3 pt-1">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                            MỨC TIỀN MUỐN NẠP VÍ
                          </span>
                          <div className="space-y-2">
                            <div className="relative">
                              <input 
                                type="number"
                                value={topupAmount}
                                onChange={(e) => setTopupAmount(Math.max(10000, parseInt(e.target.value) || 0))}
                                className="w-full p-3 pr-10 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-black font-mono text-slate-800 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all"
                                placeholder="Nhập số tiền..."
                                min="10000"
                                step="10000"
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₫</span>
                            </div>

                            {/* Quick choices */}
                            <div className="grid grid-cols-4 gap-2">
                              {[100000, 200000, 500000, 1000000].map(amt => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setTopupAmount(amt)}
                                  className={`py-2 px-1 border rounded-lg font-mono font-black text-[11px] text-center cursor-pointer transition-all ${
                                    topupAmount === amt 
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {(amt / 1000) === 1000 ? '1M' : `${amt / 1000}K`}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                              if (isOffline) {
                                triggerToast('Lỗi: Không thể nạp tiền vào ví ở chế độ Ngoại tuyến!', 'error');
                                return;
                              }
                              setSelectedPackPrice(topupAmount);
                              setSelectedPackLabel('Nạp tiền vào ví điện tử UrbanPark');
                              setVnpayStep('info');
                              setVnpayModalOpen(true);
                            }}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Nạp tiền ngay</span>
                          </button>
                        </div>

                        {/* Linked bank status */}
                        <div className="space-y-3 pt-1">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                            LIÊN KẾT NGÂN HÀNG
                          </span>

                          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black flex items-center justify-center font-mono">
                                VCB
                              </div>
                              <div>
                                <strong className="text-[11.5px] font-black text-slate-800 block">Vietcombank **** 1234</strong>
                                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                  Mặc định thanh toán
                                </span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => triggerToast('Đã huỷ liên kết tài khoản Vietcombank thành công.', 'info')}
                              className="text-[11px] font-black text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              Gỡ
                            </button>
                          </div>

                          <button 
                            type="button"
                            onClick={() => triggerToast('Chức năng liên kết ngân hàng mở rộng đang chuẩn bị ra mắt!', 'info')}
                            className="w-full py-2.5 border border-dashed border-slate-350 hover:border-blue-400 text-slate-500 hover:text-blue-600 font-bold text-xs rounded-xl cursor-pointer text-center select-none"
                          >
                            + Thêm phương thức mới
                          </button>
                        </div>
                      </div>

                      {/* Security Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-4">
                        <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                          Bảo mật
                        </strong>

                        <div className="space-y-3.5 text-xs font-sans">
                          {/* 2FA switcher */}
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <strong className="text-slate-800 font-extrabold block">Xác thực 2 lớp (2FA)</strong>
                              <span className="text-slate-450 text-[10px] leading-normal block max-w-[180px]">
                                Xác minh mã OTP thứ cấp bảo vệ truy cập từ thiết bị mới.
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setIs2faEnabled(!is2faEnabled);
                                triggerToast(is2faEnabled ? 'Đã tắt bảo vệ 2FA.' : 'Xác thực hai lớp (2FA) hỗ trợ thành công!', 'info');
                              }}
                              className={`w-10 h-6 shrink-0 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                                is2faEnabled ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                                is2faEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>

                          {/* Quick Password inputs */}
                          <div className="space-y-2">
                            <strong className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đổi mật khẩu tài khoản</strong>
                            
                            <div className="space-y-1.5">
                              <input 
                                type="password" 
                                placeholder="Mật khẩu hiện tại..."
                                className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-200 focus:bg-white text-xs outline-none"
                              />
                              <input 
                                type="password" 
                                placeholder="Mật khẩu mới..."
                                className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-200 focus:bg-white text-xs outline-none"
                              />
                            </div>
                            
                            <button 
                              type="button"
                              onClick={() => triggerToast('Mật khẩu tài khoản đã được thay đổi an toàn!', 'success')}
                              className="pt-1.5 text-[10.5px] font-black text-blue-600 hover:underline cursor-pointer inline-block"
                            >
                              Cập nhật mật khẩu ngay →
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>
              )}

              {/* TABS VIEW 6: SUPPORT CENTER */}
              {activeTab === 'support' && (
                <motion.div 
                  key="support"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  {/* Header */}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">Trung tâm Hỗ trợ</h2>
                    <p className="text-slate-400 text-xs font-semibold">
                      Tìm kiếm câu trả lời nhanh chóng hoặc liên hệ trực tiếp với đội ngũ quản lý hệ thống bãi đỗ xe thông minh của chúng tôi.
                    </p>
                  </div>

                  {/* High Search Bar block */}
                  <div className="bg-white p-5 rounded-[24px] border border-slate-200/60 shadow-xs">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchSupportQuery}
                        onChange={(e) => setSearchSupportQuery(e.target.value)}
                        placeholder="Bạn cần giúp đỡ điều gì? (Ví dụ: nạp tiền vào ví, đổi vé tháng...)"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-xl font-bold transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Grid of categories cards */}
                  <div className="space-y-3">
                    <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      Chủ đề Hỗ trợ phổ biến
                    </strong>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: <KeyRound className="w-5 h-5 text-indigo-600" />, title: 'Tài khoản & Bảo mật', bColor: 'bg-indigo-50 border-indigo-100', desc: 'Quản lý thông tin cá nhân, mật khẩu, và bảo mật hai lớp.' },
                        { icon: <Coins className="w-5 h-5 text-emerald-600" />, title: 'Thanh toán & Ví', bColor: 'bg-emerald-50 border-emerald-100', desc: 'Nạp tiền, lịch sử giao dịch, và hóa đơn điện tử.' },
                        { icon: <Calendar className="w-5 h-5 text-blue-600" />, title: 'Đăng ký vé tháng', bColor: 'bg-blue-50 border-blue-105', desc: 'Thủ tục đăng ký, gia hạn, và thay đổi thông tin biển số xe.' },
                        { icon: <MapPin className="w-5 h-5 text-amber-600" />, title: 'Hướng dẫn vào/ra bãi xe', bColor: 'bg-amber-50 border-amber-100', desc: 'Quy trình sử dụng thẻ, nhận diện biển số (LPR), và barrier.' },
                        { icon: <Wrench className="w-5 h-5 text-rose-600" />, title: 'Sự cố kỹ thuật', bColor: 'bg-rose-50 border-rose-100', desc: 'Báo cáo lỗi hệ thống, mất kết nối, hoặc barrier không mở.' },
                      ].map((cat, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            setSearchSupportQuery(cat.title);
                            triggerToast(`Đã lọc câu hỏi theo chủ đề "${cat.title}"`, 'info');
                          }}
                          className="bg-white p-5 rounded-[20px] border border-slate-200/60 hover:border-blue-400 cursor-pointer hover:shadow-xs transition-colors group flex gap-3 text-left items-start"
                        >
                          <div className={`p-2.5 rounded-xl ${cat.bColor} border group-hover:scale-105 transition-transform`}>
                            {cat.icon}
                          </div>
                          <div className="space-y-1">
                            <strong className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors block leading-none">{cat.title}</strong>
                            <p className="text-[11px] text-slate-450 font-semibold leading-normal">{cat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Accordion Section */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-250/60 space-y-4">
                    <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                      Câu hỏi thường gặp (FAQs)
                    </strong>

                    <div className="font-sans divide-y divide-slate-100 text-xs">
                      {[
                        { q: 'Làm thế nào để nạp tiền vào ví điện tử UrbanPark?', a: 'Quý khách vào mục "Cài đặt tài khoản", tìm ô "Ví UrbanPark" và nhấn nút "Nạp tiền ngay". Hệ thống sẽ kết nối với Cổng VNPAY Sandbox để quý khách thực hiện thanh toán giả lập nhanh chóng.' },
                        { q: 'Cách thay đổi biển số xe đăng ký vé tháng đang sử dụng?', a: 'Để thay đổi biển số xe hưởng đặc quyền vé tháng cố định, quý khách gửi một phiếu yêu cầu hỗ trợ (Support Ticket) bên dưới kèm theo ảnh đăng ký xe (và đăng kiểm) để đội ngũ hỗ trợ cập nhật trên hệ thống trong vòng 10 phút.' },
                        { q: 'Tôi cần làm gì khi bị mất thẻ từ vật lý gửi xe gửi ngoài bãi?', a: 'Xin vui lòng báo ngay cho ban quản lý qua Hotline 1900 6868 hoặc trực tiếp tại bốt gác bảo vệ. Chúng tôi sẽ khoá từ thẻ cũ lập tức để phòng gian và cấp mới thẻ nhựa dự phòng cho tài xế.' },
                        { q: 'Hệ thống LPR không nhận diện được biển số, tôi phải làm sao?', a: 'Trường hợp biển số bị bụi mờ ngăn camera OCR nhận dạng tự động, rào chắn tạm thời chưa mở. Quý khách vui lòng dừng xe trước vạch sơn kẻ và giơ QR Code bốt gác trực thuộc trên màn hình trang chủ tài xế để máy quét tầm gần mở cưỡng bức barrier.' },
                        { q: 'Làm sao để xuất hóa đơn điện tử VAT cho danh bạ doanh nghiệp?', a: 'At tab "Lịch sử thanh toán", đối với mọi hóa đơn trạng thái "Thành công", quý khách nhấn nút "Tải HĐ". Biểu mẫu xuất hóa đơn PDF tiêu chuẩn Tổng cục Thuế sẽ tải xuống thiết bị chứa đầy đủ thông số thanh thu.' }
                      ]
                      .filter(item => {
                        if (!searchSupportQuery) return true;
                        return item.q.toLowerCase().includes(searchSupportQuery.toLowerCase()) || 
                               item.a.toLowerCase().includes(searchSupportQuery.toLowerCase());
                      })
                      .map((faq, index) => {
                        const isOpen = expandedFaq === index;
                        return (
                          <div key={index} className="py-3">
                            <button 
                              type="button"
                              onClick={() => setExpandedFaq(isOpen ? null : index)}
                              className="w-full flex items-center justify-between gap-3 text-left font-extrabold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer select-none"
                            >
                              <span>{faq.q}</span>
                              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-[11.5px] leading-relaxed text-slate-500 font-medium pl-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                                    {faq.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ticket creation and telephone sidebar widgets */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Support Form */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-4">
                      <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                        Gửi yêu cầu hỗ trợ (Support Ticket)
                      </strong>

                      <form 
                        onSubmit={e => {
                          e.preventDefault();
                          if (isOffline) {
                            triggerToast('Lỗi: Không thể gửi yêu cầu hỗ trợ khi Ngoại tuyến!', 'error');
                            return;
                          }
                          if (!ticketTopic || !ticketMessage) {
                            triggerToast('Vui lòng điền đầy đủ chủ đề và nội dung!', 'error');
                            return;
                          }
                          triggerToast('Mã số hỗ trợ Ticket #UP-4491 đã được gửi đi thành công!', 'success');
                          setTicketTopic('');
                          setTicketMessage('');
                          setTicketAttachedFiles([]);
                        }}
                        className="space-y-4 font-sans text-xs text-left"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Chủ đề hỗ trợ</label>
                          <select 
                            value={ticketTopic}
                            onChange={(e) => setTicketTopic(e.target.value)}
                            className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-850 outline-none transition-colors"
                          >
                            <option value="">-- Chọn chủ đề hỗ trợ --</option>
                            <option value="Sự cố ứng dụng">Sự cố ứng dụng di động</option>
                            <option value="Lỗi thanh toán">Lỗi giao dịch trừ tiền sai / Nạp ví</option>
                            <option value="Biển số xe">Hỗ trợ cập nhật biển số xe / Lịch gia hạn</option>
                            <option value="Barrier không mở">Barrier bốt bảo vệ không tự mở rào</option>
                            <option value="Khác">Phản ánh dịch vụ khác</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nội dung chi tiết</label>
                          <textarea 
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                            rows={4}
                            placeholder="Mô tả cụ thể sự cố hoặc câu hỏi dành cho chúng tôi..."
                            className="w-full p-3 border rounded-xl font-medium bg-slate-50 border-slate-200 focus:bg-white text-slate-850 outline-none transition-colors resize-none"
                          />
                        </div>

                        {/* File upload drag area */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đính kèm ảnh hiện trường (Tùy chọn)</label>
                          
                          <div 
                            onClick={() => {
                              // Simulate selecting a file
                              const simulatedFiles = [
                                { name: 'bill_screenshot.png', size: '242 KB' },
                                { name: 'car_plate_blurry.png', size: '1.2 MB' }
                              ];
                              setTicketAttachedFiles(prev => [...prev, simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)]]);
                              triggerToast('Đính kèm file minh chứng thành công.', 'info');
                            }}
                            className="p-5 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors text-center font-sans space-y-1"
                          >
                            <div className="flex justify-center"><Paperclip className="w-5 h-5 text-slate-400" /></div>
                            <span className="text-slate-500 font-extrabold text-[11px] block text-center">Kéo thả hình chụp hoặc nhấn vào đây để đính kèm</span>
                            <span className="text-slate-400 text-[10px] block text-center">Hỗ trợ JPG, PNG tải lên kích thước tối đa 5MB</span>
                          </div>

                          {/* List of uploaded files */}
                          {ticketAttachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {ticketAttachedFiles.map((file, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 text-blue-700 text-[10.5px] font-extrabold rounded-lg border border-blue-100 uppercase">
                                  <span>{file.name}</span>
                                  <span className="text-[9px] text-blue-400 font-semibold">({file.size})</span>
                                  <button 
                                    type="button" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTicketAttachedFiles(prev => prev.filter((_, idx) => idx !== i));
                                    }}
                                    className="text-blue-400 hover:text-red-500 font-bold ml-1"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                        >
                          Gửi yêu cầu hỗ trợ ngay
                        </button>
                      </form>
                    </div>

                    {/* Right contacts details */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-5 text-left font-sans text-xs">
                      <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans leading-none">
                        Thông tin liên hệ
                      </strong>

                      <div className="space-y-4">
                        {/* Hotline panel */}
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                            <PhoneCall className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <strong className="text-slate-400 font-extrabold text-[10.5px] uppercase block tracking-wider leading-none">Hotline Tổng Đài 24/7</strong>
                            <strong className="text-sm font-black text-slate-950 block font-mono">1900 6868</strong>
                            <span className="text-[10px] text-slate-400 font-semibold block">Hỗ trợ khẩn cấp tại trạm barrier bốt gác</span>
                          </div>
                        </div>

                        {/* Email panel */}
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-105 text-blue-600">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <strong className="text-slate-400 font-extrabold text-[10.5px] uppercase block tracking-wider leading-none">Phòng ban Khách Hàng</strong>
                            <strong className="text-emerald-700 font-extrabold block">support@urbanpark.vn</strong>
                            <span className="text-[10px] text-slate-400 font-semibold block font-sans">Giải đáp trong vòng tối đa 2 giờ làm việc</span>
                          </div>
                        </div>

                        {/* Live chat */}
                        <div className="pt-2 border-t border-slate-100 space-y-3.5">
                          <button 
                            type="button"
                            onClick={() => triggerToast('Trò chuyện trực tuyến đang kết nối tư vấn viên...', 'success')}
                            className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Trò chuyện trực tuyến</span>
                          </button>

                          {/* Operating system status indicator */}
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-2.5 text-[11px] text-emerald-800 font-extrabold select-none">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>UrbanPark System Status: OK</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* FOOTER BLOCK SPEC IN THE GRAPHIC DESIGNS */}
          <footer className="px-8 py-5 border-t border-slate-200/60 bg-white font-sans text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 uppercase tracking-wider font-semibold">
            <span className="font-extrabold text-slate-850">UrbanPark Driver Portal</span>
            <div className="flex gap-4">
              <span className="hover:text-slate-600 cursor-pointer">Chính sách bảo mật</span>
              <span>•</span>
              <span className="hover:text-slate-600 cursor-pointer">Điều khoản dịch vụ</span>
              <span>•</span>
              <span className="hover:text-slate-600 cursor-pointer">Liên hệ hỗ trợ</span>
            </div>
            <span>© 2026 UrbanPark Infrastructure</span>
          </footer>

        </main>

      </div>

      {/* ==================================================== */}
      {/* 4. MODAL ELEMENT: ADD NEW VEHICLE */}
      {/* ==================================================== */}
      <AnimatePresence>
        {addVehicleModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md border border-slate-200/80 shadow-2xl p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setAddVehicleModalOpen(false)}
                className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-650 bg-slate-50 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4 text-left">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Thêm phương tiện mới</h3>
                  <p className="text-slate-400 text-xs mt-1">Đăng ký thêm xe ô tô mới vào hệ thống của bạn.</p>
                </div>

                <form onSubmit={handleAddVehicle} className="space-y-4 text-xs font-sans">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Biển số xe (Ví dụ: 30G-123.45)</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập biển số..."
                      value={newPlate}
                      onChange={e => setNewPlate(e.target.value)}
                      className="w-full p-2.5 border rounded-lg font-mono font-bold bg-slate-50 border-slate-200 text-slate-850 focus:bg-white focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Tên xe / Model (Ví dụ: Toyota Camry)</label>
                    <input
                      type="text"
                      placeholder="Nhập tên hãng xe..."
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full p-2.5 border rounded-lg font-bold bg-slate-50 border-slate-200 text-slate-850 focus:bg-white focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Loại phương tiện</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-bold border-slate-200 text-slate-850 outline-hidden"
                    >
                      <option value="Ô tô gầm thấp 4-5 chỗ">🚗 Ô tô gầm thấp 4-5 chỗ</option>
                      <option value="Xe 7 chỗ">🚙 Xe 7 chỗ</option>
                      <option value="Xe 9 chỗ">🚐 Xe 9 chỗ</option>
                      <option value="Xe 16 chỗ">🚌 Xe 16 chỗ</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Cà vẹt xe */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Ảnh Cà vẹt xe</label>
                      {newRegDoc ? (
                        <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={newRegDoc} alt="Cà vẹt" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setNewRegDoc(null)}
                            className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setNewRegDoc('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80')}
                          className="w-full h-20 border border-dashed border-slate-200 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer transition-colors"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider text-center block px-1">+ Tải ảnh Cà vẹt</span>
                        </button>
                      )}
                    </div>

                    {/* Ảnh CCCD */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Ảnh CMND/CCCD</label>
                      {newRegPhoto ? (
                        <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={newRegPhoto} alt="CCCD" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setNewRegPhoto(null)}
                            className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setNewRegPhoto('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80')}
                          className="w-full h-20 border border-dashed border-slate-200 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer transition-colors"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider text-center block px-1">+ Tải ảnh CCCD</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddVehicleModalOpen(false)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Huỷ bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Thêm xe mới
                    </button>
                  </div>

                </form>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* 5. MODAL ELEMENT: EDIT VEHICLE */}
      {/* ==================================================== */}
      <AnimatePresence>
        {editVehicleModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md border border-slate-200/80 shadow-2xl p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setEditVehicleModalOpen(false)}
                className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-650 bg-slate-50 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4 text-left">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Chỉnh sửa phương tiện</h3>
                  <p className="text-slate-400 text-xs mt-1">Cập nhật thông tin chi tiết xe ô tô của bạn.</p>
                </div>

                <form onSubmit={handleEditVehicle} className="space-y-4 text-xs font-sans">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Biển số xe (Ví dụ: 30G-123.45)</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập biển số..."
                      value={editPlate}
                      onChange={e => setEditPlate(e.target.value)}
                      className="w-full p-2.5 border rounded-lg font-mono font-bold bg-slate-50 border-slate-200 text-slate-850 focus:bg-white focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Tên xe / Model (Ví dụ: Toyota Camry)</label>
                    <input
                      type="text"
                      placeholder="Nhập tên hãng xe..."
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full p-2.5 border rounded-lg font-bold bg-slate-50 border-slate-200 text-slate-850 focus:bg-white focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Loại phương tiện</label>
                    <select
                      value={editType}
                      onChange={e => setEditType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-bold border-slate-200 text-slate-850 outline-hidden"
                    >
                      <option value="Ô tô gầm thấp 4-5 chỗ">🚗 Ô tô gầm thấp 4-5 chỗ</option>
                      <option value="Xe 7 chỗ">🚙 Xe 7 chỗ</option>
                      <option value="Xe 9 chỗ">🚐 Xe 9 chỗ</option>
                      <option value="Xe 16 chỗ">🚌 Xe 16 chỗ</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Cà vẹt xe */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Ảnh Cà vẹt xe</label>
                      {editRegDoc ? (
                        <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={editRegDoc} alt="Cà vẹt" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setEditRegDoc(null)}
                            className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditRegDoc('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80')}
                          className="w-full h-20 border border-dashed border-slate-200 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer transition-colors"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider text-center block px-1">+ Tải ảnh Cà vẹt</span>
                        </button>
                      )}
                    </div>

                    {/* Ảnh CCCD */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Ảnh CMND/CCCD</label>
                      {editRegPhoto ? (
                        <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={editRegPhoto} alt="CCCD" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setEditRegPhoto(null)}
                            className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditRegPhoto('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80')}
                          className="w-full h-20 border border-dashed border-slate-200 hover:border-blue-400 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer transition-colors"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider text-center block px-1">+ Tải ảnh CCCD</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditVehicleModalOpen(false)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Huỷ bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Cập nhật xe
                    </button>
                  </div>

                </form>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* 5. MODAL ELEMENT: INTERACTIVE SANDBOX VNPAY PAYOUT */}
      {/* ==================================================== */}
      <AnimatePresence>
        {vnpayModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-slate-100"
            >
              
              {/* Branding banner background color */}
              <div className="bg-[#e02020] px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=100&auto=format&fit=crop&q=80" 
                      alt="vnpay logo" 
                      className="w-7 h-7 object-contain opacity-0" // layout space
                    />
                    <span className="text-[#e12020] font-black text-xs font-mono tracking-tight">VNPay</span>
                  </div>
                  <div className="text-left font-sans">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-100 leading-none block">CỔNG THANH TOÁN QUỐC GIA</span>
                    <strong className="text-sm font-black leading-none block mt-0.5">VNPAY SANDBOX KERNEL</strong>
                  </div>
                </div>
                
                <button 
                  onClick={handleCloseVnpay}
                  className="p-1 text-red-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {vnpayStep === 'info' && (
                <div className="p-6 space-y-5 text-xs text-left font-sans">
                  
                  {/* Summary card details */}
                  <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Tài khoản thụ hưởng:</span>
                      <strong className="text-slate-800 font-extrabold uppercase">CÔNG TY CPDV CÔNG NGHỆ URBANPARK</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Mục đích cước phí:</span>
                      <strong className="text-slate-800 font-extrabold">{selectedPackLabel}</strong>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-200 mt-2 pt-2">
                      <span className="text-slate-600 font-black text-xs">SỐ TIỀN CẦN THANH TOÁN VNPAY:</span>
                      <strong className="text-red-600 font-black text-base font-mono">
                        {selectedPackPrice.toLocaleString('vi-VN')} ₫
                      </strong>
                    </div>
                  </div>

                  {/* Domestic Bank options */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Chọn Ngân Hàng Nội Địa Sandbox</span>
                    <div className="grid grid-cols-4 gap-2">
                      {['Vietcombank', 'Agribank', 'Techcombank', 'BIDV', 'Vietinbank', 'VPBank', 'MBBank', 'Sacombank'].map(bank => (
                        <button
                          key={bank}
                          onClick={() => setVnpayBank(bank)}
                          className={`p-2 border rounded-xl font-bold text-[10.5px] cursor-pointer text-center transition-all ${
                            vnpayBank === bank 
                              ? 'border-red-500 bg-red-50 text-red-600 font-black' 
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Domestic inputs fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase font-mono block">Số Thẻ Giả Lập</label>
                      <input
                        type="text"
                        value={vnpayCardNo}
                        onChange={e => setVnpayCardNo(e.target.value)}
                        className="w-full p-2.5 border rounded-lg font-mono font-bold bg-slate-50 border-slate-200 text-slate-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase font-mono block">Chủ Thẻ (In Hoa)</label>
                      <input
                        type="text"
                        value={vnpayCardHolder}
                        onChange={e => setVnpayCardHolder(e.target.value.toUpperCase())}
                        className="w-full p-2.5 border rounded-lg font-sans font-bold bg-slate-50 border-slate-200 text-slate-850"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendVnpayDomesticCard}
                    className="w-full py-4 bg-[#e02020] hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                    <span>XÁC THỰC THẺ VÀ LẤY OTP SANDBOX</span>
                  </button>
                </div>
              )}

              {vnpayStep === 'otp' && (
                <div className="p-6 space-y-5 text-center text-xs">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-100">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-slate-800">Xác thực giao dịch VNPAY OTP</h3>
                    <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">
                      Một mã OTP gián dụng đã được gửi đến số điện thoại tài xế. Mức phí thanh toán <strong className="text-red-500 font-bold font-mono">{selectedPackPrice.toLocaleString('vi-VN')}đ</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-[11px] text-red-700 font-mono font-bold leading-relaxed">
                    Mã OTP Sandbox gợi ý: <strong className="text-lg text-red-600 block my-1 font-black underline select-all">OTP-2026</strong>
                    (Hoặc quý khách gõ tắt <strong className="text-red-600 font-extrabold font-mono text-sm">2026</strong> để vượt tiến trình nhanh).
                  </div>

                  <div className="max-w-[180px] mx-auto">
                    <input
                      type="text"
                      className="w-full py-3 px-4 border rounded-2xl text-center font-bold tracking-widest text-[#e02020] font-mono outline-hidden focus:border-red-500 input-placeholder-center"
                      value={vnpayOtp}
                      onChange={e => setVnpayOtp(e.target.value)}
                      placeholder="Mã OTP..."
                    />
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <button
                      onClick={() => setVnpayStep('info')}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Quay Lại Nhập Thẻ
                    </button>
                    <button
                      onClick={handleConfirmVnpayPayment}
                      className="flex-1 py-3 bg-[#e02020] hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Xác nhận thanh toán
                    </button>
                  </div>
                </div>
              )}

              {vnpayStep === 'success' && (
                <div className="p-8 space-y-6 text-center text-xs">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                    <CheckCircle className="w-8 h-8 stroke-[3]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-lg text-emerald-600">Thanh toán VNPAY thành công!</h3>
                    <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
                      Đã ghi nhận cước phí thanh toán <strong className="text-slate-800">{selectedPackPrice.toLocaleString('vi-VN')} ₫</strong>. Giao dịch hợp lệ và kích hoạt gói cước ngay tức thì.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 text-left font-mono text-[10.5px] text-slate-500 leading-relaxed uppercase">
                    <div className="flex justify-between"><span className="font-sans">Mã giao dịch:</span><strong className="text-slate-800">VNP_REF_28812</strong></div>
                    <div className="flex justify-between"><span className="font-sans">Cổng ngân hàng:</span><strong className="text-slate-800">{vnpayBank}</strong></div>
                    <div className="flex justify-between"><span className="font-sans">Nội dung:</span><strong className="text-slate-800">VIP MONTHLY TICKET</strong></div>
                    <div className="flex justify-between"><span className="font-sans">STATUS:</span><strong className="text-emerald-600 font-black">AUTHORIZED SUCCESS</strong></div>
                  </div>

                  <button
                    onClick={handleCloseVnpay}
                    className="w-full py-3.5 bg-[#e02020] hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                  >
                    Hoàn tất và quay lại portal
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
