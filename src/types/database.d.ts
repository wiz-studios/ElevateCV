/**
 * Database Types for Supabase
 * Auto-generated types can be created with: npx supabase gen types typescript --local
 * For now, manually defining based on our schema
 */

import type { PlanType, SubscriptionStatus } from "./billing"

// Database schema types
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: ProfileInsert
                Update: ProfileUpdate
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            usage_logs: {
                Row: UsageLog
                Insert: UsageLogInsert
                Update: UsageLogUpdate
                Relationships: [
                    {
                        foreignKeyName: "usage_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Profile table types
export type Profile = {
    id: string
    email: string
    name: string | null
    plan: PlanType
    credits: number
    subscription_status: SubscriptionStatus | null
    subscription_expiry: string | null
    stripe_customer_id: string | null
    created_at: string
    updated_at: string
}

export type ProfileInsert = {
    id: string
    email: string
    name?: string | null
    plan?: PlanType
    credits?: number
    subscription_status?: SubscriptionStatus | null
    subscription_expiry?: string | null
    stripe_customer_id?: string | null
}

export type ProfileUpdate = {
    email?: string
    name?: string | null
    plan?: PlanType
    credits?: number
    subscription_status?: SubscriptionStatus | null
    subscription_expiry?: string | null
    stripe_customer_id?: string | null
    updated_at?: string
}

// Usage log table types
export type UsageLog = {
    id: string
    user_id: string
    date: string
    action: "tailor" | "ats_score" | "pdf_export"
    credits_used: number
    created_at: string
}

export type UsageLogInsert = {
    id?: string
    user_id: string
    date?: string
    action: "tailor" | "ats_score" | "pdf_export"
    credits_used?: number
    created_at?: string
}

export type UsageLogUpdate = {
    action?: "tailor" | "ats_score" | "pdf_export"
    credits_used?: number
}

// Helper type for Supabase user from auth
export type SupabaseUser = {
    id: string
    email: string
    email_confirmed_at: string | null
    created_at: string
    updated_at: string
}

