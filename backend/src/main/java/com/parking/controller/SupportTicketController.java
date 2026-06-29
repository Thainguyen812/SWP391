package com.parking.controller;

import com.parking.model.SupportTicket;
import com.parking.repository.SupportTicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
public class SupportTicketController {

    private final SupportTicketRepository ticketRepo;

    public SupportTicketController(SupportTicketRepository ticketRepo) {
        this.ticketRepo = ticketRepo;
    }

    @GetMapping
    public List<SupportTicket> getAllTickets() {
        return ticketRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());

        if (ticket.getStatus() == null) {
            ticket.setStatus("Chờ xử lý");
        }

        // 🟢 VÁ LỖI TICKET CODE COLLISION: Sinh mã duy nhất dạng TK-YYYYMMDD-XXXX
        if (ticket.getTicketCode() == null) {
            String datePart = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now());
            String randomPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            ticket.setTicketCode("TK-" + datePart + "-" + randomPart);
        }

        SupportTicket saved = ticketRepo.save(ticket);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveTicket(@PathVariable Long id) {
        SupportTicket ticket = ticketRepo.findById(id).orElse(null);
        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        ticket.setStatus("Đã xử lý");
        ticket.setResolvedAt(LocalDateTime.now());
        ticketRepo.save(ticket);
        return ResponseEntity.ok().build();
    }
}