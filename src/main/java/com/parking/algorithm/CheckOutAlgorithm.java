package com.parking.algorithm; // Khớp chuẩn với package mới bạn vừa tạo

import com.parking.model.ParkingSession;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.stereotype.Component; // Dùng @Component vì đây là cụm linh kiện thuật toán riêng biệt
import java.time.Duration;
import java.time.LocalDateTime;

@Component // Đánh dấu để Spring Boot tự động nhận diện và nạp linh kiện này vào hệ thống
public class CheckOutAlgorithm {

    private final ParkingSessionRepository parkingSessionRepository;

    // Nạp repository vào để tương tác với bảng dữ liệu ParkingSession dưới MySQL
    public CheckOutAlgorithm(ParkingSessionRepository parkingSessionRepository) {
        this.parkingSessionRepository = parkingSessionRepository;
    }

    /**
     * THUẬT TOÁN TÍNH TIỀN VÀ XỬ LÝ XE RA (BƯỚC 6)
     */
    public ParkingSession giaiphapCheckOut(Long sessionId) {

        // 1. Tìm lượt xe đang gửi trong bãi dựa vào ID
        ParkingSession session = parkingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy lượt gửi xe này trong bãi!"));

        // 2. Chốt chặn an toàn: Nếu xe đã làm thủ tục ra rồi thì không tính lại
        if (session.getCheckOutTime() != null) {
            throw new RuntimeException("Lỗi: Xe này đã làm thủ tục check-out trước đó rồi!");
        }

        // 3. Đóng dấu thời gian ra bằng mốc thời gian hiện tại
        LocalDateTime checkOutTime = LocalDateTime.now();
        session.setCheckOutTime(checkOutTime);

        // 4. Lấy thời gian vào dưới DB lên để tính khoảng cách thời gian
        LocalDateTime checkInTime = session.getCheckInTime();
        Duration duration = Duration.between(checkInTime, checkOutTime);

        long totalHours = duration.toHours(); // Đổi ra tổng số giờ
        long totalMinutes = duration.toMinutes() % 60; // Số phút lẻ còn dư

        // 5. THUẬT TOÁN BÌNH GIẢI TÍNH TIỀN (Mức giá giả định, bạn có thể tự sửa số
        // lại)
        double price = 5000; // Giá sàn cho lượt gửi dưới 2 tiếng là 5k

        if (totalHours >= 2) {
            // Từ tiếng thứ 3 trở đi, mỗi tiếng tính thêm 2k
            price += (totalHours - 2) * 2000;
        }

        // Nếu có phút lẻ phát sinh, tính tròn thêm 1 tiếng để tránh thất thoát doanh
        // thu bãi xe
        if (totalMinutes > 0 && totalHours >= 2) {
            price += 2000;
        }

        // 6. Ghi số tiền tính được vào thực thể và lưu đè xuống Database
        session.setTotalPrice(price);
        return parkingSessionRepository.save(session);
    }
}