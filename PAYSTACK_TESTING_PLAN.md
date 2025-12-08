# 🧪 Paystack Integration Testing Plan

## Pre-Testing Checklist

Before you start testing, ensure these are complete:

### ✅ Backend Setup
- [x] Paystack package installed (`paystack-node`)
- [x] Code updated to use USD currency
- [x] Database migration completed
- [x] Paystack plans created (3 subscription plans)
- [x] Local `.env.local` configured with all variables

### ⏳ Deployment Setup
- [ ] Environment variables added to Vercel
- [ ] Application redeployed to Vercel
- [ ] Webhook URL added in Paystack Dashboard

---

## Phase 1: Deployment Setup (15 minutes)

### Step 1.1: Add Environment Variables to Vercel

**Time**: ~5 minutes

1. Go to https://vercel.com
2. Select your **ElevateCV** project
3. Navigate to **Settings** → **Environment Variables**
4. Add these 9 variables:

```bash
PAYSTACK_SECRET_KEY=sk_test_6b50a20174e5eda3ce41b3ee54413f975f7065aa
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_e8b01de7a53220aa20fe6e39f9428b05eba81a30
PAYSTACK_WEBHOOK_SECRET=sk_test_6b50a20174e5eda3ce41b3ee54413f975f7065aa
PAYSTACK_PREMIUM_MONTHLY_PLAN_CODE=PLN_9ttypngn9kh2pzr
PAYSTACK_PREMIUM_YEARLY_PLAN_CODE=PLN_87cldct8v2cs0kk
PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE=PLN_v9alfp8o9bk4bfc
PAYSTACK_CREDITS_5_AMOUNT=499
PAYSTACK_CREDITS_15_AMOUNT=999
PAYSTACK_CREDITS_50_AMOUNT=2499
```

**Verification**: All 9 variables should be visible in Vercel settings

---

### Step 1.2: Redeploy Application

**Time**: ~5 minutes

1. Vercel should auto-redeploy after adding env vars
2. Or manually click **"Redeploy"** button
3. Wait for deployment to complete
4. Check deployment logs for any errors

**Verification**: Deployment status shows "Ready"

---

### Step 1.3: Add Webhook URL in Paystack

**Time**: ~3 minutes

1. Go to https://dashboard.paystack.com/#/settings/developers
2. Scroll to **Webhooks** section (or find Webhooks in sidebar)
3. Click **"Add Webhook"** or similar button
4. Enter webhook URL:
   ```
   https://elevate-cv-delta.vercel.app/api/paystack/webhook
   ```
5. Save the webhook

**Verification**: Webhook URL appears in your webhooks list

---

## Phase 2: Frontend Integration Check (10 minutes)

### Step 2.1: Verify Pricing Page Exists

**Time**: ~3 minutes

1. Visit: https://elevate-cv-delta.vercel.app
2. Navigate to the pricing/billing page
3. Check if pricing plans are displayed

**Expected Result**: You should see pricing cards/buttons

**If pricing page doesn't exist**: We'll need to create/update it to use Paystack

---

### Step 2.2: Check for Stripe References

**Time**: ~5 minutes

Search your codebase for any remaining Stripe code:

```bash
# In your project directory
cd "d:\Wiz dev\ElevateCV"

# Search for Stripe imports
grep -r "from '@stripe" app/ components/

# Search for Stripe API calls
grep -r "/api/stripe" app/ components/
```

**Action Required**: If you find Stripe references, we need to update them to Paystack

---

## Phase 3: Test Payment Flow (20 minutes)

### Test 1: One-Time Credit Purchase

**Time**: ~5 minutes

**Objective**: Test a simple one-time payment

1. **Navigate** to pricing page
2. **Click** on "5 Credits" ($4.99) purchase button
3. **Observe**: Should redirect to Paystack checkout
4. **Use Test Card**:
   - Card: `4084084084084081`
   - CVV: `123`
   - Expiry: `12/25`
   - PIN: `0000`
