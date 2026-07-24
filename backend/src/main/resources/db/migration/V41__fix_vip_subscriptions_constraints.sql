-- Fix check constraints on vip_subscriptions for payment_method and subscription_type
ALTER TABLE vip_subscriptions DROP CONSTRAINT IF EXISTS vip_subscriptions_payment_method_check;
ALTER TABLE vip_subscriptions DROP CONSTRAINT IF EXISTS vip_subscriptions_subscription_type_check;

ALTER TABLE vip_subscriptions ALTER COLUMN subscription_type TYPE VARCHAR(20);

ALTER TABLE vip_subscriptions ADD CONSTRAINT vip_subscriptions_payment_method_check 
    CHECK (payment_method IN ('VNPAY', 'VNPAY_SANDBOX', 'MOMO', 'MOMO_SANDBOX', 'WALLET', 'BANK_TRANSFER'));

ALTER TABLE vip_subscriptions ADD CONSTRAINT vip_subscriptions_subscription_type_check 
    CHECK (subscription_type IN ('DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'));
