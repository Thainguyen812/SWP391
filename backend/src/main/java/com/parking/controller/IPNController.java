package com.parking.controller;

import com.parking.model.Transaction;
import com.parking.model.VipSubscription;
import com.parking.repository.TransactionRepository;
import com.parking.repository.VipSubscriptionRepository;
import com.parking.service.ParkingService;
import com.parking.service.VNPayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/v1/payment")
public class IPNController {

    private final VipSubscriptionRepository vipRepo;
    private final TransactionRepository transactionRepo;
    private final ParkingService parkingService;
    private final VNPayService vnPayService;
    private final String vnp_HashSecret = "XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN"; // Trùng với Service nhé

    public IPNController(VipSubscriptionRepository vipRepo, TransactionRepository transactionRepo, ParkingService parkingService, VNPayService vnPayService) {
        this.vipRepo = vipRepo;
        this.transactionRepo = transactionRepo;
        this.parkingService = parkingService;
        this.vnPayService = vnPayService;
    }

    @GetMapping("/vnpay-url")
    public ResponseEntity<?> getVNPayUrl(@RequestParam UUID transactionId, HttpServletRequest request) {
        try {
            Optional<Transaction> txnOpt = transactionRepo.findById(transactionId);
            if (txnOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Transaction not found");
            }
            Transaction txn = txnOpt.get();
            if (txn.getPaymentStatus() == Transaction.PaymentStatus.SUCCESS) {
                return ResponseEntity.badRequest().body("Transaction already paid");
            }

            long amount = txn.getTotalAmount().longValue();
            String ipAddress = request.getRemoteAddr();
            String paymentUrl = vnPayService.createPaymentUrl(transactionId.toString(), amount, ipAddress);

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating VNPay URL: " + e.getMessage());
        }
    }

    @GetMapping("/transaction/{id}/status")
    public ResponseEntity<?> getTransactionStatus(@PathVariable UUID id) {
        Optional<Transaction> txnOpt = transactionRepo.findById(id);
        if (txnOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Map<String, String> response = new HashMap<>();
        response.put("paymentStatus", txnOpt.get().getPaymentStatus().name());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<?> receiveIPN(@RequestParam Map<String, String> requestParams) {
        try {
            // 1. Xác thực chữ ký bảo mật
            String vnp_SecureHash = requestParams.get("vnp_SecureHash");
            requestParams.remove("vnp_SecureHash");
            requestParams.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(requestParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = requestParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String calculatedHash = hmacSHA512(vnp_HashSecret, hashData.toString());

            if (!calculatedHash.equals(vnp_SecureHash)) {
                return ResponseEntity.ok("{\"RspCode\":\"97\",\"Message\":\"Invalid Signature\"}");
            }

            // 2. Lấy thông tin đơn hàng từ VNPay gửi về
            String txnRef = requestParams.get("vnp_TxnRef");
            String orderIdStr = txnRef.contains("_") ? txnRef.split("_")[0] : txnRef;
            String vnp_ResponseCode = requestParams.get("vnp_ResponseCode");

            UUID orderId = UUID.fromString(orderIdStr);
            
            // TH1: Check xem có phải VipSubscription không
            Optional<VipSubscription> vipOpt = vipRepo.findById(orderId);
            if (vipOpt.isPresent()) {
                VipSubscription vip = vipOpt.get();
                if (vip.getStatus() != VipSubscription.Status.PENDING_APPROVAL) {
                    if ("00".equals(vnp_ResponseCode)) {
                        vip.setPaymentStatus("PAID");
                        vip.setStatus(VipSubscription.Status.PENDING_APPROVAL); 
                    } else {
                        vip.setPaymentStatus("FAILED");
                    }
                    vip.setUpdatedAt(java.time.Instant.now());
                    vipRepo.save(vip);
                }
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            }

            // TH2: Check xem có phải Transaction (phiên đỗ xe) không
            Optional<Transaction> txnOpt = transactionRepo.findById(orderId);
            if (txnOpt.isPresent()) {
                Transaction txn = txnOpt.get();
                if (txn.getPaymentStatus() != Transaction.PaymentStatus.SUCCESS) {
                    if ("00".equals(vnp_ResponseCode)) {
                        txn.setPaymentMethod(Transaction.PaymentMethod.VNPAY_SANDBOX);
                        transactionRepo.save(txn);
                        parkingService.confirmCheckout(txn.getId());
                    }
                }
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            }

            return ResponseEntity.ok("{\"RspCode\":\"01\",\"Message\":\"Order Not Found\"}");

        } catch (Exception e) {
            return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown Error\"}");
        }
    }

    private String hmacSHA512(final String key, final String data) {
        try {
            final javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }
}