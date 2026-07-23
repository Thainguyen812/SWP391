import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CarOutlined, 
  SearchOutlined, 
  CheckCircleFilled, 
  CameraOutlined, 
  WarningOutlined,
  SafetyCertificateOutlined,
  LoadingOutlined,
  WalletOutlined,
  QrcodeOutlined,
  ZoomInOutlined,
  EyeOutlined,
  CloseOutlined,
  CloseCircleFilled,
  CrownOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { notification, Modal, Spin, Segmented } from 'antd';
import { useGlobalContext } from '../../context/GlobalContext';
import { getDemoVehicleImages, getDemoVehicleProfile } from '../../data/vehicleDataset';

export const StaffLostCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentVehicle, activeVehicles } = useGlobalContext();
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchPlate, setSearchPlate] = useState(location.state?.lpr || currentVehicle?.plate || "");
  const [foundVehicle, setFoundVehicle] = useState(null);

  const getCarImages = (plate) => {
    const profile = getDemoVehicleProfile(foundVehicle || { plate, vehicleType: foundVehicle?.vehicleType || foundVehicle?.type, imageUrl: foundVehicle?.image || foundVehicle?.imageUrl });
    const images = getDemoVehicleImages(profile || { plate });
    return {
      in1: images.entry?.[0] || images.primary,
      in2: images.entry?.[1] || images.primary,
      out1: images.exit?.[0] || images.primary,
      out2: images.exit?.[1] || images.primary
    };
  };

  const generateCccdSvg = (plate, ownerName, modelStr = 'Demo Vehicle') => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
        <defs>
          <linearGradient id="bgCc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="50%" stop-color="#0284c7"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="goldChip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <rect width="900" height="560" rx="28" fill="url(#bgCc)"/>
        <rect x="24" y="24" width="852" height="512" rx="20" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 4" opacity="0.4"/>
        
        <!-- Header -->
        <text x="450" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#f8fafc" text-anchor="middle">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</text>
        <text x="450" y="100" font-family="Arial, sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle">Độc lập - Tự do - Hạnh phúc</text>
        <text x="450" y="150" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#fef08a" text-anchor="middle">CĂN CƯỚC CÔNG DÂN</text>
        <text x="450" y="180" font-family="Arial, sans-serif" font-size="16" fill="#93c5fd" text-anchor="middle">IDENTITY CARD</text>

        <!-- Gold Chip -->
        <rect x="70" y="170" width="90" height="70" rx="10" fill="url(#goldChip)" stroke="#b45309" stroke-width="2"/>
        <line x1="70" y1="205" x2="160" y2="205" stroke="#b45309" stroke-width="1.5"/>
        <line x1="115" y1="170" x2="115" y2="240" stroke="#b45309" stroke-width="1.5"/>

        <!-- Details -->
        <text x="210" y="240" font-family="Arial, sans-serif" font-size="18" fill="#93c5fd">Số / No.:</text>
        <text x="320" y="240" font-family="Arial, sans-serif" font-size="26" font-weight="800" fill="#ffffff">034202019842</text>

        <text x="210" y="295" font-family="Arial, sans-serif" font-size="18" fill="#93c5fd">Họ và tên / Full name:</text>
        <text x="210" y="335" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#fef08a">${String(ownerName).toUpperCase()}</text>

        <text x="210" y="390" font-family="Arial, sans-serif" font-size="18" fill="#93c5fd">Phương tiện đăng ký:</text>
        <text x="210" y="430" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="#38bdf8">${plate} — ${modelStr}</text>

        <!-- Watermark Footer -->
        <rect x="70" y="465" width="760" height="50" rx="8" fill="#0f172a" opacity="0.6"/>
        <text x="90" y="498" font-family="monospace" font-size="18" fill="#38bdf8">URBANPARK ID VERIFIED || PLATE: ${plate}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgText.trim())}`;
  };

  const generateRegSvg = (plate, ownerName, modelStr = 'Hyundai Porter') => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
        <defs>
          <linearGradient id="bgReg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fefce8"/>
            <stop offset="50%" stop-color="#fef9c3"/>
            <stop offset="100%" stop-color="#fef08a"/>
          </linearGradient>
        </defs>
        <rect width="900" height="560" rx="28" fill="url(#bgReg)"/>
        <rect x="30" y="30" width="840" height="500" rx="16" fill="none" stroke="#ca8a04" stroke-width="3"/>
        <rect x="42" y="42" width="816" height="476" rx="12" fill="none" stroke="#eab308" stroke-width="1" stroke-dasharray="4 4"/>
        
        <!-- National Emblem Header -->
        <text x="450" y="80" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#713f12" text-anchor="middle">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</text>
        <text x="450" y="108" font-family="Arial, sans-serif" font-size="16" fill="#854d0e" text-anchor="middle">Độc lập - Tự do - Hạnh phúc</text>
        <line x1="320" y1="122" x2="580" y2="122" stroke="#ca8a04" stroke-width="2"/>

        <text x="450" y="170" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#9a3412" text-anchor="middle">GIẤY CHỨNG NHẬN ĐĂNG KÝ XE Ô TÔ</text>

        <rect x="270" y="200" width="490" height="50" rx="8" fill="#ffffff" stroke="#eab308" stroke-width="2"/>
        <text x="95" y="233" font-family="Arial, sans-serif" font-size="18" fill="#713f12">Biển số đăng ký / Plate No.:</text>
        <text x="515" y="236" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#1e3a8a" text-anchor="middle">${plate}</text>

        <text x="95" y="285" font-family="Arial, sans-serif" font-size="18" fill="#713f12">Tên chủ xe / Owner:</text>
        <text x="300" y="285" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">${String(ownerName).toUpperCase()}</text>

        <text x="95" y="340" font-family="Arial, sans-serif" font-size="18" fill="#713f12">Nhãn hiệu / Brand:</text>
        <text x="300" y="340" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">Hyundai</text>

        <text x="95" y="385" font-family="Arial, sans-serif" font-size="18" fill="#713f12">Số loại / Model:</text>
        <text x="300" y="385" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">${modelStr}</text>

        <text x="95" y="430" font-family="Arial, sans-serif" font-size="18" fill="#713f12">Loại xe / Type:</text>
        <text x="300" y="430" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">Xe van / Xe tải nhỏ (GASOLINE)</text>

        <!-- Stamp simulation -->
        <circle cx="750" cy="410" r="50" fill="none" stroke="#dc2626" stroke-width="3" opacity="0.8"/>
        <text x="750" y="405" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#dc2626" text-anchor="middle" opacity="0.8">CÔNG AN TP</text>
        <text x="750" y="425" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#dc2626" text-anchor="middle" opacity="0.8">ĐÃ ĐĂNG KÝ</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgText.trim())}`;
  };

  const getIdImages = (plate, overridePlate, overrideOwner) => {
    const targetPlate = overridePlate || plate || 'DEMO-PLATE';
    const targetOwner = overrideOwner || 'NGUYỄN HỒNG THÁI';
    const modelStr = foundVehicle?.model || 'Hyundai Porter';
    return {
      cccd: generateCccdSvg(targetPlate, targetOwner, modelStr),
      reg: generateRegSvg(targetPlate, targetOwner, modelStr)
    };
  };

  const carImgs = getCarImages(foundVehicle?.plate || searchPlate);
  const idImgs = getIdImages(foundVehicle?.plate || searchPlate);

  const sessionCode = useMemo(() => {
    const plate = foundVehicle?.plate || searchPlate || "default";
    let hash = 0;
    for (let i = 0; i < plate.length; i++) {
      hash = plate.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 90000 + 10000;
  }, [foundVehicle?.plate, searchPlate]);

  const normalizeGateText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');

  const entryGateLabel = useMemo(() => {
    if (!foundVehicle) return 'Không rõ';
    if (foundVehicle.entryGate) return foundVehicle.entryGate;
    if (foundVehicle.entry_gate) return foundVehicle.entry_gate;

    const currentGate = foundVehicle.gate;
    const normalizedGate = normalizeGateText(currentGate);
    if (normalizedGate.includes('VAO') || normalizedGate.includes('IN')) {
      return currentGate;
    }

    return 'Không rõ';
  }, [foundVehicle]);

  const [cccdImage, setCccdImage] = useState(null);
  const [regImage, setRegImage] = useState(null);
  const [cccdVerified, setCccdVerified] = useState(false);
  const [regVerified, setRegVerified] = useState(false);
  const [cccdError, setCccdError] = useState(null);
  const [regError, setRegError] = useState(null);
  const [isCapturingCccd, setIsCapturingCccd] = useState(false);
  const [isCapturingReg, setIsCapturingReg] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [simMode, setSimMode] = useState('MATCH'); // 'MATCH' or 'MISMATCH'
  const [vipBlockedInfo, setVipBlockedInfo] = useState(null);

  const handleSearch = () => {
    if (!searchPlate || !searchPlate.trim()) {
      notification.warning({ message: 'Vui lòng nhập biển số xe', placement: 'topRight' });
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const vehicle = activeVehicles.find(v => v.plate.toLowerCase() === searchPlate.toLowerCase());
      
      const isVip = vehicle && (
        vehicle.isVip || 
        String(vehicle.type || '').toUpperCase().includes('VIP') || 
        String(vehicle.type || '').toUpperCase().includes('THÁNG') || 
        String(vehicle.type || '').toUpperCase().includes('MONTH')
      );

      if (vehicle && isVip) {
        setFoundVehicle(null);
        setVipBlockedInfo({ plate: vehicle.plate, type: vehicle.type });
        setCccdImage(null);
        setRegImage(null);
        setCccdVerified(false);
        setRegVerified(false);
        setCccdError(null);
        setRegError(null);
        notification.error({ 
          message: 'Không thể tra cứu Báo mất thẻ!', 
          description: `Chủ xe ${vehicle.plate} (${vehicle.type}) KHÔNG ĐƯỢC CẤP THẺ VÃNG LAI từ khi vào bãi nên hệ thống KHÔNG THỂ TRA CỨU quy trình báo mất thẻ!`, 
          duration: 5,
          placement: 'topRight' 
        });
        return;
      }

      setVipBlockedInfo(null);
      if (vehicle) {
        setFoundVehicle(vehicle);
        setCccdImage(null);
        setRegImage(null);
        setCccdVerified(false);
        setRegVerified(false);
        setCccdError(null);
        setRegError(null);
        notification.success({ message: 'Đã tìm thấy 1 phiên tương ứng', placement: 'topRight' });
      } else {
        setFoundVehicle(null);
        setCccdImage(null);
        setRegImage(null);
        setCccdVerified(false);
        setRegVerified(false);
        setCccdError(null);
        setRegError(null);
        notification.error({ message: 'Không tìm thấy phương tiện', description: 'Biển số này không có trong bãi.', placement: 'topRight' });
      }
    }, 1000);
  };

  const handleRemoveCccd = (e) => {
    if (e) e.stopPropagation();
    setCccdImage(null);
    setCccdVerified(false);
    setCccdError(null);
    notification.info({ message: 'Đã hủy / xóa ảnh CCCD/CMND', placement: 'topRight' });
  };

  const handleRemoveReg = (e) => {
    if (e) e.stopPropagation();
    setRegImage(null);
    setRegVerified(false);
    setRegError(null);
    notification.info({ message: 'Đã hủy / xóa ảnh Giấy đăng ký xe', placement: 'topRight' });
  };

  const handleCaptureCccd = () => {
    if (!foundVehicle) {
      notification.error({ 
        message: 'Chụp hình không hợp lệ', 
        description: 'Vui lòng nhập Biển số xe và bấm "Tìm kiếm Lịch sử" để xác định thông tin phương tiện trước khi chụp CCCD!',
        placement: 'topRight' 
      });
      return;
    }

    setIsCapturingCccd(true);
    notification.info({ message: 'Đang mở camera & Quét AI OCR hồ sơ...', duration: 1.5 });
    
    setTimeout(() => {
      setIsCapturingCccd(false);

      if (simMode === 'MISMATCH') {
        const imgs = getIdImages(foundVehicle.plate, '30H-999.99', 'LÊ VĂN KHÔNG KHỚP');
        setCccdImage(imgs.cccd);
        setCccdVerified(false);
        setCccdError(`CẢNH BÁO OCR: Biển số trên giấy tờ (30H-999.99 - LÊ VĂN KHÔNG KHỚP) KHÔNG KHỚP với xe (${foundVehicle.plate}).`);
        notification.error({
          message: 'Đối chiếu AI OCR Thất Bại!',
          description: `Biển số trên CCCD/Giấy tờ (30H-999.99 - LÊ VĂN KHÔNG KHỚP) KHÔNG KHỚP với biển số xe khai báo (${foundVehicle.plate}). Yêu cầu chụp lại!`,
          duration: 5,
          placement: 'topRight'
        });
      } else {
        const imgs = getIdImages(foundVehicle.plate);
        setCccdImage(imgs.cccd);
        setCccdVerified(true);
        setCccdError(null);
        notification.success({ 
          message: 'Đối chiếu AI OCR Thành công', 
          description: `Tên chủ xe (NGUYỄN HỒNG THÁI) & Biển số xe (${foundVehicle.plate}) trùng khớp 100% với dữ liệu hệ thống!`, 
          duration: 4,
          placement: 'topRight' 
        });
      }
    }, 1200);
  };

  const handleCaptureReg = () => {
    if (!foundVehicle) {
      notification.error({ 
        message: 'Chụp hình không hợp lệ', 
        description: 'Vui lòng nhập Biển số xe và Tìm kiếm thông tin phương tiện trước khi chụp Đăng ký xe!',
        placement: 'topRight' 
      });
      return;
    }

    setIsCapturingReg(true);
    notification.info({ message: 'Đang mở camera & Quét AI OCR Giấy đăng ký...', duration: 1.5 });
    
    setTimeout(() => {
      setIsCapturingReg(false);

      if (simMode === 'MISMATCH') {
        const imgs = getIdImages(foundVehicle.plate, '29C-777.77', 'TRẦN VĂN KHÔNG KHỚP');
        setRegImage(imgs.reg);
        setRegVerified(false);
        setRegError(`CẢNH BÁO OCR: Đăng ký xe (29C-777.77 - TRẦN VĂN KHÔNG KHỚP) không trùng khớp phương tiện (${foundVehicle.plate}).`);
        notification.error({
          message: 'Đối chiếu Đăng ký xe Thất Bại!',
          description: `Giấy đăng ký xe (29C-777.77) không khớp với phương tiện ${foundVehicle.plate}. Vui lòng đối chiếu lại!`,
          duration: 5,
          placement: 'topRight'
        });
      } else {
        const imgs = getIdImages(foundVehicle.plate);
        setRegImage(imgs.reg);
        setRegVerified(true);
        setRegError(null);
        notification.success({ 
          message: 'Đối chiếu Giấy đăng ký thành công', 
          description: `Giấy đăng ký xe hợp lệ và trùng khớp thông tin phương tiện ${foundVehicle.plate}!`, 
          duration: 4,
          placement: 'topRight' 
        });
      }
    }, 1200);
  };

  const isVipVehicle = useMemo(() => {
    if (!foundVehicle) return false;
    const typeStr = String(foundVehicle.type || '').toUpperCase();
    return Boolean(foundVehicle.isVip || typeStr.includes('VIP') || typeStr.includes('THÁNG') || typeStr.includes('MONTH'));
  }, [foundVehicle]);

  const handleCheckoutClick = () => {
    if (!foundVehicle) {
      notification.warning({ message: 'Vui lòng tìm kiếm xe báo mất trước', placement: 'topRight' });
      return;
    }
    if (isVipVehicle) {
      notification.warning({
        message: 'Không áp dụng báo mất thẻ cho Xe VIP',
        description: `Phương tiện ${foundVehicle.plate} là xe thành viên VIP/Vé tháng đăng ký cố định trên hệ thống (không sử dụng thẻ vãng lai).`,
        placement: 'topRight'
      });
      return;
    }
    if (!cccdImage || !cccdVerified) {
      if (cccdError) {
        notification.error({
          message: 'Không thể xử lý mất thẻ',
          description: cccdError,
          placement: 'topRight'
        });
      } else {
        notification.warning({ 
          message: 'Yêu cầu đối chiếu CCCD/CMND', 
          description: 'Hồ sơ chưa được chụp hoặc chưa đối chiếu trùng khớp. Vui lòng bấm "Nhấn để chụp" ở mục 3 để đối chiếu tên chủ xe & biển số xe!', 
          placement: 'topRight' 
        });
      }
      return;
    }

    Modal.confirm({
      title: 'Chuyển sang Thanh toán',
      content: `Hệ thống sẽ chuyển xe ${foundVehicle.plate} sang Quầy thu ngân để tiến hành thu phí đỗ xe và phạt mất thẻ (200,000 đ).`,
      okText: 'Đồng ý & Chuyển',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-blue-600 border-blue-600' },
      onOk() {
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          navigate('/staff-payment', { 
            state: { 
              lostCardVehicle: foundVehicle,
              isLostCard: true,
              penaltyAmount: 200000 
            } 
          });
        }, 800);
      }
    });
  };
  return (
    <div className="p-6 w-full">
      <div className="flex justify-end mb-6">
        <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
          <WarningOutlined /> CẢNH BÁO MẤT THẺ
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lookup and Image Comparison */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Step 1: Lookup */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100">1. Tra cứu Phương tiện</h3>
            
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">NHẬP BIỂN SỐ XE</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600 text-lg">
                    <CarOutlined />
                  </div>
                  <input 
                    type="text" 
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    placeholder="VD: 30G-123.45"
                    className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg text-lg font-bold text-slate-800 tracking-widest bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
                <button onClick={handleSearch} disabled={isSearching} className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
                  {isSearching ? <LoadingOutlined spin /> : <SearchOutlined />} Tìm kiếm Lịch sử
                </button>
              </div>
            </div>

            {foundVehicle ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                    <CheckCircleFilled className="text-base" /> TÌM THẤY 1 PHIÊN ĐANG HOẠT ĐỘNG
                  </div>
                  <div className="text-slate-500 text-xs font-medium">Mã phiên: #TRX-{sessionCode}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">THỜI GIAN VÀO</div>
                    <div className="font-bold text-slate-800">{foundVehicle.inTime} - {new Date().toLocaleDateString('en-GB')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">CỬA VÀO</div>
                    <div className="font-bold text-slate-800">{entryGateLabel}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">LOẠI VÉ</div>
                    <div className="font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded inline-block">{foundVehicle.type}</div>
                  </div>
                </div>
              </div>
            ) : vipBlockedInfo ? (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mt-6 flex items-start gap-3.5 shadow-sm">
                <CloseCircleFilled className="text-red-600 text-2xl shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h4 className="font-extrabold text-red-900 text-sm uppercase tracking-wide">
                    🚫 KHÔNG THỂ BÁO MẤT THẺ: PHƯƠNG TIỆN VIP / VÉ THÁNG
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed font-semibold">
                    Phương tiện <strong className="font-mono text-red-950 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">{vipBlockedInfo.plate}</strong> ({vipBlockedInfo.type}) là xe thành viên đăng ký gói dịch vụ cố định trên hệ thống (tự động nhận diện biển số LPR / Mã QR VIP trên App).
                  </p>
                  <p className="text-xs text-red-800 font-bold pt-1">
                    👉 Chủ xe KHÔNG ĐƯỢC CẤP THẺ VÃNG LAI từ khi vào bãi nên hệ thống KHÔNG THỂ TRA CỨU quy trình báo mất thẻ!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-6 flex flex-col items-center justify-center text-slate-500">
                <CarOutlined className="text-3xl mb-2 text-slate-300" />
                <p className="text-sm">Nhập biển số và tìm kiếm để xem thông tin phương tiện</p>
              </div>
            )}
          </div>

          {/* Step 2: Image Comparison */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3">2. Đối chiếu Hình ảnh</h3>
            <p className="text-sm text-slate-500 mb-5 pb-4 border-b border-slate-100">So sánh phương tiện lúc vào và phương tiện đang đứng tại cổng ra hiện tại.</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Image 1 */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border border-slate-300">
                {foundVehicle ? (
                  <img src={carImgs.in1} alt="Front Left" className="w-full h-full object-cover opacity-90" />
                ) : (
                  <div className="text-slate-400 text-xs">Chưa có dữ liệu</div>
                )}
                <div className="absolute top-2 left-2 bg-slate-800/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  GÓC VÀO TRƯỚC TRÁI
                </div>
              </div>
              
              {/* Image 2 */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border border-slate-300">
                {foundVehicle ? (
                  <img src={carImgs.in2} alt="Front Right" className="w-full h-full object-cover opacity-90 scale-x-[-1]" />
                ) : (
                  <div className="text-slate-400 text-xs">Chưa có dữ liệu</div>
                )}
                <div className="absolute top-2 left-2 bg-slate-800/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  GÓC VÀO TRƯỚC PHẢI
                </div>
              </div>

              {/* Image 3 (LIVE) */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border-2 border-red-300">
                {foundVehicle ? (
                  <img src={carImgs.out1} alt="Rear Left Live" className="w-full h-full object-cover opacity-90" />
                ) : (
                  <div className="text-slate-400 text-xs font-medium">Chưa có phương tiện tại cổng</div>
                )}
                <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  CỔNG RA SAU TRÁI [LIVE]
                </div>
              </div>

              {/* Image 4 (LIVE) */}
              <div className="relative bg-slate-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border-2 border-red-300">
                {foundVehicle ? (
                  <img src={carImgs.out2} alt="Rear Right Live" className="w-full h-full object-cover opacity-90 scale-x-[-1]" />
                ) : (
                  <div className="text-slate-400 text-xs font-medium">Chưa có phương tiện tại cổng</div>
                )}
                <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  CỔNG RA SAU PHẢI [LIVE]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile and Payment */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-slate-800 m-0">3. Hồ sơ Xác minh</h3>
              <Segmented 
                options={[
                  { label: 'Ảnh khớp hồ sơ', value: 'MATCH' }, 
                  { label: 'Ảnh sai hồ sơ', value: 'MISMATCH' }
                ]} 
                value={simMode} 
                onChange={setSimMode} 
                size="small" 
                className="bg-slate-100 font-semibold text-xs shadow-inner" 
              />
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">Yêu cầu chụp lại giấy tờ tùy thân của người điều khiển phương tiện để lưu trữ báo cáo sự cố.</p>

            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">CCCD / CMND / GPLX <span className="text-red-500">*</span></label>
                {cccdImage && (
                  <button 
                    onClick={() => setPreviewDoc({ title: "Căn cước công dân (CCCD / CMND)", img: cccdImage, docType: "CCCD" })}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ZoomInOutlined /> Phóng to xem chi tiết
                  </button>
                )}
              </div>
              <div className={`w-full bg-slate-50 border-2 border-dashed ${cccdError ? 'border-red-400 bg-red-50/20' : 'border-slate-300'} rounded-lg aspect-[2.5/1] flex flex-col items-center justify-center text-slate-400 group overflow-hidden relative transition-all`}>
                {isCapturingCccd ? (
                  <div className="flex flex-col items-center justify-center text-blue-600 gap-2">
                    <Spin indicator={<LoadingOutlined className="text-2xl" spin />} />
                    <span className="text-xs font-semibold">Đang mở camera & Quét AI OCR...</span>
                  </div>
                ) : cccdImage ? (
                  <>
                    <img src={cccdImage} alt="CCCD" className="w-full h-full object-cover" />
                    
                    {/* Delete / Clear X Button */}
                    <button 
                      onClick={handleRemoveCccd}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg z-20 cursor-pointer"
                      title="Hủy / Xóa ảnh"
                    >
                      <CloseOutlined className="text-xs font-bold" />
                    </button>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs gap-3">
                      <button onClick={handleCaptureCccd} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur-sm transition-colors cursor-pointer">
                        <CameraOutlined /> Chụp lại
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDoc({ title: "Căn cước công dân (CCCD / CMND)", img: cccdImage, docType: "CCCD" });
                        }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-md font-bold"
                      >
                        <ZoomInOutlined /> Phóng to
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={handleCaptureCccd} className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors cursor-pointer">
                    <CameraOutlined className="text-2xl mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium mt-1">Nhấn để chụp CCCD / CMND</span>
                  </button>
                )}
              </div>
              {cccdError ? (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2 flex items-center justify-between text-xs text-red-600 font-semibold gap-2">
                  <div className="flex items-center gap-1.5">
                    <CloseCircleFilled className="text-red-500 text-sm flex-shrink-0" />
                    <span>{cccdError}</span>
                  </div>
                  <button onClick={handleRemoveCccd} className="text-red-600 hover:underline font-bold text-[11px] underline flex-shrink-0 cursor-pointer">Chụp lại</button>
                </div>
              ) : cccdVerified && foundVehicle ? (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-md p-2 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                  <CheckCircleFilled className="text-emerald-500 text-sm" />
                  <span>Đã đối chiếu OCR: Khớp tên chủ xe & Biển số <strong>{foundVehicle.plate}</strong></span>
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">GIẤY ĐĂNG KÝ XE (Tùy chọn)</label>
                {regImage && (
                  <button 
                    onClick={() => setPreviewDoc({ title: "Giấy đăng ký xe ô tô", img: regImage, docType: "REG" })}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ZoomInOutlined /> Phóng to xem chi tiết
                  </button>
                )}
              </div>
              <div className={`w-full bg-slate-50 border-2 border-dashed ${regError ? 'border-red-400 bg-red-50/20' : 'border-slate-300'} rounded-lg aspect-[2.5/1] flex flex-col items-center justify-center text-slate-400 group overflow-hidden relative transition-all`}>
                {isCapturingReg ? (
                  <div className="flex flex-col items-center justify-center text-blue-600 gap-2">
                    <Spin indicator={<LoadingOutlined className="text-2xl" spin />} />
                    <span className="text-xs font-semibold">Đang chụp & Quét OCR Đăng ký...</span>
                  </div>
                ) : regImage ? (
                  <>
                    <img src={regImage} alt="Đăng ký xe" className="w-full h-full object-cover" />
                    
                    {/* Delete / Clear X Button */}
                    <button 
                      onClick={handleRemoveReg}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg z-20 cursor-pointer"
                      title="Hủy / Xóa ảnh"
                    >
                      <CloseOutlined className="text-xs font-bold" />
                    </button>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs gap-3">
                      <button onClick={handleCaptureReg} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur-sm transition-colors cursor-pointer">
                        <CameraOutlined /> Chụp lại
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDoc({ title: "Giấy đăng ký xe ô tô", img: regImage, docType: "REG" });
                        }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-md font-bold"
                      >
                        <ZoomInOutlined /> Phóng to
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={handleCaptureReg} className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors cursor-pointer">
                    <CameraOutlined className="text-2xl mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium mt-1">Nhấn để chụp Giấy Đăng ký</span>
                  </button>
                )}
              </div>
              {regError ? (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2 flex items-center justify-between text-xs text-red-600 font-semibold gap-2">
                  <div className="flex items-center gap-1.5">
                    <CloseCircleFilled className="text-red-500 text-sm flex-shrink-0" />
                    <span>{regError}</span>
                  </div>
                  <button onClick={handleRemoveReg} className="text-red-600 hover:underline font-bold text-[11px] underline flex-shrink-0 cursor-pointer">Chụp lại</button>
                </div>
              ) : regVerified && foundVehicle ? (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-md p-2 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                  <CheckCircleFilled className="text-emerald-500 text-sm" />
                  <span>Đã đối chiếu OCR: Giấy đăng ký xe hợp lệ</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-50 border border-slate-200 border-t-4 border-t-blue-600 rounded-xl p-6 shadow-sm mt-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Tổng kết Xử lý</h3>
            
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-slate-600">Phí đỗ xe (tạm tính)</span>
              <span className="font-medium text-slate-800">{isVipVehicle ? 'Miễn phí (Thẻ VIP)' : '50,000 đ'}</span>
            </div>
            <div className="flex justify-between items-center mb-5 text-sm">
              <span className="text-slate-600">Phí phạt mất thẻ</span>
              <span className="font-medium text-slate-800">{isVipVehicle ? '0 đ (Không áp dụng)' : '150,000 đ'}</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG THU</span>
              <span className={`text-2xl font-bold ${isVipVehicle ? 'text-slate-400' : 'text-blue-600'}`}>{isVipVehicle ? '0 đ' : '200,000 đ'}</span>
            </div>

            {isVipVehicle ? (
              <button 
                disabled 
                className="w-full bg-amber-50 text-amber-800 border border-amber-300 font-extrabold py-3.5 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed mb-3 shadow-xs"
              >
                <CrownOutlined className="text-amber-600 text-base" /> Xe VIP không áp dụng Báo mất thẻ
              </button>
            ) : (
              <button onClick={handleCheckoutClick} disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20 mb-3 disabled:opacity-70">
                {isProcessing ? <Spin /> : <SafetyCertificateOutlined />} Xác nhận Xử lý Mất thẻ
              </button>
            )}
            
            <p className="text-[11px] text-center text-slate-500">
              {isVipVehicle ? 'Xe VIP không sử dụng thẻ từ vãng lai. Vui lòng cho xe ra tại Điều khiển cổng.' : 'Thao tác này sẽ mở cổng và ghi nhận sự cố vào hệ thống.'}
            </p>
          </div>

        </div>
      </div>

      {/* Zoom Modal Preview for Verification Documents */}
      <Modal
        open={!!previewDoc}
        onCancel={() => setPreviewDoc(null)}
        footer={null}
        width={750}
        centered
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <ZoomInOutlined className="text-blue-600" />
            Chi tiết Hồ sơ Xác minh - {previewDoc?.title}
          </div>
        }
      >
        {previewDoc && (
          <div className="pt-2">
            {/* Image Box */}
            <div className="bg-slate-950 rounded-xl p-3 flex justify-center items-center shadow-inner overflow-hidden border border-slate-800 mb-4 max-h-[440px]">
              <img 
                src={previewDoc.img} 
                alt={previewDoc.title} 
                className="max-w-full max-h-[420px] object-contain rounded-lg shadow-2xl transition-transform hover:scale-105 duration-300" 
              />
            </div>

            {/* Document Info Card */}
            <div className={`border rounded-xl p-4 flex flex-col gap-3 ${
              (previewDoc.docType === 'CCCD' ? cccdError : regError) 
                ? 'bg-red-50/50 border-red-200' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin Chi tiết Giấy tờ</span>
                {(previewDoc.docType === 'CCCD' ? cccdError : regError) ? (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CloseCircleFilled className="text-red-500" /> Không trùng khớp hồ sơ xe
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircleFilled className="text-emerald-500" /> Đã đối chiếu hợp lệ
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 text-xs block mb-0.5">Họ và tên chủ hồ sơ:</span>
                  <span className="font-bold text-slate-800">
                    {(previewDoc.docType === 'CCCD' ? cccdError : regError)
                      ? (previewDoc.docType === 'CCCD' ? 'LÊ VĂN KHÔNG KHỚP' : 'TRẦN VĂN KHÔNG KHỚP')
                      : 'NGUYỄN HỒNG THÁI'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block mb-0.5">Biển số trên giấy tờ:</span>
                  <span className={`font-bold px-2 py-0.5 rounded border ${
                    (previewDoc.docType === 'CCCD' ? cccdError : regError)
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : 'text-blue-600 bg-blue-50 border-blue-200'
                  }`}>
                    {(previewDoc.docType === 'CCCD' ? cccdError : regError)
                      ? (previewDoc.docType === 'CCCD' ? '30H-999.99' : '29C-777.77')
                      : (foundVehicle?.plate || searchPlate || "51H-14963.SIM")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block mb-0.5">Mã số giấy tờ:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.docType === 'CCCD' ? '034202019842' : 'REG-51H14963'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block mb-0.5">Xe đang báo mất:</span>
                  <span className="font-semibold text-slate-800">{foundVehicle?.plate || "51G-63567.SIM"} ({foundVehicle?.model || "Hyundai Porter"})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
