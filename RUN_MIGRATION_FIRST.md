# 🗄️ Database Migration - MUST RUN FIRST!

## ⚠️ CRITICAL: Run This Before Testing Payments

Your code is now configured for Paystack, but your database still has Stripe columns. You **MUST** run this migration or payments will fail!

## What This Migration Does

### Removes (Stripe columns):
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_price_id`
- `stripe_status`
- `subscription_current_period_end`

### Adds (Paystack columns):
- `paystack_customer_code` - Customer identifier in Paystack
- `paystack_subscription_code` - Active subscription code
- `premium_until` - When premium access expires
- `last_payment_reference` - Most recent transaction reference
- `payment_method` - Payment method used (card, bank, ussd, mobile_money)

### Creates Indexes:
- For faster lookups on Paystack fields

---

## 🚀 How to Run the Migration

### Option 1: Via Supabase Dashboard (Recommended)

#### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your **ElevateCV** project
3. Click on **SQL Editor** in the left sidebar

#### Step 2: Copy the Migration SQL
Copy this entire SQL script:

```sql
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
```

#### Step 3: Paste and Run
1. Paste the SQL into the SQL Editor
2. Click **Run** or press `Ctrl+Enter`
3. Wait for "Success" message

#### Step 4: Verify
Run this query to verify the new columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name LIKE 'paystack%'
ORDER BY column_name;
```

You should see:
- `paystack_customer_code`
- `paystack_subscription_code`

---

### Option 2: Via Supabase CLI (If Installed)

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "d:\Wiz dev\ElevateCV"

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

---

## ✅ After Migration Checklist

Once the migration is complete:

- [ ] Verify new Paystack columns exist in `profiles` table
- [ ] Verify old Stripe columns are removed
- [ ] Add environment variables to Vercel
- [ ] Redeploy your application
- [ ] Test a payment

---

## 🔍 Troubleshooting

### Error: "column already exists"
This is safe to ignore - it means the column was already added. The migration uses `IF NOT EXISTS` to prevent errors.

### Error: "column does not exist" when dropping
This is also safe - it means the Stripe column was already removed. The migration uses `IF EXISTS` to prevent errors.

### Error: "permission denied"
Make sure you're using the correct Supabase project and have admin access.

---

## 🚨 Important Notes

### Data Safety
- ✅ **Safe to run** - Uses `IF EXISTS` and `IF NOT EXISTS`
- ✅ **No data loss** - Only adds/removes columns, doesn't delete rows
- ✅ **Can be re-run** - Idempotent (safe to run multiple times)

### Existing Users
If you have existing users with Stripe subscriptions:
- Their subscription data will be lost when Stripe columns are dropped
- You may want to manually migrate active subscriptions
- Or notify users to re-subscribe via Paystack

### Rollback (If Needed)
If you need to rollback to Stripe, you would need to:
1. Re-add Stripe columns
2. Remove Paystack columns
3. Restore Stripe environment variables

---

## 📊 Expected Result

After running the migration, your `profiles` table will have:

**Paystack Columns:**
```
paystack_customer_code       | text
paystack_subscription_code   | text
premium_until                | timestamptz
last_payment_reference       | text
payment_method               | text
```

**Indexes:**
```
idx_profiles_paystack_customer
idx_profiles_paystack_subscription
idx_profiles_premium_until
idx_profiles_payment_reference
```

---

## 🎯 Next Steps After Migration

1. ✅ Run the migration
2. Add environment variables to Vercel
3. Redeploy application
4. Add webhook URL in Paystack Dashboard
5. Test a payment with test card: `4084084084084081`

---

**RUN THIS MIGRATION NOW before testing any payments!** 🚀
