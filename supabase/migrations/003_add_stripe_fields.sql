-- Migration: Add Stripe subscription fields to profiles
-- Description: Add fields needed for complete Stripe integration
-- Run this in your Supabase SQL Editor

-- Add Stripe subscription fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create indexes for faster Stripe lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_status ON profiles (stripe_status);

-- Add comment for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN profiles.stripe_price_id IS 'Stripe price ID of current subscription';
COMMENT ON COLUMN profiles.stripe_status IS 'Stripe subscription status: active, past_due, canceled, etc.';
COMMENT ON COLUMN profiles.subscription_current_period_end IS 'End date of current billing period';
