-- Thêm biểu phí đỗ xe cho phân loại kích thước xe MINIBUS_16
INSERT INTO pricing_rules (
    vehicle_size, 
    first_hour_fee, 
    additional_hour_fee, 
    max_daily_fee, 
    lost_card_penalty, 
    ev_violation_penalty, 
    effective_from
) VALUES (
    'MINIBUS_16', 
    30000, 
    20000, 
    200000, 
    50000, 
    30000, 
    CURRENT_DATE
);
