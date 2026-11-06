export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
/** Demo mode: only when Supabase isn't configured and DEMO_MODE=1 (or in local development). */
export const demoMode = !supabaseConfigured && (process.env.DEMO_MODE === "1" || process.env.NODE_ENV === "development");
export const DEMO_COOKIE = "mc_demo_role";
