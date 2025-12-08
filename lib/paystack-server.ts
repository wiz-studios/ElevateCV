/**
 * Paystack Server-Side Utilities
 * Handles payment processing, subscriptions, and webhooks for ElevateCV
 */

import Paystack from 'paystack-node';

// Initialize Paystack with secret key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
}

export const paystack = new Paystack(PAYSTACK_SECRET_KEY);

/**
 * Initialize a payment transaction
 */
export async function initializePayment({
    email,
    amount,
    reference,
    metadata,
    callbackUrl,
}: {
    email: string;
    amount: number; // Amount in kobo (smallest currency unit)
    reference: string;
    metadata?: Record<string, any>;
    callbackUrl?: string;
}) {
    try {
        const response = await paystack.transaction.initialize({
            email,
            amount,
            reference,
            metadata,
            callback_url: callbackUrl,
        });

        return response.body;
    } catch (error) {
        console.error('Paystack payment initialization error:', error);
        throw error;
    }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(reference: string) {
    try {
        const response = await paystack.transaction.verify({
            reference,
        });

        return response.body;
    } catch (error) {
        console.error('Paystack payment verification error:', error);
        throw error;
    }
}

/**
 * Create a subscription
 */
export async function createSubscription({
    customer,
    plan,
    authorization,
}: {
    customer: string; // Customer code or email
    plan: string; // Plan code
    authorization?: string; // Authorization code from previous transaction
}) {
    try {
        const response = await paystack.subscription.create({
            customer,
            plan,
            authorization,
        });

        return response.body;
    } catch (error) {
        console.error('Paystack subscription creation error:', error);
        throw error;
    }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(code: string, token: string) {
    try {
        const response = await paystack.subscription.disable({
            code,
            token,
        });

        return response.body;
    } catch (error) {
        console.error('Paystack subscription cancellation error:', error);
        throw error;
    }
}

/**
 * Create or fetch a customer
 */
export async function createCustomer({
    email,
    first_name,
    last_name,
    phone,
}: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
}) {
    try {
        const response = await paystack.customer.create({
            email,
            first_name,
            last_name,
            phone,
        });

        return response.body;
    } catch (error) {
        console.error('Paystack customer creation error:', error);
        throw error;
    }
}

/**
 * Fetch customer details
 */
export async function getCustomer(emailOrCode: string) {
    try {
        const response = await paystack.customer.get({
            id: emailOrCode,
        });

        return response.body;
    } catch (error) {
        console.error('Paystack customer fetch error:', error);
        throw error;
    }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
        .update(payload)
        .digest('hex');

    return hash === signature;
}
