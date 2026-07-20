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
  DollarOutlined
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
  const [foundVehicle, setFoundVehicle] = useState(
    (location.state?.lpr && activeVehicles) 
      ? activeVehicles.find(v => v.plate === location.state.lpr) 
      : (currentVehicle || null)
  );

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

  const getIdImages = (plate) => {
    const profile = getDemoVehicleProfile(foundVehicle || { plate, vehicleType: foundVehicle?.vehicleType || foundVehicle?.type, imageUrl: foundVehicle?.image || foundVehicle?.imageUrl });
    const images = getDemoVehicleImages(profile || { plate });
    return {
      cccd: images.identityDoc,
      reg: images.registrationDoc
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

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const vehicle = activeVehicles.find(v => v.plate.toLowerCase() === searchPlate.toLowerCase());
      if (vehicle) {
        setFoundVehicle(vehicle);
        setCccdImage(null);
        setRegImage(null);
        notification.success({ message: 'Đã tìm thấy 1 phiên tương ứng', placement: 'topRight' });
      } else {
        setFoundVehicle(null);
        setCccdImage(null);
        setRegImage(null);
        notification.error({ message: 'Không tìm thấy phương tiện', description: 'Biển số này không có trong bãi.', placement: 'topRight' });
      }
    }, 1000);
  };

  const handleCaptureCccd = () => {
    notification.info({ message: 'Đang mở camera...', duration: 1 });
    setTimeout(() => {
      setCccdImage(idImgs.cccd);
      notification.success({ message: 'Đã chụp CCCD/CMND', placement: 'topRight' });
    }, 1000);
  };

  const handleCaptureReg = () => {
    notification.info({ message: 'Đang mở camera...', duration: 1 });
    setTimeout(() => {
      setRegImage(idImgs.reg);
      notification.success({ message: 'Đã chụp Giấy Đăng ký', placement: 'topRight' });
    }, 1000);
  };

  const handleCheckoutClick = () => {
    if (!foundVehicle) {
      notification.warning({ message: 'Vui lòng tìm kiếm xe trước', placement: 'topRight' });
      return;
    }
    if (!cccdImage) {
      notification.warning({ message: 'Yêu cầu chụp CCCD/CMND', description: 'Vui lòng xác minh giấy tờ tùy thân của người điều khiển trước khi xử lý.', placement: 'topRight' });
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
          
          {/* Step 3: Verification Profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">3. Hồ sơ Xác minh</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">Yêu cầu chụp lại giấy tờ tùy thân của người điều khiển phương tiện để lưu trữ báo cáo sự cố.</p>

            <div className="mb-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">CCCD / CMND / GPLX <span className="text-red-500">*</span></label>
              <button onClick={handleCaptureCccd} className="w-full bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg aspect-[2.5/1] flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors cursor-pointer group overflow-hidden relative">
                {cccdImage ? (
                  <>
                    <img src={cccdImage} alt="CCCD" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-sm gap-2">
                      <CameraOutlined /> Chụp lại
                    </div>
                  </>
                ) : (
                  <>
                    <CameraOutlined className="text-2xl mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium mt-1">Nhấn để chụp</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">GIẤY ĐĂNG KÝ XE (Tùy chọn)</label>
              <button onClick={handleCaptureReg} className="w-full bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg aspect-[2.5/1] flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors cursor-pointer group overflow-hidden relative">
                {regImage ? (
                  <>
                    <img src={regImage} alt="Đăng ký xe" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-sm gap-2">
                      <CameraOutlined /> Chụp lại
                    </div>
                  </>
                ) : (
                  <>
                    <CameraOutlined className="text-2xl mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium mt-1">Nhấn để chụp</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-50 border border-slate-200 border-t-4 border-t-blue-600 rounded-xl p-6 shadow-sm mt-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Tổng kết Xử lý</h3>
            
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-slate-600">Phí đỗ xe (tạm tính)</span>
              <span className="font-medium text-slate-800">50,000 đ</span>
            </div>
            <div className="flex justify-between items-center mb-5 text-sm">
              <span className="text-slate-600">Phí phạt mất thẻ</span>
              <span className="font-medium text-slate-800">150,000 đ</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG THU</span>
              <span className="text-2xl font-bold text-blue-600">200,000 đ</span>
            </div>

            <button onClick={handleCheckoutClick} disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20 mb-3 disabled:opacity-70">
              {isProcessing ? <Spin /> : <SafetyCertificateOutlined />} Xác nhận Xử lý Mất thẻ
            </button>
            
            <p className="text-[11px] text-center text-slate-500">Thao tác này sẽ mở cổng và ghi nhận sự cố vào hệ thống.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
