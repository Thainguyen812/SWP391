package com.parking.controller;

import com.parking.model.SupportTicket;
import com.parking.repository.SupportTicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
        if (ticket.getTicketCode() == null) {
            ticket.setTicketCode("#TK-" + (int)(Math.random() * 10000));
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