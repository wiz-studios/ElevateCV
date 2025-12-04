# Billing API Documentation

## Overview

The billing system provides quota management, subscription handling, and credit purchasing for the AI Resume Builder.

## Endpoints

### GET /api/billing/usage

Returns the current user's billing usage, plan information, and quota status.

**Query Parameters:**
- `user_id` (optional): User ID. Defaults to "demo_user" for testing.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user_id": "demo_user",
    "plan": "free",
    "plan_name": "Free",
    "credits_remaining": 0,
    "monthly_quota": 3,
    "monthly_used": 1,
    "quota_reset_date": "2025-01-01T00:00:00.000Z",
    "subscription_status": null,
    "subscription_expiry": null,
    "features": [
      "3 AI-tailored resumes per month",
      "Basic ATS scoring",
      "PDF export",
      "Standard templates"
    ]
  }
}
\`\`\`

---

### GET /api/billing/check-quota

Check if the user has available quota for tailoring.

**Query Parameters:**
- `user_id` (optional): User ID

**Response (Quota Available):**
\`\`\`json
{
  "success": true,
  "data": {
    "allowed": true,
    "credits_remaining": 2
  }
}
\`\`\`

**Response (Quota Exceeded):**
\`\`\`json
{
  "success": true,
  "data": {
    "allowed": false,
    "reason": "Monthly quota of 3 tailored resumes exceeded. Upgrade to Premium for unlimited access.",
    "upgrade_required": true,
    "credits_remaining": 0
  }
}
\`\`\`

---

### POST /api/billing/purchase

Initiate a purchase for subscription or credits.

**Request Body (Subscription):**
\`\`\`json
{
  "user_id": "user_123",
  "type": "subscription",
  "plan": "premium",
  "billing_period": "monthly"
}
\`\`\`

**Request Body (Credits):**
\`\`\`json
{
  "user_id": "user_123",
  "type": "credits",
  "credit_package_id": "credits_15"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/..."
}
\`\`\`

---

## Plan Types

| Plan | Monthly Price | Yearly Price | Monthly Tailors | Features |
|------|--------------|--------------|-----------------|----------|
| Free | $0 | $0 | 3 | Basic ATS, PDF export |
| Premium | $9.99 | $79.99 | Unlimited | All features, priority support |
| Enterprise | $49.99 | $399.99 | Unlimited | Team features, API access |

---

## Credit Packages

| Package | Credits | Price | Per Credit |
|---------|---------|-------|------------|
| 5 Credits | 5 | $4.99 | $1.00 |
| 15 Credits | 15 | $9.99 | $0.67 |
| 50 Credits | 50 | $24.99 | $0.50 |

---

## Quota Enforcement

The `/api/tailor` endpoint automatically checks quota before processing:

1. Checks user's plan and subscription status
2. Verifies monthly quota hasn't been exceeded (free plan)
3. Falls back to purchased credits if quota exceeded
4. Returns 402 Payment Required if no quota/credits available

**402 Response:**
\`\`\`json
{
  "success": false,
  "error": "Monthly quota of 3 tailored resumes exceeded. Upgrade to Premium for unlimited access."
}
\`\`\`

---

## Integration with Stripe (Production)

To enable real payments, configure these environment variables:

\`\`\`env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

See `src/services/billing.ts` for Stripe integration stubs.
