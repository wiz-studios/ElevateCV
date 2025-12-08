# 📋 Paystack Plan Setup Guide

## Important: Currency Selection

⚠️ **CRITICAL**: I see your Paystack is showing **KES (Kenyan Shillings)**. However, our app is configured for **USD**. 

You have two options:

### Option A: Change Paystack to USD (Recommended)
1. Contact Paystack support to change your account currency to USD
2. Or create a new Paystack account with USD as the primary currency

### Option B: Update App to Use KES
If you prefer to use KES, we'll need to update all the pricing in the code.

---

## For USD Setup (Recommended)

If you can get USD enabled, here's how to create all the plans:

### Plan 1: Premium Monthly

**Navigate to**: Dashboard → Plans → Create Plan

Fill in the form:

```
Plan name *
Premium Monthly

Description *
Unlimited AI-tailored resumes with advanced features. Billed monthly.

Plan amount *
9.99

Currency: USD (select from dropdown)

Interval *
Monthly (select from dropdown)

Max. number of payments
Leave empty (unlimited)
```

**Click "Create Plan"** → Copy the Plan Code (e.g., `PLN_xxxxx`)

---

### Plan 2: Premium Yearly

**Click "Create Plan"** again

```
Plan name *
Premium Yearly

Description *
Unlimited AI-tailored resumes with advanced features. Billed yearly. Save 33%!

Plan amount *
79.99

Currency: USD

Interval *
Annually (or Yearly - select from dropdown)

Max. number of payments
Leave empty (unlimited)
```

**Click "Create Plan"** → Copy the Plan Code (e.g., `PLN_yyyyy`)

---

### Plan 3: Enterprise Monthly

**Click "Create Plan"** again

```
Plan name *
Enterprise Monthly

Description *
Team features with API access and custom branding. Billed monthly.

Plan amount *
49.99

Currency: USD

Interval *
Monthly

Max. number of payments
Leave empty (unlimited)
```

**Click "Create Plan"** → Copy the Plan Code (e.g., `PLN_zzzzz`)

---

## After Creating All Plans

### Update Your `.env.local`

Replace the placeholder plan codes with your actual codes:

```bash
# Replace these with your actual plan codes from Paystack
PAYSTACK_PREMIUM_MONTHLY_PLAN_CODE=PLN_xxxxx
PAYSTACK_PREMIUM_YEARLY_PLAN_CODE=PLN_yyyyy
PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE=PLN_zzzzz
```

### Update Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add/update these variables with your actual plan codes:
   - `PAYSTACK_PREMIUM_MONTHLY_PLAN_CODE` = `PLN_xxxxx`
   - `PAYSTACK_PREMIUM_YEARLY_PLAN_CODE` = `PLN_yyyyy`
   - `PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE` = `PLN_zzzzz`

4. **Redeploy** your application

---

## For KES Setup (Alternative)

If you want to use KES instead of USD, here are the equivalent amounts:

### Conversion (approximate: 1 USD = 130 KES)

**Plan 1: Premium Monthly**
```
Plan name: Premium Monthly
Description: Unlimited AI-tailored resumes with advanced features. Billed monthly.
Plan amount: 1299 KES (≈ $9.99)
Interval: Monthly
```

**Plan 2: Premium Yearly**
```
Plan name: Premium Yearly
Description: Unlimited AI-tailored resumes. Billed yearly. Save 33%!
Plan amount: 10399 KES (≈ $79.99)
Interval: Annually
```

**Plan 3: Enterprise Monthly**
```
Plan name: Enterprise Monthly
Description: Team features with API access and custom branding.
Plan amount: 6499 KES (≈ $49.99)
Interval: Monthly
```

### If Using KES - Code Changes Needed

You'll need to update the code to use KES:

1. Update `lib/paystack.ts` - change prices to KES amounts
2. Update currency in API calls from "USD" to "KES"
3. Update `.env.local` credit amounts to KES (in pesewas - smallest unit)

---

## ⚠️ Important Notes

### About One-Time Purchases (Credits)

Paystack **Plans** are for **recurring subscriptions only**. 

For one-time credit purchases ($4.99, $9.99, $24.99), you **don't create plans**. These are handled as:
- **One-time payments** through the payment initialization API
- The amounts are already configured in your `.env.local`:
  ```bash
  PAYSTACK_CREDITS_5_AMOUNT=499      # $4.99
  PAYSTACK_CREDITS_15_AMOUNT=999     # $9.99
  PAYSTACK_CREDITS_50_AMOUNT=2499    # $24.99
  ```

### Currency Mismatch Issue

If Paystack only shows KES and you need USD:
1. **Contact Paystack Support**: support@paystack.com
2. **Request USD currency** for your account
3. Or **create a new account** selecting USD as primary currency during signup

---

## ✅ Verification Checklist

After creating plans:

- [ ] Created Premium Monthly plan in Paystack
- [ ] Created Premium Yearly plan in Paystack
- [ ] Created Enterprise Monthly plan in Paystack
- [ ] Copied all plan codes
- [ ] Updated `.env.local` with actual plan codes
- [ ] Updated Vercel environment variables
- [ ] Redeployed application
- [ ] Tested a subscription purchase

---

## 🆘 Need Help?

**Currency Issue**: If you can't get USD, let me know and I'll help you update the code to use KES instead.

**Plan Codes**: After creating each plan, the plan code will be visible in the plan details. It starts with `PLN_`.

**Testing**: Use Paystack test cards to verify subscriptions work correctly before going live.
