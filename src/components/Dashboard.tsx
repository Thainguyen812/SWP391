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
  Download,
  PlusCircle,
  Plus,
  Bike,
  Sparkles,
  Info,
  Trash2,
  Send,
  Compass,
  Map,
  BadgeAlert,
  ChevronDown,
  ChevronUp,
  Headphones,
  Mail,
  Paperclip,
  Activity
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
  event: 'Xe vào' | 'Xe ra' | 'Đăng ký VIP' | 'Mua vé ngày';
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
  const [activeMenu, setActiveMenu] = useState<'home' | 'vehicles' | 'vip' | 'vip_approval' | 'billing' | 'settings' | 'support'>('billing');
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
          image: item.image || (item.plate.startsWith('30') ? 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80' : undefined)
        }));
      } catch (err) {
        console.error(err);
      }
    }
    return [
      { 
        id: 'V-1', 
        plate: '30A-123.45', 
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
        id: 'V-3', 
        plate: '29M1-678.90', 
        type: 'Xe máy', 
        brand: 'Honda SH', 
        detailType: 'Xe máy', 
        location: 'Khu B • Tầng B1', 
        status: 'DANG_DO', 
        entryTime: 'Mới đăng ký', 
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [vipPackageType, setVipPackageType] = useState('Thẻ Tháng VIP');
  const [billingMethod, setBillingMethod] = useState('Ví UrbanPark');
  const [isVnpaySandboxOpen, setIsVnpaySandboxOpen] = useState(false);
  const [vnpayOtpInput, setVnpayOtpInput] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<{ carPlate: string | null; idCard: string | null }>({ carPlate: null, idCard: null });
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});

  const handleVipCheckout = () => {
    const isMonthly = vipPackageType === 'Thẻ Tháng VIP';
    const priceUSD = isMonthly ? 40.00 : 2.00;
    const priceVNDStr = isMonthly ? '1,000,000đ' : '50,000đ';
    const packLabel = isMonthly ? 'Thẻ Tháng VIP' : 'Vé Ngày';

    if (billingMethod === 'Ví UrbanPark') {
      if (balance < priceUSD) {
        triggerToast(`Số dư ví không đủ để thanh toán ${priceVNDStr} (Khoảng $${priceUSD.toFixed(2)})! Vui lòng nạp thêm tiền.`, 'error');
        return;
      }
      setBalance(prev => Math.max(0, prev - priceUSD));
    }

    const newSub: VipSubscription = {
      id: `VIP-${Date.now().toString().slice(-4)}`,
      vehicle_plate: selectedVipPlate,
      type: packLabel,
      startDate: isMonthly ? '01/11' : new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      endDate: isMonthly ? '30/11' : new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      status: 'ACTIVE'
    };

    setVipSubscriptions(prev => [newSub, ...prev]);

    // Add activity record
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      time: `Hôm nay, ${timeNow}`,
      event: isMonthly ? 'Đăng ký VIP' : 'Mua vé ngày',
      plate: selectedVipPlate,
      cost: billingMethod === 'Ví UrbanPark' ? `-$${priceUSD.toFixed(2)}` : 'Trực tiếp'
    };
    setActivities(prev => [newAct, ...prev]);

    triggerToast(`🎉 Kích hoạt ${packLabel} thành công cho xe ${selectedVipPlate}!`, 'success');
  };

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
  const [billingTimeFilter, setBillingTimeFilter] = useState('Tháng này');
  const [billingTypeFilter, setBillingTypeFilter] = useState('Tất cả');

  // Interactive profile settings states
  const [profileName, setProfileName] = useState('Nguyễn Văn A');
  const [profileEmail, setProfileEmail] = useState('nguyenvana@example.com');
  const [profilePhone, setProfilePhone] = useState('0901234567');
  const [profileAddress, setProfileAddress] = useState('123 Đường Lê Lợi, Quận 1, TP.HCM');

  // Notification option states
  const [notifyInOutEmail, setNotifyInOutEmail] = useState(true);
  const [notifyInOutSms, setNotifyInOutSms] = useState(true);
  const [notifyReceiptEmail, setNotifyReceiptEmail] = useState(true);
  const [notifyReceiptSms, setNotifyReceiptSms] = useState(false);

  // Security password and 2FA states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);

  // Bank list
  const [bankAccounts, setBankAccounts] = useState([
    { id: 'bank-1', name: 'Vietcombank', accountNumber: '**** 1234', badge: 'Gb' }
  ]);

  // Support center states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [ticketTopic, setTicketTopic] = useState('');
  const [ticketContent, setTicketContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
            <div id="brand-area" className="flex flex-col gap-1 pl-2 font-sans">
              <span className="text-2xl font-extrabold text-[#0052cc] tracking-tight block">
                UrbanPark
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DRIVER PORTAL
              </span>
            </div>

            {/* Menu Items (matching coordinates and strings) */}
            <nav className="space-y-1.5" id="nav-items-group">
              {[
                { id: 'home', label: 'Trang chủ', icon: <Home className="w-4 h-4" /> },
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
                      ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/10' 
                      : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800'
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
                setActiveMenu('support');
                triggerToast('Trung tâm hỗ trợ và giải đáp thắc mắc.', 'info');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-xs font-bold transition-all duration-200 rounded-xl cursor-pointer ${
                activeMenu === 'support'
                  ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/10' 
                  : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800'
              }`}
              id="sidebar-support-button"
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
            {/* Left side empty spacer */}
            <div className="hidden sm:block w-32" />

            {/* Centered pill for active menu item */}
            <div className="flex items-center justify-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              {activeMenu !== 'home' && (
                <div className="bg-[#EBECEF] dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-10 py-2 rounded-lg text-xs font-bold tracking-tight border border-slate-200/50 shadow-2xs">
                  {activeMenu === 'vehicles' && 'Phương tiện của tôi'}
                  {activeMenu === 'vip' && 'Đăng ký dịch vụ'}
                  {activeMenu === 'vip_approval' && 'Phê duyệt VIP'}
                  {activeMenu === 'billing' && 'Lịch sử thanh toán'}
                  {activeMenu === 'settings' && 'Cài đặt tài khoản'}
                  {activeMenu === 'support' && 'Hỗ trợ khách hàng'}
                </div>
              )}
            </div>

            {/* Right details */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Balance Widget pill button */}
              <button 
                onClick={() => {
                  setBalance(prev => prev + 10.00);
                  triggerToast('Tài khoản Sandbox: Đã tự động nạp thêm $10.00 thành công!', 'success');
                }}
                className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 hover:shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-subtle"
                title="Click để nạp thêm tiền thử nghiệm"
              >
                {activeMenu === 'home' ? (
                  <span className="text-slate-700 dark:text-slate-200 font-bold font-sans">Balance: ${balance.toFixed(2)}</span>
                ) : (
                  <>
                    <span className="text-slate-450 dark:text-slate-400 font-medium font-sans">Số dư:</span>
                    <span className="text-slate-850 dark:text-white font-bold font-sans">${balance.toFixed(2)}</span>
                  </>
                )}
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
                <div className="space-y-1 block select-none">
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                    Chào mừng trở lại, {profileName}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold font-sans">
                    Tổng quan hoạt động và trạng thái xe của bạn hôm nay.
                  </p>
                </div>

                {/* Key Cards Side-by-Side (matching the grid structures in screenshot) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Card - Trạng Thái Hiện Tại (col-span 7) */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden min-h-[224px]">
                    
                    {/* Premium Light Blue Curve on Right from Image (curved decoration segment matching 100%) */}
                    <div className="absolute right-0 top-0 bottom-0 w-[42%] bg-[#EAF0F9] dark:bg-slate-800/40 rounded-r-3xl rounded-l-[110px] pointer-events-none z-0" />

                    <div className="relative z-10 flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-850">
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-slate-900 dark:text-white font-sans">Trạng Thái Hiện Tại</h3>
                        <p className="text-xs text-slate-400 font-medium font-sans">
                          {activeVehicle.status === 'DA_OUT' ? 'Xe đang ở ngoài bãi đỗ' : 'Xe đang đỗ trong cơ sở'}
                        </p>
                      </div>
                      
                      {/* Active green badge matched exactly in position and theme */}
                      <span className="px-3.5 py-1 bg-[#DCFCE7] dark:bg-[#0c3a2f] text-[#15803D] dark:text-[#36b37e] rounded-full text-[10px] font-black tracking-wide font-sans flex items-center gap-1.5 uppercase shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-emerald-400 animate-pulse" />
                        <span>ĐANG ĐỖ</span>
                      </span>
                    </div>

                    {/* Double Sub-cards grid mapped exactly */}
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Sub-card 1: Biển Số */}
                      <div className="bg-white/85 dark:bg-slate-900/65 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-subtle">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-wider block font-sans uppercase">BIỂN SỐ NHẬN DIỆN</span>
                        <strong className="text-xl font-extrabold text-slate-850 dark:text-slate-100 font-mono tracking-widest block uppercase">
                          {activeVehicle.plate}
                        </strong>
                      </div>

                      {/* Sub-card 2: Vị trí ước tính */}
                      <div className="bg-white/85 dark:bg-slate-900/65 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-subtle">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-wider block font-sans uppercase">VỊ TRÍ ƯỚC TÍNH</span>
                        <span className="text-xs font-black text-slate-850 dark:text-slate-200 flex items-center gap-1.5 font-sans leading-none">
                          <MapPin className="w-4 h-4 text-[#0052cc] dark:text-blue-500 shrink-0" />
                          <span>{activeVehicle.location === 'Chưa đỗ' ? 'Khu A • Tầng 2' : activeVehicle.location}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom hidden engine helpers & interactive simulator triggers */}
                    <div className="relative z-10 mt-4 pt-3 border-t border-dashed border-slate-100 dark:border-slate-850 flex items-center justify-between text-[11px] text-slate-400 select-none">
                      <div className="flex gap-1.5 overflow-x-auto select-none py-0.5">
                        {vehicles.map(v => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setActiveVehiclePlate(v.plate);
                              triggerToast(`Theo dõi xe: ${v.plate}`, 'info');
                            }}
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border transition-all ${
                              activeVehiclePlate === v.plate 
                                ? 'bg-[#0052cc] text-white border-blue-500' 
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {v.plate}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => triggerTheftSimulation(activeVehicle.plate)}
                        className="text-xs text-rose-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        ⚡ Test trộm &rarr;
                      </button>
                    </div>

                  </div>

                  {/* Right Actions Cards panel (col-span 5) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    
                    {/* Blue Button: Thanh Toán Ngay (Centered text, coin/credit card icon match exact style) */}
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full bg-[#1b6ee6] hover:bg-[#0052cc] dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-5 rounded-3xl flex items-center justify-center gap-3.5 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5 text-white stroke-[2.5]" />
                      <span className="text-base font-black tracking-tight font-sans">Thanh Toán Ngay</span>
                    </button>

                    {/* Double interactive actions buttons below */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Search / Find Vehicle */}
                      <button 
                        onClick={() => setIsFindCarOpen(true)}
                        className="bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-3.5 cursor-pointer h-36"
                      >
                        <div className="p-3 bg-blue-50/50 dark:bg-slate-800 text-[#0052cc] dark:text-blue-400 rounded-full">
                          <Compass className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div className="leading-tight">
                          <strong className="text-xs font-black text-slate-800 dark:text-slate-200 block font-sans">Tìm Xe</strong>
                          <strong className="text-xs font-black text-slate-800 dark:text-slate-200 block font-sans">Của Tôi</strong>
                        </div>
                      </button>

                      {/* Renew / Extend monthly subscriptions */}
                      <button 
                        onClick={() => {
                          setActiveMenu('vip');
                          triggerToast('Chuyển hướng đến bảng đăng ký dịch vụ của của xe.', 'info');
                        }}
                        className="bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-3.5 cursor-pointer h-36"
                      >
                        <div className="p-3 bg-blue-50/50 dark:bg-slate-800 text-[#0052cc] dark:text-blue-400 rounded-full">
                          <CreditCard className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div className="leading-tight">
                          <strong className="text-xs font-black text-slate-800 dark:text-slate-200 block font-sans">Gia Hạn</strong>
                          <strong className="text-xs font-black text-slate-800 dark:text-slate-200 block font-sans">Vé Tháng</strong>
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
                              <span className={`inline-flex items-center gap-2 font-bold font-sans text-xs ${
                                act.event === 'Xe vào' ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {act.event === 'Xe vào' ? (
                                  <LogIn className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                                ) : (
                                  <LogOut className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                                )}
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{act.event}</span>
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-100 tracking-wider">
                              {act.plate}
                            </td>
                            <td className={`p-4 text-right font-mono font-bold ${
                              act.cost.startsWith('-$') ? 'text-rose-500' : 'text-slate-400'
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
                {/* Header Title */}
                <div className="space-y-1 block pb-2">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans">Đăng ký dịch vụ</h2>
                  <p className="text-slate-550 dark:text-slate-400 text-xs font-medium font-sans">
                    Thiết lập thẻ tháng hoặc thẻ ngày cho phương tiện của bạn.
                  </p>
                </div>

                {/* Steps workflow layout */}
                <div className="flex items-center justify-between max-w-xl mx-auto py-4 relative">
                  {/* Connector lines behind */}
                  <div className="absolute top-[30px] left-4 right-4 h-[2px] bg-slate-100 dark:bg-slate-800 -z-10" />
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#0052cc] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      ✓
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mt-2 whitespace-nowrap font-sans">1. Chọn xe</span>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs">
                      2
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-950 dark:text-white mt-2 whitespace-nowrap font-sans font-medium">2. Chọn gói</span>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#f4f5f7] dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2 whitespace-nowrap font-sans">3. Thanh toán</span>
                  </div>
                </div>

                {/* Main 2-column core structure */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column (spans 2 columns) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Panel 1: Phương tiện áp dụng */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-850 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-[#0052cc]" />
                        <h3 className="text-sm font-black text-slate-905 dark:text-white uppercase tracking-wider font-sans">
                          Phương tiện áp dụng
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {vehicles.map((v) => {
                          const isSelected = selectedVipPlate === v.plate;
                          const displayCategory = v.detailType 
                            ? v.detailType.toUpperCase() 
                            : (v.type === 'Ô tô' ? 'SEDAN - TRẮNG' : 'XE MÁY');
                          
                          return (
                            <div
                              key={v.id}
                              onClick={() => setSelectedVipPlate(v.plate)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center bg-white dark:bg-slate-900/60 ${
                                isSelected 
                                  ? 'border-blue-600 shadow-xs' 
                                  : 'border-slate-200 dark:border-slate-805 hover:border-slate-300 dark:hover:border-slate-705'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-black tracking-widest text-slate-405 dark:text-slate-500 uppercase font-sans block">
                                  {displayCategory}
                                </span>
                                <div className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-wider">
                                  {v.plate}
                                </div>
                              </div>
                              
                              {/* Custom high contrast radio check circle */}
                              <div className="flex items-center justify-center shrink-0 ml-3">
                                {isSelected ? (
                                  <div className="w-4.5 h-4.5 rounded-full bg-blue-600 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  </div>
                                ) : (
                                  <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700 bg-transparent" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAddFormType('Ô tô');
                          setAddFormPlate('');
                          setAddFormBrand('');
                          setAddFormDetailType('Ô tô 4 chỗ');
                          setIsAddVehicleModalOpen(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer pt-1"
                      >
                        <span className="text-sm font-black">+</span> Thêm xe mới
                      </button>
                    </div>

                    {/* Panel 2: Gói dịch vụ */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150/80 dark:border-slate-850 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-[#0052cc]" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                          Gói dịch vụ
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {/* Option 1: Vé Ngày */}
                        <div
                          onClick={() => setVipPackageType('Vé Ngày')}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 relative bg-white dark:bg-slate-900/60 ${
                            vipPackageType === 'Vé Ngày'
                              ? 'border-slate-905 dark:border-slate-100 ring-[1.5px] ring-slate-950 dark:ring-slate-100 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {/* Radio circle */}
                          <div className="pt-0.5">
                            {vipPackageType === 'Vé Ngày' ? (
                              <div className="w-4.5 h-4.5 rounded-full bg-[#0052cc] flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            ) : (
                              <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700 bg-transparent shrink-0" />
                            )}
                          </div>
                          
                          {/* Main Text Content */}
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center w-full">
                              <span className="text-sm font-black text-slate-900 dark:text-white font-sans">Vé Ngày</span>
                              <span className="text-sm font-black text-slate-900 dark:text-white font-mono">50,000đ</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Giá trị trong 24 giờ kể từ thời điểm đăng ký.
                            </p>
                            <div className="pt-2">
                              <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[9px] font-black uppercase tracking-wider font-sans">
                                RA VÀO NHIỀU LẦN
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Option 2: Thẻ Tháng VIP */}
                        <div
                          onClick={() => setVipPackageType('Thẻ Tháng VIP')}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 relative bg-white dark:bg-slate-900/65 ${
                            vipPackageType === 'Thẻ Tháng VIP'
                              ? 'border-slate-905 dark:border-slate-100 ring-[1.5px] ring-slate-950 dark:ring-slate-100 shadow-md'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {/* Popular Tag badged pinned to border edge */}
                          <div className="absolute -top-[11px] right-6 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-slate-800 dark:border-slate-200 shadow-xs flex items-center gap-1">
                            ★ PHỔ BIẾN
                          </div>

                          {/* Radio circle */}
                          <div className="pt-0.5">
                            {vipPackageType === 'Thẻ Tháng VIP' ? (
                              <div className="w-4.5 h-4.5 rounded-full bg-[#0052cc] flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            ) : (
                              <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700 bg-transparent shrink-0" />
                            )}
                          </div>
                          
                          {/* Main Text Content */}
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center w-full">
                              <span className="text-sm font-black text-slate-900 dark:text-white font-sans">Thẻ Tháng VIP</span>
                              <span className="text-sm font-black text-slate-900 dark:text-white font-mono">1,000,000đ</span>
                            </div>
                            <p className="text-[11px] text-slate-550 dark:text-slate-400">
                              Giải pháp tối ưu cho cư dân và nhân viên văn phòng.
                            </p>
                            
                            {/* Checklist features nested */}
                            <div className="pt-3.5 space-y-2 text-xs text-slate-650 dark:text-slate-350 font-bold font-sans">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-extrabold">✓</span>
                                <span>Chỗ đỗ xe cố định (Tầng B1)</span>
                              </div>
                              <div className="flex items-center gap-2 font-medium">
                                <span className="text-[#0052cc] font-extrabold">✓</span>
                                <span>Rửa xe miễn phí 1 lần/tháng</span>
                              </div>
                              <div className="flex items-center gap-2 font-medium">
                                <span className="text-[#0052cc] font-extrabold">✓</span>
                                <span>Hỗ trợ 24/7</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Right Column: Tổng quan đơn hàng */}
                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                      <h3 className="text-sm font-black tracking-tight text-slate-950 dark:text-white font-sans">
                        Tổng quan đơn hàng
                      </h3>
                      
                      <div className="border-t border-slate-100 dark:border-slate-850/60 my-2" />
                      
                      <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-350 font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-slate-500">Phương tiện</span>
                          <strong className="text-slate-850 dark:text-white font-mono font-bold tracking-wider">
                            {selectedVipPlate}
                          </strong>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-slate-500">Gói dịch vụ</span>
                          <strong className="text-slate-850 dark:text-white font-bold">
                            {vipPackageType === 'Thẻ Tháng VIP' ? 'ThP Tháng VIP' : 'Vé Ngày'}
                          </strong>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-slate-500">Thời hạn</span>
                          <strong className="text-slate-850 dark:text-white font-bold">
                            {vipPackageType === 'Thẻ Tháng VIP' ? '01/11 - 30/11' : 'Trong vòng 24 giờ'}
                          </strong>
                        </div>
                        
                        <div className="border-t border-slate-100 dark:border-slate-850/80 pt-3.5 flex justify-between items-center">
                          <span className="text-[11px] font-bold uppercase text-slate-405 dark:text-slate-500 tracking-wider">
                            TỔNG THANH TOÁN
                          </span>
                          <strong className="text-base font-black text-slate-900 dark:text-white font-sans">
                            {vipPackageType === 'Thẻ Tháng VIP' ? '1,000,000đ' : '50,000đ'}
                          </strong>
                        </div>
                      </div>
                      
                      {/* Payment Method Select Dropdown */}
                      <div className="space-y-1 bg-transparent pt-2">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block font-sans">
                          Phương thức thanh toán
                        </label>
                        <select 
                          value={billingMethod}
                          onChange={(e) => setBillingMethod(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white text-xs outline-hidden focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Ví UrbanPark">
                            Ví UrbanPark (Số dư: ${balance.toFixed(2)})
                          </option>
                          <option value="Thẻ tín dụng">Thẻ tín dụng Quốc tế</option>
                        </select>
                      </div>
                      
                      {/* Confirm & Checkout Button */}
                      <button
                        type="button"
                        onClick={handleVipCheckout}
                        className="w-full py-3 bg-[#0B1528] hover:bg-slate-800 text-white font-extrabold uppercase rounded-xl tracking-wider text-[11px] shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-4"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-450" />
                        <span>Xác nhận &amp; Thanh toán</span>
                      </button>
                      
                      <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-relaxed font-sans mt-2">
                        Bằng việc xác nhận, bạn đồng ý với{' '}
                        <a href="#" className="font-bold text-blue-600 hover:underline">
                          Điều khoản dịch vụ.
                        </a>
                      </p>
                    </div>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="border-t border-slate-100 dark:border-slate-850 pt-6 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-sans">
                  <span className="font-black text-slate-750 dark:text-slate-300 text-sm">UrbanPark</span>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold font-sans">
                    <a href="#" className="hover:text-slate-650 transition-colors">Chính sách bảo mật</a>
                    <a href="#" className="hover:text-slate-650 transition-colors">Điều khoản dịch vụ</a>
                    <a href="#" className="hover:text-slate-650 transition-colors">Khả năng tiếp cận</a>
                    <a href="#" className="hover:text-slate-650 transition-colors">Liên hệ hỗ trợ</a>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                    © 2024 UrbanPark Infrastructure. Bảo lưu mọi quyền.
                  </span>
                </div>

              </div>
            )}

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

            {/* SUB-VIEW 4: BILLING HISTORY (RECEIPTS AND FEES) */}
            {activeMenu === 'billing' && (
              <div className="space-y-6 animate-fade-in" id="billing-sub-view">
                
                {/* Title and Subtitle */}
                <div className="space-y-1 block">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans">Lịch sử thanh toán</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-sans">Xem lịch sử thanh toán và đăng ký gói tháng</p>
                </div>

                {/* KPI stats & Filters Block */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left stats: Tháng này */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-center space-y-3">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider font-sans block">
                      Tháng này
                    </span>
                    <strong className="text-4xl font-black text-[#0052cc] dark:text-blue-500 leading-none tracking-tight font-sans block shrink-0">
                      $128.50
                    </strong>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E1FBF2] dark:bg-[#0c3a2f] text-[#00875A] dark:text-[#36b37e] rounded-full w-fit text-[11px] font-black tracking-wide font-sans">
                      <span>↘</span>
                      <span>-12% so với tháng trước</span>
                    </div>
                  </div>

                  {/* Right filters: Bộ lọc */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase text-slate-900 tracking-wider font-sans block">
                      Bộ lọc
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Filter 1: Thời gian */}
                      <div className="space-y-1 bg-transparent">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                          Thời gian
                        </label>
                        <select 
                          value={billingTimeFilter}
                          onChange={(e) => {
                            setBillingTimeFilter(e.target.value);
                            triggerToast(`Đã lọc thời gian: ${e.target.value}`, 'info');
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white text-xs outline-hidden focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Tháng này">Tháng này</option>
                          <option value="Tháng trước">Tháng trước</option>
                          <option value="Một năm">Một năm</option>
                        </select>
                      </div>
                      
                      {/* Filter 2: Loại giao dịch */}
                      <div className="space-y-1 bg-transparent">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                          Loại giao dịch
                        </label>
                        <select 
                          value={billingTypeFilter}
                          onChange={(e) => {
                            setBillingTypeFilter(e.target.value);
                            triggerToast(`Đã lọc loại giao dịch: ${e.target.value}`, 'info');
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white text-xs outline-hidden focus:border-blue-500 cursor-pointer"
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

                {/* Giao dịch list table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="bg-[#f8f9fa] dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-450 dark:text-slate-500 font-extrabold tracking-wider uppercase">
                          <th className="p-4 pl-6 text-[10px] font-black">Mã GD</th>
                          <th className="p-4 text-[10px] font-black">Ngày thực hiện</th>
                          <th className="p-4 text-[10px] font-black">Loại dịch vụ</th>
                          <th className="p-4 text-[10px] font-black">Biển số xe</th>
                          <th className="p-4 text-[10px] font-black font-sans">Số tiền</th>
                          <th className="p-4 text-[10px] font-black">Trạng thái</th>
                          <th className="p-4 pr-6 text-[10px] font-black">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300 font-sans">
                        {[
                          { id: 'TXN-9821', date: '24/10/2023 14:30', type: 'Vé ngày', plate: '29A-123.45', amount: '$5.50', status: 'Thành công' },
                          { id: 'TXN-9820', date: '22/10/2023 09:15', type: 'Vé tháng', plate: '30G-789.01', amount: '$120.00', status: 'Thành công' },
                          { id: 'TXN-9819', date: '20/10/2023 18:45', type: 'Nạp ví', plate: '-', amount: '$50.00', status: 'Đang xử lý' },
                          { id: 'TXN-9818', date: '18/10/2023 08:00', type: 'Vé ngày', plate: '29A-123.45', amount: '$3.00', status: 'Thất bại' }
                        ]
                        .filter(item => {
                          if (billingTypeFilter !== 'Tất cả' && item.type !== billingTypeFilter) {
                            return false;
                          }
                          return true;
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                            <td className="p-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                              {item.id}
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                              {item.date}
                            </td>
                            <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold font-sans">
                              {item.type}
                            </td>
                            <td className="p-4">
                              {item.plate === '-' ? (
                                <span className="font-mono text-slate-400 ml-4 font-bold">-</span>
                              ) : (
                                <span className="font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-bold tracking-wide text-xs inline-block shadow-3xs uppercase">
                                  {item.plate}
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                              {item.amount}
                            </td>
                            <td className="p-4">
                              {item.status === 'Thành công' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#E1FBF2] text-[#00875A] dark:bg-[#0c3a2f] dark:text-[#36b37e] rounded-full text-[11px] font-black tracking-wide">
                                  Thành công
                                </span>
                              )}
                              {item.status === 'Đang xử lý' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EAF0F9] text-[#0052cc] dark:bg-[#0c243a] dark:text-[#368be0] rounded-full text-[11px] font-black tracking-wide">
                                  Đang xử lý
                                </span>
                              )}
                              {item.status === 'Thất bại' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFEBEB] text-[#DE350B] dark:bg-[#3d120a] dark:text-[#ff5230] rounded-full text-[11px] font-black tracking-wide">
                                  Thất bại
                                </span>
                              )}
                            </td>
                            <td className="p-4 pr-6">
                              {item.status === 'Thành công' && (
                                <button 
                                  onClick={() => {
                                    triggerToast(`📥 Đang kết xuất hóa đơn ${item.id}...`, 'info');
                                    setTimeout(() => {
                                      triggerToast(`🎉 Đã tải hóa đơn ${item.id}.pdf thành công!`, 'success');
                                    }, 1500);
                                  }}
                                  className="flex items-center gap-1.5 text-[#0052cc] hover:text-blue-850 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-extrabold cursor-pointer text-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Tải Hđ</span>
                                </button>
                              )}
                              {item.status === 'Đang xử lý' && (
                                <span className="text-slate-400 dark:text-slate-500 font-bold font-sans text-xs select-none">
                                  Đang chờ
                                </span>
                              )}
                              {item.status === 'Thất bại' && (
                                <button 
                                  onClick={() => {
                                    triggerToast(`🔄 Đang thử lại giao dịch ${item.id}...`, 'info');
                                    setTimeout(() => {
                                      if (balance >= 3.00) {
                                        setBalance(prev => prev - 3.00);
                                        triggerToast(`🎉 Thanh toán thành công $3.00 cho ${item.id}! Trạng thái được cập nhật.`, 'success');
                                      } else {
                                        triggerToast(`❌ Thử lại thất bại: Số dư tài khoản không đủ để đóng $3.00!`, 'error');
                                      }
                                    }, 1500);
                                  }}
                                  className="flex items-center gap-1.5 text-[#0052cc] hover:text-blue-850 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-extrabold cursor-pointer text-xs uppercase"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Thử lại</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table footer / Pagination controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-850 gap-4">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-sans">
                      Hiển thị 1-4 trong số 42 giao dịch
                    </span>
                    <div className="flex gap-2 text-xs">
                      <button 
                        disabled
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800/10 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-850 rounded-xl font-bold cursor-not-allowed select-none"
                      >
                        Trang trước
                      </button>
                      <button 
                        onClick={() => triggerToast('Tài khoản Sandbox: Chuyển sang lịch sử trang tiếp theo...', 'info')}
                        className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                      >
                        Trang sau
                      </button>
                    </div>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="flex flex-col sm:flex-row items-center justify-between py-6 px-1 border-t border-slate-150 dark:border-slate-800 text-slate-500 text-[11px] gap-4">
                  <span className="font-black text-slate-750 dark:text-slate-300 text-sm">UrbanPark</span>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold font-sans">
                    <a href="#" className="hover:text-slate-650 transition-colors">Chính sách bảo mật</a>
                    <a href="#" className="hover:text-slate-650 transition-colors">Điều khoản dịch vụ</a>
                    <a href="#" className="hover:text-slate-650 transition-colors">Khả năng tiếp cận</a>
                    <a href="#" className="hover:text-slate-650 transition-colors">Liên hệ hỗ trợ</a>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                    © 2024 UrbanPark Infrastructure. Bảo lưu mọi quyền.
                  </span>
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
                
                {/* Heading section with "Lưu thay đổi" right-aligned */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 block select-none">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans">Cài đặt tài khoản</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold font-sans">
                      Quản lý thông tin cá nhân, bảo mật và tùy chọn thanh toán.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      triggerToast('Đang lưu thiết lập của bạn...', 'info');
                      setTimeout(() => {
                        triggerToast('Cấu hình tài khoản đã được cập nhật thành công!', 'success');
                      }, 800);
                    }}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-black tracking-tight shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    Lưu thay đổi
                  </button>
                </div>

                {/* Main 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* LEFT PANEL: Inputs & Notification preferences (col-span 8) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* CARD 1: Thông tin cá nhân */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-850 pb-3 uppercase tracking-wider font-sans">
                        Thông tin cá nhân
                      </strong>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                        {/* Họ và tên */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                            Họ và tên
                          </label>
                          <input 
                            type="text" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-xl font-bold text-slate-800 dark:text-white transition-all outline-hidden font-sans"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                            Email
                          </label>
                          <input 
                            type="email" 
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-xl font-bold text-slate-800 dark:text-white transition-all outline-hidden font-sans"
                          />
                        </div>

                        {/* Số điện thoại (with absolute inline verification badge) */}
                        <div className="space-y-1.5 relative">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                            Số điện thoại
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              className="w-full pl-4 pr-28 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-xl font-bold text-slate-800 dark:text-white transition-all outline-hidden font-mono tracking-wide"
                            />
                            {/* Verified check badge inside input box aligned right */}
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#DCFCE7] dark:bg-[#0c3a2f] text-[#15803D] dark:text-[#36b37e] rounded-full text-[9px] font-black tracking-wide flex items-center gap-1 uppercase select-none pointer-events-none">
                              <span className="w-1.5 h-1.5 bg-[#15803D] dark:bg-emerald-400 rounded-full" />
                              <span>đang hoạt động</span>
                            </span>
                          </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                            Địa chỉ
                          </label>
                          <input 
                            type="text" 
                            value={profileAddress}
                            onChange={(e) => setProfileAddress(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-xl font-bold text-slate-800 dark:text-white transition-all outline-hidden font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: Tùy chọn thông báo */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-850 pb-3 uppercase tracking-wider font-sans">
                        Tùy chọn thông báo
                      </strong>
                      
                      <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-sans">
                        {/* Notify In/Out */}
                        <div className="py-4 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-0.5">
                            <h4 className="font-extrabold text-[#091E42] dark:text-slate-200 font-sans text-xs">Sự kiện vào/ra bãi xe</h4>
                            <p className="text-slate-450 dark:text-slate-500 text-[11px] font-sans">Nhận thông báo khi xe đi qua cổng kiểm soát.</p>
                          </div>
                          
                          <div className="flex gap-4 items-center">
                            {/* Email Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={notifyInOutEmail}
                                onChange={(e) => setNotifyInOutEmail(e.target.checked)}
                                className="w-4 h-4 text-[#0052cc] border-slate-300 dark:border-slate-750 rounded-sm cursor-pointer"
                              />
                              <span className="font-bold text-slate-700 dark:text-slate-300">Email</span>
                            </label>
                            
                            {/* SMS Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={notifyInOutSms}
                                onChange={(e) => setNotifyInOutSms(e.target.checked)}
                                className="w-4 h-4 text-[#0052cc] border-slate-300 dark:border-slate-750 rounded-sm cursor-pointer"
                              />
                              <span className="font-bold text-slate-700 dark:text-slate-300">SMS</span>
                            </label>
                          </div>
                        </div>

                        {/* Receipts */}
                        <div className="py-4 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-0.5">
                            <h4 className="font-extrabold text-[#091E42] dark:text-slate-200 font-sans text-xs">Biên lai thanh toán</h4>
                            <p className="text-slate-450 dark:text-slate-500 text-[11px] font-sans">Nhận biên lai sau mỗi lần giao dịch trừ tiền.</p>
                          </div>
                          
                          <div className="flex gap-4 items-center">
                            {/* Email Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={notifyReceiptEmail}
                                onChange={(e) => setNotifyReceiptEmail(e.target.checked)}
                                className="w-4 h-4 text-[#0052cc] border-slate-300 dark:border-slate-750 rounded-sm cursor-pointer"
                              />
                              <span className="font-bold text-slate-700 dark:text-slate-300">Email</span>
                            </label>
                            
                            {/* SMS Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={notifyReceiptSms}
                                onChange={(e) => setNotifyReceiptSms(e.target.checked)}
                                className="w-4 h-4 text-[#0052cc] border-slate-300 dark:border-slate-750 rounded-sm cursor-pointer"
                              />
                              <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">SMS</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT PANEL: UrbanPark Wallet & Security passwords (col-span 4) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* CARD 3: VÍ URBANPARK */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
                      <strong className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-wider block font-sans uppercase">
                        Ví UrbanPark
                      </strong>

                      {/* Black Credit-Card design holder */}
                      <div className="bg-radial from-[#0d162d] to-[#040813] border border-slate-800/80 rounded-2xl p-5 text-white shadow-md relative overflow-hidden select-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="space-y-1 relative z-10">
                          <span className="text-[9px] text-[#A3B8CC] font-black uppercase tracking-wider font-sans block opacity-85">Số dư khả dụng</span>
                          <strong className="text-3xl font-black font-sans tracking-tight block">
                            ${balance.toFixed(2)}
                          </strong>
                        </div>

                        {/* Premium CTA Deposit directly inside the credit card layout matching perfectly */}
                        <button 
                          onClick={() => {
                            setBalance(prev => prev + 10.00);
                            triggerToast('Sandbox Wallet: Nạp thêm $10.00 thành công!', 'success');
                          }}
                          className="w-full text-center bg-[#0052cc] hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-lg tracking-tight mt-6 block transition-colors shadow-2xs active:scale-[0.98] cursor-pointer"
                        >
                          Nạp tiền ngay
                        </button>
                      </div>

                      {/* Bank connections section */}
                      <div className="space-y-3.5">
                        <strong className="text-[10px] font-black text-[#8993A4] dark:text-slate-500 tracking-wide block uppercase font-sans">
                          LIÊN KẾT NGÂN HÀNG
                        </strong>
                        
                        {/* Connected accounts list */}
                        <div className="space-y-2">
                          {bankAccounts.map((ac) => (
                            <div key={ac.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400">
                                  <CreditCard className="w-4 h-4 text-slate-400 stroke-[2]" />
                                </div>
                                <div className="leading-tight">
                                  <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 font-sans">{ac.name}</h5>
                                  <span className="text-[10px] font-mono font-bold text-slate-450 dark:text-slate-500 tracking-tight">{ac.accountNumber}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-black text-rose-500 font-mono tracking-wide uppercase select-none opacity-80">
                                {ac.badge}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Add simulated account */}
                        <button
                          onClick={() => {
                            const num = Math.floor(1000 + Math.random() * 9000);
                            setBankAccounts(prev => [...prev, {
                              id: `bank-${Date.now()}`,
                              name: 'Techcombank',
                              accountNumber: `**** ${num}`,
                              badge: 'TCB'
                            }]);
                            triggerToast('Sandbox: Đang đồng bộ bốt liên kết phương thức thanh toán mới...', 'info');
                            setTimeout(() => {
                              triggerToast('Đã thêm phương thức liên kết Techcombank thành công!', 'success');
                            }, 800);
                          }}
                          className="w-full py-2.5 bg-none border border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0052cc] rounded-xl text-xs font-bold text-[#0052cc] hover:bg-slate-50/40 dark:hover:bg-slate-950/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm phương thức mới</span>
                        </button>
                      </div>

                    </div>

                    {/* CARD 4: BẢO MẬT */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-850 pb-3 uppercase tracking-wider font-sans">
                        Bảo mật
                      </strong>

                      {/* Password reset form */}
                      <div className="space-y-4">
                        <h4 className="font-extrabold text-[#091E42] dark:text-slate-200 text-xs font-sans">Đổi mật khẩu</h4>
                        
                        <div className="space-y-3 font-sans text-xs">
                          <input 
                            type="password" 
                            placeholder="Mật khẩu hiện tại" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-xl outline-hidden text-[11px] font-sans"
                          />
                          <input 
                            type="password" 
                            placeholder="Mật khẩu mới" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-xl outline-hidden text-[11px] font-sans"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!currentPassword || !newPassword) {
                              triggerToast('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.', 'error');
                              return;
                            }
                            triggerToast('Đang kiểm tra mật khẩu...', 'info');
                            setTimeout(() => {
                              setCurrentPassword('');
                              setNewPassword('');
                              triggerToast('Mật khẩu của bạn đã được cập nhật thành công!', 'success');
                            }, 800);
                          }}
                          className="text-xs font-black text-[#0052cc] hover:text-blue-600 hover:underline cursor-pointer tracking-tight font-sans block"
                        >
                          Cập nhật mật khẩu
                        </button>
                      </div>

                      {/* Two-Factor Toggle */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3 font-sans">
                        <div className="flex justify-between items-center gap-4">
                          <h4 className="font-extrabold text-[#091E42] dark:text-slate-200 text-xs font-sans">Xác thực 2 lớp (2FA)</h4>
                          
                          {/* Beautiful Interactive Switch toggle */}
                          <button
                            onClick={() => {
                              setEnableTwoFactor(!enableTwoFactor);
                              triggerToast(enableTwoFactor ? 'Đã tắt bảo vệ xác thực 2 lớp.' : 'Đã bật bảo mật 2 lớp 2FA qua mã điện thoại.', 'info');
                            }}
                            className={`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 outline-hidden border border-transparent ${
                              enableTwoFactor ? 'bg-[#0052cc]' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                              enableTwoFactor ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                        
                        <p className="text-slate-450 dark:text-slate-500 text-[10.5px] leading-relaxed font-sans">
                          Bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác nhận phụ khi đăng nhập từ thiết bị lạ.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* SUB-VIEW 6: SUPPORT CENTER (HELP DESK) */}
            {activeMenu === 'support' && (
              <div className="space-y-8 animate-fade-in" id="support-sub-view">
                
                {/* Center Title Banner with description */}
                <div className="text-center space-y-3 py-6 select-none max-w-2xl mx-auto">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">
                    Trung tâm Hỗ trợ
                  </h1>
                  <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold leading-relaxed font-sans">
                    Tìm kiếm câu trả lời nhanh chóng hoặc liên hệ trực tiếp với đội ngũ quản lý hệ thống bãi đỗ xe thông minh của chúng tôi.
                  </p>
                </div>

                {/* Search query input centered */}
                <div className="max-w-xl mx-auto relative select-none">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Bạn cần giúp đỡ điều gì?"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-full text-xs font-semibold text-slate-800 dark:text-white outline-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all font-sans shadow-2xs"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 hover:underline absolute right-4 top-1/2 -translate-y-1/2 font-sans font-bold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* Chủ đề Hỗ trợ (Support Topics) Grid */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest font-sans select-none pl-1">
                    Chủ đề Hỗ trợ
                  </h3>
                  
                  {/* Grid 6 columns mapping layout perfectly: 3 cards row 1 (each col-span-2) and 2 cards row 2 (each col-span-3) */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-stretch">
                    
                    {/* Topic 1: Tài khoản & Bảo mật */}
                    <div 
                      onClick={() => {
                        setSearchQuery('bảo mật');
                        triggerToast('Lọc các câu hỏi liên quan đến Tài khoản & Bảo mật.', 'info');
                      }}
                      className="md:col-span-2 bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-850/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-4 items-start cursor-pointer transition-all shadow-2xs hover:shadow-xs hover:scale-[1.01]"
                    >
                      <div className="p-3 bg-blue-50/50 dark:bg-slate-850 text-[#0052cc] rounded-xl shrink-0">
                        <Shield className="w-5 h-5 text-[#0052cc] dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-sans">Tài khoản & Bảo mật</h4>
                        <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium font-sans">
                          Quản lý thông tin cá nhân, mật khẩu, và bảo mật hai lớp.
                        </p>
                      </div>
                    </div>

                    {/* Topic 2: Thanh toán & Ví */}
                    <div 
                      onClick={() => {
                        setSearchQuery('thanh toán');
                        triggerToast('Lọc các câu hỏi liên quan đến ví và chi phí.', 'info');
                      }}
                      className="md:col-span-2 bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-850/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-4 items-start cursor-pointer transition-all shadow-2xs hover:shadow-xs hover:scale-[1.01]"
                    >
                      <div className="p-3 bg-blue-50/50 dark:bg-slate-850 text-[#0052cc] rounded-xl shrink-0">
                        <CreditCard className="w-5 h-5 text-[#0052cc] dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-sans">Thanh toán & Ví</h4>
                        <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium font-sans">
                          Nạp tiền, lịch sử giao dịch, và hóa đơn điện tử.
                        </p>
                      </div>
                    </div>

                    {/* Topic 3: Đăng ký vé tháng */}
                    <div 
                      onClick={() => {
                        setSearchQuery('tháng');
                        triggerToast('Lọc các câu hỏi liên quan đến vé tháng VIP.', 'info');
                      }}
                      className="md:col-span-2 bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-850/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-4 items-start cursor-pointer transition-all shadow-2xs hover:shadow-xs hover:scale-[1.01]"
                    >
                      <div className="p-3 bg-blue-50/50 dark:bg-slate-850 text-[#0052cc] rounded-xl shrink-0">
                        <Calendar className="w-5 h-5 text-[#0052cc] dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-sans">Đăng ký vé tháng</h4>
                        <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium font-sans">
                          Thủ tục đăng ký, gia hạn, và thay đổi thông tin biển số xe.
                        </p>
                      </div>
                    </div>

                    {/* Topic 4: Hướng dẫn vào/ra bãi xe */}
                    <div 
                      onClick={() => {
                        setSearchQuery('vào/ra bãi xe');
                        triggerToast('Lọc các sự kiện vào/ra và quy trình bốt.', 'info');
                      }}
                      className="md:col-span-3 bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-850/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-4 items-start cursor-pointer transition-all shadow-2xs hover:shadow-xs hover:scale-[1.01]"
                    >
                      <div className="p-3 bg-blue-50/50 dark:bg-slate-850 text-[#0052cc] rounded-xl shrink-0">
                        <Car className="w-5 h-5 text-[#0052cc] dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-sans">Hướng dẫn vào/ra bãi xe</h4>
                        <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium font-sans">
                          Quy trình sử dụng thẻ, nhận diện biển số (LPR), và barrier.
                        </p>
                      </div>
                    </div>

                    {/* Topic 5: Sự cố kỹ thuật */}
                    <div 
                      onClick={() => {
                        setSearchQuery('sự cố');
                        triggerToast('Lọc các câu hỏi và báo cáo lỗi kỹ thuật.', 'info');
                      }}
                      className="md:col-span-3 bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-850/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-4 items-start cursor-pointer transition-all shadow-2xs hover:shadow-xs hover:scale-[1.01]"
                    >
                      <div className="p-3 bg-red-50/50 dark:bg-[#2c131a] text-rose-600 rounded-xl shrink-0">
                        <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-455" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-sans">Sự cố kỹ thuật</h4>
                        <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium font-sans">
                          Báo cáo lỗi hệ thống, mất kết nối, hoặc barrier không mở.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Câu hỏi thường gặp FAQ */}
                <div className="space-y-4 select-none">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest font-sans pl-1">
                    Câu hỏi thường gặp
                  </h3>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
                    {[
                      {
                        q: 'Làm thế nào để nạp tiền vào ví điện tử UrbanPark?',
                        a: 'Bạn có thể nạp tiền thông qua chuyển khoản ngân hàng trực tuyến hoặc nạp nhanh thông qua ví liên kết Vietcombank, Techcombank trực tiếp ngay trang chủ Driver Portal. Hệ thống hỗ trợ xử lý tức thì, tài khoản của bạn sẽ cập nhật sau 5 giây.',
                        topic: 'thanh toán ví'
                      },
                      {
                        q: 'Cách thay đổi biển số xe cho vé tháng đang sử dụng?',
                        a: 'Để thay đổi biển số đăng ký cho vé ngày hoặc vé tháng, vui lòng truy cập mục "Xe của tôi", chọn Sửa xe hoặc gửi yêu cầu đính kèm hình ảnh đăng kiểm qua mục "Gửi hỗ trợ" bên dưới. Quản trị viên bốt gác sẽ phê duyệt yêu cầu trong vòng 2 giờ.',
                        topic: 'vé tháng'
                      },
                      {
                        q: 'Tôi cần làm gì khi bị mất thẻ từ gửi xe?',
                        a: 'Hãy truy cập "Xe của tôi" và bật ngay chế độ "Khóa xe khẩn cấp (An toàn tối đa)". Hệ thống nhận diện bốt camera sẽ từ chối tự động mở Barie cho xe đó ra cho dù khớp biển số. Sau đó, hãy liên hệ bốt kỹ thuật để nhận thẻ thay thế.',
                        topic: 'sự cố'
                      },
                      {
                        q: 'Hệ thống LPR không nhận diện được biển số, tôi phải làm sao?',
                        a: 'Hãy đảm bảo biển số của bạn sạch sẽ, không bị che khuất. Tại cổng, nếu bốt camera gặp sự cố, bạn có thể bấm "Mô phỏng bốt" từ giao diện Điều khiển bốt vào/ra trên portal này để gửi yêu cầu nâng barie khẩn cấp từ xa.',
                        topic: 'vào/ra bãi xe'
                      },
                      {
                        q: 'Làm sao để xuất hóa đơn điện tử cho công ty?',
                        a: 'Các biên lai điện tử VAT được tạo lập tức thì cho mỗi lượt gửi xe hoặc gia hạn thẻ VIP. Bạn có thể nhấn trực tiếp vào nút "Tải về" (e-Invoice) bên cạnh mỗi giao dịch trong mục "Lịch sử thanh toán" của cổng này.',
                        topic: 'thanh toán hóa đơn'
                      }
                    ]
                    .filter(faq => {
                      if (!searchQuery) return true;
                      const qNormalized = faq.q.toLowerCase();
                      const aNormalized = faq.a.toLowerCase();
                      const topicNormalized = faq.topic.toLowerCase();
                      const searchNormalized = searchQuery.toLowerCase();
                      return qNormalized.includes(searchNormalized) || aNormalized.includes(searchNormalized) || topicNormalized.includes(searchNormalized);
                    })
                    .map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div key={idx} className="transition-all">
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/55 dark:hover:bg-slate-850/40 cursor-pointer"
                          >
                            <span className="text-[12.5px] font-black text-slate-800 dark:text-slate-200 font-sans tracking-tight">
                              {faq.q}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-slate-500 stroke-[2.5]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500 stroke-[2.5]" />
                            )}
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-5 pt-1 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium font-sans border-t border-slate-50 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20">
                                  {faq.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Section: Support Ticket (Left side) & Contact details (Right side) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column: Gửi yêu cầu hỗ trợ (col-span 8) */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
                    <strong className="text-sm font-black text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-850 pb-3 uppercase tracking-wider font-sans">
                      Gửi yêu cầu hỗ trợ (Support Ticket)
                    </strong>

                    <div className="space-y-4 font-sans text-xs">
                      {/* Topic Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                          Chủ đề hỗ trợ
                        </label>
                        <select 
                          value={ticketTopic}
                          onChange={(e) => setTicketTopic(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-[#0052cc] rounded-xl font-bold text-slate-800 dark:text-white transition-all outline-hidden appearance-none cursor-pointer"
                        >
                          <option value="">-- Chọn chủ đề --</option>
                          <option value="account">Tài khoản & Bảo mật</option>
                          <option value="billing">Thanh toán & Ví</option>
                          <option value="vip">Đăng ký vé tháng</option>
                          <option value="in_out">Hướng dẫn vào/ra bãi xe</option>
                          <option value="tech_issue">Sự cố kỹ thuật</option>
                        </select>
                      </div>

                      {/* Content textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                          Nội dung chi tiết
                        </label>
                        <textarea 
                          rows={4}
                          placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." 
                          value={ticketContent}
                          onChange={(e) => setTicketContent(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#0052cc] rounded-xl outline-hidden text-[11.5px] font-medium text-slate-800 dark:text-white placeholder-slate-400 font-sans leading-relaxed"
                        />
                      </div>

                      {/* File Upload drag-and-drop widget */}
                      <div className="space-y-1.5 relative">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
                          Đính kèm (Tùy chọn)
                        </span>
                        
                        {/* Hidden input file tag controlled nicely by ref hook */}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              setAttachedFileName(files[0].name);
                              triggerToast(`Đã nhận file đính kèm: ${files[0].name}`, 'info');
                            }
                          }}
                          className="hidden"
                          accept="image/*,.pdf"
                        />

                        {/* Interactive Drag zone box */}
                        <div 
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const files = e.dataTransfer.files;
                            if (files && files.length > 0) {
                              setAttachedFileName(files[0].name);
                              triggerToast(`Đã nhận file đính kèm: ${files[0].name}`, 'info');
                            }
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                            isDragging 
                              ? 'border-[#0052cc] bg-blue-50/20' 
                              : attachedFileName 
                                ? 'border-emerald-500 bg-emerald-50/10' 
                                : 'border-slate-200 dark:border-slate-800 hover:border-[#0052cc]'
                          }`}
                        >
                          <UploadCloud className={`w-8 h-8 ${attachedFileName ? 'text-emerald-500' : 'text-slate-400'}`} />
                          
                          {attachedFileName ? (
                            <div className="space-y-1">
                              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Đã đính kèm file thành công
                              </span>
                              <strong className="text-xs text-slate-800 dark:text-slate-200 block truncate max-w-xs">{attachedFileName}</strong>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAttachedFileName(null);
                                }}
                                className="text-[10px] text-red-500 hover:underline font-bold"
                              >
                                Gỡ bỏ file x
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                Kéo thả file vào đây hoặc <span className="text-[#0052cc] font-black hover:underline cursor-pointer">Chọn file</span>
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Hỗ trợ JPG, PNG, PDF (Max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA Submit Button right aligned */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            if (!ticketTopic) {
                              triggerToast('Vui lòng chọn chủ đề hỗ trợ.', 'error');
                              return;
                            }
                            if (!ticketContent.trim()) {
                              triggerToast('Vui lòng nhập nội dung chi tiết yêu cầu hỗ trợ.', 'error');
                              return;
                            }
                            triggerToast('Đang gửi yêu cầu hỗ trợ đến tổng đài viên...', 'info');
                            setTimeout(() => {
                              setTicketTopic('');
                              setTicketContent('');
                              setAttachedFileName(null);
                              triggerToast('Đã gửi ticket thành công! Nhân viên tư vấn của UrbanPark sẽ phản hồi lại bạn qua Email/SĐT tối đa trong 15 phút.', 'success');
                            }, 1000);
                          }}
                          className="px-6 py-2.5 bg-[#0052cc] hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-black tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>GỬI YÊU CẦU</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Liên hệ trực tiếp & Tình trạng (col-span 4) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Dark Contact Card (Matching exactly in layout and typography) */}
                    <div className="bg-[#0b1329] dark:bg-slate-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden select-none flex flex-col justify-between min-h-[300px]">
                      {/* Abstract radial layout backdrop */}
                      <div className="absolute right-0 top-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="space-y-6 relative z-10">
                        <strong className="text-sm font-black border-b border-slate-850 pb-3 block text-slate-200 tracking-wider font-sans uppercase font-sans">
                          Liên hệ trực tiếp
                        </strong>

                        {/* Hotline contact line */}
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 bg-white/10 text-white rounded-xl">
                            <Headphones className="w-5 h-5 text-white stroke-[2]" />
                          </div>
                          <div className="leading-tight">
                            <span className="text-[10px] text-[#8993A4] dark:text-slate-500 font-extrabold uppercase tracking-widest font-sans block">
                              Hotline Hỗ Trợ (24/7)
                            </span>
                            <strong className="text-2xl font-black text-white font-sans tracking-tight">
                              1900 6868
                            </strong>
                          </div>
                        </div>

                        {/* Email contact line */}
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 bg-white/10 text-white rounded-xl">
                            <Mail className="w-5 h-5 text-white stroke-[2]" />
                          </div>
                          <div className="leading-tight">
                            <span className="text-[10px] text-[#8993A4] dark:text-slate-500 font-extrabold uppercase tracking-widest font-sans block">
                              Email
                            </span>
                            <span className="text-[12.5px] font-black text-slate-200 font-sans block hover:underline cursor-pointer">
                              support@urbanpark.vn
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* White button widget aligned bottom inside the panel */}
                      <button 
                        onClick={() => {
                          setActiveMenu('settings');
                          triggerToast('Mở trợ lý ảo AI tại mục cài đặt để trò chuyện tức thì!', 'info');
                        }}
                        className="w-full text-center bg-white hover:bg-slate-100 dark:bg-slate-100 dark:hover:bg-slate-200 text-slate-900 font-black text-xs py-3.5 rounded-xl tracking-tight relative z-10 transition-colors shadow-2xs cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                        <span>Trò chuyện trực tuyến</span>
                      </button>
                    </div>

                    {/* Tình trạng hệ thống Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between font-sans select-none">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Tình trạng hệ thống
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        Bình thường
                      </span>
                    </div>

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
