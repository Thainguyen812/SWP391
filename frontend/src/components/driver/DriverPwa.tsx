import React, { useState, useEffect, useRef } from 'react';
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

export function DriverPwa({ user, accessToken, onLogout, isDarkMode = false }: DriverPwaProps) {
  // ----------------------------------------------------
  // --- CORE SYSTEM STATES & SEEDS ---
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState<'home' | 'driver_pnl' | 'vehicles' | 'vip_reg' | 'billing' | 'settings' | 'support'>('driver_pnl');
  const [isOffline, setIsOffline] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'vnpay'>('wallet');
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('urbanpark_user_balance');
    return saved ? parseFloat(saved) : 0; // Default to 0 for new users
  });

  const [selectedVehId, setSelectedVehId] = useState<string>('veh-1');
  const [qrDirection, setQrDirection] = useState<'VÀO' | 'RA'>('VÀO');
  const [isTogglingLock, setIsTogglingLock] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<UserVehicle[]>(() => {
    const saved = localStorage.getItem('urbanpark_user_vehicles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    return [];
  });

  // Background synchronize with live backend
  const fetchVehiclesFromApi = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        headers: { 'Authorization': `Bearer ${accessToken || localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: UserVehicle[] = data.data.map((v: any, index: number) => ({
          id: v.id || `veh-${v.plate}`,
          plate: v.plate,
          name: v.name,
          type: v.type === 'SUV' ? 'Ô tô 4 chỗ' : v.type === 'Sedan' ? 'Ô tô 4 chỗ' : 'Xe máy',
          regDate: '12/10/2023',
          isActive: true,
          image: index % 2 === 0 ? 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=450&auto=format&fit=crop&q=80' : '',
          isLocked: v.isLocked
        }));
        setVehicles(mapped);
        
        // Auto-initialize first selection if needed
        if (mapped.length > 0 && (!selectedVehId || !mapped.some(mv => mv.id === selectedVehId))) {
          setSelectedVehId(mapped[0].id);
        }
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
    const saved = localStorage.getItem('urbanpark_user_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
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
  const [newType, setNewType] = useState('Ô tô 4 chỗ');

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
  const [profileEmail, setProfileEmail] = useState('nguyen.van@urbanpark.com');
  const [profileAddress, setProfileAddress] = useState('123 Đường Lê Lợi, Quận 1, TP.HCM');
  
  // Extra settings states for absolute design fidelity
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [emailNotifyGate, setEmailNotifyGate] = useState(true);
  const [smsNotifyGate, setSmsNotifyGate] = useState(true);
  const [emailNotifyReceipt, setEmailNotifyReceipt] = useState(true);
  const [smsNotifyReceipt, setSmsNotifyReceipt] = useState(false);

  // Billing Filters
  const [billingTimeFilter, setBillingTimeFilter] = useState<'Tháng này' | 'Tháng trước' | '3 tháng trước'>('Tháng này');
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
    localStorage.setItem('urbanpark_user_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('urbanpark_user_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('urbanpark_user_transactions', JSON.stringify(transactions));
  }, [transactions]);

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
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) {
      triggerToast('Vui lòng điền biển số xe!', 'error');
      return;
    }
    const modelItem: UserVehicle = {
      id: `veh-${Date.now()}`,
      plate: newPlate.toUpperCase(),
      name: newName.trim() || 'Phương tiện mới',
      type: newType,
      regDate: new Date().toLocaleDateString('vi-VN'),
      isActive: true,
      image: '',
      isLocked: false
    };
    setVehicles(prev => [...prev, modelItem]);
    setNewPlate('');
    setNewName('');
    setAddVehicleModalOpen(false);
    triggerToast(`Đăng ký thêm phương tiện ${modelItem.plate} thành công!`, 'success');
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
    if (paymentMethod === 'wallet') {
      const neededUSD = selectedPackPrice === 50000 ? 2.0 : 40.0;
      if (balance < neededUSD) {
        triggerToast(`⚠️ Thất bại: Số dư ví không đủ! Cần $${neededUSD.toFixed(2)}, Số dư hiện tại: $${balance.toFixed(2)}`, 'error');
        return;
      }
      setBalance(prev => prev - neededUSD);
      const formattedPrice = selectedPackPrice === 50000 ? '50,000₫' : '1,000,000₫';
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
      setRegStep(3); // success step!
      triggerToast(`Đăng kí thành công bằng Ví UrbanPark cho xe ${selectedVehicleForVIP}!`, 'success');
    } else {
      setVnpayStep('info');
      setVnpayModalOpen(true);
    }
  };

  const handleSendVnpayDomesticCard = () => {
    if (!vnpayCardNo.trim() || !vnpayCardHolder.trim()) {
      triggerToast('Vui lòng điền đầy đủ số thẻ & tên chủ thẻ', 'error');
      return;
    }
    setVnpayStep('otp');
    setVnpayOtp('');
  };

  const handleConfirmVnpayPayment = () => {
    if (vnpayOtp !== '2026' && vnpayOtp !== 'OTP-2026') {
      triggerToast('Vui lòng nhập đúng mã OTP Sandbox: OTP-2026', 'error');
      return;
    }

    setVnpayStep('success');

    // Deduct from balance for simulation if desired, or let balance stay. Let's add a fresh transaction
    const formattedPrice = selectedPackPrice === 50000 ? '50,000₫' : '1,000,000₫';
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
    triggerToast(`Đăng kí thành viên thành công cho xe ${selectedVehicleForVIP}!`, 'success');
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
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      MÔI TRƯỜNG API THẬT (LIVE REST CLIENT)
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
                          if (!activeVeh) return null;
                          const qrValueString = `${activeVeh.plate}|${qrDirection}|${Date.now()}`;
                          return (
                            <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col items-center justify-center space-y-4">
                              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-inner w-44 h-44 flex flex-col items-center justify-center relative group">
                                {/* Simulated cool tech look camera scan target helper lines */}
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-600" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-600" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-600" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-600" />

                                {/* A highly stylized custom vector matrix blocks grid representing a high contrast QR code */}
                                <div className="grid grid-cols-5 gap-1.5 w-28 h-28 opacity-95">
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />

                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />

                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-sky-500 rounded animate-pulse" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />

                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />

                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-300 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                  <div className="bg-slate-900 rounded" />
                                </div>

                                <div className="text-[8px] text-blue-600 font-bold block bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-2">
                                  MÃ VÉ KHÁCH VIP
                                </div>
                              </div>

                              <div className="w-full text-center space-y-1">
                                <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">Chữ ký số bốt gác (Gate Token Hash)</span>
                                <strong className="text-xs font-mono font-black text-slate-800 tracking-wider block bg-white border border-slate-200 p-2 rounded-xl select-all select-all shadow-inner break-all">
                                  {qrValueString}
                                </strong>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(qrValueString);
                                  triggerToast("📋 Sao chép mã chữ ký số bốt gác thành công!", "success");
                                }}
                                className="w-full py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-extrabold text-xs rounded-xl active:scale-95 transition-all outline-none"
                              >
                                Sao chép Mã QR văn bản
                              </button>
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
                          onClick={() => {
                            triggerToast('Đã kích hoạt thiết bị đo lường định vị radar xe của bạn!', 'success');
                          }}
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

                  {/* ANTI-THEFT EXPERIMENT BOX */}
                  <div id="user-pwa-antitheft-card" className="p-5 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <strong className="text-xs text-yellow-800 font-extrabold">HỘP THỬ NGHIỆM ĐỘT NHẬP AN NINH DRIVER</strong>
                      </div>
                      <p className="text-[11px] text-yellow-600/90 leading-relaxed font-semibold">
                        Kích hoạt còi báo động nhân bốt gác để kiểm tra độ trễ phản hồi kẹp phanh gạt chặn barie tự động bảo vệ tài sản!
                      </p>
                    </div>
                    <button 
                      onClick={triggerSecurityTest}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-extrabold text-[11px] rounded-lg tracking-wide uppercase cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      Báo động đột nhập
                    </button>
                  </div>

                  {/* USER INTERACTIVE STATE CONTROL PANEL (GOOD & BAD CASES) */}
                  <div id="user-testing-pnl" className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                        Bảng Thử Nghiệm Tình Huống Vận Hành (User Portal)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Positive Scenarios */}
                      <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>TRƯỜNG HỢP TỐT (SUCCESS RUNS)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                          Kiểm định các tiến trình tiêu chuẩn vận hành mượt mà của chủ xe.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentParked({
                                plate: vehicles[0]?.plate || '30G-123.45',
                                status: 'ĐANG ĐỖ',
                                location: 'Khu A • Tầng 2',
                                isParked: true
                              });
                              // Add ticket log
                              const newTx: TransactionItem = {
                                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                                date: 'Vừa xong',
                                type: 'Xe ô tô vào bãi',
                                plate: vehicles[0]?.plate || '30G-123.45',
                                fee: '$2.00',
                                isEntry: true,
                                status: 'Thành công'
                              };
                              setTransactions(prev => [newTx, ...prev]);
                              triggerToast('Giả lập: Xe ô tô tự động quét LPR vào bãi thành công!', 'success');
                            }}
                            className="p-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
                          >
                            Xe vào bãi (LPR Chuẩn)
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setBalance(prev => prev + 50.0);
                              const newTx: TransactionItem = {
                                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                                date: 'Vừa xong',
                                type: 'Nạp ví VNPAY',
                                plate: '-',
                                fee: '+$50.00',
                                isEntry: true,
                                status: 'Thành công'
                              };
                              setTransactions(prev => [newTx, ...prev]);
                              triggerToast('Giả lập: Nạp thêm $50.00 vào số dư ví thành công!', 'success');
                            }}
                            className="p-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
                          >
                            Nạp ví VNPAY $50
                          </button>
                        </div>
                      </div>

                      {/* Negative/Abnormal Fault Scenarios */}
                      <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>TRƯỜNG HỢP XẤU (ABNORMAL/FAULT RUNS)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                          Sự cố giả định liên quan đến ví cạn kiệt, hoặc mất kết nối bốt kiểm soát.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBalance(0.15);
                              triggerToast('Giả lập: Đã hạ ví về mức cực thấp ($0.15)!', 'error');
                            }}
                            className="p-1.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer"
                          >
                            Hạ số dư ví về $0.15
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsOffline(!isOffline);
                              triggerToast(
                                !isOffline 
                                  ? '⚠️ Đã tắt mạng! Bốt gác đang hoạt động Ngoại tuyến.' 
                                  : '🟢 Khôi phục mạng Internet bốt gác hoạt động Online!', 
                                !isOffline ? 'error' : 'success'
                              );
                            }}
                            className={`p-1.5 py-2 text-white font-extrabold text-[10px] rounded-lg transition-all text-center cursor-pointer ${
                              isOffline ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            {isOffline ? 'Kết nối Internet lại' : 'Tắt mạng (Mất kết nối)'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10.5px] text-slate-500 leading-snug p-3 bg-slate-50 border border-slate-150 rounded-xl text-left">
                      💡 <strong>Hướng dẫn kiểm thử nhanh:</strong> Click <strong>"Hạ số dư ví về $0.15"</strong>, rồi sang tab <strong>"Đăng ký hàng tháng"</strong> hoặc dùng Ví để thanh toán. Bạn sẽ kích hoạt ngay kịch bản lỗi thanh toán do cạn số dư! Click <strong>"Tắt mạng"</strong> để kích hoạt chế độ cứu nạn khẩn cấp ngoại tuyến.
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
                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#10b981] font-bold text-[9px] rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              HOẠT ĐỘNG
                            </span>
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
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NGÀY ĐĂNG KÝ</span>
                              <strong className="text-xs font-extrabold text-slate-700 block mt-0.5">{v.regDate}</strong>
                            </div>
                          </div>

                          {/* Lock Trigger Controller */}
                          <div className="flex items-center justify-between gap-3 pt-1">
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

                            <button 
                              onClick={() => triggerToast(`Thẻ xe của phương tiện ${v.plate} được cấp mới đầy đủ!`, 'info')}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
                            >
                              Chi tiết
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
                            setNewType('Ô tô 4 chỗ');
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
                          {[
                            { 
                              id: 'pkg-1', 
                              label: 'Vé Ngày', 
                              price: 50000, 
                              desc: 'Giá trị trong 24 giờ kể từ thời điểm đăng ký.', 
                              badge: 'RA VÀO NHIỀU LẦN', 
                              features: [] 
                            },
                            { 
                              id: 'pkg-2', 
                              label: 'Thẻ Tháng VIP', 
                              price: 1000000, 
                              desc: 'Giải pháp tối ưu cho cư dân và nhân viên văn phòng.', 
                              badge: 'PHỔ BIẾN', 
                              features: [
                                'Chỗ đỗ xe cố định (Tầng B1)',
                                'Rửa xe miễn phí 1 lần/tháng',
                                'Hỗ trợ kỹ thuật 24/7 tức thì'
                              ] 
                            }
                          ].map(pkg => {
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
                            <option value="wallet">Ví UrbanPark (Số dư: ${balance.toFixed(2)})</option>
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
                          $128.50
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          -12% so với tháng trước
                        </span>
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
                            onChange={(e) => setBillingTimeFilter(e.target.value as any)}
                            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-xl border border-slate-200 text-slate-800 outline-none transition-all"
                          >
                            <option value="Tháng này">Tháng này</option>
                            <option value="Tháng trước">Tháng trước</option>
                            <option value="3 tháng trước">3 tháng trước</option>
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
                              if (billingTypeFilter === 'Tất cả') return true;
                              return tx.type.toLowerCase().trim() === billingTypeFilter.toLowerCase().trim();
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
                    </div>
                    <button 
                      onClick={() => triggerToast('Đã lưu mọi thay đổi thiết lập tài khoản thành công!', 'success')}
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
                                onChange={e => setProfilePhone(e.target.value)}
                                className="w-full p-3 pr-24 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-800 focus:border-blue-500 outline-none transition-colors"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/15">
                                ✓ Đã xác thực
                              </span>
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
                            ${balance.toFixed(2)}
                          </strong>

                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedPackPrice(50.00);
                              setSelectedPackLabel('Nạp tiền vào ví điện tử UrbanPark');
                              setVnpayStep('info');
                              setVnpayModalOpen(true);
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
                  <p className="text-slate-400 text-xs mt-1">Đăng ký thêm xe ô tô/xe máy mới vào hệ thống của bạn.</p>
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
                      <option value="Ô tô 4 chỗ">🚗 Ô tô 4 chỗ</option>
                      <option value="Ô tô 7 chỗ">SUV 7 chỗ</option>
                      <option value="Xe máy">🏍️ Xe máy</option>
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
