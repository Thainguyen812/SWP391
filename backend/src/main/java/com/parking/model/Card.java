package com.parking.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @Column(length = 36)
    private String id;

    @Column(unique = true)
    private String cardNumber;

    private String cardType = "TEMP";

    @Enumerated(EnumType.STRING)
    private CardStatus status = CardStatus.AVAILABLE;

    public enum CardStatus {
        AVAILABLE,
        IN_USE,
        LOST,
        DAMAGED
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public CardStatus getStatus() {
        return status;
    }

    public void setStatus(CardStatus status) {
        this.status = status;
    }
}