# Paystack Integration Complete ✅

## Installation Summary

Paystack has been successfully installed and integrated into ElevateCV! Here's what was done:

### 1. ✅ Package Installation
- **Installed**: `paystack-node` (v0.3.0)
- **Removed**: Stripe packages (`@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe`)

### 2. ✅ Environment Configuration
Updated `.env.example` with Paystack configuration:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Paystack Plan Codes
PAYSTACK_PREMIUM_MONTHLY_PLAN_CODE=PLN_premium_monthly
PAYSTACK_PREMIUM_YEARLY_PLAN_CODE=PLN_premium_yearly
PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE=PLN_enterprise_monthly
PAYSTACK_ENTERPRISE_YEARLY_PLAN_CODE=PLN_enterprise_yearly

# Credit Amounts (in cents - USD)
PAYSTACK_CREDITS_5_AMOUNT=499      # $4.99
PAYSTACK_CREDITS_15_AMOUNT=999     # $9.99
PAYSTACK_CREDITS_50_AMOUNT=2499    # $24.99
```

### 3. ✅ Core Files Created/Updated

#### New Files:
- **`lib/paystack-server.ts`** - Server-side Paystack utilities
  - Payment initialization
  - Payment verification
  - Subscription management
  - Customer management
  - Webhook signature verification

- **`app/actions/paystack.ts`** - Server actions for Paystack
  - `createPaystackCheckout()` - Initialize payments
  - `getOrCreatePaystackCustomer()` - Customer management

#### Existing Files (Already in place):
- **`lib/paystack.ts`** - Product catalog and pricing
- **`app/api/paystack/initialize/route.ts`** - Payment initialization endpoint
- **`app/api/paystack/verify/route.ts`** - Payment verification endpoint
- **`app/api/paystack/webhook/route.ts`** - Webhook handler for events

### 4. ✅ Database Migration Ready
The migration file is ready to run:
- **File**: `supabase/migrations/004_migrate_to_paystack.sql`
- **Actions**:
  - Removes Stripe-specific columns
  - Adds Paystack-specific columns
  - Creates indexes for performance
  - Adds documentation comments

## Next Steps

### Step 1: Set Up Paystack Account
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Sign up or log in
3. Navigate to **Settings → API Keys & Webhooks**
4. Copy your **Test Secret Key** and **Test Public Key**

### Step 2: Configure Environment Variables
Create a `.env.local` file (if not exists) and add:

```bash
# Copy from .env.example and fill in your actual keys
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Keep your existing Supabase and other configs
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# ... etc
```

### Step 3: Create Paystack Plans
In your Paystack Dashboard:

1. Go to **Plans** → **Create Plan**
2. **Important**: Set currency to **USD** for all plans
3. Create the following plans:

   **Premium Monthly**
   - Name: Premium Monthly
   - Amount: $9.99 (or your preferred amount)
   - Currency: **USD**
   - Interval: Monthly
   - Copy the Plan Code (e.g., `PLN_xxxxx`)

   **Premium Yearly**
   - Name: Premium Yearly
   - Amount: $79.99
   - Currency: **USD**
   - Interval: Yearly
   - Copy the Plan Code

   **Enterprise Monthly**
   - Name: Enterprise Monthly
   - Amount: $49.99
   - Currency: **USD**
   - Interval: Monthly
   - Copy the Plan Code

3. Update your `.env.local` with the actual plan codes:
   ```bash
   PAYSTACK_PREMIUM_MONTHLY_PLAN_CODE=PLN_xxxxx
   PAYSTACK_PREMIUM_YEARLY_PLAN_CODE=PLN_yyyyy
   PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE=PLN_zzzzz
   ```

### Step 4: Run Database Migration
Run the migration in your Supabase SQL Editor:

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of supabase/migrations/004_migrate_to_paystack.sql
# 3. Paste and run

# Option 2: Via CLI (if you have Supabase CLI installed)
supabase db push
```

### Step 5: Set Up Webhook
1. In Paystack Dashboard, go to **Settings → Webhooks**
2. Add a new webhook URL:
   - **URL**: `https://your-domain.com/api/paystack/webhook`
   - For local testing: Use ngrok or similar to expose localhost
3. Copy the **Webhook Secret** and add to `.env.local`:
   ```bash
   PAYSTACK_WEBHOOK_SECRET=your_actual_webhook_secret
   ```

### Step 6: Update Frontend Components
You'll need to update your billing/pricing pages to use Paystack instead of Stripe:

1. Replace Stripe checkout components with Paystack redirect flow
2. Update button handlers to call `/api/paystack/initialize`
3. Redirect users to the `authorization_url` returned
4. Handle the callback at `/billing/verify`

Example flow:
```typescript
// In your pricing component
const handleCheckout = async (productId: string) => {
  const response = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId })
  });
  
  const data = await response.json();
  
  if (data.authorization_url) {
    // Redirect to Paystack checkout
    window.location.href = data.authorization_url;
  }
};
```

### Step 7: Test the Integration
1. Start your development server: `pnpm dev`
2. Try making a test payment
3. Use Paystack test cards:
   - **Success**: `4084084084084081`
   - **Decline**: `4084080000000408`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - PIN: `0000`

### Step 8: Go Live
When ready for production:
1. Switch to **Live Keys** in Paystack Dashboard
2. Update `.env.production` with live keys
3. Update webhook URL to production domain
4. Test with real (small amount) transactions
5. Monitor webhook events in Paystack Dashboard

## Product Pricing

Current pricing configuration (in USD):

| Product | Price | Type |
|---------|-------|------|
| Premium Monthly | $9.99/month | Subscription |
| Premium Yearly | $79.99/year | Subscription |
| Enterprise Monthly | $49.99/month | Subscription |
| 5 Credits | $4.99 | One-time |
| 15 Credits | $9.99 | One-time |
| 50 Credits | $24.99 | One-time |

You can adjust these in `lib/paystack.ts`.

## Webhook Events Handled

The webhook handler processes these events:
- ✅ `charge.success` - Payment completed
- ✅ `subscription.create` - Subscription created
- ✅ `subscription.disable` - Subscription cancelled
- ⚠️ Other events are logged but not processed

## Support & Documentation

- **Paystack Docs**: https://paystack.com/docs
- **API Reference**: https://paystack.com/docs/api
- **Test Cards**: https://paystack.com/docs/payments/test-payments
- **Webhook Events**: https://paystack.com/docs/payments/webhooks

## Troubleshooting

### Payment not processing?
- Check webhook secret is correct
- Verify webhook URL is accessible
- Check Paystack Dashboard → Webhooks for failed deliveries

### Subscription not activating?
- Ensure webhook is receiving events
- Check server logs for errors
- Verify plan codes match in .env and Paystack Dashboard

### Local testing issues?
- Use ngrok to expose localhost: `ngrok http 3000`
- Update webhook URL in Paystack to ngrok URL
- Remember to update callback URLs too

---

**Installation completed successfully!** 🎉

You're now ready to accept payments via Paystack. Follow the next steps above to complete the setup.
