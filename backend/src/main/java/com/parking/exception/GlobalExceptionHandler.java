package com.parking.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
// IMPORT THÊM CÁI NÀY
import org.springframework.security.access.AccessDeniedException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiExceptions.ApiException.class)
    @ResponseBody
    public ResponseEntity<?> handleApiException(ApiExceptions.ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorBody(ex.getMessage()));
    }

    // ================= CHỖ THÊM MỚI VÀO =================
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseBody
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        // Trả về đúng mã 403 Forbidden chuẩn RESTful API khi bị chặn quyền
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorBody("Access Denied - Bạn không có quyền truy cập chức năng này!"));
    }
    // ====================================================

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<?> handleOther(Exception ex) {
        if (ex instanceof RuntimeException) {
            return ResponseEntity.status(400).body(new ErrorBody(ex.getMessage()));
        }
        return ResponseEntity.status(500)
                .body(new ErrorBody("Internal server error: " + ex.getClass().getName() + " - " + ex.getMessage()));
    }

    public static class ErrorBody {
        public final String message;

        public ErrorBody(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}
