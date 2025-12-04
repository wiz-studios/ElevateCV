/**
 * Supabase Client for Browser/Client-Side Usage
 * Uses the anon key which is safe to expose in the browser
 */

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/src/types/database"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
