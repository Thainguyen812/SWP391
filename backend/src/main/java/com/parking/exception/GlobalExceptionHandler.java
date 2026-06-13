package com.parking.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiExceptions.ApiException.class)
    @ResponseBody
    public ResponseEntity<?> handleApiException(ApiExceptions.ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorBody(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<?> handleOther(Exception ex) {
        return ResponseEntity.status(500).body(new ErrorBody("Internal server error"));
    }

    public static class ErrorBody {
        public final String message;
        public ErrorBody(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}
