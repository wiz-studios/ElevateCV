/**
 * Credits System Test Suite
 * Tests the complete credit flow from purchase to consumption
 */

import { describe, it, expect, beforeEach } from "@jest/globals"
import { addCredits, deductCredits, consumeQuota, checkQuota, getOrCreateUser } from "@/src/services/billing"
import { createAdminClient } from "@/lib/supabase/admin"

describe("Credits System Integration Tests", () => {
    const testUserId = "test_user_credits_" + Date.now()
    const testEmail = `test_${Date.now()}@example.com`

    beforeEach(async () => {
        // Clean up test user if exists
        const supabase = createAdminClient()
        await supabase.from("profiles").delete().eq("id", testUserId)
    })

    describe("Credit Purchase Flow", () => {
        it("should add credits to user account", async () => {
            // Create user
            const user = await getOrCreateUser(testUserId, testEmail)
            expect(user.credits).toBe(0)

            // Add 15 credits
            const updatedUser = await addCredits(testUserId, 15)
            expect(updatedUser.credits).toBe(15)
        })

        it("should accumulate credits from multiple purchases", async () => {
            await getOrCreateUser(testUserId, testEmail)

            await addCredits(testUserId, 5)
            await addCredits(testUserId, 10)
            const user = await addCredits(testUserId, 15)

            expect(user.credits).toBe(30)
        })
    })

    describe("Credit Consumption Flow", () => {
        it("should deduct credits when used", async () => {
            await getOrCreateUser(testUserId, testEmail)
            await addCredits(testUserId, 10)

            const success = await deductCredits(testUserId, 1)
            expect(success).toBe(true)

            const user = await getOrCreateUser(testUserId)
            expect(user.credits).toBe(9)
        })

        it("should fail when insufficient credits", async () => {
            await getOrCreateUser(testUserId, testEmail)
            await addCredits(testUserId, 5)

            const success = await deductCredits(testUserId, 10)
            expect(success).toBe(false)

            const user = await getOrCreateUser(testUserId)
            expect(user.credits).toBe(5) // Should remain unchanged
        })

        it("should sync credits to auth service after deduction", async () => {
            await getOrCreateUser(testUserId, testEmail)
            await addCredits(testUserId, 10)

            await deductCredits(testUserId, 3)

            // Verify sync by checking profile directly
            const supabase = createAdminClient()
            const { data } = await supabase.from("profiles").select("credits").eq("id", testUserId).single()

            expect(data?.credits).toBe(7)
        })
    })

    describe("Quota Check with Credits", () => {
        it("should allow action when user has credits (free plan, quota exceeded)", async () => {
            await getOrCreateUser(testUserId, testEmail)
            await addCredits(testUserId, 5)

            // Simulate quota exceeded by logging 3 tailors (free plan limit)
            const supabase = createAdminClient()
            for (let i = 0; i < 3; i++) {
                await supabase.from("usage_logs").insert({
                    id: `test_log_${i}_${Date.now()}`,
                    user_id: testUserId,
                    date: new Date().toISOString().split("T")[0],
                    action: "tailor",
                    credits_used: 1,
                })
            }

            const check = await checkQuota(testUserId)
            expect(check.allowed).toBe(true)
            expect(check.credits_remaining).toBe(5)
        })

        it("should block action when no quota and no credits", async () => {
            await getOrCreateUser(testUserId, testEmail)

            // Simulate quota exceeded
            const supabase = createAdminClient()
            for (let i = 0; i < 3; i++) {
                await supabase.from("usage_logs").insert({
                    id: `test_log_${i}_${Date.now()}`,
                    user_id: testUserId,
                    date: new Date().toISOString().split("T")[0],
                    action: "tailor",
                    credits_used: 1,
                })
            }

            const check = await checkQuota(testUserId)
            expect(check.allowed).toBe(false)
            expect(check.upgrade_required).toBe(true)
        })
    })

    describe("Consume Quota Flow", () => {
        it("should use monthly quota first, then credits", async () => {
            await getOrCreateUser(testUserId, testEmail)
            await addCredits(testUserId, 10)

            // First 3 uses should consume quota (free plan)
            for (let i = 0; i < 3; i++) {
                const success = await consumeQuota(testUserId)
                expect(success).toBe(true)
            }

            // Verify credits still at 10
            let user = await getOrCreateUser(testUserId)
            expect(user.credits).toBe(10)

            // 4th use should consume a credit
            const success = await consumeQuota(testUserId)
            expect(success).toBe(true)

            user = await getOrCreateUser(testUserId)
            expect(user.credits).toBe(9)
        })

        it("should log usage when consuming quota", async () => {
            await getOrCreateUser(testUserId, testEmail)
            await addCredits(testUserId, 5)

            await consumeQuota(testUserId)

            const supabase = createAdminClient()
            const { data } = await supabase
                .from("usage_logs")
                .select("*")
                .eq("user_id", testUserId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single()

            expect(data).toBeTruthy()
            expect(data?.action).toBe("tailor")
            expect(data?.credits_used).toBe(1)
        })
    })

    describe("Premium Plan with Credits", () => {
        it("should not consume credits for unlimited plans", async () => {
            const supabase = createAdminClient()

            // Create premium user
            await getOrCreateUser(testUserId, testEmail)
            await supabase.from("profiles").update({ plan: "premium" }).eq("id", testUserId)
            await addCredits(testUserId, 10)

            // Use quota multiple times
            for (let i = 0; i < 5; i++) {
                await consumeQuota(testUserId)
            }

            // Credits should remain unchanged
            const user = await getOrCreateUser(testUserId)
            expect(user.credits).toBe(10)
        })
    })

    describe("Stripe Webhook Integration", () => {
        it("should add credits when webhook receives credit purchase", async () => {
            await getOrCreateUser(testUserId, testEmail)

            // Simulate webhook adding credits
            await addCredits(testUserId, 15)

            const user = await getOrCreateUser(testUserId)
            expect(user.credits).toBe(15)
        })
    })
})

/**
 * Manual Test Scenarios
 * Run these manually to verify the full flow
 */
export const manualTests = {
    /**
     * Test 1: Purchase credits via checkout
     * 1. Navigate to /pricing
     * 2. Click "Buy Credits" on 15 credits package
     * 3. Complete checkout (Stripe test mode)
     * 4. Verify credits appear in account
     */
    testCreditPurchase: async () => {
        console.log("Navigate to /pricing and purchase credits")
    },

    /**
     * Test 2: Consume credits when quota exceeded
     * 1. Create free account
     * 2. Use 3 AI tailors (exhaust quota)
     * 3. Purchase 5 credits
     * 4. Try 4th tailor - should use credit
     * 5. Check account - should show 4 credits remaining
     */
    testCreditConsumption: async () => {
        console.log("Test credit consumption after quota exceeded")
    },

    /**
     * Test 3: Premium plan doesn't consume credits
     * 1. Upgrade to premium
     * 2. Purchase 10 credits
     * 3. Use AI tailor 20 times
     * 4. Check account - should still show 10 credits
     */
    testPremiumWithCredits: async () => {
        console.log("Test that premium plan doesn't consume credits")
    },
}
