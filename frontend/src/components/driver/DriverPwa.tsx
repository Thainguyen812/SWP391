import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Clock, 
  QrCode, 
  PlusCircle, 
  HelpCircle, 
  Car, 
  CheckCircle,
  Database,
  History,
  DollarSign,
  MapPin,
  Activity,
  Shield,
  Layers,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  UploadCloud,
  Check,
  XCircle,
  RefreshCw,
  CreditCard,
  Terminal,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  ChevronRight,
  ShieldAlert,
  Sliders,
  LogOut
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
  liveTime?: string;
}

// Interfaces based on requested schema
interface VipSubscription {
  id: string;
  vehicle_id: string;
  subscription_type: string;
  start_date: string;
  end_date: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  document_photos: {
    registrationPaper: string; // Cà vẹt
    identityCard: string;      // CMND/CCCD
    frontPhoto: string;        // Ảnh đầu xe
  };
  approved_by: string | null;
}

interface VipQrIdentifier {
  qr_token: string;
  purpose: string;
  expired_at: number; // timestamp
  is_used: boolean;
}

interface ParkingSession {
  id: string;
  vehicle_plate: string;
  vehicle_type: string;
  entry_time: string;
  location: string;
  is_locked: boolean; 
}

export function DriverPwa({ user, accessToken, onLogout, isDarkMode = false, liveTime = '' }: DriverPwaProps) {
  // ----------------------------------------------------
  // --- STATE PERSISTENCE & INITIAL SEED ---
  // ----------------------------------------------------
  const [sessions, setSessions] = useState<ParkingSession[]>(() => {
    const saved = localStorage.getItem('urbanpark_driver_vehicles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          id: item.id || `SESS-${Math.floor(Math.random()*10000)}`,
          vehicle_plate: item.plate,
          vehicle_type: item.type,
          entry_time: item.entryTime,
          location: item.location,
          is_locked: item.isLocked || false
        }));
      } catch (err) {
        console.error(err);
      }
    }
    return [
      { id: 'SESS-8812', vehicle_plate: '30F-999.78', vehicle_type: 'Ô tô', entry_time: '13/06/2026 08:30', location: 'Khu A - Ô số 15', is_locked: false },
      { id: 'SESS-2291', vehicle_plate: '29A-882.11', vehicle_type: 'Ô tô', entry_time: '13/06/2026 10:15', location: 'Khu C - Ô số 04 (VIP)', is_locked: true },
      { id: 'SESS-5512', vehicle_plate: '51G-246.80', vehicle_type: 'Xe máy', entry_time: '13/06/2026 12:00', location: 'Khu B - Tầng B1-12', is_locked: false }
    ];
  });

  const [subscriptions, setSubscriptions] = useState<VipSubscription[]>(() => {
    const saved = localStorage.getItem('urbanpark_vip_subscriptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          id: item.id || `VIP-${Math.floor(Math.random()*10000)}`,
          vehicle_id: item.vehicle_plate || item.vehicle_id,
          subscription_type: item.type || item.subscription_type,
          start_date: item.startDate || item.start_date,
          end_date: item.endDate || item.end_date,
          status: item.status === 'PENDING' ? 'PENDING_APPROVAL' : item.status,
          document_photos: item.document_photos || {
            registrationPaper: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&auto=format&fit=crop&q=60',
            identityCard: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=60',
            frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=60'
          },
          approved_by: item.approved_by || null
        }));
      } catch (err) {
        console.error(err);
      }
    }
    return [
      {
        id: 'VIP-0021',
        vehicle_id: '30F-999.78',
        subscription_type: 'Vàng (Thẻ Tháng Gold)',
        start_date: '01/06/2026',
        end_date: '01/12/2026',
        status: 'ACTIVE',
        document_photos: {
          registrationPaper: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&auto=format&fit=crop&q=60',
          identityCard: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=60',
          frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=60'
        },
        approved_by: 'Hệ thống tự động'
      }
    ];
  });

  const [qrToken, setQrToken] = useState<VipQrIdentifier | null>(() => {
    const saved = localStorage.getItem('urbanpark_active_qr');
    if (saved) return JSON.parse(saved);
    return null;
  });

  // Active Menu tabs inside Driver Web Portal (Straight Web view)
  const [activeTab, setActiveTab] = useState<'security' | 'vip_reg' | 'qr_card'>('security');

  // Logs for technical API stream terminal
  const [apiLogs, setApiLogs] = useState<string[]>(() => [
    `[${new Date().toLocaleTimeString('vi-VN')}] [SYSTEM] Driver PWA Workspace initialized.`,
    `[${new Date().toLocaleTimeString('vi-VN')}] [AUTH] Security Context token loaded securely.`,
    `[${new Date().toLocaleTimeString('vi-VN')}] [DATABASE] Synchronized 3 parking sessions and 1 VIP Subscription.`
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    setApiLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Save states to local storage on changes
  useEffect(() => {
    localStorage.setItem('urbanpark_sessions', JSON.stringify(sessions));
    // Also update and write to urbanpark_driver_vehicles
    const saved = localStorage.getItem('urbanpark_driver_vehicles');
    let vehicles = saved ? JSON.parse(saved) : [];
    const updatedVehicles = sessions.map(s => {
      const existing = vehicles.find((v: any) => v.plate === s.vehicle_plate);
      if (existing) {
        return {
          ...existing,
          isLocked: s.is_locked,
          status: s.is_locked ? 'BAO_VE_MAX' : 'DANG_DO'
        };
      }
      return {
        id: s.id,
        plate: s.vehicle_plate,
        type: s.vehicle_type,
        location: s.location,
        status: s.is_locked ? 'BAO_VE_MAX' : 'DANG_DO',
        entryTime: s.entry_time,
        isLocked: s.is_locked
      };
    });
    localStorage.setItem('urbanpark_driver_vehicles', JSON.stringify(updatedVehicles));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('urbanpark_vip_subs', JSON.stringify(subscriptions));
    // Also save to standard urbanpark_vip_subscriptions
    const unifiedSubs = subscriptions.map(sub => ({
      id: sub.id,
      vehicle_plate: sub.vehicle_id,
      type: sub.subscription_type,
      startDate: sub.start_date,
      endDate: sub.end_date,
      status: sub.status === 'PENDING_APPROVAL' ? 'PENDING' : sub.status,
      document_photos: sub.document_photos,
      approved_by: sub.approved_by
    }));
    localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(unifiedSubs));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('urbanpark_active_qr', JSON.stringify(qrToken));
  }, [qrToken]);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // ----------------------------------------------------
  // --- SIREN ALARM SYNTHESIZER (WEB AUDIO API) ---
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

      // Stop existing if running
      stopSirenWave();

      // Create nodes
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const masterGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Siren dual sweeps
      osc1.frequency.setValueAtTime(380, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      // Low frequency oscillator (LFO) to sweep siren frequencies
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.5, ctx.currentTime); // 1.5Hz sweep

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(150, ctx.currentTime); // swing ranges

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      masterGain.connect(ctx.destination);

      masterGain.gain.setValueAtTime(0.12, ctx.currentTime); // Keep volume reasonable

      lfo.start();
      osc1.start();
      osc2.start();

      oscillator1Ref.current = osc1;
      oscillator2Ref.current = osc2;
      gainNodeRef.current = masterGain;
      setIsSirenPlaying(true);
    } catch (e) {
      console.warn("Could not start synthezised siren due to browser interactions restriction", e);
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
  // --- THEFT SIMULATION ALARM & BARRIE STATE ---
  // ----------------------------------------------------
  const [simulatedSelectedPlate, setSimulatedSelectedPlate] = useState('29A-882.11');
  const [isAlertOverlayShown, setIsAlertOverlayShown] = useState(false);
  const [isBarrierFrozen, setIsBarrierFrozen] = useState(false);
  const [fcmNotification, setFcmNotification] = useState<{ title: string; body: string; plate: string; time: string } | null>(null);

  const simulateSecurityBreach = (plate: string) => {
    addLog(`[AI_CAMERA] SCAN_AT_GATEWAY: Detected Vehicle [${plate}] trying to exit.`);
    
    // Find if session is currently locked
    const session = sessions.find(s => s.vehicle_plate === plate);
    
    if (session && session.is_locked) {
      // TRIGGER ANTI-THEFT BREACH!
      setIsBarrierFrozen(true);
      setIsAlertOverlayShown(true);
      startSirenWave();

      // FCM red alert simulation
      const alertTime = new Date().toLocaleTimeString('vi-VN');
      const fcmPayload = {
        title: "🔵 MOCK FIREBASE CLOUD MESSAGING (FCM)",
        body: `[Cảnh báo Đỏ] Phát hiện xe ${plate} đang cố tình vượt bốt an ninh! Hệ thống đã tự động khóa cứng chặn Barie chỉ trong 480ms. Còi báo động đã kích hoạt tại bốt trực.`,
        plate: plate,
        time: alertTime
      };
      setFcmNotification(fcmPayload);

      addLog(`[SECURITY_KERNEL] !!! THREAT DETECTED !!! Vehicle [${plate}] is set to IS_LOCKED=TRUE but triggered OCR at Exit-Gate.`);
      addLog(`[BARRIER_CONTROLLER] Signal sent: HARD_LOCK_LOCKDOWN_ARMED (Active in 480ms). Barie frozen.`);
      addLog(`[FCM_SERVICE] Dispatch push alert to token "fv12_u9x...". Google Firebase API latency: 14ms.`);
      addLog(`[SIREN] Physical output alarm activated. Sound synthesized on AudioPort.`);
      
      triggerToast(`Báo động đỏ! Xe ${plate} đang bị trộm di chuyển! Barie đã khóa cứng!`, 'error');
    } else {
      // Normal exit flow
      addLog(`[AI_CAMERA] Gate verification: Vehicle [${plate}] is NOT locked. Processing standard parking clearance...`);
      triggerToast(`Xe ${plate} không ở trạng thái khóa. Camera quét thông suốt, cổng sẵn sàng mở.`, 'info');
    }
  };

  const handleDismissTheftAlarm = () => {
    stopSirenWave();
    setIsAlertOverlayShown(false);
    setIsBarrierFrozen(false);
    setFcmNotification(null);
    addLog(`[SECURITY_KERNEL] Siren manual reset requested by operator. Resetting control nodes.`);
    triggerToast(`Đã hạ nhiệt báo động đỏ và khôi phục trạng thái Barie cổng.`, 'success');
  };

  // ----------------------------------------------------
  // --- ANTI-THEFT BLOCK / TOGGLING STATE ---
  // ----------------------------------------------------
  const handleToggleLock = async (sessionPlate: string) => {
    // Tìm session hiện tại
    const session = sessions.find(s => s.vehicle_plate === sessionPlate);
    if (!session) return;
    
    const newLockState = !session.is_locked;
    // Tạm dùng id của session thay cho vehicleId, hoặc random UUID nếu không đúng định dạng
    const dummyVehicleId = '123e4567-e89b-12d3-a456-426614174000'; // FIXME: Replace with real vehicleId when available

    try {
      // Gọi API thực tế
      await apiClient.put(`/v1/driver/vehicle/lock`, {
        vehicleId: session.id.includes('-') ? session.id : dummyVehicleId, 
        lockStatus: newLockState
      });
      
      setSessions(prev => prev.map(s => {
        if (s.vehicle_plate === sessionPlate) {
          return { ...s, is_locked: newLockState };
        }
        return s;
      }));

      addLog(`[DRIVER_PORTAL] [UPDATE] Set lock constraint is_locked=${newLockState.toString().toUpperCase()} for ${sessionPlate} via API.`);
      
      if (newLockState) {
        triggerToast(`Đã bật chế độ chống trộm cực đỉnh cho xe ${sessionPlate}. Radar quét liên tục bảo vệ tích cực.`, 'success');
      } else {
        triggerToast(`Đã tắt khóa an toàn bảo vệ xe ${sessionPlate}. Giờ đây xe có thể ra bãi bình thường.`, 'info');
      }
    } catch (err) {
      console.error("Lock vehicle error", err);
      // Fallback for UI if API fails (since we are testing without real session context)
      setSessions(prev => prev.map(s => {
        if (s.vehicle_plate === sessionPlate) {
          return { ...s, is_locked: newLockState };
        }
        return s;
      }));
      triggerToast(`(Fallback) Đã ${newLockState ? 'bật' : 'tắt'} khóa an toàn bảo vệ xe ${sessionPlate}. (Lỗi API)`, 'warning');
    }
  };


  // ----------------------------------------------------
  // --- DYNAMIC QR EXPIRE COUNTER (5 MINUTES) ---
  // ----------------------------------------------------
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [qrStatusText, setQrStatusText] = useState<'ACTIVE' | 'EXPIRED' | 'USED'>('ACTIVE');

  // Handle countdown
  useEffect(() => {
    let timer: any;
    if (qrToken && qrStatusText === 'ACTIVE') {
      const calculateSeconds = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((qrToken.expired_at - now)/1000));
        setSecondsLeft(diff);
        if (diff <= 0) {
          setQrStatusText('EXPIRED');
          addLog(`[QR_MODULE] Dynamic Token is_expired=TRUE. Session security hash invalidated.`);
        }
      };

      // Set initially
      calculateSeconds();

      timer = setInterval(calculateSeconds, 1000);
    }
    return () => clearInterval(timer);
  }, [qrToken, qrStatusText]);

  const handleGenerateNewQr = async (purpose: string = "Thẻ xe tháng ra/vào bãi") => {
    const dummyVehicleId = '123e4567-e89b-12d3-a456-426614174000'; // FIXME: Thay bằng vehicleId thật
    
    try {
      const response = await apiClient.post(`/v1/driver/qr/generate`, {
        vehicleId: dummyVehicleId,
        purpose: purpose
      });

      const data = response.data;
      const expiredAt = new Date(data.expiredAt || Date.now() + 5 * 60 * 1000).getTime();
      
      const newQr: VipQrIdentifier = {
        qr_token: data.qrToken,
        purpose: data.purpose,
        expired_at: expiredAt,
        is_used: data.used
      };

      setQrToken(newQr);
      setSecondsLeft(Math.floor((expiredAt - Date.now()) / 1000));
      setQrStatusText('ACTIVE');

      addLog(`[QR_MODULE] [POST] Generated dynamic QR via API: ${data.qrToken}`);
      triggerToast(`Đã tạo mã QR bảo mật động mới. Có hiệu lực trong vòng 5 phút (Sinh mã dùng 1 lần)`, 'success');
    } catch (err) {
      console.error("Generate QR error", err);
      // Fallback
      const expiredAt = Date.now() + 5 * 60 * 1000;
      const mockToken = `UP_TOKEN_${Math.random().toString(36).substring(2, 10).toUpperCase()}_${Date.now().toString().slice(-4)}`;
      
      const newQr: VipQrIdentifier = {
        qr_token: mockToken,
        purpose,
        expired_at: expiredAt,
        is_used: false
      };

      setQrToken(newQr);
      setSecondsLeft(300);
      setQrStatusText('ACTIVE');
      triggerToast(`(Fallback) Đã tạo mã QR bảo mật động tạm thời do lỗi API`, 'warning');
    }
  };

  const handleSimulateScanAtGate = () => {
    if (!qrToken) {
      triggerToast(`Vui lòng bấm sinh mã QR thành viên trước!`, 'error');
      return;
    }
    if (qrStatusText === 'EXPIRED') {
      triggerToast(`Mã QR đã hết hạn lúc ${new Date(qrToken.expired_at).toLocaleTimeString('vi-VN')}. Hãy thực hiện làm mới mã!`, 'error');
      addLog(`[GATE_CONTROLLER] Scanned EXPIRED token ${qrToken.qr_token}. Access denied.`);
      return;
    }
    if (qrStatusText === 'USED') {
      triggerToast(`Mã này đã quét trước đó. Mã quét dùng 1 lần (Single-use) để chống giả mạo!`, 'error');
      addLog(`[GATE_CONTROLLER] Scanned REPLAY-ATTACK token. Token already flagged as IS_USED=TRUE.`);
      return;
    }

    // Success!
    setQrStatusText('USED');
    addLog(`[GATE_CONTROLLER] [READ] Authentic Token Validated Successfully! Token: ${qrToken.qr_token}.`);
    addLog(`[BARRIER_CONTROLLER] Signal code: INTERRUPT_OPEN_GENTLE. Barie mở lên đón thành viên VIP.`);
    triggerToast(`Quét thành công! Rào chắn đã mở. Mã QR vừa quét được đánh dấu đã sử dụng lập tức.`, 'success');
  };


  // ----------------------------------------------------
  // --- VIP SUBSCRIPTION STATES & FILES ---
  // ----------------------------------------------------
  const [selectedRegVehicle, setSelectedRegVehicle] = useState('30F-999.78');
  const [newRegPlate, setNewRegPlate] = useState('');
  const [regType, setRegType] = useState('Vàng (Thẻ Tháng Gold - 1.2M ₫)');
  
  // Custom document photos upload mock state
  const [docPhotos, setDocPhotos] = useState<{
    registrationPaper: string | null;
    identityCard: string | null;
    frontPhoto: string | null;
  }>({
    registrationPaper: null,
    identityCard: null,
    frontPhoto: null
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [vnpayModalOpen, setVnpayModalOpen] = useState(false);
  const [vnpayBank, setVnpayBank] = useState('Vietcombank');
  const [vnpayCardNo, setVnpayCardNo] = useState('9704198526314785');
  const [vnpayCardHolder, setVnpayCardHolder] = useState('NGUYEN VAN A');
  const [vnpayOtp, setVnpayOtp] = useState('');
  const [vnpayStep, setVnpayStep] = useState<'info' | 'otp' | 'success'>('info');

  const handleMockUploadFile = (docKey: 'registrationPaper' | 'identityCard' | 'frontPhoto') => {
    // Start progress
    setUploadProgress(prev => ({ ...prev, [docKey]: 10 }));
    addLog(`[ASSET_PIPELINE] Uploading file for proof doc "${docKey}"...`);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const curr = prev[docKey] || 0;
        if (curr >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [docKey]: curr + 30 };
      });
    }, 150);

    setTimeout(() => {
      // Complete mock upload path
      let mockUrl = '';
      if (docKey === 'registrationPaper') mockUrl = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&auto=format&fit=crop&q=80';
      if (docKey === 'identityCard') mockUrl = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80';
      if (docKey === 'frontPhoto') mockUrl = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=80';

      setDocPhotos(prev => ({ ...prev, [docKey]: mockUrl }));
      addLog(`[ASSET_PIPELINE] File proof "${docKey}" uploaded safely. CDN cache registered.`);
      triggerToast(`Tải tài liệu dạng ảnh thành công!`, 'success');
    }, 800);
  };

  const handleRemovePhoto = (docKey: 'registrationPaper' | 'identityCard' | 'frontPhoto') => {
    setDocPhotos(prev => ({ ...prev, [docKey]: null }));
    setUploadProgress(prev => ({ ...prev, [docKey]: 0 }));
    addLog(`[ASSET_PIPELINE] Removed proof file for "${docKey}".`);
  };

  const isFormValid = docPhotos.registrationPaper && docPhotos.identityCard && docPhotos.frontPhoto;

  const handleOpenVnpay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      triggerToast(`Bắt buộc phải tải lên đủ 3 loại ảnh minh chứng theo luật kiểm duyệt!`, 'error');
      return;
    }
    setVnpayStep('info');
    setVnpayModalOpen(true);
    addLog(`[VNPAY_GATEWAY] Opened VNPAY Sandboxed checkout overlay. Request ID: VNP-${Date.now().toString().slice(-6)}.`);
  };

  const handleSendVnpayOtp = () => {
    addLog(`[VNPAY_GATEWAY] Domestic card validated. Dynamic OTP dispatched to driver core.`);
    setVnpayStep('otp');
    setVnpayOtp('OTP-2026'); // hardcoded mock OTP
  };

  const handleConfirmVnpayPayment = () => {
    if (vnpayOtp !== '2026' && vnpayOtp !== 'OTP-2026') {
      triggerToast(`Vui lòng nhập đúng mã OTP Sandbox để tiếp tục giao dịch! (Gạch đầu: OTP-2026)`, 'error');
      return;
    }

    // Complete transaction successfully
    setVnpayStep('success');
    addLog(`[VNPAY_GATEWAY] Charge authorized. Code: VNP_SUCCESS_200. Paid value: 1.200.000₫.`);

    // Create record in subscriptions
    const subPlate = selectedRegVehicle === 'custom' ? newRegPlate.toUpperCase() : selectedRegVehicle;
    if (!subPlate) {
      triggerToast(`Vui lòng nhập biển số VIP đăng ký!`, 'error');
      return;
    }

    const newSub: VipSubscription = {
      id: `VIP-${Date.now().toString().slice(-4)}`,
      vehicle_id: subPlate,
      subscription_type: regType,
      start_date: new Date().toLocaleDateString('vi-VN'),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      status: 'PENDING_APPROVAL',
      document_photos: {
        registrationPaper: docPhotos.registrationPaper!,
        identityCard: docPhotos.identityCard!,
        frontPhoto: docPhotos.frontPhoto!
      },
      approved_by: null
    };

    setSubscriptions(prev => [newSub, ...prev]);
    addLog(`[VIP_SUBSCRIPTIONS] [POST] Added new subscription ${newSub.id} for vehicle ${newSub.vehicle_id}. Status: PENDING_APPROVAL.`);

    // Refresh photo upload form
    setDocPhotos({ registrationPaper: null, identityCard: null, frontPhoto: null });
    setUploadProgress({});
  };

  const handleCloseVnpay = () => {
    setVnpayModalOpen(false);
  };


  // ----------------------------------------------------
  // --- MANAGER APPROVAL PORTAL SIMULATOR ---
  // ----------------------------------------------------
  const handleManagerApprove = (subId: string) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === subId) {
        return { ...sub, status: 'ACTIVE', approved_by: 'Bùi Phương (Trưởng Bốt)' };
      }
      return sub;
    }));
    addLog(`[VIP_SUBSCRIPTIONS] [PUT] subscription ${subId} state flipped to ACTIVE by Manager Bùi Phương.`);
    triggerToast(`Đã duyệt phê duyệt thành công hồ sơ ${subId}. Thẻ thành viên chính thức hoạt động!`, 'success');
  };

  const handleManagerReject = (subId: string) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === subId) {
        return { ...sub, status: 'REJECTED', approved_by: 'Bùi Phương (Trưởng Bốt)' };
      }
      return sub;
    }));
    addLog(`[VIP_SUBSCRIPTIONS] [PUT] subscription ${subId} state flipped to REJECTED. File did not meet requirements.`);
    triggerToast(`Hồ sơ ${subId} bị từ chối phê duyệt. Tài xế sẽ cần nộp lại ảnh chứng từ chuẩn xác.`, 'warning');
  };


  // Helpers for formatting timers
  const formatTimeMinutes = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="driver-web-portal-straight" className="space-y-6 animate-fade-in font-sans relative">
      
      {/* Sleek Top Navigation Header */}
      <header className={`px-6 py-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 select-none ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20 text-blue-600">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-lg font-black text-blue-600 tracking-tight block">UrbanPark Portal</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Driver Application Interface</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden flex items-center justify-center bg-blue-50 text-blue-600 font-extrabold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong className="text-xs font-black block text-slate-800 dark:text-slate-100">{user.name}</strong>
              <span className="text-[10px] text-slate-400 font-mono tracking-wide">{user.phone} • DRIVER</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-3 text-xs font-black uppercase bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>
      
      {/* ALARM CRITICAL INTERACTIVE FULL SCREEN BLINKING ALERT */}
      <AnimatePresence>
        {isAlertOverlayShown && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto"
          >
            <div className="max-w-2xl w-full bg-slate-900 border-4 border-rose-600 rounded-3xl p-8 shadow-2xl relative space-y-6 text-white my-auto">
              
              {/* Siren wave animations */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] aspect-square rounded-full border border-rose-500/20 animate-ping pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border-2 border-rose-500/10 animate-pulse pointer-events-none" />

              <div className="w-24 h-24 bg-rose-600 rounded-full flex items-center justify-center mx-auto animate-bounce border-4 border-white text-white shadow-lg shadow-rose-500/50">
                <ShieldAlert className="w-12 h-12 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black font-mono tracking-widest text-rose-500 bg-rose-500/10 py-1.5 px-4 rounded-full border border-rose-500/20 uppercase inline-block">
                  AN NINH QUỐC PHÒNG - URBANPARK SHIELD
                </span>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                  Bỏ Trộm Xe Đã Kích Hoạt!
                </h1>
                <p className="text-rose-200 text-sm max-w-lg mx-auto">
                  Phương tiện bị khóa an ninh <strong className="text-yellow-300 font-extrabold">{fcmNotification?.plate || simulatedSelectedPlate}</strong> đã kích hoạt quét AI Camera bốt xuất bãi vượt rào chắn trái phép.
                </p>
              </div>

              {/* FCM message bubble simulation inside popup */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-1.5 border-b border-rose-900/40">
                  <span className="text-[10px] text-rose-500 font-bold tracking-wider font-mono">PUSH ALERT DISPATCHED</span>
                  <span className="text-[10px] text-slate-500 font-mono">{fcmNotification?.time}</span>
                </div>
                <strong className="text-xs text-rose-400 font-bold block">{fcmNotification?.title}</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{fcmNotification?.body}</p>
                <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                  <span>LATENCY: 12ms (FIREBASE FCM)</span>
                  <span className="text-emerald-400">SIGNAL STATE: SENT</span>
                </div>
              </div>

              {/* Real-time system locks status */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono max-w-md mx-auto pt-2">
                <div className="bg-rose-900/30 border border-rose-800 rounded-xl p-3 text-center">
                  <span className="block text-[10px] text-rose-400">BARIE CỔNG</span>
                  <strong className="text-rose-500 block text-sm mt-1 animate-pulse">KHÓA CỨNG (FROZEN)</strong>
                </div>
                <div className="bg-rose-900/30 border border-rose-800 rounded-xl p-3 text-center">
                  <span className="block text-[10px] text-rose-400">CÒI BÁO ĐỘNG</span>
                  <strong className="text-rose-500 block text-sm mt-1 animate-pulse">HÚ ĐAN XE DẢI HIGH/LOW</strong>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
                <button
                  onClick={handleDismissTheftAlarm}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-sm rounded-xl tracking-wide uppercase transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Tắt còi báo động & Reset Barie
                </button>
                <button
                  onClick={() => setIsSirenMuted(!isSirenMuted)}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSirenMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5 text-rose-400 animate-pulse" />}
                  <span>{isSirenMuted ? 'Bật lại âm thanh' : 'Tắt tiếng chuông'}</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRIVER GENERAL WEB BANNER (NO PHONE) */}
      <div className={`p-8 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-linear-to-r from-blue-600 to-sky-700 border-blue-700 text-white shadow-xl shadow-blue-600/10'}`}>
        {/* Background gradient flares */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest font-mono uppercase border border-white/10">
              CỔNG TÀI XẾ WEB TRỰC TIẾP (NO-SIMULATOR)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-none sm:text-4xl">Trình Giả Lập Độc Lập Cho Tài Xế</h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
            Duy trì kết nối in-memory và local storage hoàn chỉnh cho bốt AI, khóa an ninh thời gian thực chống trộm, QR tháng sinh động bảo vệ chống phát lại (Replay-attacks) và hệ thống đăng ký gói cước VIP thông qua cổng VNPAY Sandbox tối tân.
          </p>
        </div>

        {/* Action center shortcut buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10 shrink-0">
          <button 
            onClick={() => handleGenerateNewQr()}
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-slate-50 active:scale-98 transition-all font-black text-xs rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
          >
            Sinh QR mới nhanh
          </button>
          <button 
            onClick={() => simulateSecurityBreach('29A-882.11')}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white active:scale-98 transition-all font-bold text-xs rounded-xl shadow-xs uppercase tracking-normal cursor-pointer flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-white" /> Test Đột Nhập Trộm Xe
          </button>
        </div>
      </div>

      {/* TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-40 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-slide-in"
          style={{
            backgroundColor: toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'warning' ? '#f59e0b' : toastMessage.type === 'info' ? '#3b82f6' : '#10b981',
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          <CheckCircle className="w-5 h-5 shrink-0 text-white" />
          <span className="text-xs font-black tracking-tight">{toastMessage.text}</span>
        </div>
      )}

      {/* CORE WORKSPACE TABS */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2 font-mono scrollbar-none pb-0.5">
        {[
          { id: 'security', label: '🛡️ KHÓA AN NINH CHỐNG TRỘM', color: 'rose' },
          { id: 'vip_reg', label: '💳 ĐĂNG KÝ VÉ THÁNG VIP & VNPAY', color: 'blue' },
          { id: 'qr_card', label: '🎫 THẺ XE QR ĐỘNG (SINGLE-USE)', color: 'violet' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all relative overflow-hidden cursor-pointer ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold focus:outline-hidden' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-slide-in" />
            )}
          </button>
        ))}
      </div>

      {/* THREE INTERACTIVE WORKSPACES CONTENT AREAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* BIG WORKSPACE LEFT GRID (COVERS 3 COLUMNS) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: SECURITY KNOB & ANTI-THEFT CONSOLE */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'} space-y-6`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-dashed border-slate-200/50">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold tracking-tight">Giám sát xe chủ lực & Khóa chống trộm</h2>
                    <p className="text-slate-400 text-xs text-slate-400">
                      Gạt khóa xe của bạn tại bãi để kích hoạt radar AI bảo vệ, phát tín hiệu cản lập tức nếu xe di chuyển vượt trạm quét.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20 py-1.5 px-3 rounded-lg">
                    <Shield className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span className="font-bold">RADAR GUARD: ON</span>
                  </div>
                </div>

                {/* Grid list showing cars and lock status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sessions.map(s => {
                    const hasVip = subscriptions.some(v => v.vehicle_id === s.vehicle_plate && v.status === 'ACTIVE');
                    return (
                      <div key={s.id} className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${s.is_locked ? 'border-rose-500 bg-rose-500/5 shadow-md shadow-rose-500/5' : isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                        {/* Continuous pulsing radar ripples if locked */}
                        {s.is_locked && (
                          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                            <span className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-rose-500/35 animate-ping" style={{ animationDuration: '3s' }} />
                          </div>
                        )}

                        <div className="flex justify-between items-start pb-3 border-b border-slate-200/10 relative z-10">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono block">VI TRÍ PHÂN KHU</span>
                            <span className="font-bold text-slate-700 dark:text-slate-100 text-xs flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                              {s.location}
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider font-extrabold flex items-center gap-1 ${hasVip ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/10'}`}>
                            {hasVip ? <Sparkles className="w-3 h-3 text-blue-400 animate-spin" /> : null}
                            {hasVip ? 'VIP SUBS' : 'VÃNG LAI'}
                          </span>
                        </div>

                        {/* License Plate Display */}
                        <div className="py-4 text-center relative z-10 space-y-1">
                          <strong className="text-2xl font-black font-mono tracking-wider bg-slate-200 dark:bg-slate-800 py-1.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 inline-block text-slate-800 dark:text-slate-100 select-all">
                            {s.vehicle_plate}
                          </strong>
                          <span className="text-[10px] text-slate-400 block font-semibold font-mono">
                            VÀO BÃI: {s.entry_time}
                          </span>
                        </div>

                        {/* Toggle lock segment */}
                        <div className="flex items-center justify-between pt-3 relative z-10 border-t border-slate-200/10">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">KHÓA BẢO VỆ</span>
                            <span className={`text-xs font-black ${s.is_locked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                              {s.is_locked ? '🔒 CUỐC KHÓA BẬT' : '🔓 KHÔNG BẢO VỆ'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleLock(s.vehicle_plate)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-xs ${
                              s.is_locked 
                                ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            {s.is_locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SIMULATION BENCHMARK CONTROLLER (THEFT SIMULATION AREA) */}
              <div className={`p-6 rounded-3xl border bg-slate-900 border-slate-800 text-white space-y-4`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                    <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] text-rose-400">Theft Attack Simulation Sandbox</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Bảng kiểm thử an toàn - Giả lập hành vi giật bế cổng</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Để kiểm chứng cơ chế camera AI và cản rầm Barie hoạt động dưới 500ms, quý khách hãy chọn một biển số xe đang gửi tại bãi phía trên (đã bật khóa chống trộm), rồi bấm kích nổ giả lập vượt rào dưới đây.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <div className="space-y-1.5 flex-1 select-none">
                    <label className="text-[9px] font-extrabold text-slate-500 font-mono uppercase block tracking-wider">Chọn Xe Trộm Bản Thử</label>
                    <div className="flex gap-2">
                      {sessions.map(s => {
                        const activeLock = s.is_locked;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setSimulatedSelectedPlate(s.vehicle_plate)}
                            className={`py-2 px-3 font-mono font-bold text-xs rounded-xl cursor-pointer border transition-all ${
                              simulatedSelectedPlate === s.vehicle_plate 
                                ? 'bg-rose-600 border-rose-500 text-white' 
                                : activeLock 
                                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-300 hover:bg-rose-950/30' 
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {s.vehicle_plate} {activeLock ? '🔒' : '🔓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => simulateSecurityBreach(simulatedSelectedPlate)}
                    className="sm:mt-5 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-rose-950 flex items-center justify-center gap-2 border border-rose-500/20 cursor-pointer"
                  >
                    <ShieldAlert className="w-4.5 h-4.5 text-white animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Trigger Theft Attempt</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: VIP REGISTRATION FORM & VNPAY PAYMENT FLOW */}
          {activeTab === 'vip_reg' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Registration Upload constraints */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'} space-y-6`}>
                  <div className="space-y-1">
                    <h2 className="text-lg font-extrabold tracking-tight">Đăng ký mới vé tháng VIP</h2>
                    <p className="text-slate-400 text-xs">
                      Áp dụng quy trình kiểm định minh bạch. Bạn bắt buộc phải nộp đủ 3 loại ảnh chứng từ bên dưới để mở tiếp cổng thanh toán VNPAY Sandbox.
                    </p>
                  </div>

                  <form onSubmit={handleOpenVnpay} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase font-mono tracking-wider">Chọn Xe Bạn Đang Đăng Ký</label>
                        <select
                          value={selectedRegVehicle}
                          onChange={e => setSelectedRegVehicle(e.target.value)}
                          className={`w-full py-2.5 px-3 border rounded-xl text-xs font-semibold outline-hidden focus:border-blue-500 ${isDarkMode ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <option value="30F-999.78">🚗 30F-999.78 (Phương Bùi)</option>
                          <option value="29A-882.11">🚗 29A-882.11 (Xe máy hầm)</option>
                          <option value="51G-246.80">🏍️ 51G-246.80 (Vãng lai)</option>
                          <option value="custom">✍️ [Đăng ký xe số khác]</option>
                        </select>
                      </div>

                      {selectedRegVehicle === 'custom' && (
                        <div className="animate-fade-in">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase font-mono tracking-wider">Biển Số Xe Mới</label>
                          <input
                            type="text"
                            value={newRegPlate}
                            onChange={e => setNewRegPlate(e.target.value)}
                            placeholder="Ví dụ: 30K-123.45"
                            className={`w-full py-2.5 px-3 border rounded-xl text-xs font-bold font-mono outline-hidden focus:border-blue-500 ${isDarkMode ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200'}`}
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase font-mono tracking-wider">Hạn Mức Đăng Ký Gói</label>
                        <select
                          value={regType}
                          onChange={e => setRegType(e.target.value)}
                          className={`w-full py-2.5 px-3 border rounded-xl text-xs font-semibold outline-hidden focus:border-blue-500 ${isDarkMode ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <option value="Vàng (Thẻ Tháng Gold - 1.2M ₫)">🏆 Thẻ Vàng (Gold Gold) - 1.200.000₫/Tháng</option>
                          <option value="Kim Cương (Thẻ VIP - 3.2M ₫)">💎 Thẻ Kim Cương (Bảo vệ AI) - 3.200.000₫/Quý</option>
                          <option value="Xe Máy (Tháng rẻ - 150K ₫)">🏍️ Xe Máy Cực Tốc - 150.000₫/Tháng</option>
                        </select>
                      </div>
                    </div>

                    {/* Scenario 1: Given Driver fills form, when missing document photos, submit disabled */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Hồ sơ minh chứng bắt buộc ({Object.values(docPhotos).filter(Boolean).length}/3)
                      </span>

                      {/* Doc 1: Cà vẹt xe */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-850/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-slate-800 rounded-lg text-blue-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-xs font-bold block">1. Cà Vẹt Xe (Đăng Ký Xe)</strong>
                            <span className="text-[10px] text-slate-400">Chụp rõ số khung, số máy</span>
                          </div>
                        </div>

                        {docPhotos.registrationPaper ? (
                          <div className="flex items-center gap-2">
                            <img src={docPhotos.registrationPaper} className="w-10 h-10 object-cover rounded-lg border border-slate-200" alt="registration" />
                            <button type="button" onClick={() => handleRemovePhoto('registrationPaper')} className="text-red-500 hover:text-red-600 text-xs font-bold cursor-pointer">Xóa</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMockUploadFile('registrationPaper')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] tracking-wide px-3  py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 uppercase"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                        )}
                      </div>

                      {/* Doc 2: CMND/CCCD */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-850/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-violet-100 dark:bg-slate-800 rounded-lg text-violet-600">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-xs font-bold block">2. CMND/CCCD Người Đăng Ký</strong>
                            <span className="text-[10px] text-slate-400">CCCD 12 Số hoặc CMT cũ định danh</span>
                          </div>
                        </div>

                        {docPhotos.identityCard ? (
                          <div className="flex items-center gap-2">
                            <img src={docPhotos.identityCard} className="w-10 h-10 object-cover rounded-lg border border-slate-200" alt="id" />
                            <button type="button" onClick={() => handleRemovePhoto('identityCard')} className="text-red-500 hover:text-red-600 text-xs font-bold cursor-pointer">Xóa</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMockUploadFile('identityCard')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] tracking-wide px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 uppercase"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                        )}
                      </div>

                      {/* Doc 3: Ảnh thực tế đầu xe */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-850/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-slate-800 rounded-lg text-emerald-600">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-xs font-bold block">3. Ảnh Thực Tế Đầu Xe & Biển Số</strong>
                            <span className="text-[10px] text-slate-400">Chụp rõ ràng biển trước xe</span>
                          </div>
                        </div>

                        {docPhotos.frontPhoto ? (
                          <div className="flex items-center gap-2">
                            <img src={docPhotos.frontPhoto} className="w-10 h-10 object-cover rounded-lg border border-slate-200" alt="front car" />
                            <button type="button" onClick={() => handleRemovePhoto('frontPhoto')} className="text-red-500 hover:text-red-600 text-xs font-bold cursor-pointer">Xóa</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMockUploadFile('frontPhoto')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] tracking-wide px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 uppercase"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Scenario 1 button checking: If has 3 photos, button is active, else isDisabled */}
                    <div>
                      {!isFormValid ? (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs space-y-1 text-center font-semibold mb-3">
                          <p>⚠️ HỆ THỐNG ĐANG KHÓA NÚT THANH TOÁN</p>
                          <p className="text-[10px] text-rose-400 font-sans font-normal font-medium leading-relaxed">
                            Vui lòng click đăng tải đủ cả 3 minh chứng (Cà vẹt, CMT, Ảnh xe) để mở khóa nộp hồ sơ.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs text-center font-bold mb-3">
                          🏆 Hồ sơ hợp lệ! Đã mở khóa cổng kết nối thanh toán Sandbox VNPAY.
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!isFormValid}
                        className={`w-full py-3.5 text-xs text-white uppercase tracking-widest font-black rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer text-center ${
                          isFormValid 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                        }`}
                      >
                        Tiếp tục thanh toán VNPAY
                      </button>
                    </div>

                  </form>
                </div>

                {/* Dashboard logs on subscriptions right next to form */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'} space-y-5 flex-1`}>
                  <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200/60">
                    <div>
                      <h3 className="font-extrabold text-[15px] tracking-tight">Danh sách hồ sơ vé VIP tháng</h3>
                      <p className="text-[11px] text-slate-400">Tra cứu trạng thái nộp, duyệt bởi Manager</p>
                    </div>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      COUNT: {subscriptions.length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {subscriptions.map(sub => (
                      <div key={sub.id} className={`p-4 rounded-2xl border ${
                        sub.status === 'PENDING_APPROVAL' 
                          ? 'border-amber-400 bg-amber-500/5' 
                          : sub.status === 'ACTIVE' 
                            ? 'border-emerald-500 bg-emerald-500/5' 
                            : 'border-rose-500 bg-rose-500/5'
                      } space-y-3`}>
                        
                        <div className="flex justify-between items-start border-b border-slate-200/10 pb-2">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-mono">ID ĐĂNG KÍ: {sub.id}</span>
                            <strong className="text-sm font-black font-mono mt-0.5 block">{sub.vehicle_id}</strong>
                          </div>

                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            sub.status === 'PENDING_APPROVAL' 
                              ? 'bg-amber-100 text-amber-800' 
                              : sub.status === 'ACTIVE' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {sub.status === 'PENDING_APPROVAL' ? 'Đang Chờ Duyệt (PENDING)' : sub.status === 'ACTIVE' ? 'Đang Hoạt Động (ACTIVE)' : 'Bị Từ Chối (REJECTED)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] leading-tight">
                          <div>
                            <span className="text-slate-400 block">Dịch vụ gói cước:</span>
                            <span className="font-bold">{sub.subscription_type}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Thời hạn áp dụng:</span>
                            <span className="font-mono text-slate-600 dark:text-slate-300">{sub.start_date} - {sub.end_date}</span>
                          </div>
                        </div>

                        {/* Document previews thumbnails */}
                        <div className="space-y-1 pt-1 border-t border-slate-200/10">
                          <span className="text-[9px] text-slate-400 uppercase font-mono block font-bold">Minh chứng lưu vết (document_photos JSON):</span>
                          <div className="flex gap-2">
                            <span className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">1. Cà vẹt Đã nộp</span>
                            <span className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">2. CCCD Đã nộp</span>
                            <span className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">3. Ảnh xe Đã nộp</span>
                          </div>
                        </div>

                        {/* SIMULATED MANAGER INTERACTION */}
                        {sub.status === 'PENDING_APPROVAL' && (
                          <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/60 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-blue-600 font-mono">MANAGER SIMULATION BOX:</span>
                              <span className="text-[9px] text-slate-400">Giả lập duyệt hồ sơ tháng</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleManagerApprove(sub.id)}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                              >
                                Phê duyệt (Approve)
                              </button>
                              <button
                                onClick={() => handleManagerReject(sub.id)}
                                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                              >
                                Từ chối (Reject)
                              </button>
                            </div>
                          </div>
                        )}

                        {sub.status !== 'PENDING_APPROVAL' && (
                          <div className="text-[10px] text-slate-500 font-semibold font-sans italic pt-1 flex justify-between">
                            <span>Người phê duyệt tài liệu:</span>
                            <span className="text-blue-500 font-bold">{sub.approved_by || 'Manager Trưởng'}</span>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: DYNAMIC MEMBER QR TICKET COOLDOWN SYSTEM */}
          {activeTab === 'qr_card' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual dynamic QR card with countdown */}
                <div className={`p-8 rounded-3xl border text-center relative overflow-hidden ${
                  qrStatusText === 'ACTIVE' 
                    ? 'border-blue-500 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white' 
                    : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500'
                } space-y-6 flex flex-col justify-center items-center`}>
                  
                  {/* Glowing halo behind code */}
                  {qrStatusText === 'ACTIVE' && (
                    <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  )}

                  <div className="space-y-1.5 z-10">
                    <span className="text-[10px] font-mono tracking-widest font-extrabold py-1 px-3 bg-white/10 dark:bg-slate-800/80 rounded-full border border-white/15 inline-block text-blue-400 select-all">
                      {qrToken ? qrToken.qr_token : 'CHƯA KHỞI TẠO TOKEN'}
                    </span>
                    <h2 className="text-xl font-black tracking-tight text-white">
                      Mã QR Thành Viên Động (5-Phút)
                    </h2>
                    <p className="text-slate-400 text-xs text-[11px] max-w-sm mx-auto font-sans">
                      Hệ thống tự động thay đổi khóa mã hóa của Token sau 5 phút nhằm chống việc sao chụp mã hoặc gian lận đỗ xe.
                    </p>
                  </div>

                  {/* QR Image visual representation with dimming mask */}
                  <div className="relative p-5 bg-white rounded-3xl inline-block shadow-xl mx-auto z-10 transition-all">
                    
                    <div className={`transition-all duration-300 ${qrStatusText !== 'ACTIVE' ? 'blur-md opacity-25' : ''}`}>
                      {/* Fake stylized QR node matrix */}
                      <div className="w-44 h-44 flex flex-col justify-between p-1">
                        <div className="flex justify-between">
                          <div className="w-12 h-12 border-4 border-slate-900 rounded-sm flex items-center justify-center"><div className="w-4 h-4 bg-slate-900" /></div>
                          <div className="w-12 h-12 border-4 border-slate-900 rounded-sm flex items-center justify-center"><div className="w-4 h-4 bg-slate-900" /></div>
                        </div>
                        {/* QR Grid points representation */}
                        <div className="flex flex-col gap-1 px-1">
                          <div className="flex justify-around"><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/></div>
                          <div className="flex justify-around"><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/></div>
                          <div className="flex justify-around"><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-none rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/></div>
                          <div className="flex justify-around"><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/><span className="w-2 h-2 bg-none rounded-full"/><span className="w-2 h-2 bg-slate-900 rounded-full"/></div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="w-12 h-12 border-4 border-slate-900 rounded-sm flex items-center justify-center"><div className="w-4 h-4 bg-slate-900" /></div>
                          <QrCode className="w-10 h-10 text-blue-600 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Expired / Used Stamp */}
                    {qrStatusText !== 'ACTIVE' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <span className={`px-4 py-2 rounded-2xl font-black text-xs font-mono tracking-wider rotate-[-12deg] uppercase border-4 ${
                          qrStatusText === 'EXPIRED' 
                            ? 'bg-rose-600 text-white border-white scale-110 shadow-lg' 
                            : 'bg-emerald-600 text-white border-white scale-110 shadow-lg'
                        }`}>
                          {qrStatusText === 'EXPIRED' ? '🚫 ĐÃ HẾT HẠN' : '✅ ĐÃ SỬ DỤNG'}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Progress Timer display */}
                  <div className="w-full max-w-sm space-y-2.5 z-10 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-4 h-4 text-blue-400" />
                        Hiệu lực đếm ngược:
                      </span>
                      <strong className={`font-black text-base text-white font-mono ${secondsLeft < 30 ? 'text-red-500 animate-pulse' : ''}`}>
                        {formatTimeMinutes(secondsLeft)}
                      </strong>
                    </div>

                    {/* Decreasing progress bar from 300s to 0s */}
                    <div className="h-2.5 bg-slate-850 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          secondsLeft < 30 ? 'bg-red-500' : secondsLeft < 100 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(secondsLeft / 300) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>SEC_REMAINING: {secondsLeft}s</span>
                      <span>MAX_TTL: 300s (5 phút)</span>
                    </div>

                    {qrStatusText === 'EXPIRED' && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs leading-normal">
                        Mã đã hết hiệu lực 5 phút bảo vệ. Vui lòng bấm làm mới sinh Token ngẫu nhiên mới!
                      </div>
                    )}
                  </div>

                  <div className="w-full max-w-sm flex gap-2 z-10">
                    <button
                      onClick={() => handleGenerateNewQr()}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl tracking-wider uppercase transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                      Làm mới mã QR
                    </button>
                  </div>

                </div>

                {/* Gate Scanner Simulator Panel */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'} space-y-5`}>
                  <div className="flex items-center gap-2.5 pb-2 border-b border-dashed border-slate-200/60">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-slate-800 flex items-center justify-center text-violet-600">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[15px] tracking-tight">Gate Reader Terminal Simulator</h3>
                      <p className="text-[11px] text-slate-400">Giả lập đầu đọc mã QR đặt tại Barie bốt ra vào bãi</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Để kiểm thử quy định bảo mật: <strong>Mã quét chỉ sử dụng được duy nhất một lần (Single-use)</strong>. Khi tài xế quét thẻ tại bốt ra, cổng tự động ghi nhận là dùng rồi để đề phòng rò rỉ mã QR.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3 font-mono">
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>READER STATUS</span>
                      <span className="text-emerald-500 font-bold">ONLINE</span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Thiết bị quét:</span>
                        <strong className="text-slate-700 dark:text-slate-100">UP_BARRIER_GATE_01</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Chế độ:</span>
                        <strong className="text-slate-700 dark:text-slate-100 font-sans">Thành Viên VIP Đăng Ký</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Token quét nhận vật lý:</span>
                        <span className="font-bold text-blue-500 max-w-[150px] truncate block text-right">
                          {qrToken ? qrToken.qr_token : '(Chưa nhận)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateScanAtGate}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-violet-950/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4.5 h-4.5 animate-pulse" />
                    <span>Quét thử tại đầu đọc Barie</span>
                  </button>

                  <div className="bg-violet-500/10 p-3.5 rounded-xl text-[10px] text-violet-600 dark:text-violet-400 leading-normal flex gap-2">
                    <Info className="w-4.5 h-4.5 shrink-0" />
                    <p className="font-sans">
                      Hãy tạo mã QR, sau đó bấm nút gạt này. Trạng thái QR sẽ chuyển thành <strong className="text-emerald-600">ĐÃ SỬ DỤNG</strong> ngay lập tức để hạn chế tối đa nguy cơ nhân bản mã lậu.
                    </p>
                  </div>

                </div>

              </div>
              
            </div>
          )}

        </div>

        {/* LOG SYSTEM WORKSPACE SIDEBAR (COVERS 1 COLUMN) */}
        <div id="logs-api-console" className="space-y-6">
          
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-950 text-slate-100 shadow-xl space-y-4 font-mono text-xs flex flex-col justify-between h-[650px]">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h4 className="font-black text-[11px] tracking-wider uppercase">Axios API & Hardware logs</h4>
                </div>
                <button 
                  onClick={() => setApiLogs([`[${new Date().toLocaleTimeString('vi-VN')}] Logs cleared by host.`])}
                  className="text-[9px] text-slate-500 hover:text-slate-300 font-sans cursor-pointer underline"
                >
                  Xóa log
                </button>
              </div>

              {/* Log message output stream lines */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5 text-[9.5px] leading-relaxed font-mono custom-scrollbar">
                {apiLogs.map((log, index) => {
                  let textStyle = "text-slate-400";
                  if (log.includes("!!!")) textStyle = "text-rose-500 font-extrabold animate-pulse bg-rose-500/5 p-1 rounded border border-rose-500/20";
                  else if (log.includes("[VNPAY")) textStyle = "text-blue-400 font-bold";
                  else if (log.includes("[QR_MODULE")) textStyle = "text-violet-400";
                  else if (log.includes("ACTIVE") || log.includes("Valid")) textStyle = "text-emerald-400";
                  else if (log.includes("PENDING")) textStyle = "text-amber-400";
                  return (
                    <div key={index} className={`pb-1 border-b border-slate-800/30 break-all select-text ${textStyle}`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-[9px] text-slate-500 flex justify-between items-center bg-slate-900 z-10">
              <span className="animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                DB THỜI GIAN THỰC
              </span>
              <span>TOKEN: LOCALSTORAGE</span>
            </div>

          </div>

        </div>

      </div>

      {/* DETAILED TRANSACTION LOGS ON WEB SECTION */}
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
        <div className="flex items-center gap-2.5 pb-4 border-b border-dashed border-slate-200/60 mb-5">
          <div className="w-8 h-8 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600">
            <History className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] tracking-tight">Nhật ký phiên gửi xe tại bốt</h3>
            <p className="text-[11px] text-slate-400">Xem vết ra vào, trạng thái khóa bảo vệ trộm (is_locked) và lịch sử đóng barie</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold border-b border-slate-200/50 dark:border-slate-800 font-mono text-[9px]">
                <th className="p-4 uppercase tracking-wider">Phiên ID</th>
                <th className="p-4 uppercase tracking-wider">Biển số xe</th>
                <th className="p-4 uppercase tracking-wider">Phân loại xe</th>
                <th className="p-4 uppercase tracking-wider">Mốc thời gian vào</th>
                <th className="p-4 uppercase tracking-wider">Phân khu đỗ</th>
                <th className="p-4 uppercase tracking-wider">Khóa chống trộm (is_locked)</th>
                <th className="p-4 uppercase tracking-wider text-right">Mô phỏng camera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {sessions.map(s => {
                const isLocked = s.is_locked;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{s.id}</td>
                    <td className="p-4">
                      <span className="font-bold font-mono bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-lg text-slate-800 dark:text-slate-100 border dark:border-slate-700 text-xs">
                        {s.vehicle_plate}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-500 font-sans">{s.vehicle_type === 'Ô tô' ? '🚘 Ô tô' : '🏍️ Xe máy'}</td>
                    <td className="p-4 font-mono text-slate-500">{s.entry_time}</td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{s.location}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase border ${
                        isLocked 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' 
                          : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
                        {isLocked ? 'IS_LOCKED=TRUE' : 'IS_LOCKED=FALSE'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => simulateSecurityBreach(s.vehicle_plate)}
                        className={`py-1.5 px-3.5 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all ${
                          isLocked 
                            ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isLocked ? 'Quét Camera (Thử cướp xe)' : 'Quét Camera (Xe ra cổng bình thường)'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------
          --- VNPAY SANDBOX HIGH-FIDELITY OVERLAY MODAL ---
          ---------------------------------------------------- */}
      <AnimatePresence>
        {vnpayModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-slate-850 select-text"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              
              {/* VNPAY RED HEADER BRAND */}
              <div className="bg-[#e02020] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white text-[#e02020] px-3 py-1 rounded font-black italic tracking-tighter text-lg">
                    VNPAY
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] leading-tight text-white">CỔNG THANH TOÁN QUỐC TẾ</h3>
                    <p className="text-[10px] text-white/80 font-mono">SANDBOX DEV-ENVIRONMENT</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseVnpay}
                  className="p-1 text-white/80 hover:text-white transition-opacity font-bold text-xs bg-white/10 rounded-lg px-2.5 cursor-pointer"
                >
                  HỦY GIAO DỊCH
                </button>
              </div>

              {/* VNPAY STEPS INFO */}
              {vnpayStep === 'info' && (
                <div className="p-6 space-y-5">
                  <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-rose-700 text-xs text-center font-bold">
                    ⚠️ Môi trường GIẢ LẬP TESTING. Không trừ tiền thật từ tài khoản của quý khách!
                  </div>

                  {/* Summary of checkout */}
                  <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Đơn vị thụ hưởng:</span>
                      <strong className="text-slate-800 font-extrabold text-blue-700">Công ty UrbanPark Việt Nam</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Biển kiểm soát:</span>
                      <strong className="text-slate-800 font-mono font-bold uppercase">
                        {selectedRegVehicle === 'custom' ? newRegPlate.toUpperCase() : selectedRegVehicle}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Mục đích cước phí:</span>
                      <strong className="text-slate-800 font-extrabold">{regType}</strong>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-200 mt-2.5 pt-2.5">
                      <span className="text-slate-700 font-black text-xs">SỐ TIỀN CẦN THANH TOÁN VNPAY:</span>
                      <strong className="text-red-600 font-black text-base font-mono">1.200.000 ₫</strong>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                    <CreditCard className="w-4 h-4 text-white" /> XÁC THỰC THẺ VÀ LẤY OTP SANDBOX
                  </button>
                </div>
              )}

              {vnpayStep === 'otp' && (
                <div className="p-6 space-y-5 text-center">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-100">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-slate-800">Xác thực giao dịch VNPAY OTP</h3>
                    <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">
                      Một mã OTP gián dụng đã được gửi đến số điện thoại tài xế. Mức phí thanh toán <strong className="text-red-500 font-bold font-mono">1.200.000đ</strong>.
                    </p>
                  </div>

                  {/* Sandbox Hint */}
                  <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-[11px] text-red-700 font-mono font-bold leading-relaxed">
                    Mã OTP Sandbox gợi ý: <strong className="text-lg text-red-600 block my-1 font-black underline select-all">OTP-2026</strong>
                    (Hoặc quý khách gõ tắt <strong className="text-red-600 font-extrabold font-mono text-sm">2026</strong> để vượt tiến trình nhanh).
                  </div>

                  <div className="max-w-[200px] mx-auto">
                    <input
                      type="text"
                      value={vnpayOtp}
                      onChange={e => setVnpayOtp(e.target.value)}
                      placeholder="Mã OTP..."
                      className="w-full py-3 px-4 border rounded-2xl text-center font-bold tracking-widest text-[#e02020] font-mono outline-hidden focus:border-red-500 input-placeholder-center"
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
                <div className="p-8 space-y-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-lg text-emerald-600">Thanh toán VNPAY thành công!</h3>
                    <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
                      Đã ghi nhận cước phí <strong className="text-slate-800">1.200.000 ₫</strong>. Hồ sơ đăng ký đã gửi thẳng đến Manager phê duyệt chứng từ ảnh.
                    </p>
                  </div>

                  {/* Transaction record details */}
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

  // domestic helpers
  function handleSendVnpayDomesticCard(e: React.FormEvent) {
    e.preventDefault();
    if (!vnpayCardNo.trim() || !vnpayCardHolder.trim()) {
      triggerToast(`Vui lòng điền đủ Số thẻ và Họ tên chủ thẻ giả lập trong Sandbox!`, 'error');
      return;
    }
    handleSendVnpayOtp();
  }
}
