import { createClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/env";
import type { Gig } from "./types";

/** Public list of approved, upcoming gigs. Returns [] if Supabase isn't configured yet. */
export async function getOpenGigs(limit = 30): Promise<Gig[]> {
  if (!supabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gigs")
      .select("*")
      .eq("status", "open")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(limit);
    return (data as Gig[]) ?? [];
  } catch {
    return [];
  }
}
