import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile, Role } from "./types";

/** Returns the signed-in user's profile or redirects to /login. Optionally enforces a role. */
export async function requireProfile(role?: Role) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, city, verified, created_at")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) redirect("/login?error=profile");
  if (role && profile.role !== role) redirect(`/dashboard/${profile.role}`);
  return { supabase, user, profile };
}
