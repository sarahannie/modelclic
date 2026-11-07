import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Google sign-in finishes here. The browser gets an ID token from Google's own
 * button (shown as "Sign in to modelclic.com"), and we swap it for a Supabase session.
 */
export async function POST(request: NextRequest) {
  let body: { credential?: string; nonce?: string; role?: string; consent?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { credential, nonce } = body;
  if (!credential || !nonce) return NextResponse.json({ error: "Missing Google token" }, { status: 400 });

  const nextParam = body.next ?? "/app";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/app";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: "google", token: credential, nonce });
  if (error || !data.user) return NextResponse.json({ error: "Google sign-in didn't complete. Please try again." }, { status: 401 });

  // New Google users who chose "Host" start on the host side.
  if (body.role === "host") await supabase.rpc("set_initial_role", { p_role: "host" });

  if (!data.user.user_metadata?.consent_at) {
    if (body.consent === "1") {
      await supabase.auth.updateUser({ data: { consent_at: new Date().toISOString(), consent_version: "2026-11-06" } });
    } else {
      return NextResponse.json({ redirect: `/consent?next=${encodeURIComponent(next)}` });
    }
  }
  return NextResponse.json({ redirect: next });
}
