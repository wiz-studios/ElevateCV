# Stripe Integration Setup Guide

Complete guide to setting up Stripe payments for ElevateCV.

## 📋 Prerequisites

- Stripe account (https://dashboard.stripe.com)
- Supabase project with profiles table
- Node.js and pnpm installed

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

The required Stripe packages are already in `package.json`:
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe SDK
- `@stripe/react-stripe-js` - React components for Stripe

### 2. Run Database Migration

Run the migration in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/003_add_stripe_fields.sql
```

This adds the following fields to your `profiles` table:
- `stripe_subscription_id` - Active subscription ID
- `stripe_price_id` - Current price/plan ID
- `stripe_status` - Subscription status (active, past_due, canceled, etc.)
- `subscription_current_period_end` - Billing period end date

### 3. Configure Stripe Dashboard

#### A. Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

#### B. Create Products and Prices

1. Go to https://dashboard.stripe.com/products
2. Create products for each plan:

**Premium Monthly**
- Name: Premium Monthly
- Price: $9.99/month
- Recurring: Monthly
- Copy the Price ID (starts with `price_`)

**Premium Yearly**
- Name: Premium Yearly  
- Price: $79.99/year
- Recurring: Yearly
- Copy the Price ID

**Credit Packages** (One-time payments)
- 5 Credits: $4.99
- 15 Credits: $9.99
- 50 Credits: $24.99

3. Add Price IDs to `.env.local`:

```env
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxx
STRIPE_CREDITS_5_PRICE_ID=price_xxx
STRIPE_CREDITS_15_PRICE_ID=price_xxx
STRIPE_CREDITS_50_PRICE_ID=price_xxx
```

#### C. Configure Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.updated`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Test Locally with Stripe CLI

#### Install Stripe CLI

```bash
# Windows (with Scoop)
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

#### Login and Forward Webhooks

```bash
# Login to Stripe
stripe login

# Start your dev server
pnpm dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret starting with `whsec_`. Use this for local development.

#### Trigger Test Events

```bash
# Test checkout completion
stripe trigger checkout.session.completed

# Test subscription creation
stripe trigger customer.subscription.created

# Test payment failure
stripe trigger invoice.payment_failed
```

### 5. Test Checkout Flow

1. Start dev server: `pnpm dev`
2. Go to http://localhost:3000/pricing
3. Click "Subscribe" on any plan
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. Verify in Stripe Dashboard → Customers
7. Check your database - profile should be updated

---

## 🔧 API Routes

### Created Routes

- `POST /api/stripe/create-customer` - Create Stripe customer
- `POST /api/stripe/create-checkout-session` - Start checkout
- `POST /api/stripe/create-portal-session` - Open billing portal
- `POST /api/stripe/webhook` - Handle Stripe events

### Usage Example

```typescript
// Start checkout
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: 'premium_monthly' })
})

const { url } = await response.json()
window.location.href = url
```

---

## 🎨 Components

### CheckoutButton

```tsx
import { CheckoutButton } from '@/components/billing/checkout-button'

<CheckoutButton productId="premium_monthly">
  Subscribe to Premium
</CheckoutButton>
```

### ManageBillingButton

```tsx
import { ManageBillingButton } from '@/components/billing/manage-billing-button'

<ManageBillingButton />
```

---

## 🚀 Deployment (Vercel)

### 1. Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_... (use live keys in production!)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from production webhook)
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
STRIPE_CREDITS_5_PRICE_ID=price_...
STRIPE_CREDITS_15_PRICE_ID=price_...
STRIPE_CREDITS_50_PRICE_ID=price_...
```

### 2. Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Update endpoint URL to: `https://your-app.vercel.app/api/stripe/webhook`
3. Copy the new signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel

### 3. Test Production Webhook

```bash
# Send test event to production
stripe trigger checkout.session.completed --api-key sk_live_...
```

---

## 🔐 Security Checklist

- ✅ Never expose `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to client
- ✅ Always verify webhook signatures with `STRIPE_WEBHOOK_SECRET`
- ✅ Use HTTPS in production (automatic with Vercel)
- ✅ Validate user authentication before creating checkout sessions
- ✅ Use Stripe Customer Portal for subscription management (don't build custom cancel flows)
- ✅ Log all webhook events for debugging
- ✅ Return 200 status for webhook errors to prevent retries
- ✅ Use metadata to link Stripe objects to your users

---

## 🧪 Testing

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
Insufficient funds: 4000 0000 0000 9995
```

### Test Scenarios

1. **Successful subscription**
   - Use test card 4242 4242 4242 4242
   - Complete checkout
   - Verify profile updated with subscription
   - Check webhook logs

2. **Failed payment**
   - Use test card 4000 0000 0000 0002
   - Verify error handling
   - Check profile status

3. **Subscription cancellation**
   - Subscribe with test card
   - Open billing portal
   - Cancel subscription
   - Verify profile downgraded to free

4. **Credit purchase**
   - Purchase credits
   - Verify credits added to profile
   - Check usage logs

---

## 📊 Monitoring

### Stripe Dashboard

- Monitor payments: https://dashboard.stripe.com/payments
- View customers: https://dashboard.stripe.com/customers
- Check webhooks: https://dashboard.stripe.com/webhooks
- Review logs: https://dashboard.stripe.com/logs

### Database Queries

```sql
-- Check active subscriptions
SELECT id, email, plan, stripe_status, subscription_current_period_end
FROM profiles
WHERE stripe_status = 'active';

-- Find failed payments
SELECT id, email, stripe_status
FROM profiles
WHERE stripe_status = 'past_due';
```

---

## 🐛 Troubleshooting

### Webhook not receiving events

1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
3. Check Vercel logs for errors
4. Test with Stripe CLI: `stripe listen --forward-to your-url/api/stripe/webhook`

### Customer not created

1. Check user is authenticated
2. Verify Supabase permissions
3. Check API route logs
4. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

### Subscription not updating profile

1. Check webhook is receiving events
2. Verify customer ID matches in database
3. Check webhook handler logs
4. Ensure database migration ran successfully

---

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Configure Stripe products and prices
3. ✅ Set up webhook endpoint
4. ✅ Test locally with Stripe CLI
5. ✅ Deploy to Vercel
6. ✅ Configure production webhook
7. ✅ Test with real test cards
8. 🚀 Go live with live API keys!
