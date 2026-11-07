import { unstable_cache } from "next/cache";
import { createClient as createPlainClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, demoMode, supabaseConfigured } from "./supabase/env";
import { createDemoClient } from "./demo/client";
import type { MCEvent } from "./types";

/** Cookie-free client for public data that is the same for every visitor. */
function anonClient(): SupabaseClient | null {
  if (demoMode) return createDemoClient(null) as unknown as SupabaseClient;
  if (!supabaseConfigured) return null;
  return createPlainClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Next three open jobs for the landing page — cached for 60s so most visits skip the database. */
export const getUpcomingJobs = unstable_cache(
  async (): Promise<MCEvent[]> => {
    const db = anonClient();
    if (!db) return [];
    try {
      const { data } = await db.from("events").select("*").eq("status", "active").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3);
      return (data as MCEvent[]) ?? [];
    } catch {
      return [];
    }
  },
  ["landing-jobs"],
  { revalidate: 60 },
);
