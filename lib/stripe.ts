import Stripe from "stripe"

// Initialize Stripe with secret key
// Note: STRIPE_SECRET_KEY can be empty during build time, actual initialization happens at runtime
const stripeKey = process.env.STRIPE_SECRET_KEY || ""
export const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
}) : (null as any)

// Product IDs for Stripe (configure these in your Stripe dashboard)
export const STRIPE_PRODUCTS = {
  // Subscription plans
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "price_premium_yearly",
  enterprise_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_enterprise_monthly",
  enterprise_yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_enterprise_yearly",

  // Credit packages (one-time payments)
  credits_5: process.env.STRIPE_CREDITS_5_PRICE_ID || "price_credits_5",
  credits_15: process.env.STRIPE_CREDITS_15_PRICE_ID || "price_credits_15",
  credits_50: process.env.STRIPE_CREDITS_50_PRICE_ID || "price_credits_50",
} as const

// Product metadata
export const PRODUCTS = [
  {
    id: "premium_monthly",
    name: "Premium Monthly",
    description: "Unlimited AI-tailored resumes with advanced features",
    priceInCents: 999,
    type: "subscription" as const,
    interval: "month" as const,
    plan: "premium" as const,
  },
  {
    id: "premium_yearly",
    name: "Premium Yearly",
    description: "Unlimited AI-tailored resumes - Save 33%",
    priceInCents: 7999,
    type: "subscription" as const,
    interval: "year" as const,
    plan: "premium" as const,
  },
  {
    id: "enterprise_monthly",
    name: "Enterprise Monthly",
    description: "Team features with API access and custom branding",
    priceInCents: 4999,
    type: "subscription" as const,
    interval: "month" as const,
    plan: "enterprise" as const,
  },
  {
    id: "credits_5",
    name: "5 Resume Credits",
    description: "5 AI-tailored resumes",
    priceInCents: 499,
    type: "credits" as const,
    credits: 5,
  },
  {
    id: "credits_15",
    name: "15 Resume Credits",
    description: "15 AI-tailored resumes - Best Value",
    priceInCents: 999,
    type: "credits" as const,
    credits: 15,
    popular: true,
  },
  {
    id: "credits_50",
    name: "50 Resume Credits",
    description: "50 AI-tailored resumes - Bulk discount",
    priceInCents: 2499,
    type: "credits" as const,
    credits: 50,
  },
]
