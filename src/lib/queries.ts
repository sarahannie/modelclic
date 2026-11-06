import type { SupabaseClient } from "@supabase/supabase-js";
import type { MCEvent, Profile } from "./types";

/** Load profiles for a set of ids into a map. */
export async function profilesById(supabase: SupabaseClient, ids: (string | null | undefined)[]) {
  const uniq = [...new Set(ids.filter(Boolean) as string[])];
  if (!uniq.length) return new Map<string, Profile>();
  const { data } = await supabase.from("profiles").select("*").in("id", uniq);
  return new Map(((data as Profile[]) ?? []).map((p) => [p.id, p]));
}

export async function eventsById(supabase: SupabaseClient, ids: (string | null | undefined)[]) {
  const uniq = [...new Set(ids.filter(Boolean) as string[])];
  if (!uniq.length) return new Map<string, MCEvent>();
  const { data } = await supabase.from("events").select("*").in("id", uniq);
  return new Map(((data as MCEvent[]) ?? []).map((e) => [e.id, e]));
}

export async function fillById(supabase: SupabaseClient, ids: string[]) {
  if (!ids.length) return new Map<string, { booked: number; bids: number }>();
  const { data } = await supabase.rpc("event_fill", { p_ids: ids });
  return new Map(((data as { event_id: string; booked: number; bids: number }[]) ?? []).map((r) => [r.event_id, r]));
}

export const hostName = (p?: Profile | null) => (p ? p.company_name || p.full_name : "Verified host");

/** Rough match score between a talent and a job. */
export function matchScore(me: Profile, e: MCEvent) {
  let s = 55;
  if (me.job_prefs.includes(e.type)) s += 25;
  if (me.state && e.state === me.state) s += 15;
  if (me.gender && e.gender_req && e.gender_req !== "No preference" && e.gender_req !== me.gender) s -= 30;
  return Math.max(10, Math.min(98, s));
}
