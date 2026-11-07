"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE, demoMode } from "@/lib/supabase/env";
import { homeFor } from "@/lib/session";
import type { ActionResult } from "@/app/actions/rpc";
import type { Role } from "@/lib/types";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

async function origin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}

const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/app");

/* ── Demo mode ─────────────────────────────────────────────────── */

export async function enterDemo(fd: FormData) {
  if (!demoMode) redirect("/login");
  const role = (["talent", "host", "admin"].includes(s(fd, "role")) ? s(fd, "role") : "talent") as Role;
  (await cookies()).set(DEMO_COOKIE, role, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
  redirect(homeFor(role));
}

/* ── Email + password ──────────────────────────────────────────── */

export async function login(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  if (demoMode) {
    (await cookies()).set(DEMO_COOKIE, s(fd, "side") === "host" ? "host" : "talent", { path: "/", httpOnly: true, sameSite: "lax" });
    redirect(s(fd, "side") === "host" ? "/host" : "/talent");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: s(fd, "email"), password: String(fd.get("password") ?? "") });
  if (error || !data.user) return { ok: false, error: "That email and password don't match." };

  // Logged in on the other tab? Switch side if the account has it.
  const side = s(fd, "side") as Role;
  const { data: p } = await supabase.from("profiles").select("role, sides").eq("id", data.user.id).maybeSingle();
  if (p && side && side !== p.role && (p.sides as Role[]).includes(side)) {
    await supabase.from("profiles").update({ role: side }).eq("id", data.user.id);
  }
  redirect(safeNext(s(fd, "next") || "/app"));
}

export async function staffLogin(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  if (demoMode) {
    (await cookies()).set(DEMO_COOKIE, "admin", { path: "/", httpOnly: true, sameSite: "lax" });
    redirect("/admin");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: s(fd, "email"), password: String(fd.get("password") ?? "") });
  if (error || !data.user) return { ok: false, error: "Those staff details aren't right." };
  const { data: p } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (p?.role !== "admin") {
    await supabase.auth.signOut();
    return { ok: false, error: "This account isn't a staff account." };
  }
  redirect("/admin");
}

const CONSENT_ERR = "Please tick the consent box to create your account.";
const consentMeta = (fd: FormData) => ({
  consent_at: new Date().toISOString(),
  consent_version: s(fd, "consent_version") || "2026-11-06",
});

function checkPassword(fd: FormData): string | null {
  const pw = String(fd.get("password") ?? "");
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (pw !== String(fd.get("confirm") ?? "")) return "Passwords don't match.";
  return null;
}

export async function registerTalent(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  if (demoMode) redirect("/demo");
  const first_name = s(fd, "first_name"), last_name = s(fd, "last_name"), dob = s(fd, "dob");
  if (!first_name || !last_name) return { ok: false, error: "Please enter your first and last name." };
  if (!dob) return { ok: false, error: "Please add your date of birth." };
  const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 864e5);
  if (age < 18) return { ok: false, error: "You must be 18 or older to join ModelClic." };
  const pwErr = checkPassword(fd);
  if (pwErr) return { ok: false, error: pwErr };
  if (fd.get("consent") !== "1") return { ok: false, error: CONSENT_ERR };

  const supabase = await createClient();
  const email = s(fd, "email");
  const { data, error } = await supabase.auth.signUp({
    email,
    password: String(fd.get("password")),
    options: {
      data: { role: "talent", first_name, last_name, dob, gender: s(fd, "gender"), phone: s(fd, "phone"), ...consentMeta(fd) },
      emailRedirectTo: `${await origin()}/auth/callback?next=/talent/verify`,
    },
  });
  if (error) return { ok: false, error: error.message };
  if (data.session) redirect("/talent/verify");
  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

export async function registerHost(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  if (demoMode) redirect("/demo");
  const first_name = s(fd, "first_name"), last_name = s(fd, "last_name");
  if (!first_name || !last_name) return { ok: false, error: "Please enter your first and last name." };
  const nin = s(fd, "nin");
  if (nin && !/^\d{11}$/.test(nin)) return { ok: false, error: "NIN should be 11 digits." };
  const pwErr = checkPassword(fd);
  if (pwErr) return { ok: false, error: pwErr };
  if (fd.get("consent") !== "1") return { ok: false, error: CONSENT_ERR };

  const supabase = await createClient();
  const email = s(fd, "email");
  const { data, error } = await supabase.auth.signUp({
    email,
    password: String(fd.get("password")),
    options: {
      data: {
        ...consentMeta(fd),
        role: "host", first_name, last_name, phone: s(fd, "phone"), company: s(fd, "company"),
        registered_name: s(fd, "registered_name"), cac: s(fd, "cac"), nin, address: s(fd, "address"),
        state: s(fd, "state"), city: s(fd, "city"),
      },
      emailRedirectTo: `${await origin()}/auth/callback?next=/host/verify`,
    },
  });
  if (error) return { ok: false, error: error.message };
  if (data.session) redirect("/host/verify");
  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

/* ── Google ────────────────────────────────────────────────────── */

export async function googleSignIn(fd: FormData) {
  if (demoMode) redirect("/demo?google=1");
  const role = s(fd, "role") === "host" ? "host" : "talent";
  const next = safeNext(s(fd, "next") || "/app");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await origin()}/auth/callback?role=${role}&next=${encodeURIComponent(next)}${fd.get("consent") === "1" ? "&consent=1" : ""}`,
    },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

/* ── Password reset ────────────────────────────────────────────── */

export async function forgotPassword(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  if (demoMode) return { ok: true, message: "Demo mode — no email sent." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(s(fd, "email"), {
    redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
  });
  // Same answer whether or not the email exists.
  return { ok: true, message: "If that email has an account, a reset link is on its way." };
}

export async function resetPassword(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const pwErr = checkPassword(fd);
  if (pwErr) return { ok: false, error: pwErr };
  if (demoMode) return { ok: true, message: "Demo mode — nothing changed." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: String(fd.get("password")) });
  if (error) return { ok: false, error: "That reset link has expired. Request a new one." };
  redirect("/app");
}

/* ── Consent (for new Google accounts that haven't given it yet) ── */

export async function recordConsent(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  if (fd.get("consent") !== "1") return { ok: false, error: "Please tick the consent box to continue." };
  if (demoMode) redirect(safeNext(s(fd, "next") || "/app"));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: consentMeta(fd) });
  if (error) return { ok: false, error: "Couldn't save that. Please try again." };
  redirect(safeNext(s(fd, "next") || "/app"));
}

export async function declineConsent() {
  // No consent → no account. Sign out; an admin can remove the empty account on request.
  if (!demoMode) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/?consent=declined");
}
