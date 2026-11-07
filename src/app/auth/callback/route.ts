import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Email confirmation, password reset and Google sign-in all land here. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role");
  const nextParam = searchParams.get("next") ?? "/app";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/app";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // New Google users who chose "Host" start on the host side.
      if (role === "host") await supabase.rpc("set_initial_role", { p_role: "host" });
      const user = data.user;
      if (user && !user.user_metadata?.consent_at) {
        if (searchParams.get("consent") === "1") {
          await supabase.auth.updateUser({ data: { consent_at: new Date().toISOString(), consent_version: "2026-11-06" } });
        } else {
          // Signed up with Google without ticking consent (e.g. from the login page) → ask first.
          return NextResponse.redirect(`${origin}/consent?next=${encodeURIComponent(next)}`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
