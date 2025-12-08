-- Migration: Replace Stripe fields with Paystack fields
-- Description: Remove Stripe-specific columns and add Paystack payment tracking
-- Run this in your Supabase SQL Editor

-- Drop Stripe-specific columns
ALTER TABLE profiles
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS stripe_price_id,
  DROP COLUMN IF EXISTS stripe_status,
  DROP COLUMN IF EXISTS subscription_current_period_end;

-- Add Paystack-specific columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
  ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('card', 'bank', 'ussd', 'mobile_money'));

-- Create indexes for faster Paystack lookups
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_customer ON profiles (paystack_customer_code);
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_subscription ON profiles (paystack_subscription_code);
CREATE INDEX IF NOT EXISTS idx_profiles_premium_until ON profiles (premium_until);
CREATE INDEX IF NOT EXISTS idx_profiles_payment_reference ON profiles (last_payment_reference);

-- Add comments for documentation
COMMENT ON COLUMN profiles.paystack_customer_code IS 'Paystack customer code for billing';
COMMENT ON COLUMN profiles.paystack_subscription_code IS 'Active Paystack subscription code';
COMMENT ON COLUMN profiles.premium_until IS 'Premium access expiry date';
COMMENT ON COLUMN profiles.last_payment_reference IS 'Most recent Paystack transaction reference';
COMMENT ON COLUMN profiles.payment_method IS 'Preferred payment method: card, bank, ussd, mobile_money';
