# ✅ Paystack Webhook Setup Complete

## What is the Webhook Secret?

According to Paystack's official documentation, **the webhook secret is your Paystack Secret Key**.

From the docs:
> "Events sent from Paystack carry the x-paystack-signature header. The value of this header is a HMAC SHA512 signature of the event payload signed using **your secret key**."

## ✅ Your Configuration

Your `.env.local` is now correctly configured:

```bash
PAYSTACK_SECRET_KEY=sk_test_6b50a20174e5eda3ce41b3ee54413f975f7065aa
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_e8b01de7a53220aa20fe6e39f9428b05eba81a30
PAYSTACK_WEBHOOK_SECRET=sk_test_6b50a20174e5eda3ce41b3ee54413f975f7065aa

# Plan Codes
PAYSTACK_PREMIUM_MONTHLY_PLAN_CODE=PLN_9ttypngn9kh2pzr
PAYSTACK_PREMIUM_YEARLY_PLAN_CODE=PLN_87cldct8v2cs0kk
PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE=PLN_v9alfp8o9bk4bfc

# Credit Amounts
PAYSTACK_CREDITS_5_AMOUNT=499
PAYSTACK_CREDITS_15_AMOUNT=999
PAYSTACK_CREDITS_50_AMOUNT=2499
```

## 🔐 How Webhook Verification Works

Your webhook handler (`app/api/paystack/webhook/route.ts`) already implements this correctly:

1. **Paystack sends an event** to your webhook URL
2. **Includes `x-paystack-signature` header** - a HMAC SHA512 hash
3. **Your server verifies** by creating the same hash using your secret key
4. **If hashes match** - event is authentic and processed
5. **Returns 200 OK** - tells Paystack the event was received

```javascript
// This is already in your code!
const hash = crypto
  .createHmac('sha512', webhookSecret)
  .update(body)
  .digest('hex')

if (hash === signature) {
  // Process the event
}
```

## 📍 Your Webhook URL

Make sure this is added in Paystack Dashboard:

```
https://elevate-cv-delta.vercel.app/api/paystack/webhook
```

### How to Add in Paystack:

1. Go to **Settings → Developers** (or Settings → Webhooks)
2. Scroll to **Webhooks** section
3. Click **Add Webhook** or similar
4. Enter: `https://elevate-cv-delta.vercel.app/api/paystack/webhook`
5. Click **Save**

## 🎯 Next Steps

### 1. Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables and add:

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

### 2. Redeploy Your Application

After adding the environment variables, redeploy your app.

### 3. Test the Webhook

After deployment, you can test if webhooks are working:

1. Make a test payment using test card: `4084084084084081`
2. Check Paystack Dashboard → Webhooks → Event Logs
3. You should see successful webhook deliveries (200 OK responses)

## 🔍 Webhook Events Your App Handles

Your webhook handler processes these events:

| Event | What It Does |
|-------|--------------|
| `charge.success` | Updates user subscription or adds credits after successful payment |
| `subscription.create` | Saves subscription code to user profile |
| `subscription.disable` | Downgrades user to free plan when subscription is cancelled |

## ✅ Security Features Already Implemented

Your webhook handler includes:

1. ✅ **Signature Verification** - Validates events are from Paystack
2. ✅ **Idempotency** - Prevents duplicate processing of same event
3. ✅ **Error Handling** - Returns 200 OK even on errors to prevent retries
4. ✅ **Audit Logging** - Logs all payment events for tracking

## 🧪 Testing Webhooks Locally

If you want to test webhooks on your local machine:

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start your app**:
   ```bash
   pnpm dev
   ```

3. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Update webhook URL in Paystack** to:
   ```
   https://your-ngrok-url.ngrok.io/api/paystack/webhook
   ```

5. **Test payments** - webhooks will be sent to your local machine!

## 📊 Monitoring Webhooks

In Paystack Dashboard:
- Go to **Webhooks** section
- View **Event Logs** to see all webhook deliveries
- Check for failed deliveries (non-200 responses)
- Retry failed webhooks if needed

---

## 🎉 You're All Set!

Your Paystack integration is now fully configured with:
- ✅ API Keys
- ✅ Webhook Secret
- ✅ Subscription Plans
- ✅ Credit Amounts
- ✅ Webhook Handler

**Next**: Add these to Vercel and test your first payment! 🚀
