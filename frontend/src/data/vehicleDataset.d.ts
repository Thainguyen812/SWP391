export type DemoVehicleProfile = {
  plate: string;
  normalizedPlate: string;
  model: string;
  brand: string;
  vehicleType: string;
  fuelType: string;
  vip: boolean;
  color: string;
  colorRgb: string;
  bodyShape: string;
  zoneCode: string;
  zoneLabel: string;
  imageUrl: string;
  entryImages?: string[];
  exitImages?: string[];
  registrationDocUrl?: string;
  registrationPhotoUrl?: string;
  identityDocUrl?: string;
  mobileProofImageUrl?: string;
};

export type VehicleTypeMeta = {
  label: string;
  detail: string;
  zoneCode: string;
  zoneLabel: string;
  imageUrl: string;
  bodyShape: string;
};

export const DEMO_VEHICLE_DATASET: DemoVehicleProfile[];
export function normalizePlate(value: unknown): string;
export function normalizeVehicleType(value: unknown): string;
export function getVehicleTypeMeta(vehicleType: unknown): VehicleTypeMeta;
export function getDemoVehicleByPlate(plate: unknown): DemoVehicleProfile | null;
export function getDemoVehicleProfile(source: unknown): DemoVehicleProfile | null;
export function createDemoVehicleFromInput(source: {
  plate?: string;
  model?: string;
  vehicleType?: string;
  fuelType?: string;
}): DemoVehicleProfile;
export function getDemoVehicleImages(source: unknown): {
  entry: string[];
  exit: string[];
  primary: string;
  registrationDoc?: string;
  identityDoc?: string;
  registrationPhoto?: string;
  mobileProof?: string;
};
export function chooseDemoGateVehicle(source?: {
  index?: number;
  vipRatio?: number;
  excludePlates?: string[];
}): DemoVehicleProfile;
