package com.parking.security; // Package khớp chuẩn với thư mục quản lý bảo mật của dự án

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // Đánh dấu bộ lọc này là một Component để Spring tự động phát hiện và quản lý
public class JwtAuthFilter extends OncePerRequestFilter { // Kế thừa OncePerRequestFilter để đảm bảo bộ lọc này chỉ chặn
                                                          // và chạy đúng 1 lần duy nhất cho mỗi Request

    private final JwtUtils jwtUtils; // Tiêm tiện ích JwtUtils (Bước 2) vào để dùng các hàm bóc tách, xác thực Token
    private final UserDetailsService userDetailsService; // Tiêm dịch vụ User của Spring vào để chọc xuống Database thật
                                                         // tìm người dùng

    // Constructor dùng để ép Spring tự động nạp (Inject) 2 đối tượng phụ trợ ở trên
    // vào khi khởi chạy ứng dụng
    public JwtAuthFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    // Hàm lõi xử lý việc chặn đường và kiểm tra Request
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Tìm xem trong Header của Request gửi lên có ô nào tên là "Authorization"
        // hay không
        String header = request.getHeader("Authorization");

        // Kiểm tra: Nếu có Header VÀ chuỗi chữ bắt đầu bằng "Bearer " (chuẩn Token quốc
        // tế)
        if (header != null && header.startsWith("Bearer ")) {

            // Thực hiện cắt bỏ 7 ký tự đầu "Bearer " để lấy ra chuỗi Token mã hóa nguyên
            // bản
            String token = header.substring(7);

            // 2. Gọi hàm ở Bước 2 để kiểm tra xem Token này có bị fake, bị sửa hay hết hạn
            // hay không
            if (jwtUtils.validateJwtToken(token)) {

                // Sử dụng hàm ở Bước 2 để bóc tách và lấy ra Username (chủ tài khoản) từ trong
                // Token
                String username = jwtUtils.getUserNameFromJwtToken(token);

                // 3. ĐOẠN ĐỤNG DATABASE THẬT: Gọi lệnh loadUserByUsername truyền vào username
                // vừa bóc tách
                // Hàm này sẽ tự động chạy xuống bảng dữ liệu MySQL (qua UserRepository) để lôi
                // toàn bộ thông tin của User đó
                // lên (bao gồm cả Password đã băm và danh sách các Roles/Quyền hạn thật đang
                // lưu ở DB) rồi gói vào đối tượng UserDetails
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 4. Tạo một chiếc "thẻ thông hành" UsernamePasswordAuthenticationToken chứa
                // đầy đủ thông tin:
                // - Tài khoản (userDetails)
                // - Thông tin xác thực bổ sung (null)
                // - Danh sách quyền hạn thật lấy từ DB lên (userDetails.getAuthorities())
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                // 5. CHỐT CHẶN QUYẾT ĐỊNH: Đút chiếc thẻ thông hành này vào hệ thống trung tâm
                // SecurityContextHolder
                // Kể từ giây phút này, Spring Security chính thức xác nhận người này đã đăng
                // nhập thành công bằng tài khoản có thật dưới DB và lưu giữ các quyền của họ
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 6. LỆNH CHO ĐI: Cho phép request tiếp tục di chuyển tới Controller hoặc các
        // tầng logic nghiệp vụ phía sau
        filterChain.doFilter(request, response);
    }
}