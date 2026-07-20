const TYPE_META = {
  SEDAN_HATCHBACK: {
    label: 'Xe 4-5 chỗ',
    detail: 'Ô tô gầm thấp 4-5 chỗ',
    zoneCode: 'F1',
    zoneLabel: 'Tầng F1',
    imageUrl: '/images/raize.png',
    bodyShape: 'SEDAN_HATCHBACK',
  },
  SUV_CUV_MPV: {
    label: 'Xe 7-9 chỗ',
    detail: 'SUV/CUV/MPV 7-9 chỗ',
    zoneCode: 'F2',
    zoneLabel: 'Tầng F2',
    imageUrl: '/images/santafe.png',
    bodyShape: 'SUV_CUV_MPV',
  },
  VAN_TRUCK: {
    label: 'Xe van / Xe tải nhỏ',
    detail: 'Xe van hoặc xe tải nhỏ',
    zoneCode: 'B1',
    zoneLabel: 'Tầng B1',
    imageUrl: '/images/transit.png',
    bodyShape: 'VAN_TRUCK',
  },
  MINIBUS_16: {
    label: 'Xe khách 12-16 chỗ',
    detail: 'Xe khách 12-16 chỗ',
    zoneCode: 'G',
    zoneLabel: 'Tầng G',
    imageUrl: '/images/granvia.png',
    bodyShape: 'MINIBUS_16',
  },
};

const rawDataset = [
  ['30H-12312', 'Toyota Vios', 'Toyota', 'SEDAN_HATCHBACK', 'GASOLINE', true, '#F7C600', 'Vàng'],
  ['30H-12314', 'Toyota Raize', 'Toyota', 'SEDAN_HATCHBACK', 'GASOLINE', false, '#8BC6FF', 'Xanh nhạt'],
  ['30G-68788.SIM', 'Hyundai Accent', 'Hyundai', 'SEDAN_HATCHBACK', 'GASOLINE', false, '#FFFFFF', 'Trắng'],
  ['29A-47440.SIM', 'Kia Morning', 'Kia', 'SEDAN_HATCHBACK', 'GASOLINE', false, '#D5E7FF', 'Xanh bạc'],
  ['51H-61444.SIM', 'Mazda 3', 'Mazda', 'SEDAN_HATCHBACK', 'GASOLINE', false, '#1F2937', 'Đen'],
  ['65A-56432', 'VinFast VF e34', 'VinFast', 'SEDAN_HATCHBACK', 'ELECTRIC', false, '#FFFFFF', 'Trắng'],
  ['30E-44840.SIM', 'VinFast VF 5', 'VinFast', 'SEDAN_HATCHBACK', 'ELECTRIC', false, '#0EA5E9', 'Xanh'],
  ['51F-35072.SIM', 'Tesla Model 3', 'Tesla', 'SEDAN_HATCHBACK', 'ELECTRIC', false, '#EF4444', 'Đỏ'],

  ['65A-09231', 'Toyota Camry', 'Toyota', 'SUV_CUV_MPV', 'GASOLINE', true, '#FFFFFF', 'Trắng'],
  ['65H-98765', 'Ford Everest', 'Ford', 'SUV_CUV_MPV', 'GASOLINE', false, '#FFFFFF', 'Trắng'],
  ['51A-28454.SIM', 'Hyundai Santa Fe', 'Hyundai', 'SUV_CUV_MPV', 'GASOLINE', false, '#FFFFFF', 'Trắng'],
  ['51K-87908.SIM', 'Kia Sorento', 'Kia', 'SUV_CUV_MPV', 'GASOLINE', false, '#111827', 'Đen'],
  ['30E-75058.SIM', 'VinFast VF 9', 'VinFast', 'SUV_CUV_MPV', 'ELECTRIC', false, '#0F172A', 'Xanh đậm'],
  ['59A-55555', 'Honda CR-V', 'Honda', 'SUV_CUV_MPV', 'GASOLINE', false, '#FFFFFF', 'Trắng'],

  ['51H-13579', 'Ford Transit', 'Ford', 'VAN_TRUCK', 'GASOLINE', true, '#FFFFFF', 'Trắng'],
  ['51H-14963.SIM', 'Ford Transit Van', 'Ford', 'VAN_TRUCK', 'GASOLINE', false, '#FFFFFF', 'Trắng'],
  ['51G-63567.SIM', 'Hyundai Porter', 'Hyundai', 'VAN_TRUCK', 'GASOLINE', false, '#94A3B8', 'Bạc'],
  ['29A-52992.SIM', 'Kia Carnival Cargo', 'Kia', 'VAN_TRUCK', 'GASOLINE', false, '#0F172A', 'Đen'],

  ['51K-29673.SIM', 'Toyota Granvia', 'Toyota', 'MINIBUS_16', 'GASOLINE', true, '#FFFFFF', 'Trắng'],
  ['51K-95013.SIM', 'Mercedes Sprinter', 'Mercedes', 'MINIBUS_16', 'GASOLINE', false, '#FFFFFF', 'Trắng'],
  ['51F-43244.SIM', 'Ford Transit 16 chỗ', 'Ford', 'MINIBUS_16', 'GASOLINE', false, '#FFFFFF', 'Trắng'],
  ['30E-31770.SIM', 'VinFast Minibus EV', 'VinFast', 'MINIBUS_16', 'ELECTRIC', true, '#0EA5E9', 'Xanh'],
];