5. **Complete** payment
6. **Observe**: Should redirect back to success page

**Expected Results**:
- ✅ Redirected to Paystack payment page
- ✅ Payment completes successfully
- ✅ Redirected back to your app
- ✅ Success message displayed

**Verification**:
```sql
-- Check in Supabase SQL Editor
SELECT id, email, credits, last_payment_reference
FROM profiles
WHERE email = 'your-test-email@example.com';
```

Expected: `credits` increased by 5, `last_payment_reference` populated

---

### Test 2: Subscription Purchase (Premium Monthly)

**Time**: ~5 minutes

**Objective**: Test subscription payment and webhook

1. **Navigate** to pricing page
2. **Click** on "Premium Monthly" ($9.99/month)
3. **Use Test Card** (same as above)
4. **Complete** payment
5. **Wait** 10 seconds for webhook to process

**Expected Results**:
- ✅ Payment completes
- ✅ Redirected to success page
- ✅ Webhook processes in background

**Verification**:
```sql
-- Check subscription was created
SELECT 
  id, 
  email, 
  plan,
  paystack_subscription_code,
  premium_until,
  last_payment_reference
FROM profiles
WHERE email = 'your-test-email@example.com';
```

Expected:
- `plan` = 'premium'
- `paystack_subscription_code` = populated
- `premium_until` = ~30 days from now
- `last_payment_reference` = populated

---

### Test 3: Failed Payment

**Time**: ~3 minutes

**Objective**: Test error handling

1. **Navigate** to pricing page
2. **Click** any plan
3. **Use Decline Test Card**: `4084080000000408`
4. **Attempt** payment

**Expected Results**:
- ✅ Payment fails with error message
- ✅ User not charged
- ✅ Database not updated

---

### Test 4: Webhook Event Verification

**Time**: ~5 minutes

**Objective**: Verify webhooks are being received

1. Go to Paystack Dashboard
2. Navigate to **Webhooks** → **Event Logs**
3. Look for recent events from your tests

**Expected Results**:
- ✅ See `charge.success` events
- ✅ See `subscription.create` events (if you tested subscriptions)
- ✅ All events show **200 OK** response
- ✅ No failed deliveries

**If webhooks are failing**:
- Check response code (should be 200)
- Check error message
- Verify webhook URL is correct
- Check Vercel deployment logs

---

## Phase 4: Edge Cases & Error Handling (15 minutes)

### Test 5: Duplicate Payment Prevention

**Time**: ~3 minutes

**Objective**: Ensure same payment isn't processed twice

1. Make a payment
2. Note the `reference` from the URL or database
3. Try to manually trigger webhook with same reference

**Expected Result**: Payment should only be processed once (idempotency check)

---

### Test 6: User Without Account

**Time**: ~3 minutes

**Objective**: Test payment flow for non-authenticated users

1. **Log out** (if logged in)
2. **Try to purchase** a plan
3. **Observe** behavior

**Expected Result**: 
- Should redirect to login/signup
- OR show error message
- Should NOT allow payment without authentication

---

### Test 7: Cancel During Payment

**Time**: ~3 minutes

**Objective**: Test user canceling payment

1. **Start** a payment
2. **Close** the Paystack popup/page before completing
3. **Return** to your app

**Expected Result**:
- ✅ No charge made
- ✅ Database not updated
- ✅ User can try again

---

## Phase 5: Monitoring & Logs (10 minutes)

### Check 1: Vercel Deployment Logs

**Time**: ~3 minutes

1. Go to Vercel → Your Project → Deployments
2. Click on latest deployment
3. Check **Functions** tab for any errors
4. Look for `/api/paystack/*` routes

**Expected**: No errors in API routes

---

### Check 2: Supabase Logs

**Time**: ~3 minutes

1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Database**
3. Look for any errors related to `profiles` table

