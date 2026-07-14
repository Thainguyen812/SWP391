import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Sliders
} from 'lucide-react';

interface DriverPwaProps {
  user: {
    name: string;
    phone: string;
    role: string;
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
  fuelType?: string;
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
    const parts = txDateStr.split('/');
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

export function DriverLayout({ user, accessToken, onLogout, isDarkMode = false }: DriverPwaProps) {
  const handleLogout = onLogout;
  // ----------------------------------------------------
  // --- CORE SYSTEM STATES & SEEDS ---
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState<'home' | 'driver_pnl' | 'vehicles' | 'vip_reg' | 'billing' | 'settings' | 'support'>('driver_pnl');
  const [isOffline, setIsOffline] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'vnpay'>('wallet');
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(`urbanpark_user_balance_${user?.username || 'default'}`);
    return saved ? parseFloat(saved) : 0; // Default to 0 for new users
  });

  const [selectedVehId, setSelectedVehId] = useState<string>('veh-1');
  const [qrDirection, setQrDirection] = useState<'VÀO' | 'RA'>('VÀO');
  const [isTogglingLock, setIsTogglingLock] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<UserVehicle[]>(() => {
    const saved = localStorage.getItem(`urbanpark_user_vehicles_${user?.username || 'default'}`);
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
          'Authorization': `Bearer ${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}`
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
        headers: { 'Authorization': `Bearer ${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}` }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setVehicles(prevVehicles => {
          const mapped = data.data.map((v: any, index: number) => {
            const sizeType = v.type || 'SEDAN_HATCHBACK';
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

            const existingLocal = prevVehicles.find(lv => lv.plate === v.plate);

            // Lookup latest subscription status from localStorage
            const savedSubs = localStorage.getItem('urbanpark_vip_subscriptions');
            let activeSub = undefined;
            let expiry = undefined;
            let subStatus = undefined;

            if (v.subscriptionStatus) {
              subStatus = v.subscriptionStatus === 'PENDING_APPROVAL' ? 'PENDING' : v.subscriptionStatus;
              if (v.subscriptionStatus === 'ACTIVE') {
                activeSub = translateSubscriptionType(v.subscriptionType);
                expiry = v.subscriptionExpiry ? new Date(v.subscriptionExpiry).toLocaleDateString('vi-VN') : undefined;
              }

              // Sync back to localStorage to keep other components in sync
              try {
                const subs = savedSubs ? JSON.parse(savedSubs) : [];
                let changed = false;
                let found = false;
                const updatedSubs = subs.map((s: any) => {
                  if (s.vehicle_plate === v.plate) {
                    found = true;
                    const newStatus = v.subscriptionStatus === 'PENDING_APPROVAL' ? 'PENDING' : v.subscriptionStatus;
                    const newEndDate = v.subscriptionExpiry ? new Date(v.subscriptionExpiry).toLocaleDateString('vi-VN') : s.endDate;
                    if (s.status !== newStatus || s.endDate !== newEndDate) {
                      changed = true;
                      return { 
                        ...s, 
                        status: newStatus,
                        endDate: newEndDate
                      };
                    }
                  }
                  return s;
                });

                if (!found && v.subscriptionStatus) {
                  changed = true;
                  updatedSubs.push({
                    id: v.subscriptionId || `VIP-${Math.floor(1000 + Math.random() * 9000)}`,
                    vehicle_plate: v.plate,
                    type: translateSubscriptionType(v.subscriptionType),
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
              if (!isOffline && v.subscriptionStatus === null) {
                try {
                  const subs = JSON.parse(savedSubs);
                  const updated = subs.filter((s: any) => s.vehicle_plate !== v.plate);
                  localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(updated));
                } catch (err) {}
              } else {
                try {
                  const subs = JSON.parse(savedSubs);
                  const matched = subs.filter((s: any) => s.vehicle_plate === v.plate);
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
            }

            return {
              id: v.id || `veh-${v.plate}`,
              plate: v.plate,
              name: v.name,
              type: sizeLabel,
              regDate: '12/10/2023',
              isActive: true,
              image: index % 2 === 0 ? 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=450&auto=format&fit=crop&q=80' : '',
              isLocked: activeSub ? (v.isLocked !== undefined ? v.isLocked : (existingLocal ? existingLocal.isLocked : false)) : false,
              fuelType: v.fuelType || existingLocal?.fuelType || 'GASOLINE',
              activeSubscription: activeSub,
              subscriptionExpiry: expiry,
              subscriptionStatus: subStatus
            };
          });

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
    const saved = localStorage.getItem(`urbanpark_user_transactions_${user?.username || 'default'}`);
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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/logs', {
          headers: { 'Authorization': `Bearer ${(sessionStorage.getItem('token') || localStorage.getItem('token'))}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.items && data.items.length > 0) {
            const mapped = data.items.map((item: any, index: number) => ({
              id: `#TRX-${9000 + index}`,
              date: item.time,
              type: 'Gửi xe',
              plate: item.plate,
              fee: item.action === 'Vào bãi' ? '0 đ' : '15,000 đ',
              isEntry: item.action === 'Vào bãi',
              status: item.status === 'Thành Công' ? 'Thành công' : 'Đang xử lý'
            }));
            setTransactions(prev => {
              const localPayments = prev.filter(tx => !tx.id.startsWith('#TRX-'));
              return [...localPayments, ...mapped];
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch driver transactions", err);
      }
    };
    fetchTransactions();
  }, [user]);

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
  const [newFuelType, setNewFuelType] = useState('GASOLINE');

  // Edit Vehicle Modal controls
  const [editVehicleModalOpen, setEditVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editPlate, setEditPlate] = useState('');
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Ô tô gầm thấp 4-5 chỗ');

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

  // Profile Edit
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    return localStorage.getItem('urbanpark_phone_verified') === 'true';
  });
  const [profileEmail, setProfileEmail] = useState('nguyen.van@urbanpark.com');
  const [profileAddress, setProfileAddress] = useState('123 Đường Lê Lợi, Quận 1, TP.HCM');
  
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

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`urbanpark_user_balance_${user?.username || 'default'}`, balance.toString());
  }, [balance, user?.username]);

