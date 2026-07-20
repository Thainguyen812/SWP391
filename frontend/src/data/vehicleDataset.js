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
  const model = profile?.model || 'Demo vehicle';
  const text = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <rect width="900" height="560" rx="28" fill="#f8fafc"/>
      <rect x="44" y="44" width="812" height="472" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      <text x="80" y="118" font-family="Arial" font-size="38" font-weight="700" fill="#0f172a">${title}</text>
      <text x="80" y="170" font-family="Arial" font-size="24" fill="#475569">${subtitle}</text>
      <rect x="80" y="220" width="740" height="128" rx="12" fill="#eff6ff" stroke="#60a5fa" stroke-width="2"/>
      <text x="116" y="300" font-family="Arial" font-size="52" font-weight="800" fill="#1d4ed8">${plate}</text>
      <text x="80" y="414" font-family="Arial" font-size="28" font-weight="700" fill="#111827">${model}</text>
      <text x="80" y="458" font-family="Arial" font-size="22" fill="#64748b">${profile?.brand || 'UrbanPark'} - ${getVehicleTypeMeta(profile?.vehicleType).label} - ${profile?.fuelType || 'GASOLINE'}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(text)}`;
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
