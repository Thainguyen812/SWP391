package com.parking.exception;

import org.springframework.http.HttpStatus;

public class ApiExceptions {
    public static class ApiException extends RuntimeException {
        private final HttpStatus status;
        public ApiException(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }
        public HttpStatus getStatus() { return status; }
    }

    public static class ForbiddenException extends ApiException {
        public ForbiddenException(String message) { super(HttpStatus.FORBIDDEN, message); }
    }

    public static class ConflictException extends ApiException {
        public ConflictException(String message) { super(HttpStatus.CONFLICT, message); }
    }

    public static class BadRequestException extends ApiException {
        public BadRequestException(String message) { super(HttpStatus.BAD_REQUEST, message); }
    }
}
