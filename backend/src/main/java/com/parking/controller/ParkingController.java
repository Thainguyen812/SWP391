package com.parking.controller;

import com.parking.dto.AiCheckInRequest;
import com.parking.dto.CheckInResponse;
import com.parking.dto.CongestionCheckoutRequest;
import com.parking.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.parking.dto.VisitorCheckInRequest;// TASK 5
import com.parking.dto.FloorEntryVerificationRequest;
import com.parking.dto.FloorEntryVerificationResponse;
import com.parking.dto.SlotOccupancyRequest;

// phần 1 / check out task 5
import java.util.UUID;
import com.parking.model.Transaction;
//

@RestController
@RequestMapping("/api/v1/parking")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    // 1. AI Check-in: Chỉ STAFF hoặc hệ thống camera vận hành kích hoạt
    @PostMapping("/check-in/ai")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<CheckInResponse> aiCheckIn(@Valid @RequestBody AiCheckInRequest request) {
        CheckInResponse resp = parkingService.aiCheckIn(request);
        return ResponseEntity.status(201).body(resp);
    }

    // 2. Xác thực QR lối ra: Chỉ dành cho nhân viên trực cổng (Staff) soát vé xe
    // VIP
    @PostMapping("/verify-exit-qr")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<?> verifyExitQr(@RequestBody VerifyExitQrRequest request) {
        parkingService.verifyExitQr(request.getDetectedPlate(), request.getQrToken());
        return ResponseEntity.ok("MATCH — VIP QR EXIT");
    }

    public static class VerifyExitQrRequest {
        private String detectedPlate;
        private String qrToken;

        public String getDetectedPlate() {
            return detectedPlate;
        }

        public void setDetectedPlate(String detectedPlate) {
            this.detectedPlate = detectedPlate;
        }

        public String getQrToken() {
            return qrToken;
        }

        public void setQrToken(String qrToken) {
            this.qrToken = qrToken;
        }
    }

    // CHECK IN VISITOR
    // 3. Đăng ký xe vãng lai: Chỉ nhân viên trực bốt PC quét và bấm nút tạo
    @PostMapping("/check-in/visitor")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<CheckInResponse> visitorCheckIn(@RequestBody VisitorCheckInRequest request) {
        CheckInResponse response = parkingService.visitorCheckIn(request); // gọi qua serviceyml
        return ResponseEntity.status(201).body(response);
    }

    // phần 1 / check out VISITOR task 5
    // 4. Các cổng Checkout (Theo ID / Theo Code / Xác nhận): Chỉ dành cho Staff thu
    // tiền
    @PostMapping("/checkout/{cardId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<Transaction> checkout(
            @PathVariable UUID cardId) {
        return ResponseEntity.ok(
                parkingService.checkoutCard(cardId));
    }

    // confirm check out dành cho staff
    @PostMapping("/checkout/confirm/{transactionId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<Transaction> confirmCheckout(
            @PathVariable UUID transactionId,
            @RequestParam(required = false) String paymentMethod) {

        return ResponseEntity.ok(
                parkingService.confirmCheckout(transactionId, paymentMethod));
    }

    @PostMapping("/checkout-by-code/{cardCode}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<Transaction> checkoutByCode(
            @PathVariable String cardCode) {
        return ResponseEntity.ok(
                parkingService.checkoutCardByCode(cardCode));
    }

    // 5. Checkout lưu động chống kẹt xe: Staff cầm máy Mobile đi quét
    @PostMapping("/congestion/checkout") // check out lưu động
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<Transaction> congestionCheckout(
            @RequestBody CongestionCheckoutRequest request) {
        return ResponseEntity.ok(
                parkingService.congestionCheckout(request)); // nhảy qua serviceyml để xử lý
    }

    // 6. Xem phí gửi xe: Chỉ dành cho Staff kiểm tra trước khi thu tiền khách
    @GetMapping("/fee/{cardId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<java.util.Map<String, Object>> getParkingFee(@PathVariable UUID cardId) {
        return ResponseEntity.ok(parkingService.getParkingFee(cardId));
    }

    @GetMapping("/fee-by-plate/{plate}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<java.util.Map<String, Object>> getParkingFeeByPlate(@PathVariable String plate) {
        return ResponseEntity.ok(parkingService.getParkingFeeByPlate(plate));
    }

    // 8. Bản đồ bãi xe: chỉ dành cho Staff và Manager vận hành,Thêm ADMIN để cấp kỹ
    // thuật cao nhất
    @GetMapping("/monitoring/map")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getMonitoringMap() {
        return ResponseEntity.ok(parkingService.getMonitoringMap());
    }

    @GetMapping("/zones/overview")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getZoneOverview() {
        return ResponseEntity.ok(parkingService.getZoneOverview());
    }

    @PostMapping("/slots/sensor-occupancy")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> recordSlotOccupancy(
            @RequestBody SlotOccupancyRequest request) {
        return ResponseEntity.ok(parkingService.recordSlotOccupancy(request));
    }

    // 9. Xác thực xe lên tầng: Chỉ nhân viên trực tầng hoặc điều phối
    @PostMapping("/verify-floor-entry")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public ResponseEntity<FloorEntryVerificationResponse> verifyFloorEntry(
            @RequestBody FloorEntryVerificationRequest request) {
        return ResponseEntity.ok(parkingService.verifyFloorEntry(request));
    }

    @PostMapping("/verify-floor-exit")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public FloorEntryVerificationResponse verifyFloorExit(
            @RequestBody FloorEntryVerificationRequest request) {

        return parkingService.verifyFloorExit(request);
    }
}
