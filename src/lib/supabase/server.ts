import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { DEMO_COOKIE, SUPABASE_ANON_KEY, SUPABASE_URL, demoMode } from "./env";
import { createDemoClient } from "../demo/client";
import type { Role } from "../types";

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  if (demoMode) {
    const r = cookieStore.get(DEMO_COOKIE)?.value as Role | undefined;
    return createDemoClient(r && ["admin", "host", "talent"].includes(r) ? r : null) as unknown as SupabaseClient;
  }
  return createServerClient(SUPABASE_URL || "http://localhost", SUPABASE_ANON_KEY || "anon", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component — middleware refreshes the session.
        }
      },
    },
  });
}
