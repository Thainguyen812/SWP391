import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Car, Layers, RefreshCcw, Search, Signal, SquareParking } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface ParkingMonitorViewProps {
  triggerToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  isDarkMode?: boolean;
  [key: string]: any;
}

interface ZoneOverview {
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  allowedVehicleTypes?: string[];
  totalSlots: number;
  currentOccupied: number;
  availableSlots: number;
  sensorTotal: number;
  sensorOccupied: number;
  sensorAvailable: number;
  sensorOnline: number;
  sensorStatus: string;
}

interface SlotMap {
  id: string;
  zoneId: string;
  zoneCode?: string;
  zoneName?: string;
  slotNumber: string;
  slotType: string;
  slotStatus: string;
  sensorMockId?: string;
  licensePlate?: string;
  vehicleType?: string;
  isVip?: boolean;
  slotPhotoUrl?: string;
  lastUpdated?: string;
}

const vehicleTypeLabel = (type?: string) => {
  const value = (type || '').toUpperCase();
  if (value.includes('SUV_CUV_MPV')) return 'Xe 7-9 chỗ';
  if (value.includes('LARGE') || value.includes('VAN') || value.includes('MINIBUS')) return 'Xe lớn';
  if (value.includes('EV')) return 'Xe điện';
  return 'Xe 4-5 chỗ';
};

const sortZones = (zones: ZoneOverview[]) => {
  const order = ['F1', 'F2', 'B1', 'G'];
  return [...zones].sort((a, b) => order.indexOf(a.zoneCode) - order.indexOf(b.zoneCode));
};

