-- Migration: Create usage_logs table
-- Description: Track AI tailoring usage for quota management
-- Run this in your Supabase SQL Editor AFTER 001_create_profiles.sql

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  action TEXT NOT NULL CHECK (action IN ('tailor', 'ats_score', 'pdf_export')),
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert usage logs
CREATE POLICY "Service role can insert usage logs"
  ON usage_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Service role can view all usage logs (for admin purposes)
CREATE POLICY "Service role can view all usage logs"
  ON usage_logs
  FOR SELECT
  USING (true);
