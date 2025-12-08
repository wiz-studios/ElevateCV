# Paystack Migration Checklist

## ✅ Completed Steps

- [x] Install `paystack-node` package
- [x] Remove Stripe packages (`@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe`)
- [x] Update `.env.example` with Paystack configuration
- [x] Create `lib/paystack-server.ts` (server-side utilities)
- [x] Create `app/actions/paystack.ts` (server actions)
- [x] Verify API routes exist:
  - [x] `/api/paystack/initialize` - Payment initialization
  - [x] `/api/paystack/verify` - Payment verification
  - [x] `/api/paystack/webhook` - Webhook handler
- [x] Database migration file ready (`004_migrate_to_paystack.sql`)

## 🔄 Next Steps (To Do)

### 1. Environment Setup
- [ ] Create `.env.local` file (if not exists)
- [ ] Add Paystack API keys from dashboard
- [ ] Add webhook secret
- [ ] Add plan codes after creating them

### 2. Paystack Dashboard Setup
- [ ] Sign up/login to Paystack
- [ ] Get Test API keys (Settings → API Keys)
- [ ] Create subscription plans:
  - [ ] Premium Monthly (₦5,000/month)
  - [ ] Premium Yearly (₦40,000/year)
  - [ ] Enterprise Monthly (₦25,000/month)
- [ ] Copy plan codes to `.env.local`
- [ ] Set up webhook URL (Settings → Webhooks)

### 3. Database Migration
- [ ] Run migration in Supabase SQL Editor
- [ ] Verify new columns exist in `profiles` table
- [ ] Verify old Stripe columns are removed

### 4. Frontend Updates
- [ ] Find and update billing/pricing components
- [ ] Replace Stripe checkout flow with Paystack redirect
- [ ] Update button handlers to use `/api/paystack/initialize`
- [ ] Test checkout flow end-to-end

### 5. Testing
- [ ] Test subscription purchase (monthly)
- [ ] Test subscription purchase (yearly)
- [ ] Test credit purchase
- [ ] Test webhook events
- [ ] Verify database updates after payment
- [ ] Test payment failure scenarios

### 6. Cleanup
- [ ] Remove old Stripe-related code/components
- [ ] Remove `app/actions/stripe.ts` (if not needed)
- [ ] Update documentation/README
- [ ] Remove Stripe environment variables

### 7. Production Deployment
- [ ] Switch to Live API keys
- [ ] Update production webhook URL
- [ ] Test with small real payment
- [ ] Monitor webhook deliveries
- [ ] Set up error monitoring

## 📝 Important Notes

### Test Cards
Use these for testing:
- **Success**: `4084084084084081`
- **Decline**: `4084080000000408`
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: `0000`

### Webhook Testing
For local development:
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3000`
3. Use ngrok URL in Paystack webhook settings
4. Format: `https://your-ngrok-url.ngrok.io/api/paystack/webhook`

### Database Schema Changes
The migration will:
- **Remove**: `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`, `stripe_status`, `subscription_current_period_end`
- **Add**: `paystack_customer_code`, `paystack_subscription_code`, `premium_until`, `last_payment_reference`, `payment_method`

## 🔗 Resources

- [Paystack Dashboard](https://dashboard.paystack.com)
- [Paystack Documentation](https://paystack.com/docs)
- [API Reference](https://paystack.com/docs/api)
- [Test Payments Guide](https://paystack.com/docs/payments/test-payments)
- [Webhook Events](https://paystack.com/docs/payments/webhooks)

## 🆘 Need Help?

If you encounter issues:
1. Check the detailed guide: `PAYSTACK_INSTALLATION_COMPLETE.md`
2. Review Paystack Dashboard → Webhooks for failed events
3. Check server logs for errors
4. Verify all environment variables are set correctly
