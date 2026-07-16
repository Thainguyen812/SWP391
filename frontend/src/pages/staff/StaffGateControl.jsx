import { 
  LockOutlined, 
  ToolOutlined, 
  CheckCircleFilled, 
  CloseCircleOutlined,
  VideoCameraOutlined,
  ExclamationCircleFilled,
  CarOutlined
} from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { notification, Modal, Dropdown, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { useGlobalContext } from '../../context/GlobalContext';
import { getVehicleImageByPlate } from '../../utils/vehicleImages';

export const StaffGateControl = () => {
  const navigate = useNavigate();
  const { activityLogs, addActivityLog, activeVehicles, currentVehicle, setCurrentVehicle, addActiveVehicle, removeActiveVehicle, processEntryVehicle, addTransaction, updateShiftStats, dailyVolume, setDailyVolume, fetchAllDataFromBackend, totalGates, isEmergency, setIsEmergency, gates, setGates, gateLogs, setGateLogs, addSecurityAlert } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('Tất cả');

  const [manualPlate, setManualPlate] = useState('');
  const [manualCardCode, setManualCardCode] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [lastCheckInResult, setLastCheckInResult] = useState(null);
  
  const [terminalTime, setTerminalTime] = useState(new Date().toLocaleTimeString('en-GB') + ' GMT+7');
  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalTime(new Date().toLocaleTimeString('en-GB') + ' GMT+7');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getFloorShortName = (code) => {
    if (!code) return "Chưa gán";
    const c = code.toUpperCase();
    if (c === "F1") return "Tầng 1";
    if (c === "F2") return "Tầng 2";
    if (c === "B1") return "Tầng B1";
    if (c === "G") return "Tầng G";
    return c;
  };

  const getFloorFullName = (code) => {
    if (!code) return "Chưa gán";
    const c = code.toUpperCase();
    if (c === "F1") return "Tầng 1 — Khu Xe Gia Đình 4-5 Chỗ (Sedan, Hatchback, EV)";
    if (c === "F2") return "Tầng 2 — Khu Xe 7-9 Chỗ (SUV, CUV, MPV)";
    if (c === "B1") return "Tầng B1 — Khu Xe Van & Xe Tải Nhỏ";
    if (c === "G") return "Tầng G — Khu Xe Khách 12-16 Chỗ";
    return `Tầng ${c}`;
  };

  const getVehicleTypeLabel = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'SUV_CUV_MPV') return 'Xe 7-9 chỗ';
    if (t === 'LARGE_VAN_MINIBUS') return 'Xe lớn';
    if (t === 'EV_CAR' || t === 'ELECTRIC') return 'Xe điện';
    return 'Xe 4-5 chỗ';
  };

  const getVehicleTypeFromZone = (zoneCode) => {
    const code = (zoneCode || '').toUpperCase();
    if (code === 'F1') return 'SEDAN_HATCHBACK';
    if (code === 'F2') return 'SUV_CUV_MPV';
    if (code === 'B1' || code === 'G' || code === 'B1/G') return 'LARGE_VAN_MINIBUS';
    return null;
  };

  const inferVehicleType = (vehicle) => {
    const zoneVehicleType = getVehicleTypeFromZone(vehicle?.assignedZoneCode);
    if (zoneVehicleType) return zoneVehicleType;
    const directType = vehicle?.vehicleType || vehicle?.vehicleSize || vehicle?.detectedVehicleType;
    if (directType) return directType;

    const text = `${vehicle?.model || ''} ${vehicle?.type || ''}`.toUpperCase();
    if (text.includes('SUV') || text.includes('CUV') || text.includes('MPV') || text.includes('7') || text.includes('9')) {
      return 'SUV_CUV_MPV';
    }
    if (text.includes('VAN') || text.includes('BUS') || text.includes('TRUCK') || text.includes('16')) {
      return 'LARGE_VAN_MINIBUS';
    }
    return 'SEDAN_HATCHBACK';
  };

  const getZoneForVehicleType = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'SUV_CUV_MPV') return 'F2';
    if (t === 'LARGE_VAN_MINIBUS') return 'B1/G';
    return 'F1';
  };

  const getRouteHint = (type, zoneCode) => {
    const code = (zoneCode || getZoneForVehicleType(type)).toUpperCase();
    const label = getVehicleTypeLabel(type);
    if (code === 'F1') return `${label} → Tầng F1`;
    if (code === 'F2') return `${label} → Tầng F2`;
    if (code === 'B1' || code === 'G' || code === 'B1/G') return `${label} → Tầng B1/G`;
    return `${label} → ${getFloorShortName(code)}`;
  };

  const normalizeGateText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');

  const isEntryGateId = (value) => normalizeGateText(value).includes('VAO') || normalizeGateText(value).includes('IN');
  const isExitGateId = (value) => normalizeGateText(value).includes('RA') || normalizeGateText(value).includes('OUT');

  const handleGateRowSelect = (gate) => {
    if (!gate.vehicleId || !activeVehicles) {
      setCurrentVehicle(null);
      setManualPlate('');
      return;
    }

    const vehicle = activeVehicles.find(av => av.id === gate.vehicleId);
    if (!vehicle) {
      setCurrentVehicle(null);
      setManualPlate('');
      return;
    }

    setCurrentVehicle(vehicle);

    if (isEntryGateId(gate.id)) {
      setManualPlate(gate.plate && gate.plate !== '---' ? gate.plate : vehicle.plate || '');
      return;
    }

    if (isExitGateId(gate.id)) {
      setManualPlate('');
    }
  };

  // AI Simulator State
  const DEFAULT_CAMERA_IMAGE = 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80';
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [isLotModalVisible, setIsLotModalVisible] = useState(false);
  const [aiPlate, setAiPlate] = useState('30G-123.45');
  const [aiConfidence, setAiConfidence] = useState(98.5);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiImagePreview, setAiImagePreview] = useState(getVehicleImageByPlate('51A-999.99'));

  const getVehicleCameraImage = (vehicle) => {
    return vehicle?.image || vehicle?.imageUrl || vehicle?.cameraImage || vehicle?.entryImageUrl || DEFAULT_CAMERA_IMAGE;
  };

  const getSelectedGateVehicle = () => {
    if (currentVehicle?.plate) return currentVehicle;
    return activeVehicles?.find(v => v.gate) || null;
  };

  const openVipCameraModal = () => {
    const vehicle = getSelectedGateVehicle();
    if (vehicle?.plate) {
      setAiPlate(vehicle.plate);
    }
    setAiImagePreview(getVehicleCameraImage(vehicle));
    setIsAiModalVisible(true);
  };

  const handleManualCheckIn = async () => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể check-in lúc này.' });
      return;
    }
    if (!manualPlate) {
      notification.error({ message: 'Lỗi', description: 'Vui lòng nhập biển số xe!' });
      return;
    }

    const normalizedManualPlate = manualPlate.trim().toUpperCase();
    const existingVehicle = activeVehicles?.find(v => v.plate?.toUpperCase() === normalizedManualPlate);
    const isWaitingEntry = isEntryGateId(existingVehicle?.gate);
    const isExistingVip = existingVehicle && (existingVehicle.type === 'VIP' || existingVehicle.isVip === true);

    if (existingVehicle && !isWaitingEntry) {
      notification.error({ message: 'Lỗi Check-in', description: 'Xe này đã có phiên gửi xe ACTIVE trong bãi.' });
      return;
    }

    if (isWaitingEntry && isExistingVip) {
      setAiPlate(normalizedManualPlate);
      notification.warning({
        message: 'Xe VIP cần xác thực camera',
        description: 'Xe VIP không check-in bằng thẻ vãng lai. Dùng nút "Xác thực VIP Camera" hoặc phê duyệt VIP ở bảng làn.'
      });
      return;
    }

    if (!manualCardCode || !manualCardCode.trim()) {
      notification.error({ message: 'Thiếu mã thẻ', description: 'Khách vãng lai phải quẹt/cấp thẻ tạm trước khi vào bãi.' });
      return;
    }
    
    setIsCheckingIn(true);
    try {
      const waitingVehicleForForm = activeVehicles?.find(v => v.plate?.toUpperCase() === normalizedManualPlate && isEntryGateId(v.gate));
      const detectedType = inferVehicleType(waitingVehicleForForm);
      const mappedType = detectedType;

      // Gọi API /api/gate/scan thông minh (Tự nhận diện VIP hoặc cấp thẻ vãng lai)
      const response = await apiClient.post(`/gate/scan`, {
        plate: normalizedManualPlate,
        cardCode: manualCardCode.trim(),
        gate: waitingVehicleForForm?.gate || 'L-VÀO 1',
        direction: 'ENTRY',
        vehicleType: mappedType,
        fuelType: mappedType === 'EV_CAR' ? 'ELECTRIC' : 'GASOLINE'
      });
      const payload = response?.data || response;

      notification.success({
        message: 'Thành công',
        description: payload?.message || `Đã check-in thành công cho xe ${normalizedManualPlate}`
      });
      addLog(`[GATE_SCAN] Success: ${payload?.message}`, 'OK');

      const isVip = payload?.message?.toLowerCase().includes('vip') || false;
      const zone = payload?.data?.assignedZoneCode || getZoneForVehicleType(mappedType);
      setLastCheckInResult({
        plate: normalizedManualPlate,
        type: isVip ? 'VIP' : 'Vãng lai',
        vehicleType: getVehicleTypeLabel(mappedType),
        assignedZoneCode: zone,
        floorName: getFloorShortName(zone),
        floorFullName: getFloorFullName(zone),
        routeHint: getRouteHint(mappedType, zone),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      if (waitingVehicleForForm) {
        processEntryVehicle(normalizedManualPlate);
      }
      if (fetchAllDataFromBackend) {
        fetchAllDataFromBackend();
      }
      
      addActivityLog({
        plate: normalizedManualPlate,
        model: 'Khách vãng lai',
        type: 'MỞ BARRIER',
        gate: waitingVehicleForForm?.gate || 'L-VÀO 1',
        action: 'Vào bãi bằng thẻ tạm',
        time: new Date().toISOString(),
        status: 'THÀNH CÔNG',
        typeColor: 'text-orange-600',
        statusColor: 'bg-emerald-100 text-emerald-700',
        actionColor: 'text-emerald-600',
        image: null
      });
      
      setDailyVolume(prev => prev + 1);
      setManualPlate('');
      setManualCardCode('');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error === 'VEHICLE_LOCKED') {
        notification.error({
          message: '🚨 CẢNH BÁO BẢO MẬT 🚨',
          description: `Phát hiện xe đang khóa cố tình vượt cổng ra! Hệ thống đã kích hoạt báo động.`,
          duration: 0,
          style: { backgroundColor: '#fef2f2', border: '2px solid #ef4444' }
        });
        addLog(`[SECURITY_ALERT] Xe bị khóa cố tình vượt trạm!`, 'ERROR');
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Không thể check-in lúc này';
        notification.error({ message: 'Thất bại', description: errorMsg });
        addLog(`[ERROR] Check-in thất bại: ${errorMsg}`, 'ERROR');
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleAiCheckIn = async () => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể check-in lúc này.' });
      return;
    }
    if (!aiPlate || !aiPlate.trim()) {
      notification.warning({ message: 'Lỗi', description: 'Vui lòng nhập biển số.' });
      return;
    }

    const plateUpper = aiPlate.trim().toUpperCase();
    const parsedConfidence = parseFloat(aiConfidence);

    // Confidence below 70% must be blocked
    if (Number.isNaN(parsedConfidence) || parsedConfidence < 70) {
      notification.error({
        message: 'Bị từ chối',
        description: `Độ tin cậy (${aiConfidence}%) dưới ngưỡng 70%. Không thể mở cổng!`
      });
      addLog(`[AI_LPR] Blocked: Plate ${plateUpper}, Conf: ${aiConfidence}% (Under 70%)`, 'WARN');
      return;
    }

    setIsAiProcessing(true);
    try {
      // Check if there is a vehicle waiting at the IN gate (in activeVehicles) matching this plate
      const waitingVehicle = activeVehicles?.find(v => v.plate?.toUpperCase() === plateUpper && isEntryGateId(v.gate));
      const aiVehicleType = inferVehicleType(waitingVehicle || currentVehicle);

      if (waitingVehicle) {
        const isWaitingVip = waitingVehicle.type === 'VIP' || waitingVehicle.isVip === true;
        if (isWaitingVip) {
          // If VIP is waiting + confidence >= 70%: call /sessions/approve-entry
          await apiClient.post('/sessions/approve-entry', { plate: plateUpper });
          const zone = waitingVehicle.assignedZoneCode || getZoneForVehicleType(aiVehicleType);

          notification.success({
            message: 'Xác thực VIP Camera thành công',
            description: `Mở cổng cho xe VIP ${plateUpper}`
          });

          addLog(`[AI_LPR] VIP Approved (LPR): Plate ${plateUpper}, Conf: ${aiConfidence}%`, 'OK');
          processEntryVehicle(plateUpper);

          setLastCheckInResult({
            plate: plateUpper,
            type: 'VIP',
            vehicleType: getVehicleTypeLabel(aiVehicleType),
            assignedZoneCode: zone,
            floorName: getFloorShortName(zone),
            floorFullName: getFloorFullName(zone),
            routeHint: getRouteHint(aiVehicleType, zone),
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          addActivityLog({
            plate: plateUpper,
            model: "Nhận diện VIP Camera",
            type: "VIP",
            gate: waitingVehicle.gate || "CAM-01-IN",
            action: "Vào Cổng (Xác thực LPR)",
            time: "Vừa xong",
            status: "Thành Công",
            typeColor: "text-amber-600",
            statusColor: "bg-emerald-100 text-emerald-700",
            actionColor: "text-emerald-600"
          });

          setDailyVolume(prev => prev + 1);
          setIsAiModalVisible(false);
          setAiPlate('');
          if (fetchAllDataFromBackend) fetchAllDataFromBackend();
          return;
        } else {
          // If Visitor (Vãng lai) is waiting: do not call VIP API!
          // Auto-fill license plate to the form, close modal, and ask staff to swipe temporary card.
          setManualPlate(plateUpper);

          notification.info({
            message: 'Cần quẹt thẻ tạm',
            description: `Xe vãng lai ${plateUpper} đã được tự điền. Staff quẹt/cấp thẻ tạm để check-in.`
          });

          setIsAiModalVisible(false);
          return;
        }
      }

      // If not in the waiting queue, but is a VIP check-in in DB (or new entry):
      // Call /v1/parking/check-in/ai
      const response = await apiClient.post(`/v1/parking/check-in/ai`, {
        plate: plateUpper,
        vehicle_type: aiVehicleType,
        camera_id: "CAM-01-IN",
        confidence_score: parsedConfidence,
        image_url: getVehicleImageByPlate(newVehicle.licensePlate)
      });
      const payload = response?.data || response;
      
      const zone = payload?.assigned_zone_code || getZoneForVehicleType(aiVehicleType);
      setLastCheckInResult({
        plate: plateUpper,
        type: 'VIP',
        vehicleType: getVehicleTypeLabel(aiVehicleType),
        assignedZoneCode: zone,
        floorName: getFloorShortName(zone),
        floorFullName: getFloorFullName(zone),
        routeHint: getRouteHint(aiVehicleType, zone),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      notification.success({ message: 'Xác thực VIP Camera thành công', description: `Biển số VIP ${plateUpper} hợp lệ.` });
      addLog(`[AI_LPR] Success (New VIP check-in): Plate ${plateUpper}, Conf: ${aiConfidence}%`, 'OK');
      setIsAiModalVisible(false);
      setAiPlate('');
      setAiConfidence(98.5);
      
      addActivityLog({
        plate: plateUpper,
        model: "Nhận diện Camera",
        type: "VIP",
        gate: "CAM-01-IN",
        action: "Vào Cổng (AI)",
        time: "Vừa xong",
        status: "Thành Công",
        typeColor: "text-amber-600",
        statusColor: "bg-emerald-100 text-emerald-700",
        actionColor: "text-emerald-600"
      });
      setDailyVolume(prev => prev + 1);
      if (fetchAllDataFromBackend) fetchAllDataFromBackend();

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Xác thực VIP thất bại';
      notification.error({ message: 'Lỗi', description: errorMsg });
      addLog(`[ERROR] AI Check-in: ${errorMsg}`, 'ERROR');
    } finally {
      setIsAiProcessing(false);
    }
  };


  const addLog = (msg, type = 'INFO') => {
    let colorClass = "text-slate-300";
    if (type === 'OK') colorClass = "text-emerald-400";
    if (type === 'WARN') colorClass = "text-yellow-400";
    if (type === 'ERROR') colorClass = "text-red-400";
    setGateLogs(prev => [`<span class="${colorClass}"><span class="opacity-70">[${type}]</span> ${msg}</span>`, ...prev].slice(0, 20));
  };

  const processedLogIds = useRef(new Set());

  useEffect(() => {
    if (!activityLogs || activityLogs.length === 0) return;
    activityLogs.slice(0, 10).reverse().forEach(log => {
      const logId = log.id || `${log.plate}-${log.time}-${log.action}`;
      if (!processedLogIds.current.has(logId)) {
        processedLogIds.current.add(logId);
        if (!log.isManual) {
          let typeStr = 'INFO';
          if (log.status === 'Thành Công' || log.status === 'Success') typeStr = 'OK';
          if (log.status === 'Cảnh Báo' || log.status === 'Warning' || log.status === 'Cảnh báo') typeStr = 'WARN';
          if (log.status === 'Lỗi' || log.status === 'ERROR') typeStr = 'ERROR';
          const timeStr = log.time && log.time !== 'Vừa xong' ? `[${new Date(log.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}] ` : '';
          addLog(`${timeStr}[${log.gate || 'Hệ thống'}] ${log.action}: ${log.plate}`, typeStr);
        }
      }
    });
  }, [activityLogs]);

  const handleApprove = (id, plate) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể mở cổng lúc này.' });
      return;
    }

    const isExitGate = isExitGateId(id);
    const fee = isExitGate ? 25000 : 0;
    const vehicle = activeVehicles.find(v => v.plate === plate);
    const isVip = vehicle && (vehicle.type === 'VIP' || vehicle.isVip === true);

    // Exit gate always goes through the payment/review screen so staff can verify card/ID and compare images first.
    if (isExitGate) {
      notification.info({ message: 'Chuyển hướng', description: 'Đang mở màn hình thanh toán/đối chiếu ảnh...', placement: 'topRight' });
      navigate('/staff-payment', {
        state: {
          lpr: plate,
          cardCode: vehicle?.cardCode,
          type: vehicle?.type,
          isVip,
          duration: vehicle?.duration,
          inTime: vehicle?.inTime
        }
      });
      return;
    }

    // If it's an entry gate and not a VIP, we MUST use the form below to swipe card code and check-in
    if (!isExitGate && !isVip) {
      notification.info({
        message: 'Yêu cầu quẹt thẻ',
        description: `Vui lòng quẹt thẻ tạm ở form "Check-in vãng lai bằng thẻ" phía dưới để hoàn tất check-in cho xe ${plate}!`,
        placement: 'topRight'
      });
      setManualPlate(plate);
      return;
    }

    Modal.confirm({
      title: 'Xác nhận mở cổng',
      content: `Mở cổng ${id} cho xe ${plate}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-blue-600' },
      async onOk() {
        try {
          if (isExitGate && isVip) {
            await apiClient.post('/sessions/approve-exit', { plate });
          } else if (!isExitGate) {
            await apiClient.post('/sessions/approve-entry', { plate });
          }
        } catch (e) {
          notification.error({ message: 'Lỗi', description: e.response?.data?.message || 'Không thể mở cổng!' });
          return;
        }

        // Clear from active vehicles so the UI updates
        if (!isExitGate) {
          processEntryVehicle(plate);
        } else {
          removeActiveVehicle(plate);
        }
        
        // Temporarily visually open the gate before it gets cleared out
        setGates(prev => prev.map(g => {
          if (g.id === id) {
            return { ...g, barrier: "MỞ", barrierColor: "text-emerald-500", actions: ["lock", "wrench"] };
          }
          return g;
        }));

        addLog(`${id}: Phê duyệt thủ công, Barrier MỞ cho xe ${plate}`, 'OK');
        if (isExitGate) {
          addTransaction({
            id: 'TX' + Date.now().toString().slice(-6),
            plate: plate,
            type: isVip ? 'VIP' : 'Vãng lai',
            amount: 0,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            method: 'Miễn phí (Mở thủ công)',
            staff: 'Phạm Hải Đăng'
          });
        }
        
        // Update Global Context Activity Log
        addActivityLog({
          plate: plate,
          model: "Mở Thủ Công",
          type: isVip ? "VIP" : "VÃNG LAI",
          gate: id,
          action: isExitGate ? "Ra Cổng" : "Vào Cổng",
          time: "Vừa xong",
          status: "Thành Công",
          typeColor: isVip ? "text-amber-600" : "text-blue-600",
          statusColor: "bg-emerald-100 text-emerald-700",
          actionColor: "text-emerald-600"
        });

        notification.success({
          message: 'Đã phê duyệt',
          description: `Barrier đã được mở cho xe ${plate}.`,
          placement: 'topRight'
        });
      }
    });
  };

  const handleReject = (id, plate) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thao tác lúc này.' });
      return;
    }
    const vehicle = activeVehicles.find(v => v.plate === plate);

    Modal.confirm({
      title: 'Từ chối mở cổng',
      content: `Bạn chắc chắn muốn từ chối xe ${plate} đi qua cổng ${id} và yêu cầu xe lùi lại?`,
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        removeActiveVehicle(plate);
        setGates(prev => prev.map(g => {
          if (g.id === id) {
            return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", actions: ["lock", "wrench"] };
          }
          return g;
        }));
        
        addSecurityAlert({
          id: 'AL' + Date.now().toString().slice(-6),
          plate: plate,
          image: vehicle?.image,
          reason: `Từ chối mở cổng tại ${id}. Xe buộc phải lùi lại.`,
          type: 'TỪ CHỐI QUA CỔNG',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          status: 'new'
        });

        addLog(`${id}: Từ chối mở cổng cho xe ${plate}`, 'WARN');
        
        notification.error({
          message: 'Đã từ chối mở cổng',
          description: `Xe ${plate} đã bị từ chối qua cổng và hệ thống đã ghi nhận cảnh báo an ninh. Nhân viên vui lòng hướng dẫn xe lùi lại hoặc di chuyển sang khu vực xử lý vi phạm.`,
          placement: 'topRight',
          duration: 8
        });
      }
    });
  };

  const handleLock = (id) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thao tác lúc này.' });
      return;
    }
    const gate = gates.find(g => g.id === id);
    if (!gate) return;
    
    const isLocked = gate.mode === "Khóa";
    
    if (!isLocked && gate.vehicleId) {
      notification.warning({ message: 'Không thể khóa', description: 'Đang có xe chờ xử lý tại cổng.' });
      return;
    }
    
    Modal.confirm({
      title: isLocked ? 'Xác nhận mở khóa làn' : 'Xác nhận khóa làn',
      content: isLocked ? `Bạn muốn mở khóa làn ${id}?` : `Bạn có chắc chắn muốn khóa khẩn cấp làn ${id}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: !isLocked },
      onOk() {
        if (isLocked) {
           addLog(`${id}: Mở khóa làn`, 'INFO');
        } else {
           addLog(`${id}: Đã khóa làn khẩn cấp`, 'ERROR');
        }

        setGates(prev => prev.map(g => {
          if (g.id === id) {
            if (isLocked) {
               return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", mode: "Tự động" };
            } else {
               return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", mode: "Khóa" };
            }
          }
          return g;
        }));
        notification.success({message: isLocked ? 'Đã mở khóa' : 'Đã khóa', placement: 'topRight'});
      }
    });
  };

  const handleMaintenance = (id) => {
    if (isEmergency) {
      notification.error({ message: 'Hệ thống đang dừng khẩn cấp', description: 'Không thể thao tác lúc này.' });
      return;
    }
    const gate = gates.find(g => g.id === id);
    if (!gate) return;
    const isCurrentlyMaintenance = gate.mode === "Bảo trì";
    
    if (!isCurrentlyMaintenance && gate.vehicleId) {
      notification.warning({ message: 'Không thể bảo trì', description: 'Đang có xe chờ xử lý tại cổng.' });
      return;
    }

    if (isCurrentlyMaintenance) {
      addLog(`${id}: Đã tắt chế độ bảo trì, chuyển về Tự động`, 'SUCCESS');
    } else {
      addLog(`${id}: Chuyển sang chế độ bảo trì`, 'WARN');
    }

    setGates(prev => prev.map(g => {
      if (g.id === id) {
        if (isCurrentlyMaintenance) {
          return { ...g, mode: "Tự động" };
        } else {
          return { ...g, barrier: "ĐÓNG", barrierColor: "text-red-500", mode: "Bảo trì" };
        }
      }
      return g;
    }));
  };

  const handleEmergencyStop = () => {
    if (isEmergency) {
      setIsEmergency(false);
      notification.success({
        message: 'KHÔI PHỤC HỆ THỐNG',
        description: 'Tất cả các Barrier đã được cấp điện lại. Chế độ vận hành bình thường đã được khôi phục.',
        placement: 'topRight'
      });
      return;
    }

    Modal.confirm({
      title: 'Xác nhận Dừng khẩn cấp',
      icon: <ExclamationCircleFilled style={{ color: '#ef4444' }} />,
      content: 'Hành động này sẽ ngắt điện toàn bộ hệ thống Barrier và khóa các cổng đang mở. Bạn có chắc chắn không?',
      okText: 'KÍCH HOẠT DỪNG KHẨN CẤP',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk() {
        setIsEmergency(true);
        notification.error({
          message: 'HỆ THỐNG ĐÃ BỊ DỪNG KHẨN CẤP',
          description: 'Toàn bộ Barrier đã bị khóa. Vui lòng liên hệ bộ phận Kỹ thuật để mở lại.',
          placement: 'topRight',
          duration: 10
        });
      },
    });
  };

  const getVehicleTypeDisplay = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'SUV_CUV_MPV') return 'Xe 7-9 chỗ (SUV/CUV/MPV)';
    if (t === 'LARGE_VAN_MINIBUS') return 'Xe lớn (Van/Minibus)';
    if (t === 'EV_CAR' || t === 'ELECTRIC') return 'Xe điện';
    return 'Xe 4-5 chỗ (Sedan/Hatchback)';
  };

  const getLedDirection = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'SUV_CUV_MPV') return 'Tầng F2';
    if (t === 'LARGE_VAN_MINIBUS') return 'Tầng B1/G';
    return 'Tầng F1';
  };

  const getVehicleTypeForZone = (type, zoneCode) => {
    if (!zoneCode) return type;
    return getVehicleTypeFromZone(zoneCode) || type;
  };

  return (
    <div className="p-6 w-full">
      {/* Top Stats & Emergency */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* Xe trong bãi */}
        <div onClick={() => setIsLotModalVisible(true)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center cursor-pointer hover:border-blue-400 hover:shadow-md transition-all">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Xe trong bãi</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-4xl font-extrabold text-slate-800">{activeVehicles ? activeVehicles.filter(v => !v.gate).length : 0}</span>
              <span className="text-xl text-slate-400 font-medium">xe</span>
              {activeVehicles && activeVehicles.filter(v => v.gate).length > 0 && (
                <span className="text-xs text-orange-500 font-medium ml-1">
                  ({activeVehicles.filter(v => v.gate).length} xe đang ở cổng)
                </span>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Tổng lượt vào/ra hôm nay</h4>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-800">{(dailyVolume || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Số làn đang hoạt động</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-800">
                {(() => {
                  if (isEmergency) return 0;
                  const gatesInMaintenance = gates.filter(g => g.mode === 'Bảo trì').length;
                  return Math.max(0, totalGates - gatesInMaintenance);
                })()}
              </span>
              <span className="text-xl text-slate-400 font-medium">/ {totalGates}</span>
            </div>
            <div className="flex gap-1">
              {(() => {
                const gatesInMaintenance = gates.filter(g => g.mode === 'Bảo trì').length;
                const activeLanesCount = isEmergency ? 0 : Math.max(0, totalGates - gatesInMaintenance);
                const inactiveLanesCount = totalGates - activeLanesCount;
                return (
                  <>
                    {[...Array(activeLanesCount)].map((_, i) => <div key={`active-${i}`} className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>)}
                    {[...Array(inactiveLanesCount)].map((_, i) => <div key={`inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-red-500"></div>)}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Trạng thái hệ thống</h4>
          <div className="flex items-center gap-2 mt-1">
            {isEmergency ? (
              <>
                <CloseCircleOutlined className="text-red-500 text-2xl" />
                <span className="text-xl font-bold text-red-600">Dừng khẩn cấp</span>
              </>
            ) : (
              <>
                <CheckCircleFilled className="text-emerald-500 text-2xl" />
                <span className="text-xl font-bold text-emerald-600">Bình thường</span>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={handleEmergencyStop}
          className={`active:scale-[0.98] transition-all p-5 rounded-xl flex flex-col items-center justify-center cursor-pointer group ${
            isEmergency 
              ? 'bg-slate-800 border-2 border-slate-700 text-white shadow-md hover:bg-slate-700'
              : 'bg-white border-2 border-red-500 hover:bg-red-50 shadow-[0_4px_15px_rgba(239,68,68,0.2)] text-red-600'
          }`}
        >
          <span className="text-4xl font-bold mb-1 group-hover:scale-110 transition-transform">*</span>
          <span className="text-sm font-bold uppercase tracking-widest text-center leading-snug">
            {isEmergency ? 'Tắt dừng khẩn cấp' : 'Dừng khẩn cấp'}
          </span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Gate Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-lg font-bold text-slate-800">Quản lý làn xe trực tuyến</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Tìm tên, biển số, ..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 w-[220px]"
              />
              <Dropdown menu={{ 
                items: [
                  { key: 'Tất cả', label: 'Tất cả trạng thái' },
                  { key: 'Tự động', label: 'Chế độ Tự động' },
                  { key: 'Thủ công', label: 'Chế độ Thủ công' },
                  { key: 'Khóa', label: 'Làn bị Khóa' },
                  { key: 'Bảo trì', label: 'Đang Bảo trì' }
                ], 
                onClick: (e) => setFilterMode(e.key) 
              }} trigger={['click']}>
                <button className="border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer">Lọc: {filterMode}</button>
              </Dropdown>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('Tất cả');
                  notification.success({message: 'Tải lại thành công', description: 'Đã cập nhật trạng thái làn xe mới nhất.', placement: 'topRight'});
                }}
                className="border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Tải lại
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-4 border-b border-slate-200 w-[15%]">Mã Làn</th>
                  <th className="p-4 border-b border-slate-200 w-[15%]">Loại Xe</th>
                  <th className="p-4 border-b border-slate-200 w-[20%]">Biển Số</th>
                  <th className="p-4 border-b border-slate-200 w-[15%]">Barrier</th>
                  <th className="p-4 border-b border-slate-200 w-[10%]">Chế độ</th>
                  <th className="p-4 border-b border-slate-200 w-[25%]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {gates
                  .filter(gate => filterMode === 'Tất cả' || gate.mode === filterMode)
                  .filter(gate => 
                    gate.plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    gate.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    gate.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((gate, i) => {
                    const isSelected = currentVehicle?.id === gate.vehicleId;
                    return (
                  <tr 
                    key={i} 
                    onClick={() => handleGateRowSelect(gate)}
                    className={`border-b hover:bg-slate-50 transition-colors last:border-0 cursor-pointer ${isSelected ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'border-slate-100'}`}
                  >
                    <td className="p-4 font-bold text-slate-800">{gate.id}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${gate.typeColor}`}>
                        {gate.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 tracking-wider">
                      {gate.plate}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {gate.barrier === "MỞ" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                        {gate.barrier === "ĐÓNG" && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                        <span className={`text-[11px] font-bold ${gate.barrierColor}`}>
                          {gate.barrier}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {gate.mode}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {gate.actions.includes("lock") && (
                          <button onClick={() => handleLock(gate.id)} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${gate.mode === "Khóa" ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                            <LockOutlined />
                          </button>
                        )}
                        {gate.actions.includes("wrench") && (
                          <button onClick={() => handleMaintenance(gate.id)} className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${gate.mode === "Bảo trì" ? "bg-orange-50 border-orange-200 text-orange-500" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}>
                            <ToolOutlined />
                          </button>
                        )}
                        {gate.actions.includes("approve") && (
                          <button 
                            onClick={() => handleApprove(gate.id, gate.plate)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircleFilled className="text-white" />
                            {isExitGateId(gate.id) ? "THANH TOÁN" : "PHÊ DUYỆT"}
                          </button>
                        )}
                        {gate.actions.includes("reject") && (
                          <button 
                            onClick={() => handleReject(gate.id, gate.plate)}
                            className="w-8 h-8 rounded border border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                          >
                            <CloseCircleOutlined />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                    );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 text-center bg-slate-50 mt-auto">
            <button 
              onClick={() => navigate('/staff-monitoring')}
              className="text-slate-700 text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
            >
              Xem thêm báo cáo lưu lượng
            </button>
          </div>
        </div>

        {/* Right Column: Cameras & Logs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Virtual LED Board Widget */}
          <div className="bg-slate-950 border-4 border-slate-800 rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">LED BOARD SIMULATOR — LÀN VÀO</span>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></div>
            </div>
            <div className="bg-slate-950/80 rounded px-2 py-3 border border-slate-900 flex items-center justify-center min-h-[50px]">
              {lastCheckInResult ? (
                lastCheckInResult.type === 'VIP' ? (
                  <marquee 
                    className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-amber-500" 
                    style={{ textShadow: '0 0 8px rgba(245, 158, 11, 0.8)' }}
                    scrollamount="6"
                  >
                    WELCOME VIP {lastCheckInResult.plate} ➔ HƯỚNG ĐI: {lastCheckInResult.floorName.toUpperCase()}
                  </marquee>
                ) : (
                  <marquee 
                    className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-emerald-400" 
                    style={{ textShadow: '0 0 8px rgba(52, 211, 153, 0.8)' }}
                    scrollamount="6"
                  >
                    BIỂN SỐ: {lastCheckInResult.plate} ➔ {lastCheckInResult.routeHint || `${lastCheckInResult.vehicleType} → ${lastCheckInResult.floorName}`}
                  </marquee>
                )
              ) : (
                <span 
                  className="font-mono text-xs text-orange-600/70 font-semibold tracking-wider uppercase animate-pulse"
                  style={{ textShadow: '0 0 4px rgba(234, 88, 12, 0.3)' }}
                >
                  Hệ thống LED đang chờ phương tiện...
                </span>
              )}
            </div>
          </div>

          {/* AI Info Card with Glassmorphism */}
          {lastCheckInResult && (
            <div className="backdrop-blur-md bg-white/80 border border-slate-100 p-4 rounded-xl shadow-sm transition-all duration-350 transform translate-y-0 opacity-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trích xuất Camera AI</span>
                <span className="text-[9px] font-mono text-slate-500">{lastCheckInResult.timestamp}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Biển số</span>
                  <span className="font-mono text-lg font-bold text-slate-800 tracking-wider">{lastCheckInResult.plate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Vé xe</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mt-0.5 ${
                    lastCheckInResult.type === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {lastCheckInResult.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Nhận diện xe</span>
                  <span className="text-xs font-bold text-slate-700">{lastCheckInResult.vehicleType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Phân Tầng Đỗ</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                    lastCheckInResult.assignedZoneCode === 'F1' ? 'bg-emerald-100 text-emerald-800' :
                    lastCheckInResult.assignedZoneCode === 'F2' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {lastCheckInResult.floorName}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Đã phân tầng thành công
                </span>
                <span className="text-slate-400 font-normal">Zone: {lastCheckInResult.assignedZoneCode?.length > 10 ? 'Khu Vực Chung' : lastCheckInResult.assignedZoneCode}</span>
              </div>
            </div>
          )}
          
          {/* Camera Monitor */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <VideoCameraOutlined /> Giám sát Camera (LIVE)
              </h3>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div className="p-2 flex flex-col gap-2 bg-slate-50">
                {(() => {
                  let displayGate = null;
                  let displayVehicle = null;

                  if (currentVehicle) {
                     displayVehicle = currentVehicle;
                     displayGate = gates?.find(g => g.vehicleId === currentVehicle.id);
                  } else {
                     displayGate = gates?.find(g => g.vehicleId);
                     if (displayGate) {
                         displayVehicle = activeVehicles?.find(v => v.id === displayGate.vehicleId);
                     }
                  }

                  if (!displayGate || !displayVehicle) {
                    return (
                      <div className="relative rounded overflow-hidden aspect-[16/9] bg-slate-900 border border-slate-200 flex items-center justify-center">
                        <span className="text-slate-500 text-xs font-medium">Chọn một làn để xem Camera</span>
                      </div>
                    );
                  }

                  return (
                    <div key={displayGate.id} className="relative rounded overflow-hidden aspect-[16/9] bg-slate-900 border border-blue-500 shadow-md ring-2 ring-blue-500">
                      <img src={getVehicleImageByPlate(displayVehicle.licensePlate)} alt={`Cam ${displayGate.id}`} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        CAM - {displayGate.id}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                        {displayVehicle.plate}
                      </div>
                    </div>
                  );
                })()}
              <button 
                onClick={openVipCameraModal}
                className="mt-1 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-sm"
              >
                <VideoCameraOutlined /> XÁC THỰC VIP CAMERA
              </button>
            </div>
          </div>

          {/* Manual Check-In */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col p-4 mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
              <CheckCircleFilled className="text-emerald-500" /> Check-in vãng lai bằng thẻ
            </h3>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Biển số xe (VD: 30A-123.45)" 
                value={manualPlate}
                onChange={(e) => setManualPlate(e.target.value)}
                className="border border-slate-200 p-2 rounded text-sm focus:outline-none focus:border-blue-500 uppercase"
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Mã thẻ (Quẹt thẻ...)" 
                  value={manualCardCode}
                  onChange={(e) => setManualCardCode(e.target.value)}
                  className="border border-slate-200 p-2 rounded text-sm focus:outline-none focus:border-blue-500 flex-1"
                />
                <button 
                  onClick={() => setManualCardCode(String(Math.floor(Math.random() * 50) + 1).padStart(6, '0'))}
                  title="Giả lập máy quét thẻ"
                  className="bg-slate-100 border border-slate-200 px-3 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  💳 Quét mẫu
                </button>
              </div>
              {(() => {
                const normalizedPlate = manualPlate.trim().toUpperCase();
                if (!normalizedPlate) return null;
                const waitingVehicleForForm = activeVehicles?.find(v => v.plate?.toUpperCase() === normalizedPlate && isEntryGateId(v.gate));
                const detectedZone = waitingVehicleForForm?.assignedZoneCode;
                const detectedType = getVehicleTypeForZone(inferVehicleType(waitingVehicleForForm), detectedZone);
                return (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600 font-medium my-1">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-0.5">Camera nhận diện</span>
                      <span className="text-slate-800 font-extrabold text-[13px]">
                        {getVehicleTypeDisplay(detectedType).toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-0.5">Hướng dẫn LED bảng chỉ dẫn</span>
                      <span className="text-emerald-600 font-extrabold text-[13px] tracking-wide">
                        XE {normalizedPlate || '...'} ➔ {getRouteHint(detectedType, detectedZone).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })()}
              <button 
                onClick={handleManualCheckIn}
                disabled={isCheckingIn}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-sm mt-1"
              >
                💳 QUẸT THẺ & CHECK-IN
              </button>
            </div>
          </div>

          {/* System Terminal Log */}
          <div className="bg-[#0f172a] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 border border-slate-800 min-h-[250px]">
            <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-[#0b1121]">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhật ký Hệ thống</h3>
              <span className="text-[9px] font-mono text-slate-500">{terminalTime}</span>
            </div>
            {gateLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">Chưa có sự kiện nào</div>
            ) : (
              <div className="p-4 font-mono text-[10px] sm:text-xs text-slate-300 flex flex-col gap-2 overflow-auto custom-scrollbar">
                {gateLogs.map((log, i) => (
                   <div key={i} dangerouslySetInnerHTML={{ __html: log }} />
                ))}
                {/* Fake cursor */}
                <div className="w-2 h-3.5 bg-slate-400 animate-pulse mt-1"></div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* AI LPR Simulator Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 uppercase tracking-wider font-bold">
            <VideoCameraOutlined className="text-amber-500" /> Xác thực VIP qua LPR
          </div>
        }
        open={isAiModalVisible}
        onCancel={() => setIsAiModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <div className="flex flex-col gap-5 mt-4">
          {/* Camera Image Area */}
          <div className="border border-slate-200 rounded-lg p-2 flex flex-col bg-slate-50 relative overflow-hidden">
             <img src={aiImagePreview || DEFAULT_CAMERA_IMAGE} alt="Ảnh camera xe tại cổng" className="w-full h-40 object-cover rounded opacity-85" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nhận diện Biển số</label>
            <input 
              type="text" 
              value={aiPlate}
              onChange={(e) => setAiPlate(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-lg font-mono text-xl text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase text-center"
              placeholder="VD: 30G-123.45"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>Độ tin cậy (Confidence Score)</span>
              <span className={`text-base ${aiConfidence < 70 ? 'text-red-500' : 'text-emerald-500'}`}>{aiConfidence}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" step="0.1"
              value={aiConfidence}
              onChange={(e) => setAiConfidence(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            {aiConfidence < 70 ? (
              <p className="text-[11px] text-red-500 mt-3 font-semibold flex items-center gap-1 bg-red-50 p-2 rounded">
                <ExclamationCircleFilled /> Hệ thống Backend sẽ từ chối nhận diện do độ tin cậy dưới ngưỡng (70%).
              </p>
            ) : (
              <p className="text-[11px] text-emerald-600 mt-3 font-semibold flex items-center gap-1 bg-emerald-50 p-2 rounded">
                <CheckCircleFilled /> Độ tin cậy đạt yêu cầu để mở cổng tự động.
              </p>
            )}
          </div>

          <button
            onClick={handleAiCheckIn}
            disabled={isAiProcessing}
            className={`w-full font-bold py-3.5 px-4 rounded-lg transition-colors shadow-md mt-2 flex items-center justify-center gap-2 uppercase tracking-wider ${aiConfidence < 70 ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'} disabled:opacity-70`}
          >
            {isAiProcessing ? 'Đang gửi Backend xử lý...' : (aiConfidence < 70 ? 'Phê duyệt (Bị từ chối)' : 'Phê duyệt VIP')}
          </button>
        </div>
      </Modal>

      {/* Vehicles in Lot Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <CarOutlined />
            <span>Danh sách Xe trong bãi ({activeVehicles ? activeVehicles.filter(v => !v.gate).length : 0})</span>
          </div>
        }
        open={isLotModalVisible}
        footer={null}
        onCancel={() => setIsLotModalVisible(false)}
        width={700}
      >
        <div className="py-4">
          <div className="mb-4">
            <Input.Search placeholder="Tìm biển số xe..." allowClear />
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-3 border-b border-slate-200">Biển số</th>
                  <th className="p-3 border-b border-slate-200">Loại vé</th>
                  <th className="p-3 border-b border-slate-200">Tầng đỗ</th>
                  <th className="p-3 border-b border-slate-200">Giờ vào</th>
                  <th className="p-3 border-b border-slate-200 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeVehicles && activeVehicles.filter(v => !v.gate).length > 0 ? (
                  activeVehicles.filter(v => !v.gate).map(v => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-700">{v.plate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${v.type === 'VIP' ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="p-3">
                        {v.assignedZoneCode ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            v.assignedZoneCode.length > 10 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            v.assignedZoneCode.toUpperCase() === 'F1' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            v.assignedZoneCode.toUpperCase() === 'F2' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            v.assignedZoneCode.toUpperCase() === 'B1' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            v.assignedZoneCode.toUpperCase() === 'G' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-slate-50 text-slate-700'
                          }`}>
                            {v.assignedZoneCode.length > 10 ? ((v.floorName && v.floorName.length < 10) ? v.floorName : 'Khu Vực Chung') : `${(v.floorName && v.floorName.length < 10) ? v.floorName : v.assignedZoneCode} (${v.assignedZoneCode.toUpperCase()})`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Chưa gán</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 text-sm">{v.inTime}</td>
                      <td className="p-3 text-right">
                        <Button size="small" type="primary" ghost onClick={() => {
                          setIsLotModalVisible(false);
                          navigate('/staff-payment', { state: { lpr: v.plate } });
                        }}>
                          Thanh toán
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500">Bãi đang trống</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

    </div>
  );
};
