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
  LogOut as LogOutIcon, 
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
  PlusCircle,
  Plus,
  Bike,
  Sparkles,
  Info,
  Trash2,
  Send,
  Compass,
  Map,
  BadgeAlert
} from 'lucide-react';

import { VipApprovalPanel } from './VipApprovalPanel';

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

interface Vehicle {
  id: string;
  plate: string;
  type: string;
  location: string;
  status: 'DANG_DO' | 'DA_OUT' | 'BAO_VE_MAX';
  entryTime: string;
  isLocked: boolean;
  brand?: string;
  detailType?: string;
  image?: string;
}

interface Activity {
  id: string;
  time: string;
  event: 'Xe vào' | 'Xe ra';
  plate: string;
  cost: string;
}

interface VipSubscription {
  id: string;
  vehicle_plate: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

export function Dashboard({ user, accessToken, onRefreshToken, onLogout }: DashboardProps) {
  // Navigation / Sidebar active menu
  const [activeMenu, setActiveMenu] = useState<'home' | 'vehicles' | 'vip' | 'vip_approval' | 'billing' | 'settings'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);

  // States with Local Storage persistence
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('urbanpark_driver_balance');
    return saved ? parseFloat(saved) : 45.50;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('urbanpark_driver_vehicles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          brand: item.brand || (item.type === 'Ô tô' ? 'Toyota Camry' : 'Honda SH'),
          detailType: item.detailType || (item.type === 'Ô tô' ? 'Ô tô 4 chỗ' : 'Xe máy'),
          image: item.image || (item.plate === '30G-123.45' || item.plate === '30A-123.45' || item.type === 'Ô tô' ? 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80' : undefined)
        }));
      } catch (err) {
        console.error(err);
      }
    }
    return [
      { 
        id: 'V-1', 
        plate: '30G-123.45', 
        type: 'Ô tô', 
        brand: 'Toyota Camry', 
        detailType: 'Ô tô 4 chỗ', 
        location: 'Khu A • Tầng 2', 
        status: 'DANG_DO', 
        entryTime: 'Hôm nay, 08:32', 
        isLocked: false,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80'
      },
      { 
        id: 'V-2', 
        plate: '29M1-678.90', 
        type: 'Xe máy', 
        brand: 'Honda SH', 
        detailType: 'Xe máy', 
        location: 'Khu B • Tầng B1', 
        status: 'DANG_DO', 
        entryTime: '13/06/2026 10:15', 
        isLocked: false,
        image: undefined
      }
    ];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('urbanpark_driver_activities');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ACT-1', time: 'Hôm nay, 08:32', event: 'Xe vào', plate: '30A-123.45', cost: '--' },
      { id: 'ACT-2', time: 'Hôm qua, 18:45', event: 'Xe ra', plate: '30A-123.45', cost: '-$4.50' },
      { id: 'ACT-3', time: '12/10/2023, 08:15', event: 'Xe vào', plate: '30A-123.45', cost: '--' }
    ];
  });

  const [vipSubscriptions, setVipSubscriptions] = useState<VipSubscription[]>(() => {
    const saved = localStorage.getItem('urbanpark_vip_subscriptions');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'VIP-2026-01', vehicle_plate: '30A-123.45', type: 'Thẻ Vàng (Thẻ Tháng Gold)', startDate: '01/06/2026', endDate: '01/12/2026', status: 'ACTIVE' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('urbanpark_driver_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('urbanpark_driver_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('urbanpark_driver_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(vipSubscriptions));
  }, [vipSubscriptions]);

  // Toast message management
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ----------------------------------------------------
  // --- SIREN ALARM SYNTHESIZER ---
  // ----------------------------------------------------
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillator1Ref = useRef<OscillatorNode | null>(null);
  const oscillator2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);

  const startSirenWave = () => {
    if (isSirenMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      stopSirenWave();

      // Create synthetic oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const masterGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(380, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2.0, ctx.currentTime); // 2Hz sweep rhythm

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);

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
      setIsSirenPlaying(true);
    } catch (e) {
      console.warn("Audio context bypass error:", e);
    }
  };

  const stopSirenWave = () => {
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
      setIsSirenPlaying(false);
    } catch (e) {
      // already stopped
    }
  };

  useEffect(() => {
    return () => {
      stopSirenWave();
    };
  }, []);

  // ----------------------------------------------------
  // --- INTEGRATED INTERACTIVE SIMULATORS ---
  // ----------------------------------------------------
  const [activeVehiclePlate, setActiveVehiclePlate] = useState('30A-123.45');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isFindCarOpen, setIsFindCarOpen] = useState(false);
  const [theftAttemptVehicle, setTheftAttemptVehicle] = useState<string | null>(null);

  // Active vehicle state helper
  const activeVehicle = vehicles.find(v => v.plate === activeVehiclePlate) || vehicles[0];

  const handleToggleLock = (vehicleId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const nextLock = !v.isLocked;
        triggerToast(`Đã ${nextLock ? 'bật hệ thống bảo vệ' : 'tắt chế độ khóa bảo vệ'} xe ${v.plate}`, nextLock ? 'success' : 'info');
        return {
          ...v,
          isLocked: nextLock,
          status: nextLock ? 'BAO_VE_MAX' : v.status === 'BAO_VE_MAX' ? 'DANG_DO' : v.status
        };
      }
      return v;
    }));
  };

  // Simulate a physical scan of car exit while locked
  const triggerTheftSimulation = (plateToSteal: string) => {
    const target = vehicles.find(v => v.plate === plateToSteal);
    if (!target) return;

    if (target.isLocked) {
      // TRIGGER THEFT EMERGENCY
      setTheftAttemptVehicle(plateToSteal);
      startSirenWave();
      triggerToast(`🚨 CẢNH BÁO: Phát hiện hành vi di chuyển trái phép xe ${plateToSteal}!`, 'error');

      // Add to activities
      const rightNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setActivities(prev => [
        {
          id: `ACT-${Date.now()}`,
          time: `Hôm nay, ${rightNow}`,
          event: 'Xe ra',
          plate: plateToSteal,
          cost: 'BỊ CHẶN LẠI (THẾT CÒI)'
        },
        ...prev
      ]);
    } else {
      // Normal Exit Flow
      triggerToast(`Xe ${plateToSteal} đã rời bãi thành công (Không bị khóa bảo vệ)!`, 'success');
      setVehicles(prev => prev.map(v => {
        if (v.plate === plateToSteal) {
          return { ...v, status: 'DA_OUT', location: 'Đã ra khỏi bãi' };
        }
        return v;
      }));

      const rightNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setActivities(prev => [
        {
          id: `ACT-${Date.now()}`,
          time: `Hôm nay, ${rightNow}`,
          event: 'Xe ra',
          plate: plateToSteal,
          cost: '-$4.50'
        },
        ...prev
      ]);
      setBalance(prev => Math.max(0, prev - 4.50));
    }
  };

  // ----------------------------------------------------
  // --- BILL REUNION / CHIP FLOW IN-APP ---
  // ----------------------------------------------------
  const handleQuickPayment = () => {
    if (balance < 4.50) {
      triggerToast('Tài khoản không đủ số dư để thanh toán! Vui lòng nạp thêm.', 'error');
      return;
    }
    setBalance(prev => prev - 4.50);
    triggerToast('Thanh toán thành công $4.50 phí đỗ xe qua Ví UrbanPark.', 'success');
    setIsPaymentModalOpen(false);

    // Update session state
    setVehicles(prev => prev.map(v => {
      if (v.plate === activeVehiclePlate) {
        return { ...v, status: 'DA_OUT', location: 'Đã thanh toán (Sẵn sàng ra)' };
      }
      return v;
    }));
  };

  // ----------------------------------------------------
  // --- SUBMISSION FOR VIP PASS (WITH VNPAY SANDBOX) ---
  // ----------------------------------------------------
  const [selectedVipPlate, setSelectedVipPlate] = useState('30A-123.45');
  const [customPlateInput, setCustomPlateInput] = useState('');
  const [vipPackageType, setVipPackageType] = useState('Gói Thẻ Vàng (Gold) - $45.00/Tháng');
  const [isVnpaySandboxOpen, setIsVnpaySandboxOpen] = useState(false);
  const [vnpayOtpInput, setVnpayOtpInput] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<{ carPlate: string | null; idCard: string | null }>({ carPlate: null, idCard: null });
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});

  const simulatePhotoUpload = (doc: 'carPlate' | 'idCard') => {
    setUploadStatus(prev => ({ ...prev, [doc]: 'UPLOADING' }));
    setTimeout(() => {
      setUploadedPhotos(prev => ({
        ...prev,
        [doc]: doc === 'carPlate' 
          ? 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80'
      }));
      setUploadStatus(prev => ({ ...prev, [doc]: 'DONE' }));
      triggerToast('Đã tải lên minh chứng tài liệu thành công!', 'success');
    }, 1200);
  };

  const handleOpenVnpaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedPhotos.carPlate || !uploadedPhotos.idCard) {
      triggerToast('Vui lòng tải lên đầy đủ hình ảnh Đăng ký xe và CMND/CCCD để kiểm duyệt!', 'error');
      return;
    }
    setIsVnpaySandboxOpen(true);
  };

  const handleConfirmVnpay = () => {
    if (vnpayOtpInput !== '1234' && vnpayOtpInput !== '123456') {
      triggerToast('OTP không chính xác! Hãy sử dụng OTP kiểm thử: 1234', 'error');
      return;
    }

    // Cost calculations
    const price = vipPackageType.includes('$45.00') ? 45.00 : 120.00;
    
    // Add pass
    const plateToRegister = selectedVipPlate === 'custom' ? customPlateInput.toUpperCase() : selectedVipPlate;
    const newSub: VipSubscription = {
      id: `VIP-${Date.now().toString().slice(-4)}`,
      vehicle_plate: plateToRegister,
      type: vipPackageType,
      startDate: new Date().toLocaleDateString('vi-VN'),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      status: 'ACTIVE'
    };

    setVipSubscriptions(prev => [newSub, ...prev]);
    setBalance(prev => Math.max(0, prev + 10.00)); // cash back simulated
    triggerToast(`Đăng ký Vé tháng thành công cho xe ${plateToRegister}!`, 'success');
    setIsVnpaySandboxOpen(false);
    setUploadedPhotos({ carPlate: null, idCard: null });
    setUploadStatus({});
    setVnpayOtpInput('');
  };

  // Add new vehicle state helper
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('Ô tô');

  // Modals and advanced forms
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [selectedDetailVehicle, setSelectedDetailVehicle] = useState<Vehicle | null>(null);
  
  // Form states inside the custom Modal
  const [addFormPlate, setAddFormPlate] = useState('');
  const [addFormType, setAddFormType] = useState('Ô tô');
  const [addFormBrand, setAddFormBrand] = useState('');
  const [addFormDetailType, setAddFormDetailType] = useState('');

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehiclePlate.trim()) {
      triggerToast('Biển số xe không thể trống!', 'error');
      return;
    }
    const newCar: Vehicle = {
      id: `V-${Date.now()}`,
      plate: newVehiclePlate.toUpperCase().trim(),
      type: newVehicleType,
      location: 'Chưa vào bãi',
      status: 'DA_OUT',
      entryTime: '--',
      isLocked: false
    };
    setVehicles(prev => [...prev, newCar]);
    setNewVehiclePlate('');
    triggerToast(`Đã đăng ký xe ${newCar.plate} vào danh sách của bạn.`, 'success');
  };

  const handleModalCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormPlate.trim()) {
      triggerToast('Vui lòng nhập biển số xe!', 'error');
      return;
    }
    
    const plateUpper = addFormPlate.toUpperCase().trim();
    
    // Check duplicate
    const duplicate = vehicles.some(v => v.plate === plateUpper);
    if (duplicate) {
      triggerToast(`Biển số xe ${plateUpper} đã tồn tại trong danh sách!`, 'error');
      return;
    }

    const finalBrand = addFormBrand.trim() || (addFormType === 'Ô tô' ? 'Toyota Camry' : 'Honda SH');
    const finalDetailType = addFormDetailType.trim() || (addFormType === 'Ô tô' ? 'Ô tô 4 chỗ' : 'Xe máy');
    
    const newCar: Vehicle = {
      id: `V-${Date.now()}`,
      plate: plateUpper,
      type: addFormType,
      brand: finalBrand,
      detailType: finalDetailType,
      location: addFormType === 'Ô tô' ? 'Khu A • Tầng 2' : 'Khu C • Tầng 1',
      status: 'DANG_DO',
      entryTime: 'Mới đăng ký',
      isLocked: false,
      image: addFormType === 'Ô tô'
        ? 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80'
        : undefined
    };

    setVehicles(prev => [...prev, newCar]);
    setAddFormPlate('');
    setAddFormBrand('');
    setAddFormDetailType('');
    setIsAddVehicleModalOpen(false);
    triggerToast(`Đăng ký thành công phương tiện ${newCar.plate}!`, 'success');
  };

  // Chatbot state for support tab
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Chào anh Nguyễn Văn! Tôi là trợ lý UrbanPark Shield AI. Anh cần hỗ trợ thông tin gì về vé tháng, hệ thống chống trộm hoặc thanh toán?' }
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const userText = userChatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setUserChatInput('');

    setTimeout(() => {
      let botResponse = 'Hệ thống đã nhận thông tin. Yêu cầu hỗ trợ đã được chuyển tiếp đến Ban quản lý bốt gác để hỗ trợ anh trực tiếp.';
      if (userText.toLowerCase().includes('khóa') || userText.toLowerCase().includes('trộm')) {
        botResponse = 'Hệ thống bảo vệ an ninh chống trộm hoạt động bằng cách đóng các chốt chặn cơ khí của Barie ngay lập tức nếu phát hiện xe trong trạng thái "BẬT KHÓA" di chuyển ra bốt AI Camera. Anh có thể bật/tắt an toàn từ tab "Xe của tôi".';
      } else if (userText.toLowerCase().includes('vnpay') || userText.toLowerCase().includes('thanh toán')) {
        botResponse = 'UrbanPark tích hợp cổng VNPAY an toàn. Phí gửi xe sẽ được khấu trừ tự động hoặc thanh toán nhanh thông qua nút bấm "Thanh Toán Ngay" trên giao diện chính.';
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div id="urbanpark-user-root" className={`min-h-screen font-sans antialiased text-slate-800 transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc]'}`}>
      
      {/* 1. TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-slide-in text-white"
          style={{
            backgroundColor: toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'info' ? '#3b82f6' : '#10b981',
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-tight">{toastMessage.text}</span>
        </div>
      )}

      {/* 2. SIREN DETECTED MODAL */}
      <AnimatePresence>
        {theftAttemptVehicle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-rose-950/90 backdrop-blur-md flex items-center justify-center p-4 text-white"
          >
            <div className="bg-slate-900 border-4 border-rose-500 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
              
              <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-rose-500/50">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full uppercase border border-rose-500/20 inline-block">
                  CẢNH BÁO TRỘM XE KHẨN CẤP
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight">PHÁT HIỆN SỰ CỐ AN NINH!</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Phương tiện của bạn mang biển số <strong className="text-yellow-300 font-black">{theftAttemptVehicle}</strong> đang ở trạng thái <strong className="text-rose-400">KHÓA BẢO VỆ CHỐNG TRỘM</strong> nhưng đã kích hoạt quét OCR AI tại Bốt Kiểm Soát Xuất Bãi!
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-rose-950 mb-2">
                  <span className="text-[10px] text-rose-400 font-mono tracking-widest">HỆ THỐNG PHẢN ỨNG TỰ ĐỘNG</span>
                  <span className="text-[10px] text-slate-500 font-mono">LIVE FEED</span>
                </div>
                <p className="text-xs text-rose-200">
                  ⚠️ <strong>Hành động:</strong> Barie chắn sắt đã tự động đóng ngắt hành trình phản hồi trong vòng <strong>480ms</strong>. Lực lượng bảo vệ bốt trực bãi đỗ đã được huy động để chặn xe. Còi hú khẩn cấp đã kích hoạt.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    stopSirenWave();
                    setTheftAttemptVehicle(null);
                    triggerToast('Đã khôi phục an ninh bình thường!', 'success');
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-extrabold uppercase rounded-xl transition-all shadow-md cursor-pointer"
                >
                  XÁC NHẬN & TẮT BÁO ĐỘNG
                </button>
                <button
                  onClick={() => setIsSirenMuted(!isSirenMuted)}
                  className="px-4 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />}
                  <span>{isSirenMuted ? 'Mở âm thanh' : 'Tắt còi'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. LAYOUT CONTAINER WITH INTEGRATED DESIGN */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen">
        
        {/* SIDEBAR NAVIGATION PANEL (MATCHING IMAGE 100%) */}
        <aside id="sidebar-portal" className="w-full md:w-68 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6">
          <div className="space-y-8">
            
            {/* Brand Header */}
            <div id="brand-area" className="flex flex-col gap-1 pl-2">
              <span className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
                UrbanPark
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Driver Portal
              </span>
            </div>

            {/* Menu Items (matching coordinates and strings) */}
            <nav className="space-y-1.5" id="nav-items-group">
              {[
                { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
                { id: 'vehicles', label: 'Xe của tôi', icon: <Car className="w-4 h-4" /> },
                { id: 'vip', label: 'Đăng ký hàng tháng', icon: <Calendar className="w-4 h-4" /> },
                ...(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'STAFF' ? [
                  { id: 'vip_approval', label: 'Phê duyệt VIP 🌟', icon: <FileText className="w-4 h-4" /> }
                ] : []),
                { id: 'billing', label: 'Lịch sử thanh toán', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'settings', label: 'Cài đặt tài khoản', icon: <Settings className="w-4 h-4" /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeMenu === item.id 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Sidebar Items */}
          <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => {
                setActiveMenu('settings');
                triggerToast('Chuyển hướng đến trung tâm CSKH.', 'info');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Hỗ trợ</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT (COMPLEMENTED WITH HOME STATS AND DETAILS) */}
        <div id="main-panel-hub" className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0b1329]/20">
          
          {/* HEADER TOP STAT BAR (MATCHING THE SCREENSHOT EXACTLY) */}
          <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs select-none relative z-20">
            {/* Left label: Small uppercase description */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-sans tracking-wide font-black text-slate-400 uppercase">
                Quản lý Phương tiện - UrbanPark
              </span>
            </div>

            {/* Centered pill for active menu item */}
            <div className="flex items-center justify-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              <div className="bg-[#EBECEF] dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-lg text-xs font-bold tracking-tight border border-slate-200/50 shadow-2xs">
                {activeMenu === 'home' && 'Trang chủ'}
                {activeMenu === 'vehicles' && 'Phương tiện của tôi'}
                {activeMenu === 'vip' && 'Đăng ký hàng tháng'}
                {activeMenu === 'vip_approval' && 'Phê duyệt VIP'}
                {activeMenu === 'billing' && 'Lịch sử thanh toán'}
                {activeMenu === 'settings' && 'Cài đặt tài khoản'}
              </div>
            </div>

            {/* Right details */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Balance Widget pill button */}
              <button 
                onClick={() => {
                  setBalance(prev => prev + 10.00);
                  triggerToast('Tài khoản Sandbox: Đã tự động nạp thêm $10.00 thành công!', 'success');
                }}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
                title="Click để nạp thêm tiền thử nghiệm"
              >
                <span className="text-slate-400 font-medium">Số dư:</span>
                <span className="text-slate-800 dark:text-white">${balance.toFixed(2)}</span>
              </button>

              {/* Notification icon */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {/* Dropdown notifications */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-850 rounded-2xl shadow-xl border border-slate-150 p-4 space-y-3 z-30"
                    >
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-xs font-bold text-slate-600">Thanh thông báo</span>
                        <button onClick={() => setNotificationCount(0)} className="text-[10px] text-blue-500 hover:underline">Đã đọc hết</button>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 hover:bg-slate-50 rounded-lg">
                          <strong className="block text-blue-600">Đăng ký thành công!</strong>
                          <span className="text-slate-400 text-[10px]">Đăng ký vé tháng bãi xe ô tô được duyệt tự động.</span>
                        </div>
                        <div className="p-2 hover:bg-slate-50 rounded-lg">
                          <strong className="block text-emerald-600">Bảo vệ kích hoạt</strong>
                          <span className="text-slate-400 text-[10px]">Xe 30F-999.78 đã bật radar an ninh bảo mật cấp độ cao nhất.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Help Circle Info icon */}
              <button 
                onClick={() => {
                  triggerToast('Tài liệu hướng dẫn portal của tài xế đã sẵn sàng trong tab Hỗ Trợ.', 'info');
                  setActiveMenu('settings');
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 transition-colors"
                title="Trợ giúp"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Circular Avatar of Nguyen Van */}
              <div 
                className="w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden shadow-xs cursor-pointer select-none"
                onClick={() => setActiveMenu('settings')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </header>

          {/* MAIN SPACE BODY */}
          <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
            
            {/* SUB-VIEW 1: HOME (MATCHING IMAGE SPECIFICATIONS PERFECTLY!) */}
            {activeMenu === 'home' && (
              <div className="space-y-6 animate-fade-in" id="home-sub-view">
                
                {/* Greeting banner */}
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Chào mừng trở lại, {user.name || 'Nguyễn Văn'}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Tổng quan hoạt động và trạng thái xe của bạn hôm nay.
                  </p>
                </div>

                {/* Key Cards Side-by-Side (matching the grid structures in screenshot) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Card - Trạng Thái Hiện Tại (col-span 7) */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
                    {/* Background decor */}
                    <div className="absolute right-0 top-0 w-44 h-44 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Trạng Thái Hiện Tại</h3>
                        <p className="text-xs text-slate-400">
                          {activeVehicle.status === 'DANG_DO' || activeVehicle.status === 'BAO_VE_MAX' 
                            ? 'Xe đang đỗ trong cơ sở' 
                            : 'Xe đang ở ngoài không thuộc bãi đỗ'}
                        </p>
                      </div>
                      
                      {/* Active green badge matched exactly */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide font-sans flex items-center gap-1.5 ${
                        activeVehicle.status === 'DA_OUT' 
                          ? 'bg-slate-105 text-slate-500' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeVehicle.status === 'DA_OUT' ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                        {activeVehicle.status === 'DA_OUT' ? 'ĐÃ RỜI BÃI' : 'ĐANG ĐỖ'}
                      </span>
                    </div>

                    {/* Selector for vehicle to display */}
                    <div className="pt-3 pb-2 flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Xe theo dõi:</span>
                      <div className="flex gap-1.5">
                        {vehicles.map(v => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setActiveVehiclePlate(v.plate);
                              triggerToast(`Đang theo dõi thông tin xe ${v.plate}`, 'info');
                            }}
                            className={`px-2 px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all ${
                              activeVehiclePlate === v.plate 
                                ? 'bg-blue-600 text-white border-blue-500' 
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {v.plate}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Double Sub-cards grid mapped exactly */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      {/* Sub-card 1: Biển Số */}
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-750 rounded-xl p-4 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider block uppercase">BIỂN SỐ NHẬN DIỆN</span>
                        <strong className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-mono tracking-widest block">
                          {activeVehicle.plate}
                        </strong>
                      </div>

                      {/* Sub-card 2: Vị trí ước tính */}
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-750 rounded-xl p-4 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider block uppercase">VỊ TRÍ ƯỚC TÍNH</span>
                        <span className="text-sm font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-1 bg-white/20">
                          <span className="text-blue-500">📍</span> {activeVehicle.location}
                        </span>
                      </div>
                    </div>

                    {/* Extra simulation trigger built nicely inside the card */}
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex items-center justify-between text-[11px] text-slate-400 select-none">
                      <span>Theo dõi thời gian thực bằng camera AI bốt trực</span>
                      <button 
                        onClick={() => triggerTheftSimulation(activeVehicle.plate)}
                        className="text-xs text-rose-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {activeVehicle.isLocked ? '🔒 Test trộm thử' : '🚗 Thử xuất bốt '} &rarr;
                      </button>
                    </div>

                  </div>

                  {/* Right Actions Cards panel (col-span 5) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    
                    {/* Blue Button: Thanh Toán Ngay */}
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-5 rounded-2xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-150 active:scale-95 group text-left cursor-pointer"
                    >
                      <div className="p-3 bg-white/10 rounded-xl">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <strong className="text-base font-bold block">Thanh Toán Ngay</strong>
                        <span className="text-xs text-blue-150 block opacity-90">Thanh toán phí gửi xe vãng lai nhanh không xếp hàng</span>
                      </div>
                    </button>

                    {/* Double interactive actions buttons below */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Search / Find Vehicle */}
                      <button 
                        onClick={() => setIsFindCarOpen(true)}
                        className="bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:shadow-sm transition-all duration-150 flex flex-col items-center text-center justify-center gap-2 cursor-pointer"
                      >
                        <div className="p-2.5 bg-blue-50 dark:bg-slate-800 text-blue-600 rounded-full">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="text-xs font-bold block">Tìm Xe</strong>
                          <span className="text-[10px] text-slate-400 uppercase">Của Tôi</span>
                        </div>
                      </button>

                      {/* Renew / Extend monthly monthly subscriptions */}
                      <button 
                        onClick={() => {
                          setActiveMenu('vip');
                          triggerToast('Chuyển hướng đến bảng đăng ký gia hạn thẻ xe hàng tháng.', 'info');
                        }}
                        className="bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:shadow-sm transition-all duration-150 flex flex-col items-center text-center justify-center gap-2 cursor-pointer"
                      >
                        <div className="p-2.5 bg-sky-50 dark:bg-slate-800 text-sky-600 rounded-full">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="text-xs font-bold block">Gia Hạn</strong>
                          <span className="text-[10px] text-slate-400 uppercase">Vé Tháng</span>
                        </div>
                      </button>
                    </div>

                  </div>

                </div>

                {/* VISUAL CAR SEARCH / RADAR EXPANDABLE WIDGET */}
                <AnimatePresence>
                  {isFindCarOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white dark:bg-slate-900 border border-blue-100 rounded-2xl p-5 shadow-xs space-y-4"
                    >
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
                          <h3 className="text-sm font-bold">Bản Đồ Bãi Xe Nội Khu - Vị Trí Xe</h3>
                        </div>
                        <button 
                          onClick={() => setIsFindCarOpen(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Đóng mô đun
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="space-y-2 col-span-1 text-xs">
                          <p>🎯 Xe của bạn <strong>{activeVehicle.plate}</strong> được xác định đang đỗ tại:</p>
                          <div className="bg-blue-50 p-3 rounded-lg border">
                            <strong className="text-blue-700 block text-xs">{activeVehicle.location}</strong>
                            <span className="text-[10px] text-slate-400">Thời gian đỗ: {activeVehicle.entryTime}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Radar camera ghi nhận xe đã khóa chống trộm bảo mật.</p>
                        </div>
                        
                        {/* Beautiful Visual grid drawing of the parking slots */}
                        <div className="col-span-3 bg-slate-50 p-4 rounded-xl border border-dashed text-center">
                          <span className="text-[10px] font-bold text-slate-400 block mb-2 font-mono">CHỨNG MINH THỰC ĐỊA ZONE A - TẦNG KHU VỰC</span>
                          
                          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                            {Array.from({ length: 15 }).map((_, i) => {
                              const slotNo = i + 1;
                              const isActiveSeat = slotNo === 15;
                              return (
                                <div 
                                  key={slotNo}
                                  className={`p-2 rounded-lg border text-[9px] font-mono font-bold flex flex-col items-center justify-center h-12 transition-all ${
                                    isActiveSeat 
                                      ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30' 
                                      : slotNo % 3 === 0 
                                        ? 'bg-slate-200 text-slate-400 border-slate-300' 
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  }`}
                                >
                                  <span>O-{slotNo}</span>
                                  <span className="text-[8px] scale-90">
                                    {isActiveSeat ? 'MY CAR' : slotNo % 3 === 0 ? 'FULL' : 'EMPTY'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* PAYING QUICK MODAL */}
                <AnimatePresence>
                  {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border"
                      >
                        <h3 className="text-base font-bold pb-2 border-b">Thanh Toán Phí Gửi Xe Qua Ví UrbanPark</h3>
                        <div className="py-4 space-y-3 font-sans text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Biển số thanh toán:</span>
                            <strong className="font-mono text-slate-700">{activeVehicle.plate}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450 text-slate-400">Vị trí đỗ hiện nay:</span>
                            <span className="font-semibold">{activeVehicle.location}</span>
                          </div>
                          <div className="flex justify-between border-t border-dashed pt-2">
                            <span className="text-slate-400">Thời gian vào bãi:</span>
                            <span>{activeVehicle.entryTime}</span>
                          </div>
                          <div className="flex justify-between pb-2 border-b border-dashed">
                            <span className="text-slate-400 font-bold">ĐƠN GIÁ VÃNG LAI:</span>
                            <strong className="text-red-500 font-black">$4.50</strong>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-450 font-bold">Số dư tài khoản:</span>
                            <strong className="text-slate-800">${balance.toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button 
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-4 py-2 border rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button 
                            onClick={handleQuickPayment}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Xác Nhận Trừ Ví ($4.50)
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Hoạt Động Gần Đây (MATCHING RECENT ACTIVITY IN SCREENSHOT) */}
                <div className="space-y-3" id="recent-activity-section">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      Hoạt Động Gần Đây
                    </h3>
                    <button 
                      onClick={() => triggerToast('Lịch sử đã tổng hợp hết giao dịch hiện thời!', 'info')}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Xem tất cả
                    </button>
                  </div>

                  {/* Clean responsive table as illustrated in the mockup (Vietnamese headers) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                          <th className="p-4">Thời Gian</th>
                          <th className="p-4">Sự Kiện</th>
                          <th className="p-4">Biển Số</th>
                          <th className="p-4 text-right">Phí</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activities.map((act) => (
                          <tr 
                            key={act.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                          >
                            <td className="p-4 font-mono font-medium text-slate-500 dark:text-slate-300">
                              {act.time}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 font-bold font-sans">
                                <span className={`w-2 h-2 rounded-full ${
                                  act.event === 'Xe vào' ? 'bg-emerald-500' : 'bg-red-500'
                                }`} />
                                {act.event}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-100 tracking-wider">
                              {act.plate}
                            </td>
                            <td className={`p-4 text-right font-mono font-bold ${
                              act.cost.startsWith('-$') ? 'text-red-500' : 'text-slate-400'
                            }`}>
                              {act.cost}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Simulator action directly under recent activity */}
                  <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">Thử Nghiệm Tự Động Hóa Xe Vào/Ra</span>
                      <p className="text-[11.5px] text-slate-400 font-normal">Sắp đặt hành trình mô phỏng sự kiện đi qua bốt nhận dạng biển số.</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                          const newAct: Activity = {
                            id: `ACT-${Date.now()}`,
                            time: `Hôm nay, ${timeNow}`,
                            event: 'Xe vào',
                            plate: activeVehiclePlate,
                            cost: '--'
                          };
                          setActivities(prev => [newAct, ...prev]);

                          setVehicles(prev => prev.map(v => {
                            if (v.plate === activeVehiclePlate) {
                              return { ...v, status: 'DANG_DO', location: 'Khu A • Tầng 2', entryTime: `Hôm nay, ${timeNow}` };
                            }
                            return v;
                          }));
                          triggerToast(`Đã nhận dạng xe ${activeVehiclePlate} đi qua BỐT VÀO lúc ${timeNow}!`, 'success');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Mô phỏng Xe Vào bãi 🟢
                      </button>
                      <button 
                        onClick={() => triggerTheftSimulation(activeVehiclePlate)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Mô phỏng Xe Ra bãi 🔴
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SUB-VIEW 2: XE CỦA TÔI (MY VEHICLES SECTION) */}
            {activeMenu === 'vehicles' && (
              <div className="space-y-6 animate-fade-in" id="vehicles-sub-view">
                
                {/* Heading section with "+ Thêm xe mới" right-aligned */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 block">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">Phương tiện của tôi</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-sans">Quản lý các phương tiện đã đăng ký để ra vào hệ thống UrbanPark.</p>
                  </div>
                  <button
                    onClick={() => {
                      setAddFormType('Ô tô');
                      setAddFormPlate('');
                      setAddFormBrand('');
                      setAddFormDetailType('');
                      setIsAddVehicleModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1528] hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm xe mới</span>
                  </button>
                </div>

                {/* Vehicles Grid layout reproducing the custom cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map(v => {
                    const hasVip = vipSubscriptions.some(sub => sub.vehicle_plate === v.plate && sub.status === 'ACTIVE');
                    return (
                      <div 
                        key={v.id}
                        className={`bg-white dark:bg-slate-900 border ${
                          v.isLocked ? 'border-rose-400 dark:border-rose-900/50 shadow-md shadow-rose-100/50 dark:shadow-none' : 'border-slate-200 dark:border-slate-800'
                        } rounded-2xl overflow-hidden flex flex-col justify-between min-h-[352px] transition-all hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700`}
                      >
                        {/* Upper image/icon section */}
                        {v.image ? (
                          <div className="relative h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                            <img 
                              referrerPolicy="no-referrer"
                              src={v.image} 
                              alt={v.brand || v.plate} 
                              className="w-full h-full object-cover"
                            />
                            {/* Blinking green active badge */}
                            <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800/50 shadow-xs py-1 px-3 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{v.plate === '30G-123.45' ? 'HOẠT ĐỘNG NG' : 'HOẠT ĐỘNG'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative h-44 bg-[#F5F6F8] dark:bg-slate-800/40 p-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80">
                            {/* Standard bike SVG representation in gray */}
                            <div className="w-20 h-20 text-slate-300 dark:text-slate-650 flex items-center justify-center">
                              <svg className="w-16 h-16 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="5" cy="18" r="3" />
                                <circle cx="19" cy="18" r="3" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18V9h4.5M12 12h5m-8.5-3H5v2" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9L9 6H5" />
                              </svg>
                            </div>

                            {/* Blinking green active badge */}
                            <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800 shadow-xs py-1 px-3 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>HOẠT ĐỘNG</span>
                            </div>
                          </div>
                        )}

                        {/* Lower informative section */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Plate row with type icon */}
                            <div className="flex justify-between items-center">
                              <span className="font-sans text-xl font-black tracking-tight text-slate-800 dark:text-white">
                                {v.plate}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {hasVip && (
                                  <span className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-800 dark:text-yellow-450 text-[8px] font-black tracking-wide rounded border border-yellow-300">VIP</span>
                                )}
                                {v.type === 'Ô tô' ? (
                                  <Car className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <Bike className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Subtitle brand name */}
                            <p className="text-xs text-slate-450 dark:text-slate-500 font-medium mt-0.5 font-sans">
                              {v.brand || (v.type === 'Ô tô' ? 'Toyota Camry' : 'Honda SH')}
                            </p>
                          </div>

                          {/* Horizontal divider */}
                          <div className="border-t border-slate-100 dark:border-slate-800" />

                          {/* Double column data */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block font-sans">LOẠI XE</span>
                              <span className="text-xs font-semibold text-slate-750 dark:text-slate-300 block mt-0.5 font-sans">
                                {v.detailType || (v.type === 'Ô tô' ? 'Ô tô 4 chỗ' : 'Xe máy')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block font-sans">NGÀY ĐĂNG KÝ</span>
                              <span className="text-xs font-semibold text-slate-750 dark:text-slate-300 block mt-0.5 font-sans">
                                {v.detailType || (v.type === 'Ô tô' ? 'Ô tô 4 chỗ' : 'Xe máy')}
                              </span>
                            </div>
                          </div>

                          {/* Action detail button */}
                          <button
                            onClick={() => setSelectedDetailVehicle(v)}
                            className="w-full py-2 bg-[#F2F2F4] hover:bg-[#E4E4E6] dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg tracking-tight transition-all active:scale-98 cursor-pointer text-center font-sans"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Card 3: Thêm xe mới (Dashed Card) */}
                  <div 
                    onClick={() => {
                      setAddFormType('Ô tô');
                      setAddFormPlate('');
                      setAddFormBrand('');
                      setAddFormDetailType('');
                      setIsAddVehicleModalOpen(true);
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-500/50 dark:border-slate-800 dark:hover:border-blue-500/40 bg-white/40 dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[352px] transition-all duration-200 group creative-card"
                  >
                    <div className="w-12 h-12 bg-[#EBECEF] dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4 shadow-subtle group-hover:scale-105 transition-transform">
                      <Plus className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 font-sans">Thêm xe mới</h3>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 max-w-[200px] leading-relaxed font-sans">
                      Đăng ký xe mới để sử dụng dịch vụ bãi đỗ tự động.
                    </p>
                  </div>
                </div>

                {/* Alarm Simulation Area preserved for safety (neatly rendered below) */}
                <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                    <div>
                      <strong className="text-sm font-black text-slate-800 dark:text-white block font-sans">Hệ Thống Mô Phỏng - Radar &amp; Bốt Guard AI</strong>
                      <span className="text-[10px] text-slate-400 block font-mono">Giả lập camera AI quét biển, đóng/mở gạt barie và phát còi cảnh báo đột nhập</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans">
                    Chọn một xe và mô phỏng xe lăn bánh vào/ra qua Bốt để Camera AI ghi nhận trực tiếp. Nếu xe đang bật <strong>Bảo vệ chống trộm (Khóa đỏ)</strong>, mô phỏng hành vi ra bãi sẽ ngay lập tức kích hoạt rào thép &amp; còi hú kịch khung.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select 
                      value={activeVehiclePlate}
                      onChange={e => setActiveVehiclePlate(e.target.value)}
                      className="px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono outline-hidden font-bold text-xs text-slate-800 dark:text-white shrink-0 w-full sm:w-auto"
                    >
                      {vehicles.map(v2 => (
                        <option key={v2.id} value={v2.plate}>
                          {v2.plate} ({v2.brand}) • {v2.isLocked ? '🔒 KHÓA MẠNH' : '🔓 TỰ DO'}
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <button 
                        onClick={() => {
                          const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                          const newAct: Activity = {
                            id: `ACT-${Date.now()}`,
                            time: `Hôm nay, ${timeNow}`,
                            event: 'Xe vào',
                            plate: activeVehiclePlate,
                            cost: '--'
                          };
                          setActivities(prev => [newAct, ...prev]);

                          setVehicles(prev => prev.map(v => {
                            if (v.plate === activeVehiclePlate) {
                              return { ...v, status: 'DANG_DO', location: 'Khu A • Ô số 15', entryTime: `Hôm nay, ${timeNow}` };
                            }
                            return v;
                          }));
                          triggerToast(`Đã nhận dạng xe ${activeVehiclePlate} đi qua BỐT VÀO lúc ${timeNow}! Barie tự động nâng rảnh tay.`, 'success');
                        }}
                        className="px-4 py-2 bg-[#0B1528] hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all active:scale-97 font-sans"
                      >
                        Mô phỏng Xe Vào bãi 🟢
                      </button>
                      <button 
                        onClick={() => {
                          const sessionMatch = vehicles.find(v => v.plate === activeVehiclePlate);
                          if (sessionMatch?.isLocked) {
                            triggerTheftSimulation(activeVehiclePlate);
                          } else {
                            const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                            const newAct: Activity = {
                              id: `ACT-${Date.now()}`,
                              time: `Hôm nay, ${timeNow}`,
                              event: 'Xe ra',
                              plate: activeVehiclePlate,
                              cost: '-$4.50'
                            };
                            setActivities(prev => [newAct, ...prev]);
                            setVehicles(prev => prev.map(v => {
                              if (v.plate === activeVehiclePlate) {
                                return { ...v, status: 'DA_OUT', location: 'Ngoài khu', entryTime: '--' };
                              }
                              return v;
                            }));
                            setBalance(prev => Math.max(0, prev - 4.50));
                            triggerToast(`Đã nhận diện biển số ${activeVehiclePlate} ra bốt lúc ${timeNow}. Tài khoản tự động trừ $4.50.`, 'info');
                          }
                        }}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl cursor-pointer transition-all active:scale-97 font-sans"
                      >
                        Mô phỏng Xe Ra bãi 🔴
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW 3: ĐĂNG KÝ HÀNG THÁNG (MONTHLY PASS & DOC PROOFS) */}
            {activeMenu === 'vip' && (
              <div className="space-y-6 animate-fade-in" id="vip-sub-view">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký mới / Gia hạn vé tháng VIP</h2>
                  <p className="text-slate-400 text-xs">Phí tháng ưu đãi, sử dụng camera nhận biển số bốt AI vào/ra bãi không cần check-in thẻ vật lý rườm rà.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Form registration */}
                  <div className="bg-white p-6 rounded-2xl border space-y-4">
                    <strong className="text-sm font-bold border-b pb-2 block text-slate-800">Biểu Mẫu Tờ Khai Định Danh Xe</strong>
                    
                    <form onSubmit={handleOpenVnpaySubmit} className="space-y-4 text-xs">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Phương tiện gắn thẻ</label>
                          <select 
                            value={selectedVipPlate} 
                            onChange={e => setSelectedVipPlate(e.target.value)}
                            className="w-full px-3.5 py-2.5 border rounded-xl outline-hidden bg-white text-slate-700 font-bold font-mono"
                          >
                            {vehicles.map(v => (
                              <option key={v.id} value={v.plate}>{v.plate} ({v.type})</option>
                            ))}
                            <option value="custom">✍️ Thêm phương tiện mới...</option>
                          </select>
                        </div>

                        {selectedVipPlate === 'custom' && (
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Biển số tự chọn</label>
                            <input 
                              type="text" 
                              value={customPlateInput}
                              onChange={e => setCustomPlateInput(e.target.value)}
                              placeholder="Ví dụ: 30A-999.9F"
                              className="w-full px-3.5 py-2 border rounded-xl outline-hidden font-bold font-mono text-slate-800 bg-white"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gói cước phân phối</label>
                          <select 
                            value={vipPackageType} 
                            onChange={e => setVipPackageType(e.target.value)}
                            className="w-full px-3.5 py-2.5 border rounded-xl outline-hidden bg-white text-slate-700 font-bold"
                          >
                            <option value="Gói Thẻ Vàng (Gold) - $45.00/Tháng">🏆 Thẻ Vàng (Gold) - $45.00/Tháng</option>
                            <option value="Gói Kim Cương (VIP) - $120.00/Quý">💎 Thẻ Kim Cương (Bảo vệ AI) - $120.00/Quý</option>
                          </select>
                        </div>
                      </div>

                      {/* Documents uploading sections */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Tài Liệu Đập Mình Chứng</span>

                        {/* Doc 1: Car Photo Plate */}
                        <div className="p-3.5 rounded-xl border border-dashed bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <strong className="text-xs block">1. Cà Vẹt (Đăng Ký Xe Ô Tô/Xe Máy)</strong>
                              <span className="text-[10px] text-slate-400">Hình chụp trực diện đăng ký chính chủ</span>
                            </div>
                          </div>

                          {uploadedPhotos.carPlate ? (
                            <div className="flex items-center gap-2">
                              <img src={uploadedPhotos.carPlate} className="w-10 h-10 object-cover rounded-lg border" alt="Car doc" />
                              <button type="button" onClick={() => setUploadedPhotos(prev => ({ ...prev, carPlate: null }))} className="text-red-500 text-[11px] font-bold hover:underline">Xóa</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => simulatePhotoUpload('carPlate')}
                              disabled={uploadStatus.carPlate === 'UPLOADING'}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg tracking-wide uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>{uploadStatus.carPlate === 'UPLOADING' ? 'TẢI...' : 'UPLOAD'}</span>
                            </button>
                          )}
                        </div>

                        {/* Doc 2: CMND/CCCD */}
                        <div className="p-3.5 rounded-xl border border-dashed bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-violet-600" />
                            <div>
                              <strong className="text-xs block">2. Bản chụp CMND/CCCD/Hộ Chiếu</strong>
                              <span className="text-[10px] text-slate-400">Bản gốc định danh số khớp bảo mật</span>
                            </div>
                          </div>

                          {uploadedPhotos.idCard ? (
                            <div className="flex items-center gap-2">
                              <img src={uploadedPhotos.idCard} className="w-10 h-10 object-cover rounded-lg border" alt="id doc" />
                              <button type="button" onClick={() => setUploadedPhotos(prev => ({ ...prev, idCard: null }))} className="text-red-500 text-[11px] font-bold hover:underline">Xóa</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => simulatePhotoUpload('idCard')}
                              disabled={uploadStatus.idCard === 'UPLOADING'}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg tracking-wide uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>{uploadStatus.idCard === 'UPLOADING' ? 'TẢI...' : 'UPLOAD'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer pt-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Mở Cổng Thanh Toán VNPay Sandbox</span>
                      </button>

                    </form>
                  </div>

                  {/* Active Packages lists */}
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl border space-y-3">
                      <strong className="text-sm font-bold border-b pb-2 block text-slate-800">Các Gói Vé Đang Hoạt Động Của Bạn</strong>
                      
                      {vipSubscriptions.length === 0 ? (
                        <p className="text-xs text-slate-400">Bạn chưa đăng ký thẻ tháng cho phương tiện nào.</p>
                      ) : (
                        <div className="space-y-3">
                          {vipSubscriptions.map(s => (
                            <div key={s.id} className="p-4 rounded-xl border bg-slate-50 flex justify-between items-center text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border">{s.vehicle_plate}</span>
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>
                                </div>
                                <span className="text-[11px] text-slate-500 block">{s.type}</span>
                                <span className="text-[10px] text-slate-400 block">Thời hạn: {s.startDate} &rarr; {s.endDate}</span>
                              </div>
                              <span className="text-blue-500 hover:underline font-bold text-[11px] cursor-pointer">Xử lý gia hạn &rarr;</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50/50 border border-blue-105 rounded-2xl p-4 text-xs text-blue-800 flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-0.5">Tiện ích đặc quyền VIP Thẻ Tháng:</strong>
                        <p className="text-[11px] leading-relaxed">
                          Hệ thống AI camera tại cổng tự ghi nhận biển số và nâng Barie rảnh tay chưa đầy 480ms. Bạn không cần thanh toán đơn lẻ tại trạm. Đăng ký được duyệt tự động ngay sau khi hoàn thành giao dịch sandbox.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* VNPAY SANDBOX FRAME MODAL */}
                <AnimatePresence>
                  {isVnpaySandboxOpen && (
                    <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="bg-[#0c2040] text-white rounded-3xl p-6 shadow-2xl w-full max-w-md border-2 border-blue-500"
                      >
                        <div className="pb-3 border-b border-white/10 flex justify-between items-center text-center">
                          <span className="text-xs font-mono tracking-widest text-[#00b5f1] font-bold">CỔNG TIẾU CHI VN-PAY SANDBOX</span>
                          <span className="text-xs font-bold font-mono">Bản thử 2.0</span>
                        </div>

                        <div className="py-6 text-center space-y-4">
                          <div className="w-12 h-12 rounded-full border bg-white/10 flex items-center justify-center text-white mx-auto">
                            <CreditCard className="w-6 h-6 animate-pulse" />
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">DỰ KIẾN TRỪ PHÍ GIAO DỊCH</span>
                            <strong className="text-2xl font-black text-[#00b5f1] break-all block">
                              {vipPackageType.includes('$45.00') ? '$45.00' : '$120.00'}
                            </strong>
                            <span className="text-[10px] text-emerald-400 block">Đã được miễn phí chuyển khoản Sandbox</span>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-2 text-xs text-left">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Merchant:</span>
                              <strong className="text-slate-200">UrbanPark Tech Corp</strong>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Mã đơn hàng:</span>
                              <span className="text-slate-200 font-mono tracking-wide">UP_99812_SAND</span>
                            </div>
                            <div className="flex justify-between text-[11px] pb-1 border-b border-white/5">
                              <span className="text-slate-400">Đăng kiểm xe:</span>
                              <span className="text-slate-200 font-mono font-bold">
                                {selectedVipPlate === 'custom' ? customPlateInput.toUpperCase() : selectedVipPlate}
                              </span>
                            </div>

                            <div className="space-y-1.5 pt-2">
                              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Nhập mã xác thực OTP Sandbox</label>
                              <input 
                                type="text" 
                                value={vnpayOtpInput}
                                onChange={e => setVnpayOtpInput(e.target.value)}
                                placeholder="Gõ: 1234 (Để xác nhận sandbox)"
                                className="w-full text-center py-2 bg-slate-900 border border-white/20 rounded font-bold font-mono tracking-widest text-[#00b5f1]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setIsVnpaySandboxOpen(false)}
                            className="flex-1 py-2.5 rounded-xl border border-white/20 text-xs font-semibold hover:bg-white/5 cursor-pointer text-center"
                          >
                            Hủy giao dịch
                          </button>
                          <button 
                            type="button"
                            onClick={handleConfirmVnpay}
                            className="flex-1 py-2.5 bg-[#00b5f1] hover:bg-[#009bcf] text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer text-center"
                          >
                            ĐỒNG Ý THANH TOÁN
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* MODAL: ĐĂNG KÝ PHƯƠNG TIỆN MỚI */}
                <AnimatePresence>
                  {isAddVehicleModalOpen && (
                    <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4"
                      >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                          <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white font-sans">Đăng ký phương tiện</h3>
                          <button 
                            type="button" 
                            onClick={() => setIsAddVehicleModalOpen(false)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-bold text-xs animate-none cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <form onSubmit={handleModalCreateVehicle} className="space-y-4">
                          {/* Plate Number */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">Biển số xe</label>
                            <input 
                              type="text" 
                              value={addFormPlate}
                              onChange={e => setAddFormPlate(e.target.value)}
                              placeholder="Ví dụ: 30G-123.45"
                              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-250/60 dark:border-slate-800 rounded-xl font-bold font-mono tracking-widest text-[#0B1528] dark:text-white uppercase outline-hidden focus:border-blue-500 text-xs"
                              required
                            />
                          </div>

                          {/* Brand Model name */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">Thương hiệu / Dòng xe</label>
                            <input 
                              type="text" 
                              value={addFormBrand}
                              onChange={e => setAddFormBrand(e.target.value)}
                              placeholder="Ví dụ: Toyota Camry, Honda SH..."
                              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-250/60 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white text-xs outline-hidden focus:border-blue-500"
                            />
                          </div>

                          {/* Standard Categories Selection */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">Phân loại</label>
                              <select 
                                value={addFormType}
                                onChange={e => {
                                  setAddFormType(e.target.value);
                                  // automatically sync detail classification default
                                  if (e.target.value === 'Ô tô') {
                                    setAddFormDetailType('Ô tô 4 chỗ');
                                  } else {
                                    setAddFormDetailType('Xe máy');
                                  }
                                }}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-250/60 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white text-xs outline-hidden focus:border-blue-500 cursor-pointer"
                              >
                                <option value="Ô tô">🚗 Ô tô</option>
                                <option value="Xe máy">🏍️ Xe máy</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">Phân khúc</label>
                              <select 
                                value={addFormDetailType}
                                onChange={e => setAddFormDetailType(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-250/60 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white text-xs outline-hidden focus:border-blue-500 cursor-pointer"
                              >
                                {addFormType === 'Ô tô' ? (
                                  <>
                                    <option value="Ô tô 4 chỗ">Ô tô 4 chỗ</option>
                                    <option value="Ô tô 7 chỗ">Ô tô 7 chỗ</option>
                                    <option value="Bán tải">Bán tải</option>
                                    <option value="SUV Hạng Sang">SUV Hạng Sang</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="Xe máy">Xe tay ga (SH, Vespa...)</option>
                                    <option value="Xe số">Xe số phổ thông</option>
                                    <option value="Mô tô">Mô tô PKL</option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button 
                              type="button"
                              onClick={() => setIsAddVehicleModalOpen(false)}
                              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-center"
                            >
                              Hủy
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 py-2.5 bg-[#0B1528] hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wide cursor-pointer text-center"
                            >
                              Đăng ký
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* MODAL: CHI TIẾT PHƯƠNG TIỆN & CHỐNG TRỘM RADAR */}
                <AnimatePresence>
                  {selectedDetailVehicle && (
                    <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4 relative overflow-hidden"
                      >
                        {/* Status Badge */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">Thông tin biển số</span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-sans mt-0.5">{selectedDetailVehicle.plate}</h3>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                              selectedDetailVehicle.status === 'DA_OUT' 
                                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' 
                                : selectedDetailVehicle.status === 'BAO_VE_MAX' 
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse font-black' 
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                            }`}>
                              {selectedDetailVehicle.status === 'DA_OUT' ? 'Ngoại khu' : selectedDetailVehicle.status === 'BAO_VE_MAX' ? 'BẢO VỆ MAX 🔒' : 'ĐANG ĐỖ 🟢'}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setSelectedDetailVehicle(null)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Image preview */}
                        {selectedDetailVehicle.image ? (
                          <div className="h-40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                            <img 
                              referrerPolicy="no-referrer"
                              src={selectedDetailVehicle.image} 
                              alt="car" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="h-40 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                            <Bike className="w-10 h-10 stroke-[1.5] text-slate-350" />
                            <span className="text-[10px] font-medium tracking-tight mt-1">Phương tiện gắn máy (SH/Vespa)</span>
                          </div>
                        )}

                        {/* Metadata blocks */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-150/40 dark:border-slate-800/60 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-medium font-sans">Hãng xe/Model</span>
                            <strong className="text-slate-700 dark:text-slate-200 font-bold font-sans">{selectedDetailVehicle.brand || 'Honda SH'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-medium font-sans">Bố trí bãi đỗ</span>
                            <strong className="text-slate-700 dark:text-slate-200 font-bold font-sans">{selectedDetailVehicle.location || 'Chưa vào bãi'}</strong>
                          </div>
                          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-850">
                            <span className="text-slate-400 block text-[10px] font-medium font-sans">Dịch vụ tháng</span>
                            <strong className="text-slate-700 dark:text-slate-200 font-bold font-sans">
                              {vipSubscriptions.some(s => s.vehicle_plate === selectedDetailVehicle.plate && s.status === 'ACTIVE') ? 'Vé VIP 🌟' : 'Khách thường'}
                            </strong>
                          </div>
                          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-850">
                            <span className="text-slate-400 block text-[10px] font-medium font-sans">Thời điểm vào bãi</span>
                            <strong className="text-slate-700 dark:text-slate-200 font-bold font-sans">{selectedDetailVehicle.entryTime || '--'}</strong>
                          </div>
                        </div>

                        {/* Lock / Protect module */}
                        <div className="p-4 rounded-2xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/[0.02] space-y-3">
                          <div className="flex justify-between items-center gap-2">
                            <div className="space-y-0.5 flex-1">
                              <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-widest block font-mono">AN NINH TRỘM CHUYÊN SÂU</span>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Khóa cứng bánh quay &amp; còi động cơ báo động tại cổng.</p>
                            </div>
                            
                            <button 
                              onClick={() => {
                                handleToggleLock(selectedDetailVehicle.id);
                                // Sync local state in modal instantly
                                setSelectedDetailVehicle(prev => prev ? { ...prev, isLocked: !prev.isLocked } : null);
                              }}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                                selectedDetailVehicle.isLocked 
                                  ? 'bg-rose-600 text-white hover:bg-rose-700' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {selectedDetailVehicle.isLocked ? <Lock className="w-4.5 h-4.5 text-rose-300" /> : <Unlock className="w-4.5 h-4.5 text-slate-400" />}
                            </button>
                          </div>

                          {selectedDetailVehicle.isLocked && (
                            <div className="bg-rose-500/10 border border-rose-200/30 p-2.5 rounded-xl text-center">
                              <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider block animate-pulse">🔒 ĐỒNG BỘ CHỐNG CƯỚP ĐANG BẬT</span>
                              <button
                                type="button"
                                onClick={() => {
                                  // Close modal first and run simulation
                                  const tempPlate = selectedDetailVehicle.plate;
                                  setSelectedDetailVehicle(null);
                                  triggerTheftSimulation(tempPlate);
                                }}
                                className="mt-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black tracking-tight cursor-pointer uppercase font-sans inline-block"
                              >
                                Thử Đột Nhập Thử Nghiệm 🚨
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Close and Delete buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button 
                            type="button"
                            onClick={() => {
                              const confirmDel = window.confirm(`Bạn có chắc chắn muốn xóa phương tiện ${selectedDetailVehicle.plate} khỏi danh sách?`);
                              if (confirmDel) {
                                setVehicles(prev => prev.filter(v => v.id !== selectedDetailVehicle.id));
                                setSelectedDetailVehicle(null);
                                triggerToast(`Đã gỡ bỏ xe ${selectedDetailVehicle.plate} khỏi tài khoản!`, 'info');
                              }
                            }}
                            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-900/30 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                            title="Xóa xe khỏi danh sách"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSelectedDetailVehicle(null)}
                            className="flex-1 py-2.5 bg-[#0B1528] hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase cursor-pointer text-center font-sans"
                          >
                            Đóng
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </div>
            )}

            {/* SUB-VIEW 4: BILLING HISTORY (RECEIPTS AND FEES) */}
            {activeMenu === 'billing' && (
              <div className="space-y-6 animate-fade-in" id="billing-sub-view">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nhật Ký Thanh Toán / Hóa Đơn</h2>
                  <p className="text-slate-400 text-xs">Xem lại lịch sử thanh toán ví, hóa đơn khấu trừ vé vãng lai & gia hạn vé VIP của bạn.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <strong className="text-sm font-bold text-slate-800">Sổ dư tích dụng ví gửi xe</strong>
                    <button 
                      onClick={() => {
                        setBalance(100.00);
                        triggerToast('Tài khoản Sandbox: Khôi phục số dư $100.00 chính xác!', 'success');
                      }} 
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Reset Số Dư ($100.00)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">HẠN MỨC VÍ ĐIỆN TỬ URBANPARK</span>
                      <strong className="text-2xl font-black text-slate-800">${balance.toFixed(2)}</strong>
                      <span className="text-[10px] text-emerald-600 block flex items-center gap-1">🔒 SECURE WALLET • ENCRYPTED</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Nạp tiền Sandbox nhanh</span>
                      <p className="text-[11px] text-slate-450 text-slate-400 mb-1">Dùng để test giao dịch khấu trừ vé xe.</p>
                      <button 
                        onClick={() => {
                          setBalance(prev => prev + 20.00);
                          triggerToast('Tài khoản Sandbox: Đã tự động nạp $20.00 thành công!', 'success');
                        }}
                        className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer text-center block w-full"
                      >
                        + Nạp Trực Tiếp $20.00 Sandbox
                      </button>
                    </div>
                  </div>
                </div>

                {/* Receipts table ledger */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-400 font-bold">
                        <th className="p-4">Thời gian</th>
                        <th className="p-4">Mã giao dịch</th>
                        <th className="p-4">Nội dung thanh toán</th>
                        <th className="p-4 text-right">Giá trị khấu trừ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-650">
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono">13/06/2026, 11:20</td>
                        <td className="p-4 font-mono">UP_PAY_9881</td>
                        <td className="p-4">Thanh toán phí đỗ xe 30A-123.45 vãng lai qua cổng bốt di dời</td>
                        <td className="p-4 text-right text-red-500 font-bold">-$4.50</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono">11/06/2026, 08:30</td>
                        <td className="p-4 font-mono">UP_PAY_8123</td>
                        <td className="p-4">Gia hạn Vé tháng Gold 30A-123.45 (VNPay sandbox)</td>
                        <td className="p-4 text-right text-red-500 font-bold">-$45.00</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono">10/06/2026, 17:00</td>
                        <td className="p-4 font-mono">UP_TOP_1290</td>
                        <td className="p-4">Nạp tiền vào tài khoản Portal tài xế (Mô hình sandbox test)</td>
                        <td className="p-4 text-right text-emerald-600 font-bold">+$50.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* SUB-VIEW: VIP APPROVAL (MANAGER CONSOLE) */}
            {activeMenu === 'vip_approval' && (
              <div className="animate-fade-in" id="vip-approval-sub-view">
                <VipApprovalPanel 
                  isDarkMode={isDarkMode} 
                  triggerToast={triggerToast} 
                />
              </div>
            )}

            {/* SUB-VIEW 5: SETTINGS & SUPPORT (CHATBOT & ACCESSIBILITY) */}
            {activeMenu === 'settings' && (
              <div className="space-y-6 animate-fade-in" id="settings-sub-view">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hỗ Trợ &amp; Thiết Lập Tài Khoản</h2>
                  <p className="text-slate-400 text-xs">Cấu hình hồ sơ, thay đổi bảo mật và trò chuyện cùng trợ lý AI bốt kiểm soát hỗ trợ.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Account Information editing */}
                  <div className="bg-white p-6 rounded-2xl border space-y-4">
                    <strong className="text-sm font-bold border-b pb-2 block text-slate-800">Thông Tin Tài Khoản Tài Xế</strong>
                    
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Họ và tên tài xế</label>
                        <input 
                          type="text" 
                          defaultValue={user.name || 'Nguyễn Văn'} 
                          className="w-full px-3.5 py-2 border rounded-xl outline-hidden font-bold text-slate-800 bg-slate-50" 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Mã điện thoại định danh</label>
                        <input 
                          type="text" 
                          defaultValue={user.phone || '0901234567'} 
                          className="w-full px-3.5 py-2 border rounded-xl outline-hidden font-mono text-slate-800 bg-slate-50" 
                          disabled 
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Cấp độ phân quyền hệ thống</label>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold font-mono">
                          {user.role || 'ROLE_DRIVER'}
                        </span>
                      </div>
                      <div className="pt-2">
                        <button 
                          type="button"
                          onClick={() => triggerToast('Tính năng sửa đổi thông tin đã bị tắt trong bản demo an toàn.', 'info')}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-[11px]"
                        >
                          Cập nhật mật khẩu cá nhân
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Support Chat Simulator */}
                  <div className="bg-white p-6 rounded-2xl border flex flex-col justify-between min-h-[350px]">
                    <div className="space-y-3">
                      <strong className="text-sm font-bold border-b pb-2 block text-slate-800">Trợ Lý AI Trung Tâm Điều Hành</strong>
                      
                      {/* Chat screen */}
                      <div className="h-52 overflow-y-auto border rounded-xl p-3 bg-slate-50 space-y-2 text-xs">
                        {chatMessages.map((msg, i) => (
                          <div 
                            key={i} 
                            className={`p-2.5 rounded-xl max-w-[85%] ${
                              msg.sender === 'bot' 
                                ? 'bg-blue-600 text-white mr-auto' 
                                : 'bg-slate-200 text-slate-800 ml-auto'
                            }`}
                          >
                            <span>{msg.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={sendChatMessage} className="flex gap-2 pt-3">
                      <input 
                        type="text" 
                        value={userChatInput}
                        onChange={e => setUserChatInput(e.target.value)}
                        placeholder="Hỏi về khóa chống trộm, thanh toán..." 
                        className="flex-1 px-3.5 py-2 border rounded-xl outline-hidden text-xs bg-white text-slate-800 focus:border-blue-500"
                      />
                      <button 
                        type="submit"
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}
          <footer className="border-t border-slate-200 dark:border-slate-850 p-4 text-center text-[10px] font-mono tracking-wider text-slate-400 bg-white dark:bg-slate-900 select-none">
            URBANPARK • SHIELD SECURITY ACTIVE PROTECTION FRAMEWORK © {new Date().getFullYear()}
          </footer>

        </div>

      </div>

    </div>
  );
}
