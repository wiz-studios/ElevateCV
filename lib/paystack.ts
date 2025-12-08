/**
 * Paystack Configuration
 * 
 * Product catalog and pricing for Paystack payments.
 * All prices are in USD ($).
 * 
 * @see https://paystack.com/docs
 */

// Product IDs for Paystack (configure these in your Paystack dashboard)
export const PAYSTACK_PRODUCTS = {
  // Subscription plans
  premium_monthly: process.env.PAYSTACK_PREMIUM_MONTHLY_PLAN_CODE || "PLN_premium_monthly",
  premium_yearly: process.env.PAYSTACK_PREMIUM_YEARLY_PLAN_CODE || "PLN_premium_yearly",
  enterprise_monthly: process.env.PAYSTACK_ENTERPRISE_MONTHLY_PLAN_CODE || "PLN_enterprise_monthly",
  enterprise_yearly: process.env.PAYSTACK_ENTERPRISE_YEARLY_PLAN_CODE || "PLN_enterprise_yearly",
} as const

// Product metadata and pricing
export const PRODUCTS = [
  {
    id: "premium_monthly",
    name: "Premium Monthly",
    description: "Unlimited AI-tailored resumes with advanced features",
    price: 9.99, // $9.99/month
    type: "subscription" as const,
    interval: "month" as const,
    plan: "premium" as const,
  },
  {
    id: "premium_yearly",
    name: "Premium Yearly",
    description: "Unlimited AI-tailored resumes - Save 33%",
    price: 79.99, // $79.99/year
    type: "subscription" as const,
    interval: "year" as const,
    plan: "premium" as const,
  },
  {
    id: "enterprise_monthly",
    name: "Enterprise Monthly",
    description: "Team features with API access and custom branding",
    price: 49.99, // $49.99/month
    type: "subscription" as const,
    interval: "month" as const,
    plan: "enterprise" as const,
  },
  {
    id: "credits_5",
    name: "5 Resume Credits",
    description: "5 AI-tailored resumes",
    price: 4.99, // $4.99
    type: "credits" as const,
    credits: 5,
  },
  {
    id: "credits_15",
    name: "15 Resume Credits",
    description: "15 AI-tailored resumes - Best Value",
    price: 9.99, // $9.99
    type: "credits" as const,
    credits: 15,
    popular: true,
  },
  {
    id: "credits_50",
    name: "50 Resume Credits",
    description: "50 AI-tailored resumes - Bulk discount",
    price: 24.99, // $24.99
    type: "credits" as const,
    credits: 50,
  },
]

/**
 * Convert dollars to cents (Paystack uses smallest currency unit)
 * @param amount Amount in dollars
 * @returns Amount in cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert cents to dollars
 * @param cents Amount in cents
 * @returns Amount in dollars
 */
export function fromCents(cents: number): number {
  return cents / 100
}