  useEffect(() => {
    localStorage.setItem(`urbanpark_user_vehicles_${user?.username || 'default'}`, JSON.stringify(vehicles));
  }, [vehicles, user?.username]);

  useEffect(() => {
    localStorage.setItem(`urbanpark_user_transactions_${user?.username || 'default'}`, JSON.stringify(transactions));
  }, [transactions, user?.username]);

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
      fuelType: newFuelType
    };

    if (isOffline) {
      const modelItem: UserVehicle = {
        id: uuid,
        plate: newPlate.toUpperCase().trim(),
        name: newName.trim() || 'Phương tiện mới',
        type: newType,
        regDate: new Date().toLocaleDateString('vi-VN'),
        isActive: true,
        image: '',
        isLocked: false,
        fuelType: newFuelType
      };
      setVehicles(prev => [...prev, modelItem]);
      setNewPlate('');
      setNewName('');
      setNewFuelType('GASOLINE');
      setAddVehicleModalOpen(false);
      triggerToast(`Đăng ký thêm phương tiện ${modelItem.plate} thành công (Ngoại tuyến)!`, 'success');
      return;
    }

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}`
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
        plate: savedVehicle.licensePlate || savedVehicle.plate,
        name: savedVehicle.brand || savedVehicle.name,
        type: newType,
        regDate: new Date().toLocaleDateString('vi-VN'),
        isActive: true,
        image: '',
        isLocked: false,
        fuelType: savedVehicle.fuelType || newFuelType
      };

      setVehicles(prev => [...prev, modelItem]);
      setNewPlate('');
      setNewName('');
      setNewFuelType('GASOLINE');
      setAddVehicleModalOpen(false);
      triggerToast(`Đăng ký thêm phương tiện ${modelItem.plate} thành công!`, 'success');
      
      fetchVehiclesFromApi();
    } catch (error: any) {
      triggerToast(error.message || 'Thêm xe thất bại, vui lòng kiểm tra lại!', 'error');
    }
  };

  // Edit Vehicle helper
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
      fuelType: vehicles.find(v => v.id === editingVehicleId)?.fuelType || 'GASOLINE'
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
      setEditVehicleModalOpen(false);
      triggerToast('Đã sửa phương tiện thành công (Chế độ Ngoại tuyến)!', 'success');
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${editingVehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}`
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
              type: editType
            };
          }
          return v;
        }));
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

  const toggleVehicleLock = async (id: string, plate: string) => {
    if (isOffline) {
      triggerToast('Lỗi: Không thể thực hiện khóa/mở khóa xe ở chế độ Ngoại tuyến!', 'error');
      return;
    }
    const targetVeh = vehicles.find(v => v.id === id);
    if (!targetVeh) return;
    const nextState = !targetVeh.isLocked;

    try {
      const response = await fetch('/api/vehicles/lock', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}`
        },
        body: JSON.stringify({ plate: plate, isLocked: nextState })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(data.message, nextState ? 'success' : 'info');
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, isLocked: nextState } : v));
      } else {
        triggerToast(`Không thành công: ${data.message}`, 'error');
      }
    } catch (err) {
      triggerToast('Lỗi kết nối API Backend!', 'error');
    }
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
          'Authorization': `Bearer ${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}`
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
  const translateSubscriptionType = (type: string) => {
    if (!type) return 'Thẻ Tháng VIP';
    const t = type.toUpperCase();
    if (t === 'DAILY' || t === 'DAY') return 'Vé Ngày';
    if (t === 'QUARTERLY' || t === 'QUATERLY') return 'Thẻ 3 Tháng VIP';
    if (t === 'HALF_YEARLY' || t === '6_MONTHS' || t === '6_MONTH') return 'Thẻ 6 Tháng VIP';
    if (t === 'YEARLY' || t === 'YEAR') return 'Thẻ Năm VIP';
    if (t === 'MONTHLY') return 'Thẻ Tháng VIP';
    return type;
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

  // Checkout VIP flow
  const handleStartVnpay = async () => {
    if (isOffline) {
      triggerToast('Lỗi: Không thể đăng ký Thẻ Tháng VIP ở chế độ Ngoại tuyến!', 'error');
      return;
    }
    if (paymentMethod === 'wallet') {
      const neededUSD = selectedPackPrice / 25000;
      if (balance < neededUSD) {
        triggerToast(`⚠️ Thất bại: Số dư ví không đủ! Cần $${neededUSD.toFixed(2)}, Số dư hiện tại: $${balance.toFixed(2)}`, 'error');
        return;
      }
      setBalance(prev => prev - neededUSD);
      const formattedPrice = selectedPackPrice.toLocaleString('vi-VN') + '₫';
      const newTx: TransactionItem = {
        id: `txn-${Date.now()}`,
        date: 'Vừa xong',
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

      if (selectedPackLabel.includes('3 Tháng')) {
        expiryDate.setDate(expiryDate.getDate() + 90);
      } else if (selectedPackLabel.includes('6 Tháng')) {
        expiryDate.setDate(expiryDate.getDate() + 180);
      } else if (selectedPackLabel.includes('1 Năm')) {
        expiryDate.setDate(expiryDate.getDate() + 365);
      } else if (selectedPackLabel.includes('Tháng') || selectedPackLabel.includes('VIP')) {
        expiryDate.setDate(expiryDate.getDate() + 30);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 1);
      }
      const expiryString = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;

      let subType = 'MONTHLY';
      if (selectedPackLabel.includes('Vé Ngày') || selectedPackLabel.includes('Ngày')) {
        subType = 'DAILY';
      } else if (selectedPackLabel.includes('3 Tháng') || selectedPackLabel.includes('3 tháng') || selectedPackLabel.includes('Quý')) {
        subType = 'QUARTERLY';
      } else if (selectedPackLabel.includes('6 Tháng') || selectedPackLabel.includes('6 tháng') || selectedPackLabel.includes('Nửa')) {
        subType = 'HALF_YEARLY';
      } else if (selectedPackLabel.includes('1 Năm') || selectedPackLabel.includes('Năm') || selectedPackLabel.includes('năm')) {
        subType = 'YEARLY';
      }

      const docPhotos = (window as any).lastUploadedPhotos || {
        registrationPaper: targetVeh?.registrationDocUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80',
        identityCard: targetVeh?.registrationPhotoUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
        frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
      };

      // Create subscription in localStorage with PENDING_APPROVAL status
      const savedSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
      const tempId = 'VIP-' + Math.floor(1000 + Math.random() * 9000);
      const newSub = {
        id: tempId,
        vehicle_plate: selectedVehicleForVIP,
        type: selectedPackLabel,
        startDate: new Date().toLocaleDateString('vi-VN'),
        endDate: expiryString,
        status: (selectedPackLabel.includes('Vé Ngày') || selectedPackLabel.includes('Ngày')) ? 'ACTIVE' : 'PENDING_APPROVAL',
        document_photos: docPhotos,
        explanation: (window as any).lastUploadedPhotos?.explanation || ''
      };
      localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify([newSub, ...savedSubs]));
      window.dispatchEvent(new Event('storage'));

      try {
        apiClient.post('/vip/register', {
          vehicleId: targetVeh ? targetVeh.id : null,
          licensePlate: selectedVehicleForVIP,
          subscriptionType: subType,
          documentPhotos: JSON.stringify(docPhotos)
        }).then((response: any) => {
          const data = response?.data ?? response;
          if (data && data.id) {
            const currentSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
            const updated = currentSubs.map(s => s.id === tempId ? { ...s, id: data.id } : s);
            localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          }
        }).catch(err => console.warn("Backend VIP registration failed:", err));
      } catch (err) {
        console.error("Lỗi khi đăng ký VIP:", err);
      }

      setRegStep(3); // success step!
      triggerToast(
        (selectedPackLabel.includes('Vé Ngày') || selectedPackLabel.includes('Ngày'))
          ? "✨ Đã kích hoạt vé ngày thành công cho xe " + selectedVehicleForVIP + "!"
          : "✉️ Đăng kí thành công! Đang chờ Manager phê duyệt hồ sơ VIP cho xe " + selectedVehicleForVIP + ".",
        'success'
      );
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

  const handleConfirmVnpayPayment = async () => {
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
        date: 'Vừa xong',
        type: 'Nạp ví VNPAY',
        plate: '-',
        fee: `+$${selectedPackPrice.toFixed(2)}`,
        isEntry: true,
        status: 'Thành công'
      };
      setTransactions(prev => [newTx, ...prev]);
      triggerToast(`Nạp thành công $${selectedPackPrice.toFixed(2)} vào ví điện tử!`, 'success');
    } else {
      // Deduct from balance for simulation if desired, or let balance stay. Let's add a fresh transaction
      const formattedPrice = selectedPackPrice.toLocaleString('vi-VN') + '₫';
      const newTx: TransactionItem = {
        id: `txn-${Date.now()}`,
        date: 'Vừa xong',
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

      if (selectedPackLabel.includes('3 Tháng')) {
        expiryDate.setDate(expiryDate.getDate() + 90);
      } else if (selectedPackLabel.includes('6 Tháng')) {
        expiryDate.setDate(expiryDate.getDate() + 180);
      } else if (selectedPackLabel.includes('1 Năm')) {
        expiryDate.setDate(expiryDate.getDate() + 365);
      } else if (selectedPackLabel.includes('Tháng') || selectedPackLabel.includes('VIP')) {
        expiryDate.setDate(expiryDate.getDate() + 30);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 1);
      }
      const expiryString = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;

      let subType = 'MONTHLY';
      if (selectedPackLabel.includes('Vé Ngày') || selectedPackLabel.includes('Ngày')) {
        subType = 'DAILY';
      } else if (selectedPackLabel.includes('3 Tháng') || selectedPackLabel.includes('3 tháng') || selectedPackLabel.includes('Quý')) {
        subType = 'QUARTERLY';
      } else if (selectedPackLabel.includes('6 Tháng') || selectedPackLabel.includes('6 tháng') || selectedPackLabel.includes('Nửa')) {
        subType = 'HALF_YEARLY';
      } else if (selectedPackLabel.includes('1 Năm') || selectedPackLabel.includes('Năm') || selectedPackLabel.includes('năm')) {
        subType = 'YEARLY';
      }

      const docPhotos = (window as any).lastUploadedPhotos || {
        registrationPaper: targetVeh?.registrationDocUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80',
        identityCard: targetVeh?.registrationPhotoUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
        frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
      };

      // Create subscription in localStorage with PENDING_APPROVAL status
      const savedSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
      const tempId = 'VIP-' + Math.floor(1000 + Math.random() * 9000);
      const newSub = {
        id: tempId,
        vehicle_plate: selectedVehicleForVIP,
        type: selectedPackLabel,
        startDate: new Date().toLocaleDateString('vi-VN'),
        endDate: expiryString,
        status: (selectedPackLabel.includes('Vé Ngày') || selectedPackLabel.includes('Ngày')) ? 'ACTIVE' : 'PENDING_APPROVAL',
        document_photos: docPhotos,
        explanation: (window as any).lastUploadedPhotos?.explanation || ''
      };
      localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify([newSub, ...savedSubs]));
      window.dispatchEvent(new Event('storage'));

      try {
        apiClient.post('/vip/register', {
          vehicleId: targetVeh ? targetVeh.id : null,
          licensePlate: selectedVehicleForVIP,
          subscriptionType: subType,
          documentPhotos: JSON.stringify(docPhotos)
        }).then((response: any) => {
          const data = response?.data ?? response;
          if (data && data.id) {
            const currentSubs = JSON.parse(localStorage.getItem('urbanpark_vip_subscriptions') || '[]');
            const updated = currentSubs.map(s => s.id === tempId ? { ...s, id: data.id } : s);
            localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          }
        }).catch(err => console.warn("Backend VIP registration failed:", err));
      } catch (err) {
        console.error("Lỗi khi đăng ký VIP:", err);
      }

      setRegStep(3); // success step!
      triggerToast(
        (selectedPackLabel.includes('Vé Ngày') || selectedPackLabel.includes('Ngày'))
          ? "✨ Đã kích hoạt vé ngày thành công cho xe " + selectedVehicleForVIP + "!"
          : "✉️ Đăng kí thành công! Đang chờ Manager phê duyệt hồ sơ VIP cho xe " + selectedVehicleForVIP + ".",
        'success'
      );
      }

    }
  };

  const handleCloseVnpay = () => {
    setVnpayModalOpen(false);
    if (vnpayStep === 'success') {
      setRegStep(3); // move progress step to step 3
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
            className={`fixed top-10 right-10 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
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
                value={searchSupportQuery}
                onChange={(e) => setSearchSupportQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-full font-medium"
              />
            </div>

            {/* Right side user statistics */}
            <div className="flex items-center gap-5">
              {/* Wallet Balance representation */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-mono font-bold text-slate-700">
                <span className="text-[10px] text-slate-400 font-sans tracking-wide">Số dư ví:</span>
                <span className="text-blue-600 font-black">${balance.toFixed(2)}</span>
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

            <Outlet context={{
              user, accessToken, onLogout, isDarkMode,
              activeTab, setActiveTab, isOffline, setIsOffline,
              paymentMethod, setPaymentMethod, balance, setBalance,
              selectedVehId, setSelectedVehId, qrDirection, setQrDirection,
              isTogglingLock, setIsTogglingLock, vehicles, setVehicles,
              transactions, setTransactions, currentParked, setCurrentParked,
              addVehicleModalOpen, setAddVehicleModalOpen, newPlate, setNewPlate,
              newName, setNewName, newType, setNewType, regStep, setRegStep,
              selectedVehicleForVIP, setSelectedVehicleForVIP, selectedPackPrice, setSelectedPackPrice,
              selectedPackLabel, setSelectedPackLabel, vnpayBank, setVnpayBank,
              vnpayCardNo, setVnpayCardNo, vnpayCardHolder, setVnpayCardHolder,
              vnpayOtp, setVnpayOtp, vnpayModalOpen, setVnpayModalOpen,
              vnpayStep, setVnpayStep, isSirenMuted, setIsSirenMuted,
              isAlertOverlayShown, setIsAlertOverlayShown, profileName, setProfileName,
              profilePhone, setProfilePhone, isPhoneVerified, setIsPhoneVerified, profileEmail, setProfileEmail,
              profileAddress, setProfileAddress, is2faEnabled, setIs2faEnabled,
              emailNotifyGate, setEmailNotifyGate, smsNotifyGate, setSmsNotifyGate,
              emailNotifyReceipt, setEmailNotifyReceipt, smsNotifyReceipt, setSmsNotifyReceipt,
              billingTimeFilter, setBillingTimeFilter, billingTypeFilter, setBillingTypeFilter,
              searchSupportQuery, setSearchSupportQuery, expandedFaq, setExpandedFaq,
              ticketTopic, setTicketTopic, ticketMessage, setTicketMessage,
              ticketAttachedFiles, setTicketAttachedFiles, triggerToast, isTxDateInFilter, handleLogout,
              editVehicleModalOpen, setEditVehicleModalOpen,
              editingVehicleId, setEditingVehicleId,
              editPlate, setEditPlate,
              editName, setEditName,
              editType, setEditType,
              handleEditVehicle,
              triggerSecurityTest,
              activeQrToken,
              qrExpiryTime,
              isGeneratingQr,
              countdownSec,
              generateQrToken,
              isQrRequested,
              setIsQrRequested
            }} />

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

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block">Loại động cơ</label>
                    <select
                      value={newFuelType}
                      onChange={e => setNewFuelType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-bold border-slate-200 text-slate-850 outline-hidden"
                    >
                      <option value="GASOLINE">Xe Xăng</option>
                      <option value="ELECTRIC">Xe Điện</option>
                    </select>
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

