package com.parking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component // Đánh dấu bộ lọc này là một Component để Spring tự động quản lý
public class JwtAuthFilter extends OncePerRequestFilter { // Đảm bảo chạy đúng 1 lần duy nhất cho mỗi Request

    private final JwtUtils jwtUtils;

    // TỐI ƯU: Loại bỏ hoàn toàn việc nạp MockUserDetailsService tại đây.
    // Việc này giúp hệ thống loại bỏ các câu lệnh SELECT không cần thiết xuống DB,
    // cải thiện hiệu năng gấp nhiều lần.
    public JwtAuthFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Tìm xem trong Header của Request gửi lên có "Authorization" hay không
        String header = request.getHeader("Authorization");

        // Kiểm tra điều kiện: Có Header VÀ chuỗi bắt đầu bằng chuẩn "Bearer "
        if (header != null && header.startsWith("Bearer ")) {

            // Cắt bỏ 7 ký tự đầu "Bearer " để lấy chuỗi Token nguyên bản
            String token = header.substring(7);

            // 2. Gọi tiện ích xác thực xem Token xịn, fake hay đã hết hạn
            if (jwtUtils.validateJwtToken(token)) {

                // 3. ĐỌC DỮ LIỆU TỪ TOKEN (Không chạm Database):
                // Bóc tách Username và danh sách Roles đã được nhét sẵn trong gói claims khi
                // tạo Token
                String username = jwtUtils.getUserNameFromJwtToken(token);
                List<String> roles = jwtUtils.getRolesFromToken(token);

                // 4. Chuyển đổi danh sách String quyền hạn sang cấu trúc GrantedAuthority của
                // Spring Security
                List<SimpleGrantedAuthority> authorities = roles != null ? roles.stream()
                        .map(role -> {
                            // Nếu chuỗi chưa có tiền tố ROLE_ thì tự động thêm vào cho đúng chuẩn Spring
                            // Security
                            String formattedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
                            return new SimpleGrantedAuthority(formattedRole);
                        })
                        .toList() : List.of();
                // 5. Tạo "thẻ thông hành" UsernamePasswordAuthenticationToken tích hợp sẵn
                // thông tin
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, null, authorities);

                // 6. CHỐT CHẶN: Đút thẻ thông hành vào hệ thống trung tâm SecurityContextHolder
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } else {
                // SỬA LỖI AN TOÀN: Nếu Frontend có truyền Token nhưng Token sai/hết hạn,
                // lập tức chặn đứng tại đây và phản hồi lỗi 401 Unauthorized luôn, không cho
                // chạy tiếp.
                // NGOẠI LỆ: Nếu đang truy cập các public endpoint (ví dụ: login, register, swagger...),
                // cho phép đi tiếp để không bị chặn đứng/không thể đăng nhập lại khi có token cũ bị hết hạn.
                String path = request.getRequestURI();
                boolean isPublicPath = (path.startsWith("/api/auth/") && !path.equals("/api/auth/me"))
                        || path.startsWith("/v3/api-docs")
                        || path.startsWith("/swagger-ui")
                        || path.contains("/find-car")
                        || path.contains("/vnpay-ipn")
                        || path.contains("/momo-ipn");

                if (isPublicPath) {
                    filterChain.doFilter(request, response);
                    return;
                }

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter()
                        .write("{\"error\": \"Token không hợp lệ hoặc đã hết hạn! Vui lòng đăng nhập lại.\"}");
                return; // Ngắt luồng, kết thúc Filter chain tại đây
            }
        }

        // 7. LỆNH CHO ĐI: Cho phép request tiếp tục di chuyển (Dành cho trường hợp
        // request không mang Token,
        // ví dụ như các API công khai: /api/auth/login, /api/auth/register...)
        filterChain.doFilter(request, response);
    }
}