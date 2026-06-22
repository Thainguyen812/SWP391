import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Vehicle {
  id: string;
  plate: string;
  name: string;
  isLocked: boolean;
  type: string;
  ownerName: string;
}

interface ScanLog {
  id: string;
  plate: string;
  cardCode?: string;
  qrToken?: string;
  action: "VÀO" | "RA";
  time: string;
  gate: string;
  status: "Thành công" | "Bị chặn (Khóa)" | "Lỗi quét";
  message: string;
}

// In-memory persistent database for the session
let vehicles: Vehicle[] = [
  { id: "v-01", plate: "30G-123.45", name: "VinFast VF8 - Đạt", isLocked: false, type: "SUV", ownerName: "Nguyễn Tiến Đạt" },
  { id: "v-02", plate: "30F-999.78", name: "Toyota Camry - Thủy", isLocked: true, type: "Sedan", ownerName: "Trần Thị Thuỷ" },
  { id: "v-03", plate: "29A-888.88", name: "Mercedes E300 - Hoàng", isLocked: false, type: "VIP", ownerName: "Phạm Minh Hoàng" },
  { id: "v-04", plate: "51F-111.11", name: "Hyundai SantaFe - Bé", isLocked: false, type: "Crossover", ownerName: "Trần Thị Bé" }
];