export const normalizePlate = (value) =>
  String(value || '').trim().toUpperCase().replace(/\s+/g, '');

const docSvg = (profile, title, subtitle) => {
  const plate = profile?.plate || 'DEMO-PLATE';
  const model = profile?.model || 'Demo Vehicle';
  const brand = profile?.brand || 'UrbanPark';
  const ownerName = profile?.ownerName || 'NGUYỄN HỒNG THÁI';
  const isCcCd = String(title || '').toUpperCase().includes('CĂN CƯỚC') || String(title || '').toUpperCase().includes('CCCD') || String(title || '').toUpperCase().includes('CMND');

  let svgText = '';

  if (isCcCd) {
    // Generate realistic CCCD chip card layout
    svgText = `
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
        <text x="210" y="335" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#fef08a">${ownerName.toUpperCase()}</text>

        <text x="210" y="390" font-family="Arial, sans-serif" font-size="18" fill="#93c5fd">Phương tiện đăng ký:</text>
        <text x="210" y="430" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="#38bdf8">${plate} — ${brand} ${model}</text>

        <!-- Watermark Footer -->
        <rect x="70" y="465" width="760" height="50" rx="8" fill="#0f172a" opacity="0.6"/>
        <text x="90" y="498" font-family="monospace" font-size="18" fill="#38bdf8">URBANPARK ID VERIFIED || PLATE: ${plate}</text>
      </svg>`;
  } else {
    // Generate realistic Ca Vet xe layout
    svgText = `
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

        <!-- Information Box -->
        <rect x="70" y="200" width="760" height="110" rx="12" fill="#ffffff" stroke="#eab308" stroke-width="2"/>
        <text x="95" y="245" font-family="Arial, sans-serif" font-size="20" fill="#713f12">Biển số đăng ký / Plate No.:</text>
        <text x="400" y="255" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#1e3a8a">${plate}</text>
        <text x="95" y="290" font-family="Arial, sans-serif" font-size="18" fill="#854d0e">Tên chủ xe / Owner: <tspan font-weight="700" fill="#1e293b">${ownerName.toUpperCase()}</tspan></text>

        <!-- Vehicle Details -->
        <text x="95" y="350" font-family="Arial, sans-serif" font-size="20" fill="#713f12">Nhãn hiệu / Brand:</text>
        <text x="300" y="350" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">${brand}</text>

        <text x="95" y="395" font-family="Arial, sans-serif" font-size="20" fill="#713f12">Số loại / Model:</text>
        <text x="300" y="395" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">${model}</text>

        <text x="95" y="440" font-family="Arial, sans-serif" font-size="20" fill="#713f12">Loại xe / Type:</text>
        <text x="300" y="440" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f172a">${getVehicleTypeMeta(profile?.vehicleType).label} (${profile?.fuelType || 'GASOLINE'})</text>

        <!-- Stamp simulation -->
        <circle cx="750" cy="420" r="50" fill="none" stroke="#dc2626" stroke-width="3" opacity="0.8"/>
        <text x="750" y="415" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#dc2626" text-anchor="middle" opacity="0.8">CÔNG AN TP</text>
        <text x="750" y="435" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#dc2626" text-anchor="middle" opacity="0.8">ĐÃ ĐĂNG KÝ</text>
      </svg>`;
  }
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgText.trim())}`;
};

export const getVehicleTypeMeta = (vehicleType) => {
  const key = normalizeVehicleType(vehicleType);
  return TYPE_META[key] || TYPE_META.SEDAN_HATCHBACK;
};

export const normalizeVehicleType = (value) => {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return 'SEDAN_HATCHBACK';
  if (raw.includes('MINIBUS_16') || raw.includes('16')) return 'MINIBUS_16';
  if (raw.includes('VAN_TRUCK') || raw.includes('LARGE_VAN_MINIBUS') || raw.includes('VAN') || raw.includes('TRUCK') || raw.includes('TAI')) return 'VAN_TRUCK';
  if (raw.includes('SUV') || raw.includes('CUV') || raw.includes('MPV') || raw.includes('7') || raw.includes('9')) return 'SUV_CUV_MPV';
  return 'SEDAN_HATCHBACK';
};

export const getCarModelImage = (model) => {
  if (!model) return '/images/raize.png';
  const lower = String(model).toLowerCase();
  if (lower.includes('vios')) return '/images/vios.png';
  if (lower.includes('raize')) return '/images/raize.png';
  if (lower.includes('accent')) return '/images/accent.png';
  if (lower.includes('morning')) return '/images/morning.png';
  if (lower.includes('mazda 3')) return '/images/mazda3.png';
  if (lower.includes('vf e34')) return '/images/vfe34.png';
  if (lower.includes('vf 5')) return '/images/vf5.png';
  if (lower.includes('model 3')) return '/images/tesla_model_3.png';
  if (lower.includes('camry')) return '/images/camry.png';
  if (lower.includes('everest')) return '/images/everest.png';
  if (lower.includes('santa fe')) return '/images/santafe.png';
  if (lower.includes('sorento')) return '/images/sorento.png';
  if (lower.includes('vf 9')) return '/images/vf9.png';
  if (lower.includes('cr-v')) return '/images/crv.png';
  if (lower.includes('transit van')) return '/images/transit_van.png';
  if (lower.includes('transit 16')) return '/images/transit_16.png';
  if (lower.includes('transit')) return '/images/transit.png';
  if (lower.includes('porter')) return '/images/porter.png';
  if (lower.includes('carnival')) return '/images/carnival.png';
  if (lower.includes('granvia')) return '/images/granvia.png';
  if (lower.includes('sprinter')) return '/images/sprinter.png';
  if (lower.includes('minibus')) return '/images/minibus_ev.png';
  return '/images/raize.png';
};

export const DEMO_VEHICLE_DATASET = rawDataset.map(([plate, model, brand, vehicleType, fuelType, vip, colorRgb, color]) => {
  const type = normalizeVehicleType(vehicleType);
  const meta = TYPE_META[type];
  const baseProfile = {
    plate,
    normalizedPlate: normalizePlate(plate),
    model,
    brand,
    vehicleType: type,
    fuelType,
    vip,
    color,
    colorRgb,
    bodyShape: meta.bodyShape,
    zoneCode: meta.zoneCode,
    zoneLabel: meta.zoneLabel,
  };
  const carImage = getCarModelImage(model);
  const profile = {
    ...baseProfile,
    imageUrl: carImage,
  };
  return {
    ...profile,
    entryImages: [carImage, carImage],
    exitImages: [carImage, carImage],
    registrationDocUrl: docSvg(profile, 'GIẤY ĐĂNG KÝ XE', 'Tài liệu mô phỏng dùng cho OCR demo'),
    registrationPhotoUrl: carImage,
    identityDocUrl: docSvg(profile, 'CĂN CƯỚC CÔNG DÂN', 'Chủ xe demo UrbanPark'),
    mobileProofImageUrl: carImage,
  };
});

const DATASET_BY_PLATE = new Map(DEMO_VEHICLE_DATASET.map((vehicle) => [vehicle.normalizedPlate, vehicle]));

export const getDemoVehicleByPlate = (plate) => DATASET_BY_PLATE.get(normalizePlate(plate)) || null;

const isLegacySvgImage = (value) =>
  typeof value === 'string' && value.trim().toLowerCase().startsWith('data:image/svg+xml');

const pickUsableImage = (...values) =>
  values.find((value) => typeof value === 'string' && value.trim() && !isLegacySvgImage(value));

export const getDemoVehicleProfile = (source) => {
  if (!source) return null;
  const plate = typeof source === 'string'
    ? source
    : source.plate || source.licensePlate || source.license_plate || source.detectedPlate;
  const byPlate = getDemoVehicleByPlate(plate);
  if (byPlate) return byPlate;

  const vehicleType = normalizeVehicleType(source.vehicleType || source.vehicleSize || source.type);
  const meta = TYPE_META[vehicleType];
  return {
    plate: plate || '',
    normalizedPlate: normalizePlate(plate),
    model: source.model || source.vehicleModel || source.brand || meta.label,
    brand: source.brand || source.vehicleBrand || meta.label,
    vehicleType,
    fuelType: String(source.fuelType || source.fuel_type || 'GASOLINE').toUpperCase(),
    vip: Boolean(source.vip || source.isVip),
    color: source.color || 'Trắng',
    colorRgb: source.colorRgb || '#FFFFFF',
    bodyShape: meta.bodyShape,
    zoneCode: source.assignedZoneCode || source.zoneCode || meta.zoneCode,
    zoneLabel: meta.zoneLabel,
    imageUrl: pickUsableImage(source.image, source.imageUrl, source.cameraImage, source.entryImageUrl) || meta.imageUrl,
    entryImages: [
      pickUsableImage(source.entryImageUrl, source.imageUrl, source.image) || meta.imageUrl,
      pickUsableImage(source.image, source.imageUrl) || meta.imageUrl
    ],
    exitImages: [
      pickUsableImage(source.exitImageUrl, source.imageUrl, source.image) || meta.imageUrl,
      pickUsableImage(source.image, source.imageUrl) || meta.imageUrl
    ],
    registrationDocUrl: source.registrationDocUrl || docSvg({ plate, model: source.model || source.brand, vehicleType, fuelType: source.fuelType }, 'GIẤY ĐĂNG KÝ XE', 'Tài liệu mô phỏng dùng cho OCR demo'),
    registrationPhotoUrl: pickUsableImage(source.registrationPhotoUrl, source.image, source.imageUrl) || meta.imageUrl,
    identityDocUrl: source.identityDocUrl || docSvg({ plate, model: source.model || source.brand, vehicleType, fuelType: source.fuelType }, 'CĂN CƯỚC CÔNG DÂN', 'Chủ xe demo UrbanPark'),
    mobileProofImageUrl: pickUsableImage(source.mobileProofImageUrl, source.image, source.imageUrl) || meta.imageUrl,
  };
};

export const createDemoVehicleFromInput = ({ plate, model, vehicleType, fuelType }) => {
  const existing = getDemoVehicleByPlate(plate);
  if (existing) return existing;
  const type = normalizeVehicleType(vehicleType);
  const meta = TYPE_META[type];
  const profile = {
    plate,
    normalizedPlate: normalizePlate(plate),
    model: model || meta.label,
    brand: model || meta.label,
    vehicleType: type,
    fuelType: String(fuelType || 'GASOLINE').toUpperCase(),
    vip: false,
    color: 'Trắng',
    colorRgb: '#FFFFFF',
    bodyShape: meta.bodyShape,
    zoneCode: meta.zoneCode,
    zoneLabel: meta.zoneLabel,
  };
  profile.imageUrl = meta.imageUrl;
  return {
    ...profile,
    entryImages: [meta.imageUrl, meta.imageUrl],
    exitImages: [meta.imageUrl, meta.imageUrl],
    registrationDocUrl: docSvg(profile, 'GIẤY ĐĂNG KÝ XE', 'Tài liệu mô phỏng dùng cho OCR demo'),
    registrationPhotoUrl: meta.imageUrl,
    identityDocUrl: docSvg(profile, 'CĂN CƯỚC CÔNG DÂN', 'Chủ xe demo UrbanPark'),
    mobileProofImageUrl: meta.imageUrl,
  };
};

export const getDemoVehicleImages = (source) => {
  const profile = getDemoVehicleProfile(source);
  if (!profile) {
    const meta = TYPE_META.SEDAN_HATCHBACK;
    const fallbackProfile = {
      plate: 'DEMO-PLATE',
      model: meta.label,
      brand: 'UrbanPark',
      vehicleType: meta.bodyShape,
      fuelType: 'GASOLINE',
    };
    return {
      entry: [meta.imageUrl, meta.imageUrl],
      exit: [meta.imageUrl, meta.imageUrl],
      primary: meta.imageUrl,
      registrationDoc: docSvg(fallbackProfile, 'GIAY DANG KY XE', 'Tai lieu mo phong dung cho OCR demo'),
      identityDoc: docSvg(fallbackProfile, 'CAN CUOC CONG DAN', 'Chu xe demo UrbanPark'),
      registrationPhoto: meta.imageUrl,
      mobileProof: meta.imageUrl,
    };
  }
  return {
    entry: profile.entryImages?.length ? profile.entryImages : [profile.imageUrl, profile.imageUrl],
    exit: profile.exitImages?.length ? profile.exitImages : [profile.imageUrl, profile.imageUrl],
    primary: profile.imageUrl,
    registrationDoc: profile.registrationDocUrl,
    identityDoc: profile.identityDocUrl,
    registrationPhoto: profile.registrationPhotoUrl,
    mobileProof: profile.mobileProofImageUrl,
  };
};

export const chooseDemoGateVehicle = ({ index = 0, vipRatio = 0.4, excludePlates = [] } = {}) => {
  const excluded = new Set(excludePlates.map(normalizePlate));
  const available = DEMO_VEHICLE_DATASET.filter((vehicle) => !excluded.has(vehicle.normalizedPlate));
  const vipPool = available.filter((vehicle) => vehicle.vip);
  const visitorPool = available.filter((vehicle) => !vehicle.vip);
  const shouldVip = ((index + 1) % 5) < Math.round(vipRatio * 5);
  const pool = shouldVip && vipPool.length ? vipPool : visitorPool.length ? visitorPool : available;
  return pool[Math.abs(index) % pool.length] || DEMO_VEHICLE_DATASET[0];
};
