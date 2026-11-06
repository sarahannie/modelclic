import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { demoMode } from "./supabase/env";
import type { PrivateDetails, Profile, Role } from "./types";

export const homeFor = (role: Role) => (role === "admin" ? "/admin" : role === "host" ? "/host" : "/talent");

/** Current user + profile (cached per request). */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, demo: demoMode };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: profile as Profile | null, demo: demoMode };
});

/** Require a signed-in user, optionally with a specific active role. */
export async function requireUser(role?: Role | Role[]) {
  const s = await getSession();
  if (!s.user || !s.profile) redirect("/login");
  const allowed = role ? (Array.isArray(role) ? role : [role]) : null;
  if (allowed && !allowed.includes(s.profile.role)) redirect(homeFor(s.profile.role));
  return { supabase: s.supabase, user: s.user, profile: s.profile, demo: s.demo };
}

export const getPrivate = cache(async (id: string) => {
  const { supabase } = await getSession();
  const { data } = await supabase.from("private_details").select("*").eq("id", id).maybeSingle();
  return data as PrivateDetails | null;
});

export const getSettings = cache(async () => {
  const { supabase } = await getSession();
  const { data } = await supabase.from("app_settings").select("*").maybeSingle();
  return (data as { fee_pct: number; monthly_points: number; bid_cost: number; auto_release_hours: number; sos_sla_minutes: number } | null) ?? {
    fee_pct: 10, monthly_points: 20, bid_cost: 3, auto_release_hours: 12, sos_sla_minutes: 2,
  };
});