let scanLogs: ScanLog[] = [
  { id: "log-1", plate: "30F-999.78", action: "VÀO", time: new Date(Date.now() - 3600000).toLocaleString("vi-VN"), gate: "Cổng Vào 01", status: "Thành công", message: "Quét LPR ô tô thông bốt thành công." },
  { id: "log-2", plate: "29A-888.88", action: "VÀO", time: new Date(Date.now() - 1800000).toLocaleString("vi-VN"), gate: "Cổng Vào 01", status: "Thành công", message: "Xác thực QR Pass lái xe VIP thành công." }
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // --- API ROUTE HANDLERS ---

  // 1. Get raw vehicles
  app.get("/api/vehicles", (req, res) => {
    res.json({ success: true, data: vehicles });
  });

  // 2. Lock/Unlock a vehicle
  app.post("/api/vehicles/lock", (req, res) => {
    const { plate, isLocked } = req.body;
    if (!plate) {
      return res.status(400).json({ success: false, error: "MISSING_PLATE", message: "Thiếu biển số xe" });
    }

    const cleanPlate = plate.replace(/\s+/g, "").toUpperCase();
    const vehicle = vehicles.find(v => v.plate.replace(/\s+/g, "").toUpperCase() === cleanPlate);

    if (vehicle) {
      vehicle.isLocked = !!isLocked;
      return res.json({ 
        success: true, 
        data: vehicle, 
        message: isLocked 
          ? `🔒 Đã kích hoạt hệ thống phanh hơi và radar chống trộm cho xe ${vehicle.plate}!` 
          : `🔓 Đã giải phóng kẹp phanh, mở khóa xe ${vehicle.plate} thành công.` 
      });
    } else {
      // Auto-create vehicle if not found to handle robust entries
      const newV: Vehicle = {
        id: `v-${Date.now()}`,
        plate: plate.toUpperCase(),
        name: `Phương tiện tự động - ${plate}`,
        isLocked: !!isLocked,
        type: "Sedan",
        ownerName: "Khách lẻ vãng lai"
      };
      vehicles.push(newV);
      return res.json({ 
        success: true, 
        data: newV, 
        message: isLocked 
          ? `🔒 Đã đăng ký & khóa xe vãng lai ${newV.plate}.` 
          : `🔓 Đã mở khóa xe vãng lai ${newV.plate}.` 
      });
    }
  });

  // 3. Register vehicle
  app.post("/api/vehicles/add", (req, res) => {
    const { plate, name, type } = req.body;
    if (!plate || !name) {
      return res.status(400).json({ success: false, error: "INVALID_BODY", message: "Thiếu biển số hoặc tên xe" });
    }

    const cleanPlate = plate.replace(/\s+/g, "").toUpperCase();
    if (vehicles.some(v => v.plate.replace(/\s+/g, "").toUpperCase() === cleanPlate)) {
      return res.status(400).json({ success: false, error: "DUPLICATE_PLATE", message: "Biển số xe đã được đăng ký trên hệ thống" });
    }

    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      plate: plate.toUpperCase(),
      name: name,
      isLocked: false,
      type: type || "Sedan",
      ownerName: "Tài xế PWA"
    };
    vehicles.push(newVehicle);
    res.json({ success: true, data: newVehicle, message: "Đăng ký xe thành công!" });
  });

  // 4. Guard Gate Swipe / LPR / QR Scan
  app.post("/api/gate/scan", (req, res) => {
    const { plate, cardCode, qrToken, gate = "Bốt Gác Cổng trực" } = req.body;
    
    let targetPlate = (plate || "").trim().toUpperCase();

    // If QR token is present, decode plate from token (simple protocol: "PLATE-ACTION-TIMESTAMP")
    if (qrToken) {
      try {
        const parts = qrToken.split("|");
        if (parts.length >= 1) {
          targetPlate = parts[0].trim().toUpperCase();
        }
      } catch (err) {
        return res.status(400).json({ success: false, error: "INVALID_QR", message: "Mã QR không đúng định dạng hoặc đã hết hạn!" });
      }
    }

    // Fallback: If rfid card was scanned but no plate, map some standard cards
    if (cardCode && !targetPlate) {
      if (cardCode === "8892") targetPlate = "30G-123.45";
      else if (cardCode === "4415") targetPlate = "30F-999.78";
      else if (cardCode === "1188") targetPlate = "29A-888.88";
      else {
        targetPlate = "GUEST-" + cardCode;
      }
    }

    if (!targetPlate) {
      return res.status(400).json({ success: false, error: "MISSING_IDENTIFIER", message: "Vui lòng nhập biển số xe hoặc quét mã thẻ/QR!" });
    }

    // Check if vehicle is locked
    const cleanPlate = targetPlate.replace(/\s+/g, "").toUpperCase();
    const matchedVehicle = vehicles.find(v => v.plate.replace(/\s+/g, "").toUpperCase() === cleanPlate);

    if (matchedVehicle && matchedVehicle.isLocked) {
      const errorLog: ScanLog = {
        id: `log-${Date.now()}`,
        plate: matchedVehicle.plate,
        cardCode,
        qrToken,
        action: "VÀO",
        time: new Date().toLocaleString("vi-VN"),
        gate,
        status: "Bị chặn (Khóa)",
        message: "❌ PHÁT HIỆN ĐỘT NHẬP: Xe đang kích hoạt KHÓA CHỐNG TRỘM! Barrier đóng cứng, còi hú bốt trực!"
      };
      scanLogs.unshift(errorLog);
      return res.json({ 
        success: false, 
        error: "VEHICLE_LOCKED", 
        message: errorLog.message,
        data: { vehicle: matchedVehicle, log: errorLog }
      });
    }

    // Determine direction (in/out) via matching last successfully resolved scan logs
    const lastLog = scanLogs.find(l => l.plate.replace(/\s+/g, "").toUpperCase() === cleanPlate && l.status === "Thành công");
    const action: "VÀO" | "RA" = (lastLog && lastLog.action === "VÀO") ? "RA" : "VÀO";

    const successLog: ScanLog = {
      id: `log-${Date.now()}`,
      plate: matchedVehicle ? matchedVehicle.plate : targetPlate,
      cardCode,
      qrToken,
      action,
      time: new Date().toLocaleString("vi-VN"),
      gate,
      status: "Thành công",
      message: action === "VÀO" 
        ? `🟢 THÔNG XE cổng trực: Xe ${matchedVehicle ? matchedVehicle.plate : targetPlate} được dọn bến và cho phép VÀO bãi.` 
        : `⚪ GIẢI TỎA cổng trực: Xe ${matchedVehicle ? matchedVehicle.plate : targetPlate} thanh toán hoàn tất, được mở barie RA bãi.`
    };

    scanLogs.unshift(successLog);
    return res.json({
      success: true,
      action,
      message: successLog.message,
      data: {
        vehicle: matchedVehicle || { plate: targetPlate, name: "Khách lẻ vãng lai", type: "Vãng lai", isLocked: false },
        log: successLog
      }
    });
  });

  // 5. Get Scan Logs
  app.get("/api/gate/logs", (req, res) => {
    res.json({ success: true, data: scanLogs });
  });

  // 6. Reset or clear logs
  app.post("/api/gate/clear", (req, res) => {
    scanLogs = [];
    res.json({ success: true, message: "Nhật ký cổng trực định dạng lại sạch hoàn toàn!" });
  });

  // --- INTEGRATED VITE & STATIC FILE SERVING MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[UrbanPark Core Engine] Backend Server is fully operational on port ${PORT}`);
  });
}

startServer();
