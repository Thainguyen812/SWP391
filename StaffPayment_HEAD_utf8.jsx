import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  EditOutlined, 
  CheckCircleFilled,
  CloseCircleFilled,
  BankOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  WarningFilled,
  CarOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { notification, Input, Button, Modal, Spin, QRCode } from 'antd';
import { useGlobalContext } from '../../context/GlobalContext';
import { apiClient } from '../../api/apiClient';
import { parkingService } from '../../services/parkingService';

export const StaffPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, fetchAllDataFromBackend, addTransaction, updateShiftStats, shiftStats, addActivityLog, currentVehicle, activeVehicles, removeActiveVehicle, isEmergency, currentUser, getVehicleFines, clearVehicleFines } = useGlobalContext();
  

  const totalSlots = 500; // Static capacity for now until API provides it
  const activeCount = activeVehicles ? activeVehicles.filter(v => !v.gate).length : 0;
  const emptyCount = Math.max(0, totalSlots - activeCount);
  const occupancyPercent = totalSlots > 0 ? Math.round((activeCount / totalSlots) * 100) : 0;
  
  const lostCardData = location.state?.lostCardVehicle;
  const isLostCard = location.state?.isLostCard;
  const penaltyAmount = location.state?.penaltyAmount || 200000;
  const baseAmount = 50000;
  
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [lan1Status, setLan1Status] = useState(isLostCard ? 'busy' : 'free');
  const [lan2Status, setLan2Status] = useState('free');
  const [lpr, setLpr] = useState(location.state?.lpr || lostCardData?.plate || currentVehicle?.plate || '30G-123.45');
  const [isEditingLpr, setIsEditingLpr] = useState(false);
  const [hasVehicle, setHasVehicle] = useState(isLostCard ? true : false);
  const [cashGiven, setCashGiven] = useState(0);
  const [cardCode, setCardCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [backendTxn, setBackendTxn] = useState(null);
  const [identityVerified, setIdentityVerified] = useState(isLostCard ? true : false);
  const [vnpayUrl, setVnpayUrl] = useState('');
  const [isPollingVnpay, setIsPollingVnpay] = useState(false);

  const calculateVisitorFee = (durationStr) => {
    if (!durationStr || durationStr === '─Éang v├áo') return 30000; // Default minimum fee
    const matchHours = durationStr.match(/(\d+)h/i);
    const matchMins = durationStr.match(/(\d+)m/i);
    const hours = matchHours ? parseInt(matchHours[1]) : 0;
    const mins = matchMins ? parseInt(matchMins[1]) : 0;
    
    // Round up if > 15 mins past the hour
    const totalHours = hours + (mins > 15 ? 1 : 0);
    
    let fee = 30000; // First 2 hours
    if (totalHours > 2) {
      fee += (totalHours - 2) * 10000; // +10k per additional hour
    }
    return fee;
  };

  const vehicleToPay = useMemo(() => {
    const locationVehicle = location.state?.lpr ? {
      plate: location.state.lpr,
      type: location.state.type,
      cardCode: location.state.cardCode,
      duration: location.state.duration,
      inTime: location.state.inTime
    } : null;
    if (activeVehicles) {
      return activeVehicles.find(v => v.plate === lpr) || (currentVehicle?.plate === lpr ? currentVehicle : null) || locationVehicle;
    }
    return (currentVehicle?.plate === lpr ? currentVehicle : null) || locationVehicle;
  }, [activeVehicles, lpr, currentVehicle, location.state]);

  const isVehicleVip = vehicleToPay?.type === 'VIP' || vehicleToPay?.type === 'V├⌐ th├íng' || location.state?.isVip === true || location.state?.type === 'VIP' || location.state?.type === 'V├⌐ th├íng';
  const isVip = isVehicleVip || backendTxn?.ticketType === 'VIP' || backendTxn?.ticketType === 'V├⌐ th├íng';
  const expectedCredential = useMemo(() => {
    if (isLostCard) return '';
    if (vehicleToPay?.cardCode) return vehicleToPay.cardCode;
    if (location.state?.cardCode) return location.state.cardCode;
    if (isVehicleVip && lpr && !lpr.startsWith('THß║║:')) return `VIP-${lpr}`;
    return '';
  }, [isLostCard, vehicleToPay?.cardCode, location.state?.cardCode, isVehicleVip, lpr]);
  const canReviewVehicle = identityVerified || isLostCard;
  const displayAmount = canReviewVehicle ? totalAmount : 0;
  
  useEffect(() => {
    let interval;
    if (paymentMethod === 'vnpay' && backendTxn?.id && canReviewVehicle && !isPaid) {
      if (!vnpayUrl) {
        apiClient.get(`/v1/payment/vnpay-url?transactionId=${backendTxn.id}`)
          .then(res => setVnpayUrl((res.data || res).paymentUrl))
          .catch(err => console.error("Error fetching VNPay URL", err));
      }
        
      setIsPollingVnpay(true);
      interval = setInterval(() => {
        apiClient.get(`/v1/payment/transaction/${backendTxn.id}/status`)
          .then(res => {
            if ((res.data || res).paymentStatus === 'SUCCESS') {
              clearInterval(interval);
              setIsPollingVnpay(false);
              notification.success({message: 'Kh├ích ─æ├ú thanh to├ín VNPay th├ánh c├┤ng!'});
              setIsPaid(true);
              setLan1Status('free');
              if (fetchAllDataFromBackend) fetchAllDataFromBackend();
              setTimeout(() => handleCancel(), 2000);
            }
          });
      }, 3000);
    } else {
      setIsPollingVnpay(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentMethod, backendTxn, canReviewVehicle, isPaid, vnpayUrl]);
  const ticketNumber = useMemo(() => {
    if (!lpr) return 1000;
    let hash = 0;
    for (let i = 0; i < lpr.length; i++) {
      hash = lpr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 9000 + 1000;
  }, [lpr]);

  useEffect(() => {
    setIsPaid(false);
    setBackendTxn(null);
    setIdentityVerified(isLostCard ? true : false);
    setHasVehicle(isLostCard ? true : false);
    if (expectedCredential) {
      setCardCode(expectedCredential);
      notification.info({
        message: isVehicleVip ? 'Tß╗▒ ─æß╗Öng ─æiß╗ün m├ú ─æß╗ïnh danh VIP' : 'Tß╗▒ ─æß╗Öng ─æiß╗ün m├ú thß║╗',
        description: isVehicleVip
          ? `M├ú ─æß╗ïnh danh ${expectedCredential} ─æ├ú ─æ╞░ß╗úc lß║Ñy tß╗½ xe VIP.`
          : `M├ú thß║╗ ${expectedCredential} ─æ├ú ─æ╞░ß╗úc tß╗▒ ─æß╗Öng lß║Ñy tß╗½ hß╗ç thß╗æng.`,
        placement: 'topRight'
      });
    }
  }, [expectedCredential, isLostCard, isVehicleVip]);

  useEffect(() => {
    // Auto-select payment method if VIP
    if (isVip) {
      setPaymentMethod('card');
    }
  }, [isVip]);

  useEffect(() => {
    if (backendTxn) {
      setTotalAmount(prev => {
        if (prev !== backendTxn.totalAmount) {
          setCashGiven(backendTxn.totalAmount);
          return backendTxn.totalAmount;
        }
        return prev;
      });
      return;
    }
    
    const isError = vehicleToPay?.status === 'Lß╗ùi thß║╗';

    let amount;
    let evPenalty = backendTxn?.violationPenalty || (lpr && lpr.includes('EV') ? 500000 : 0);
    
    // Calculate accumulated fines
    const accumulatedFines = lpr ? getVehicleFines(lpr).reduce((sum, fine) => sum + fine.amount, 0) : 0;
    
    if (isLostCard) {
      amount = calculateVisitorFee(lostCardData?.duration) + penaltyAmount + evPenalty;
    } else if (isVip) {
      amount = evPenalty;
    } else {
      amount = calculateVisitorFee(vehicleToPay?.duration) + evPenalty;
    }
    
    amount += accumulatedFines;
    
    setTotalAmount(prev => {
      if (prev !== amount) {
        setCashGiven(amount);
        return amount;
      }
      return prev;
    });
  }, [lpr, vehicleToPay, isLostCard, backendTxn]);

  const getCarImages = (plate) => {
    const images = [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1621416953228-868f04179e87?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80"
    ];
    let sum = 0;
    const str = plate || "default";
    for(let i=0; i<str.length; i++) sum += str.charCodeAt(i);
    return {
      in1: images[sum % images.length],
      in2: images[(sum + 1) % images.length],
      out1: images[(sum + 2) % images.length],
      out2: images[(sum + 3) % images.length]
    };
  };

  const carImgs = getCarImages(lpr);
  const reviewImageClass = `absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
    canReviewVehicle ? 'opacity-85 group-hover:opacity-100' : 'opacity-35 blur-md scale-105'
  }`;

  const handleScanCard = async () => {
    if (isEmergency) {
      notification.error({ message: 'Hß╗ç thß╗æng ─æang dß╗½ng khß║⌐n cß║Ñp', description: 'Kh├┤ng thß╗â qu├⌐t thß║╗ l├║c n├áy.' });
      return;
    }
    const normalizedCode = cardCode.trim();
    if (!normalizedCode) return notification.warning({message: 'Vui l├▓ng nhß║¡p hoß║╖c qu├⌐t m├ú thß║╗/─æß╗ïnh danh'});
    if (expectedCredential && normalizedCode !== expectedCredential) {
      notification.error({
        message: 'Sai m├ú x├íc nhß║¡n',
        description: `M├ú vß╗½a qu├⌐t kh├┤ng khß╗¢p vß╗¢i ${isVip ? '─æß╗ïnh danh VIP' : 'thß║╗ v├úng lai'} cß╗ºa xe ${lpr}.`
      });
      setIdentityVerified(false);
      return;
    }

    setIsCheckingOut(true);
    try {
      if (isVip) {
        setIdentityVerified(true);
        setHasVehicle(true);
        setLan1Status('busy');
        setTotalAmount(0);
        setCashGiven(0);
        notification.success({
          message: '─É├ú x├íc nhß║¡n VIP',
          description: 'ß║ónh v├áo/ra ─æ├ú ─æ╞░ß╗úc mß╗ƒ ─æß╗â staff ─æß╗æi chiß║┐u tr╞░ß╗¢c khi cho xe ra.'
        });
        return;
      }

      const matchedByCard = activeVehicles?.find(v => v.cardCode === normalizedCode);
      if (matchedByCard?.plate && matchedByCard.plate !== lpr) {
        setLpr(matchedByCard.plate);
      }

      const response = await apiClient.post(`/v1/parking/checkout-by-code/${normalizedCode}`);
      const txn = response?.data || response;
      
      setBackendTxn(txn);
      if (!lpr) setLpr(matchedByCard?.plate || `THß║║: ${normalizedCode}`); // Only fallback to card code if plate is unknown
      setTotalAmount(txn.totalAmount);
      setCashGiven(txn.totalAmount);
      setHasVehicle(true);
      setIdentityVerified(true);
      setLan1Status('busy');
      notification.success({message: 'X├íc nhß║¡n thß║╗ th├ánh c├┤ng', description: `─É├ú mß╗ƒ ß║únh ─æß╗æi chiß║┐u v├á t├¡nh ph├¡: ${txn.totalAmount} VND.`});
    } catch (error) {
        notification.error({message: 'Lß╗ùi Check-out', description: error.response?.data?.message || 'Kh├┤ng thß╗â check-out bß║▒ng thß║╗ n├áy'});
        setHasVehicle(false);
        setBackendTxn(null);
        setIdentityVerified(false);
      } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePayment = () => {
    if (isPaid || isCheckingOut) return;
    if (isEmergency) {
      notification.error({ message: 'Hß╗ç thß╗æng ─æang dß╗½ng khß║⌐n cß║Ñp', description: 'Kh├┤ng thß╗â thanh to├ín v├á mß╗ƒ cß╗òng l├║c n├áy.' });
      return;
    }
    if (!canReviewVehicle) {
      notification.warning({
        message: 'Ch╞░a x├íc nhß║¡n ─æß╗æi chiß║┐u',
        description: 'Vui l├▓ng x├íc nhß║¡n ─æ├║ng m├ú thß║╗/─æß╗ïnh danh ─æß╗â mß╗ƒ ß║únh ─æß╗æi chiß║┐u tr╞░ß╗¢c khi thanh to├ín.'
      });
      return;
    }
    
    Modal.confirm({
      title: displayAmount === 0 ? 'X├íc nhß║¡n mß╗ƒ cß╗òng' : 'X├íc nhß║¡n thanh to├ín',
      content: isLostCard ? `Tiß║┐n h├ánh thu ${displayAmount.toLocaleString()} ─æ (Bao gß╗ôm ph├¡ ─æß╗ù xe v├á phß║ít mß║Ñt thß║╗) v├á mß╗ƒ cß╗òng cho xe ${lpr}?` :
               (displayAmount === 0 ? `X├íc nhß║¡n ß║únh ─æß╗æi chiß║┐u ─æ├║ng v├á mß╗ƒ cß╗òng cho xe VIP ${lpr}?` : `Tiß║┐n h├ánh thu ph├¡ v├á mß╗ƒ cß╗òng cho xe ${lpr}?`),
      okText: displayAmount === 0 ? 'X├íc nhß║¡n & Mß╗ƒ cß╗òng' : 'Thu tiß╗ün & Mß╗ƒ cß╗òng',
      cancelText: 'Hß╗ºy',
      okButtonProps: { className: 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' },
      async onOk() {
        try {
          if (isVip && !isLostCard) {
            await apiClient.post('/sessions/approve-exit', { plate: lpr });
          } else if (backendTxn && backendTxn.id) {
            await parkingService.confirmCheckout(backendTxn.id);
          } else {
            // NEW LOGIC FOR LOST CARD
            if (isLostCard) {
              const staffId = currentUser?.id; // Fixed mock Staff ID
              try {
                await apiClient.post('/blacklisted-cards/block-by-plate', null, {
                  params: {
                    plate: lpr,
                    reason: 'LOST',
                    staffId: staffId
                  }
                });
              } catch (err) {
                  console.error("Failed to block card by plate", err);
                }
                // Send mock transaction to backend so it saves in DB
                await apiClient.post('/revenue/transactions/mock', {
                  amount: totalAmount,
                  plate: lpr
                });
              } else {
                notification.error({message: 'Lß╗ùi thanh to├ín', description: 'Giao dß╗ïch kh├┤ng hß╗úp lß╗ç, vui l├▓ng qu├⌐t lß║íi thß║╗!'});
                return;
              }
            }
          // Refresh global context to pull latest transactions and remove from active
          if (fetchAllDataFromBackend) fetchAllDataFromBackend();
        } catch (e) {
          console.error("Failed to mock transaction", e);
        }

        notification.success({message: 'Thanh to├ín th├ánh c├┤ng', description: '─É├ú gß╗¡i lß╗çnh mß╗ƒ cß╗òng ra.', placement: 'topRight'});
        
        // Tß║»t hiß╗ân thß╗ï xe ngay lß║¡p tß╗⌐c (UI state)
        setIsPaid(true);
        removeActiveVehicle(lpr);
        setHasVehicle(false);
        addActivityLog({
          plate: lpr,
          model: isLostCard ? lostCardData?.model : (isVip ? (vehicleToPay?.model || "Th├ánh vi├¬n VIP") : "Kh├ích v├úng lai"),
          type: isLostCard ? "Mß║ñT THß║║" : (isVip ? "VIP" : "V├ë NG├ÇY"),
          gate: "L├án ra 1 - Cß╗¡a B",
          action: isLostCard ? "Ra b├úi (Thu phß║ít)" : "Ra b├úi (─É├ú thu)",
          time: "Vß╗½a xong",
          status: "Th├ánh C├┤ng",
          typeColor: isLostCard ? "text-red-600" : (isVip ? "text-amber-600" : "text-blue-600"),
          statusColor: "bg-emerald-100 text-emerald-700",
          actionColor: "text-emerald-600"
        });

        removeActiveVehicle(lpr);
        if (lpr) clearVehicleFines(lpr);

        setHasVehicle(false);
        setBackendTxn(null);
        setIdentityVerified(false);
        setCardCode('');
        setTotalAmount(0);
        setCashGiven(0);
        setLan1Status('free');
      }
    });
  };

  function handleCancel() {
    Modal.confirm({
      title: 'X├íc nhß║¡n huß╗╖ giao dß╗ïch',
      content: 'Bß║ín c├│ chß║»c chß║»n muß╗æn huß╗╖ bß╗Å giao dß╗ïch n├áy? Ph╞░╞íng tiß╗çn sß║╜ kh├┤ng ─æ╞░ß╗úc ph├⌐p qua cß╗òng.',
      okText: 'Huß╗╖ giao dß╗ïch',
      cancelText: 'Quay lß║íi',
      okButtonProps: { danger: true },
      onOk() {
        notification.error({message: '─É├ú huß╗╖ bß╗Å giao dß╗ïch', placement: 'topRight'});
        setHasVehicle(false);
        setIdentityVerified(false);
        setBackendTxn(null);
        setLan1Status('free');
      }
    });
  };

  const simulateNextVehicle = () => {
    // Removed because we now use real scanning API
  };

  const handleCheckout = () => {
    notification.success({message: 'Chß╗æt ca th├ánh c├┤ng', description: 'B├ío c├ío ─æang ─æ╞░ß╗úc in...', placement: 'topRight'});
  };

  return (
    <div className="p-6 w-full">
      {/* Header Tags removed as requested */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 m-0 flex items-center gap-2">
                  {isLostCard ? <span className="text-red-600"><WarningFilled className="mr-2"/> Xß╗¡ l├╜ Sß╗▒ cß╗æ Mß║Ñt thß║╗</span> : (isVip ? "Xß╗¡ l├╜ xe VIP xuß║Ñt b├úi" : "Xß╗¡ l├╜ v├⌐ v├úng lai")}
                </h3>
                <span className="bg-slate-100 text-slate-500 font-mono text-xs px-3 py-1 rounded">TICKET #{ticketNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* LPR and Cameras */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Biß╗ân sß╗æ nhß║¡n diß╗çn (LPR)</h4>
                  <div className="flex items-center justify-between border border-blue-200 bg-blue-50/50 rounded-lg p-3">
                    {isEditingLpr ? (
                      <Input 
                        value={lpr} 
                        onChange={(e) => setLpr(e.target.value.toUpperCase())}
                        onBlur={() => setIsEditingLpr(false)}
                        onPressEnter={() => setIsEditingLpr(false)}
                        autoFocus
                        className="text-xl font-bold tracking-wider"
                      />
                    ) : (
                      <span className="text-xl font-bold text-slate-800 tracking-wider">{lpr}</span>
                    )}
                    <button onClick={() => setIsEditingLpr(!isEditingLpr)} className="text-blue-600 hover:text-blue-800 transition-colors ml-3 cursor-pointer">
                      <EditOutlined className="text-lg" />
                    </button>
                  </div>
                </div>

                <div className={`border rounded-lg p-3 ${canReviewVehicle ? 'border-emerald-200 bg-emerald-50/70' : 'border-blue-200 bg-blue-50/70'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {isVip ? 'X├íc nhß║¡n ─æß╗ïnh danh VIP' : 'Qu├⌐t m├ú thß║╗ / Nhß║¡p biß╗ân sß╗æ'}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${canReviewVehicle ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {canReviewVehicle ? '─É├â X├üC NHß║¼N' : 'Bß║«T BUß╗ÿC'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={cardCode}
                      onChange={(e) => {
                        setCardCode(e.target.value.trim());
                        setIdentityVerified(false);
                        if (!isVip) setBackendTxn(null);
                      }}
                      placeholder={isVip ? 'M├ú VIP tß╗▒ ─æß╗Öng' : 'Qu├⌐t m├ú thß║╗ hoß║╖c nhß║¡p biß╗ân sß╗æ xe...'}
                      className="font-mono font-bold"
                    />
                    <Button
                      type="primary"
                      loading={isCheckingOut}
                      onClick={handleScanCard}
                      className="bg-blue-600 font-bold"
                    >
                      X├íc nhß║¡n
                    </Button>
                  </div>
                  {expectedCredential && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      M├ú hß╗ç thß╗æng: <span className="font-mono font-bold text-slate-800">{expectedCredential}</span>
                    </div>
                  )}
                  {!canReviewVehicle && (
                    <div className="mt-2 text-[11px] text-blue-700 font-medium">
                      ß║ónh v├áo/ra ─æang ─æ╞░ß╗úc l├ám mß╗¥. X├íc nhß║¡n ─æ├║ng m├ú ─æß╗â mß╗ƒ ß║únh ─æß╗æi chiß║┐u v├á t├¡nh ph├¡.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">L├║c v├áo (Cam 1 - G├│c tr├íi)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.in1} className={reviewImageClass} />
                      {!canReviewVehicle && <span className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-bold text-slate-200 bg-slate-950/30 text-center px-2">X├íc nhß║¡n thß║╗ ─æß╗â xem ß║únh</span>}
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">ENT: CAM-01</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">L├║c v├áo (Cam 2 - G├│c phß║úi)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.in2} className={reviewImageClass} />
                      {!canReviewVehicle && <span className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-bold text-slate-200 bg-slate-950/30 text-center px-2">X├íc nhß║¡n thß║╗ ─æß╗â xem ß║únh</span>}
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">ENT: CAM-02</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">L├║c ra (Cam 3 - G├│c tr├íi)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.out1} className={reviewImageClass} />
                      {!canReviewVehicle && <span className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-bold text-slate-200 bg-slate-950/30 text-center px-2">X├íc nhß║¡n thß║╗ ─æß╗â xem ß║únh</span>}
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">EXT: CAM-03</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">L├║c ra (Cam 4 - G├│c phß║úi)</span>
                    <div className="bg-black rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden group cursor-pointer">
                      <img src={carImgs.out2} className={reviewImageClass} />
                      {!canReviewVehicle && <span className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-bold text-slate-200 bg-slate-950/30 text-center px-2">X├íc nhß║¡n thß║╗ ─æß╗â xem ß║únh</span>}
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10 font-mono">EXT: CAM-04</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex flex-col border-l border-slate-100 pl-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Thß╗¥i gian gß╗¡i ({isLostCard ? 'Sß╗▒ cß╗æ' : (vehicleToPay?.type || 'V├úng lai')})
                      {vehicleToPay?.type === 'VIP' && vehicleToPay?.status === 'Lß╗ùi thß║╗' && (
                        <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold">Lß╗ûI THß║║ Cß║ªN QUß║╕T Lß║áI</span>
                      )}
                    </h4>
                    <div className="text-base font-bold text-slate-800">{isLostCard ? lostCardData?.duration : (vehicleToPay?.duration && vehicleToPay?.duration !== '─Éang v├áo' ? vehicleToPay?.duration : '0h 0m')}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{isLostCard ? lostCardData?.inTime : (vehicleToPay?.inTime || '08:15')} - {new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tß╗òng tiß╗ün thu</h4>
                    <div className="text-2xl font-black text-red-600">{displayAmount.toLocaleString()} <span className="text-sm font-bold">VND</span></div>
                    {!canReviewVehicle && <div className="text-[10px] text-blue-600 mt-1 font-bold">Ch╞░a t├¡nh ph├¡ do ch╞░a x├íc nhß║¡n thß║╗</div>}
                    {isLostCard && <div className="text-[10px] text-red-500 mt-1">─É├ú bao gß╗ôm 200k tiß╗ün phß║ít thß║╗</div>}
                    {(backendTxn?.violationPenalty > 0 || (lpr && lpr.includes('EV'))) && <div className="text-[10px] text-red-600 mt-1 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">ΓÜá∩╕Å Bß╗ï phß║ít ─Éß╗ù sai vß╗ï tr├¡ EV (+500k)</div>}
                    {lpr && getVehicleFines(lpr).length > 0 && <div className="text-[10px] text-red-600 mt-1 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">ΓÜá∩╕Å ─É├ú bao gß╗ôm phß║ít cß╗Öng dß╗ôn (+{getVehicleFines(lpr).reduce((sum, f) => sum + f.amount, 0).toLocaleString()}─æ)</div>}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Ph╞░╞íng thß╗⌐c thanh to├ín</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        if (isVip) {
                          notification.warning({ message: 'Kh├┤ng khß║ú dß╗Ñng', description: 'Kh├ích VIP bß║»t buß╗Öc thanh to├ín bß║▒ng QR ─Éß╗Öng theo quy tr├¼nh.' });
                          return;
                        }
                        setPaymentMethod('cash');
                      }}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${
                        isVip ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-100 text-slate-400' :
                        paymentMethod === 'cash' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-sm text-blue-700 scale-[1.02]' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5'
                      }`}
                    >
                      {paymentMethod === 'cash' && <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-bl-xl flex items-center justify-center"><CheckCircleFilled className="text-white text-xs" /></div>}
                      <BankOutlined className="text-3xl mb-2 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-black tracking-wide">TIß╗ÇN Mß║╢T</span>
                    </button>

                    <button 
                      onClick={() => {
                        if (isVip) {
                          notification.warning({ message: 'Kh├┤ng khß║ú dß╗Ñng', description: 'Kh├ích VIP bß║»t buß╗Öc thanh to├ín bß║▒ng QR ─Éß╗Öng theo quy tr├¼nh.' });
                          return;
                        }
                        setPaymentMethod('vnpay');
                        setVnpayUrl('');
                      }}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${
                        isVip ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-100 text-slate-400' :
                        paymentMethod === 'vnpay' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-sm text-blue-700 scale-[1.02]' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5'
                      }`}
                    >
                      {paymentMethod === 'vnpay' && <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-bl-xl flex items-center justify-center"><CheckCircleFilled className="text-white text-xs" /></div>}
                      <WalletOutlined className="text-3xl mb-2 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-black tracking-wide">VNPAY</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (!isVip) {
                          notification.warning({ message: 'Kh├┤ng khß║ú dß╗Ñng', description: 'Ph╞░╞íng thß╗⌐c n├áy chß╗ë d├ánh cho xe VIP/V├⌐ th├íng.' });
                          return;
                        }
                        setPaymentMethod('card');
                      }}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                        !isVip ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-100 text-slate-400' :
                        paymentMethod === 'card' ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50/50 shadow-sm text-amber-700 cursor-pointer scale-[1.02]' : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer'
                      }`}
                    >
                      {paymentMethod === 'card' && <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500 rounded-bl-xl flex items-center justify-center"><CheckCircleFilled className="text-white text-xs" /></div>}
                      <QrcodeOutlined className="text-3xl mb-2 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-black tracking-wide">QR VIP</span>
                    </button>
                  </div>
                </div>

                <div className="mb-6 flex-1 flex flex-col justify-center">
                  {paymentMethod === 'cash' && (
                    <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-5 shadow-inner backdrop-blur-sm animate-fadeIn">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-slate-600">Tiß╗ün kh├ích ─æ╞░a:</span>
                        <Input 
                          className="w-40 text-right font-black text-lg bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg" 
                          disabled={!canReviewVehicle}
                          value={canReviewVehicle && cashGiven ? parseInt(cashGiven).toLocaleString('en-US') : ''}
                          onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                          suffix={<span className="text-slate-400 font-medium text-sm">Γé½</span>}
                        />
                      </div>
                      <div className="h-0 w-full border-b-[2px] border-dashed border-slate-300/70 mb-4"></div>
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-semibold text-slate-600 mb-1">Tiß╗ün thß╗æi lß║íi:</span>
                        <div className="text-right">
                          <span className="text-3xl font-black text-slate-800 tracking-tight">
                            {Math.max(0, parseInt(cashGiven || 0) - displayAmount).toLocaleString('en-US')}
                          </span>
                          <span className="text-sm font-bold text-slate-500 ml-1">VND</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'vnpay' && (
                    <div className="bg-white border border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center animate-fadeIn shadow-sm relative overflow-hidden">
                      <div className="w-32 h-32 bg-slate-50 rounded-lg flex items-center justify-center mb-3 border border-slate-200 overflow-hidden relative p-2">
                        {!canReviewVehicle ? (
                          <div className="text-center">
                            <span className="text-[10px] font-bold text-slate-400 block px-2">CHß╗£ X├üC NHß║¼N</span>
                          </div>
                        ) : vnpayUrl ? (
                          <QRCode value={vnpayUrl} size={150} bordered={false} />
                        ) : (
                          <Spin />
                        )}
                        <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 text-center mb-3">
                        {!canReviewVehicle ? "Vui l├▓ng 'X├íc nhß║¡n thß║╗' tr╞░ß╗¢c ─æß╗â lß║Ñy m├ú QR" : isPollingVnpay ? "─Éang ─æß╗úi thanh to├ín VNPay Sandbox..." : "Y├¬u cß║ºu kh├ích qu├⌐t m├ú VNPay Sandbox"}
                      </span>
                    </div>
                  )}
                  {paymentMethod === 'card' && (
                    <div className="bg-white border border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center animate-fadeIn shadow-sm relative overflow-hidden">
                      <div className="w-28 h-28 bg-slate-50 rounded-lg flex items-center justify-center mb-3 border border-slate-200 overflow-hidden relative">
                        <QRCode value={`VIP_Checkout_${lpr || 'Unknown'}`} size={100} bordered={false} />
                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 text-center mb-3">M├ú QR d├ánh cho Th├ánh vi├¬n VIP<br/>(D├╣ng app hß╗ç thß╗æng ─æß╗â qu├⌐t)</span>
                      <button onClick={handlePayment} disabled={!canReviewVehicle} className={`w-full border text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 ${canReviewVehicle ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200 cursor-pointer' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}>
                        <QrcodeOutlined /> Giß║ú lß║¡p ─æ├ú qu├⌐t m├ú VIP
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-auto">
                  <button onClick={handleCancel} className="flex-[0.8] bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-3.5 rounded-xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow active:scale-95">
                    Huß╗╖ bß╗Å
                  </button>
                  <button 
                    onClick={handlePayment} 
                    disabled={isPaid || isCheckingOut || !canReviewVehicle}
                    className={`flex-[2] text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-sm tracking-wide ${
                      isPaid || isCheckingOut || !canReviewVehicle 
                        ? 'bg-slate-300 text-slate-100 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 cursor-pointer active:scale-95'
                    }`}
                  >
                    <CheckCircleFilled className="text-lg" />
                    {!canReviewVehicle ? 'Cß║ªN X├üC NHß║¼N THß║║' : (displayAmount === 0 ? 'X├üC NHß║¼N & Mß╗₧ Cß╗öNG' : 'THANH TO├üN & Mß╗₧ Cß╗öNG')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* History Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 m-0">Lß╗ïch sß╗¡ giao dß╗ïch gß║ºn ─æ├óy</h3>
              <a onClick={(e) => { e.preventDefault(); navigate('/staff-transactions'); }} href="#" className="text-blue-600 text-xs font-bold hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                Xem tß║Ñt cß║ú <ArrowRightOutlined />
              </a>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-4 border-b border-slate-200">Thß╗¥i gian</th>
                  <th className="p-4 border-b border-slate-200">Biß╗ân sß╗æ</th>
                  <th className="p-4 border-b border-slate-200">Loß║íi v├⌐</th>
                  <th className="p-4 border-b border-slate-200 text-right">Sß╗æ tiß╗ün</th>
                  <th className="p-4 border-b border-slate-200">Trß║íng th├íi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(txn => {
                  const statusColor = txn.statusColor || 'bg-emerald-100 text-emerald-600';
                  const textColor = statusColor.split(' ')[1] || 'text-emerald-600';
                  
                  let amountDisplay = txn.amount || (txn.totalAmount ? txn.totalAmount.toLocaleString('vi-VN') + '─æ' : '0─æ');
                  if (typeof amountDisplay === 'string') {
                    amountDisplay = amountDisplay.replace('.00', '').replace('─æ', '') + '─æ';
                    if (!amountDisplay.includes(',') && !amountDisplay.includes('.')) {
                      amountDisplay = parseInt(amountDisplay).toLocaleString('vi-VN') + '─æ';
                    }
                  }

                  const formatTime = (isoString) => {
                    if (!isoString) return '';
                    let cleanStr = isoString;
                    if (typeof cleanStr === 'string' && cleanStr.includes('T')) {
                      cleanStr = cleanStr.replace(/(\.\d{3})\d+Z$/, '$1Z');
                    }
                    const d = new Date(cleanStr);
                    if (isNaN(d.getTime())) return isoString;
                    return d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                  };

                  const timeDisplay = formatTime(txn.time);
                  const inTimeDisplay = txn.inTime ? formatTime(txn.inTime) : null;

                  const statusDisplay = (txn.status === 'SUCCESS' || txn.paymentStatus === 'SUCCESS') ? 'Th├ánh c├┤ng' : (txn.status === 'FAILED' || txn.paymentStatus === 'FAILED' ? 'Thß║Ñt bß║íi' : (txn.status || 'Th├ánh c├┤ng'));
                  
                  return (
                  <tr key={txn.id} className={txn.hasError ? "border-b border-red-50 bg-red-50/20 hover:bg-red-50/50 transition-colors" : "border-b border-slate-50 hover:bg-slate-50 transition-colors"}>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-semibold">{timeDisplay}</span>
                        {inTimeDisplay && <span className="text-[11px] text-slate-500 font-medium">V├áo: {inTimeDisplay}</span>}
                      </div>
                    </td>
                      <td className={`p-4 font-bold ${txn.hasError ? 'text-red-600' : 'text-slate-800'}`}>{txn.plate || '---'}</td>
                    <td className="p-4">
                      <span className={`${txn.type === 'car' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-600'} text-[10px] px-2 py-0.5 rounded font-medium uppercase`}>
                        {txn.type === 'car' ? '├ö T├ö' : (txn.type === 'moto' ? 'XE M├üY' : (txn.type || 'V├âNG LAI'))}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-right">{amountDisplay}</td>
                    <td className={`p-4 text-xs font-bold ${textColor}`}>
                      {txn.hasError ? <CloseCircleFilled className="mr-1" /> : <CheckCircleFilled className="mr-1" />} 
                      {statusDisplay}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Shift Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-800 leading-tight m-0">Tß╗òng kß║┐t<br/>ca trß╗▒c</h3>
              <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold text-center">
                Ca S├íng (06:00<br/>- 14:00)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Doanh Thu</div>
                <div className="text-xl font-black text-slate-800">{shiftStats ? (shiftStats.revenue / 1000).toLocaleString('vi-VN') + 'K' : '0K'}</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">L╞░ß╗út Xe Ra</div>
                <div className="text-xl font-black text-slate-800">{shiftStats ? shiftStats.transactions : 0}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600 font-medium">Tiß╗ün mß║╖t</span>
                </div>
                <span className="font-bold text-slate-800">{shiftStats ? shiftStats.cash.toLocaleString('vi-VN') : 0} Γé½</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 font-medium">VietQR</span>
                </div>
                <span className="font-bold text-slate-800">{shiftStats ? shiftStats.transfer.toLocaleString('vi-VN') : 0} Γé½</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-lg transition-colors cursor-pointer">
              Chß╗æt ca & In b├ío c├ío
            </button>
          </div>

          {/* Capacity Card */}
          <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-base font-bold m-0 mb-1">C├┤ng suß║Ñt b├úi</h3>
            <div className="text-xs text-slate-400 mb-6">Cß║¡p nhß║¡t l├║c 12:40</div>
            
            <div className="flex items-center justify-between">
              {/* CSS Circle Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-700"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    className="text-emerald-400"
                    strokeDasharray={`${occupancyPercent}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{occupancyPercent}%</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 text-sm flex-1 ml-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">─Éang ─æß╗ù</span>
                  <span className="font-bold text-white">{activeCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Trß╗æng</span>
                  <span className="font-bold text-emerald-400">{emptyCount}</span>
                </div>
                <div className="h-px w-full bg-slate-700 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tß╗òng chß╗ù</span>
                  <span className="font-bold text-white">{totalSlots}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
