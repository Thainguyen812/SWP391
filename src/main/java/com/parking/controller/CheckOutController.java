package com.parking.controller;

import com.parking.algorithm.CheckOutAlgorithm; // Gọi linh kiện thuật toán ở Bước 6 của bạn sang
import com.parking.model.ParkingSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Thư viện phân quyền tối cao
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout") // Định nghĩa cổng vào API: http://localhost:8080/api/checkout
public class CheckOutController {

    private final CheckOutAlgorithm checkOutAlgorithm;

    // Tiêm linh kiện thuật toán ở package algorithm của bạn vào đây để sử dụng
    public CheckOutController(CheckOutAlgorithm checkOutAlgorithm) {
        this.checkOutAlgorithm = checkOutAlgorithm;
    }

    /**
     * API XỬ LÝ TÍNH TIỀN CHO XE RA (BƯỚC 7)
     * Thao tác: Nhận vào ID lượt gửi ➡️ Chạy thuật toán ➡️ Trả kết quả tính tiền
     */
    @PostMapping("/{sessionId}")
    @PreAuthorize("hasRole('STAFF')") // 🛡️ CHỐT CHẶN BẢO MẬT: Chỉ có Token chứa quyền STAFF mới được vào cổng này!
    public ResponseEntity<?> thựcHiệnTínhTiền(@PathVariable Long sessionId) {
        try {
            // Gọi hàm xử lý thuật toán ở Bước 6 để tính tiền và lưu DB
            ParkingSession kếtQuả = checkOutAlgorithm.giaiphapCheckOut(sessionId);

            // Trả về mã 200 OK kèm theo thông tin lượt gửi đã được tính tiền hoàn tất
            return ResponseEntity.ok(kếtQuả);

        } catch (RuntimeException e) {
            // Nếu có lỗi (Ví dụ: ID không tồn tại, xe đã ra rồi), trả về mã 400 Bad Request
            // kèm thông báo lỗi công khai
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}