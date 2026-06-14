package com.parking.controller;

import com.parking.dto.BlacklistCardRequest;
import com.parking.model.BlacklistedCard;
import com.parking.service.BlacklistCardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blacklisted-cards")
public class BlacklistCardController {

    private final BlacklistCardService blacklistCardService;

    public BlacklistCardController(BlacklistCardService blacklistCardService) {
        this.blacklistCardService = blacklistCardService;
    }

    @PostMapping
    public BlacklistedCard create(@RequestBody BlacklistCardRequest request) {
        return blacklistCardService.create(request);
    }

    @GetMapping
    public List<BlacklistedCard> findAll() {
        return blacklistCardService.findAll();
    }

    @GetMapping("/check/{cardId}")
    public boolean check(@PathVariable UUID cardId) {
        return blacklistCardService.isCardBlacklisted(cardId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        blacklistCardService.delete(id);
    }
}