export function ParkingMonitorView({ triggerToast, isDarkMode }: ParkingMonitorViewProps) {
  const [zones, setZones] = useState<ZoneOverview[]>([]);
  const [slots, setSlots] = useState<SlotMap[]>([]);
  const [selectedZone, setSelectedZone] = useState('F1');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [sensorPlate, setSensorPlate] = useState('');
  const [sensorVehicleType, setSensorVehicleType] = useState('SEDAN_HATCHBACK');
  const [sensorImageUrl, setSensorImageUrl] = useState('');
  const [sensorOccupied, setSensorOccupied] = useState(true);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (triggerToast) triggerToast(msg, type);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [zoneData, slotData] = await Promise.all([
        apiClient.get('/v1/parking/zones/overview'),
        apiClient.get('/v1/parking/monitoring/map')
      ]);
      const normalizedZones = sortZones(Array.isArray(zoneData) ? zoneData : []);
      setZones(normalizedZones);
      setSlots(Array.isArray(slotData) ? slotData : []);
      if (!selectedZone && normalizedZones[0]) setSelectedZone(normalizedZones[0].zoneCode);
    } catch (error) {
      console.error(error);
      notify('Không tải được bản đồ tầng/sensor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedZoneInfo = zones.find((zone) => zone.zoneCode === selectedZone) || zones[0];
  const visibleSlots = useMemo(() => {
    return slots
      .filter((slot) => !selectedZoneInfo || slot.zoneId === selectedZoneInfo.zoneId || slot.zoneCode === selectedZoneInfo.zoneCode)
      .filter((slot) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;
        return [slot.slotNumber, slot.licensePlate, slot.sensorMockId].some((value) =>
          (value || '').toLowerCase().includes(keyword)
        );
      });
  }, [slots, selectedZoneInfo, search]);

  const totals = useMemo(() => {
    return zones.reduce(
      (acc, zone) => ({
        total: acc.total + Number(zone.totalSlots || 0),
        occupied: acc.occupied + Number(zone.currentOccupied || 0),
        available: acc.available + Number(zone.availableSlots || 0),
        sensors: acc.sensors + Number(zone.sensorOnline || 0)
      }),
      { total: 0, occupied: 0, available: 0, sensors: 0 }
    );
  }, [zones]);

  const submitSensor = async () => {
    if (!selectedSlotId) {
      notify('Chọn một ô đỗ trước khi ghi nhận sensor', 'error');
      return;
    }
    if (sensorOccupied && !sensorPlate.trim()) {
      notify('Sensor báo có xe thì cần biển số', 'error');
      return;
    }

    try {
      const res = await apiClient.post('/v1/parking/slots/sensor-occupancy', {
        slotId: selectedSlotId,
        licensePlate: sensorPlate.trim().toUpperCase(),
        vehicleType: sensorVehicleType,
        occupied: sensorOccupied,
        imageUrl: sensorImageUrl.trim()
      });
      
      const responseData = res.data || res;
      if (responseData.message === 'SENSOR_SLOT_RECORDED_WITH_VIOLATION') {
        notify('Đã cập nhật sensor. CHÚ Ý: Phát hiện xe đỗ sai vị trí, đã ghi nhận vé phạt vào hệ thống!', 'error');
      } else {
        notify('Đã cập nhật dữ liệu sensor ô đỗ', 'success');
      }
      
      setSensorPlate('');
      setSensorImageUrl('');
      await loadData();
    } catch (error: any) {
      console.error(error);
      notify(error?.response?.data?.message || error?.message || 'Sensor update thất bại', 'error');
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Zone Map & Sensor Control</h2>
          <p className="text-sm text-slate-500">Quản lý phân tầng, sức chứa và trạng thái cảm biến từng ô đỗ.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Tải lại
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          { label: 'Tổng ô', value: totals.total, icon: SquareParking, tone: 'text-slate-800' },
          { label: 'Xe trong tầng', value: totals.occupied, icon: Car, tone: 'text-blue-700' },
          { label: 'Còn trống', value: totals.available, icon: Layers, tone: 'text-emerald-700' },
          { label: 'Sensor online', value: totals.sensors, icon: Signal, tone: 'text-amber-700' }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
                {item.label}
                <Icon size={16} />
              </div>
              <div className={`text-3xl font-black ${item.tone}`}>{item.value}</div>
            </div>
          );
        })}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-black uppercase tracking-wide">Cấu hình phân tầng</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Tầng</th>
                <th className="px-4 py-3">Loại xe được phép</th>
                <th className="px-4 py-3">Tổng ô</th>
                <th className="px-4 py-3">Đang có xe</th>
                <th className="px-4 py-3">Còn trống</th>
                <th className="px-4 py-3">Sensor</th>
              </tr>
            </thead>
            <tbody>
              {sortZones(zones).map((zone) => (
                <tr
                  key={zone.zoneId}
                  onClick={() => setSelectedZone(zone.zoneCode)}
                  className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${selectedZone === zone.zoneCode ? 'bg-blue-50/70' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-black">{zone.zoneCode}</div>
                    <div className="text-xs text-slate-500">{zone.zoneName}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {(zone.allowedVehicleTypes || []).join(', ') || 'Chưa cấu hình'}
                  </td>
                  <td className="px-4 py-3">{zone.totalSlots}</td>
                  <td className="px-4 py-3 font-bold text-blue-700">{zone.currentOccupied}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{zone.availableSlots}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${zone.sensorStatus === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {zone.sensorOnline}/{zone.sensorTotal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide">Sensor ô đỗ {selectedZoneInfo?.zoneCode}</h3>
              <p className="text-xs text-slate-500">Slot chỉ được gán khi sensor/camera xác nhận xe đã đỗ.</p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm slot, biển số, sensor"
                className="h-9 w-56 outline-none text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-4 xl:grid-cols-6">
            {visibleSlots.map((slot) => {
              const occupied = slot.slotStatus?.toUpperCase() === 'OCCUPIED';
              const selected = selectedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`min-h-[92px] rounded-md border p-3 text-left transition ${
                    selected ? 'border-blue-500 ring-2 ring-blue-100' :
                    occupied ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black">{slot.slotNumber}</span>
                    <span className={`h-2 w-2 rounded-full ${occupied ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-600">{occupied ? (slot.licensePlate || 'Có xe') : 'Trống'}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{occupied ? vehicleTypeLabel(slot.vehicleType) : slot.sensorMockId || 'No sensor'}</div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-wide">Ghi nhận sensor</h3>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-500">Slot đã chọn</label>
            <div className="rounded-md bg-slate-50 px-3 py-2 text-sm font-bold">
              {slots.find((slot) => slot.id === selectedSlotId)?.slotNumber || 'Chưa chọn'}
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={sensorOccupied} onChange={(event) => setSensorOccupied(event.target.checked)} />
              Sensor báo có xe
            </label>
            <input
              value={sensorPlate}
              onChange={(event) => setSensorPlate(event.target.value)}
              disabled={!sensorOccupied}
              placeholder="Biển số xe"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500 disabled:bg-slate-100"
            />
            <select
              value={sensorVehicleType}
              onChange={(event) => setSensorVehicleType(event.target.value)}
              disabled={!sensorOccupied}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
            >
              <option value="SEDAN_HATCHBACK">Xe 4-5 chỗ</option>
              <option value="SUV_CUV_MPV">Xe 7-9 chỗ</option>
              <option value="LARGE_VAN_MINIBUS">Xe lớn</option>
              <option value="EV_CAR">Xe điện</option>
            </select>
            <input
              value={sensorImageUrl}
              onChange={(event) => setSensorImageUrl(event.target.value)}
              disabled={!sensorOccupied}
              placeholder="Ảnh camera slot (tuỳ chọn)"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
            />
            <button
              onClick={submitSensor}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700"
            >
              Cập nhật sensor
            </button>
            <div className="flex gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              Sensor không tạo session mới. Xe phải có phiên ACTIVE từ gate trước khi gán vào ô.
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