**Expected**: No constraint violations or errors

---

### Check 3: Browser Console

**Time**: ~2 minutes

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Make a test payment
4. Watch for errors

**Expected**: No JavaScript errors

---

## Phase 6: Production Readiness (Optional - 10 minutes)

### Checklist for Going Live

- [ ] All tests passed
- [ ] Webhooks working correctly
- [ ] Error handling tested
- [ ] User experience is smooth
- [ ] Database updates correctly
- [ ] Email notifications working (if implemented)
- [ ] Receipt generation working (if implemented)

### When Ready for Live Mode:

1. **Get Live Keys** from Paystack Dashboard
2. **Create Live Plans** in Paystack (same as test plans)
3. **Update Vercel Env Vars** with live keys
4. **Update Webhook URL** to use live mode
5. **Test with Small Real Payment** ($1 or minimum)
6. **Monitor First Real Transactions** closely

---

## 🐛 Troubleshooting Guide

### Issue: Payment redirects but nothing happens

**Possible Causes**:
- Webhook URL not configured
- Webhook secret incorrect
- Environment variables not set in Vercel

**Solution**:
1. Check Paystack webhook logs
2. Verify webhook URL is correct
3. Check Vercel env vars

---

### Issue: "Product not found" error

**Possible Causes**:
- Plan codes don't match
- Environment variables not loaded

**Solution**:
1. Verify plan codes in Vercel match Paystack
2. Redeploy application
3. Check `lib/paystack.ts` product IDs

---

### Issue: Database not updating after payment

**Possible Causes**:
- Webhook not firing
- Webhook signature validation failing
- Database permissions issue

**Solution**:
1. Check Paystack webhook event logs
2. Check Vercel function logs
3. Verify webhook secret matches

---

### Issue: Currency mismatch error

**Possible Causes**:
- Paystack account set to KES instead of USD
- Plans created in wrong currency

**Solution**:
1. Verify Paystack account currency
2. Recreate plans in USD
3. Or update code to use KES

---

## 📊 Test Results Template

Use this to track your testing:

```
## Test Results - [Date]

### Phase 1: Deployment
- [ ] Env vars added to Vercel
- [ ] Application redeployed
- [ ] Webhook URL configured
- [ ] No deployment errors

### Phase 2: Frontend
- [ ] Pricing page accessible
- [ ] No Stripe references found
- [ ] Payment buttons working

### Phase 3: Payment Flow
- [ ] Test 1: Credit purchase - PASS/FAIL
- [ ] Test 2: Subscription - PASS/FAIL
- [ ] Test 3: Failed payment - PASS/FAIL
- [ ] Test 4: Webhooks - PASS/FAIL

### Phase 4: Edge Cases
- [ ] Test 5: Duplicate prevention - PASS/FAIL
- [ ] Test 6: Unauthenticated user - PASS/FAIL
- [ ] Test 7: Payment cancellation - PASS/FAIL

### Phase 5: Monitoring
- [ ] Vercel logs clean
- [ ] Supabase logs clean
- [ ] Browser console clean

### Issues Found:
1. [Describe any issues]
2. [Describe any issues]

### Notes:
[Any additional observations]
```

---

## 🎯 Success Criteria

Your Paystack integration is successful when:

✅ **All payments complete** without errors  
✅ **Webhooks deliver** with 200 OK responses  
✅ **Database updates** correctly after payment  
✅ **User experience** is smooth and intuitive  
✅ **Error handling** works for failed payments  
✅ **No console errors** during payment flow  

---

## 📞 Need Help?

If you encounter issues during testing:

1. **Check Paystack Dashboard** → Webhooks → Event Logs
2. **Check Vercel Logs** → Functions tab
3. **Check Browser Console** for JavaScript errors
4. **Review this testing plan** for troubleshooting steps

---

**Ready to start testing? Begin with Phase 1!** 🚀
