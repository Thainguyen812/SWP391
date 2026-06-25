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

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // Chỉ xử lý nếu có header Authorization
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtUtils.validateJwtToken(token)) {
                String username = jwtUtils.getUserNameFromJwtToken(token);
                List<String> roles = jwtUtils.getRolesFromToken(token);

                // Quan trọng: Kiểm tra xem role có tiền tố ROLE_ chưa, nếu chưa thì thêm vào
                List<SimpleGrantedAuthority> authorities = roles != null ? roles.stream()
                        .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                        .map(SimpleGrantedAuthority::new)
                        .toList() : List.of();

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null,
                        authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Token het han hoac khong hop le\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}