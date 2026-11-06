"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession, homeFor } from "@/lib/session";
import type { ActionResult } from "./rpc";
import type { Role } from "@/lib/types";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const fail = (error: string): ActionResult => ({ ok: false, error });

async function me() {
  const s = await getSession();
  if (!s.user || !s.profile) throw new Error("Please log in again.");
  return { ...s, user: s.user, profile: s.profile };
}

export async function markAllRead() {
  const { supabase, user } = await me();
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  revalidatePath("/", "layout");
}

export async function switchSide(): Promise<string> {
  const { supabase, profile } = await me();
  const next: Role = profile.role === "host" ? "talent" : "host";
  if (!profile.sides.includes(next)) return homeFor(profile.role);
  await supabase.from("profiles").update({ role: next }).eq("id", profile.id);
  revalidatePath("/", "layout");
  return homeFor(next);
}

export async function addSide(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, profile } = await me();
  const side = profile.role === "host" ? "talent" : "host";
  const { error } = await supabase.rpc("add_side", {
    p_side: side,
    p_company: str(fd, "company") || null,
    p_cac: str(fd, "cac") || null,
  });
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return { ok: true, message: side === "host" ? "Hiring profile added — you’re now in hiring mode." : "Talent profile added — you’re now in working mode." };
}

export async function createTicket(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await me();
  const subject = str(fd, "subject"), body = str(fd, "body");
  if (!subject || !body) return fail("Add a subject and details.");
  const { error } = await supabase.from("tickets").insert({ user_id: user.id, subject, body });
  if (error) return fail("Couldn’t send your ticket. Please try again.");
  revalidatePath("/settings/help");
  return { ok: true, message: "Ticket sent — we’ll reply within 24 hours." };
}

export async function updateAccount(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user, profile } = await me();
  const first_name = str(fd, "first_name"), last_name = str(fd, "last_name");
  if (!first_name) return fail("First name is required.");
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name, last_name,
      company_name: profile.role === "host" ? str(fd, "company_name") || null : profile.company_name,
      state: str(fd, "state") || null, city: str(fd, "city") || null,
    })
    .eq("id", user.id);
  if (error) return fail(error.message);
  await supabase.from("private_details").update({ phone: str(fd, "phone") || null, address: str(fd, "address") || null }).eq("id", user.id);
  revalidatePath("/", "layout");
  return { ok: true, message: "Account updated." };
}

export async function updateWork(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await me();
  const { error } = await supabase
    .from("profiles")
    .update({
      available_for_work: fd.get("available") === "on",
      job_prefs: fd.getAll("job_prefs").map(String),
      availability: { days: str(fd, "days"), start: str(fd, "start"), end: str(fd, "end") },
    })
    .eq("id", user.id);
  if (error) return fail(error.message);
  revalidatePath("/settings/work");
  return { ok: true, message: "Work preferences saved." };
}

export async function updateNotifyPrefs(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await me();
  const keys = ["jobs", "bids", "payments", "messages"];
  const prefs = Object.fromEntries(keys.map((k) => [k, { push: fd.get(`${k}.push`) === "on", email: fd.get(`${k}.email`) === "on", sms: fd.get(`${k}.sms`) === "on" }]));
  const { error } = await supabase.from("private_details").update({ notify_prefs: prefs }).eq("id", user.id);
  if (error) return fail(error.message);
  return { ok: true, message: "Notification settings saved." };
}

export async function updatePrivacy(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await me();
  const { error } = await supabase
    .from("private_details")
    .update({
      privacy_prefs: { show_photos: fd.get("show_photos") === "on", share_location_on_shift: fd.get("share_location") === "on" },
      ec_name: str(fd, "ec_name") || null, ec_relationship: str(fd, "ec_relationship") || null, ec_phone: str(fd, "ec_phone") || null,
    })
    .eq("id", user.id);
  if (error) return fail(error.message);
  return { ok: true, message: "Privacy & safety saved." };
}

export async function changePassword(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const pw = str(fd, "password"), confirm = str(fd, "confirm");
  if (pw.length < 8) return fail("Use at least 8 characters.");
  if (pw !== confirm) return fail("Passwords don’t match.");
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) return fail(error.message);
  return { ok: true, message: "Password changed." };
}

export async function savePayout(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await me();
  const bank = str(fd, "bank"), acct = str(fd, "account").replace(/\D/g, "");
  if (!bank) return fail("Choose your bank.");
  if (acct.length !== 10) return fail("Account number must be 10 digits.");
  const { error } = await supabase.from("private_details").update({ bank_name: bank, account_number: acct, account_verified: false }).eq("id", user.id);
  if (error) return fail(error.message);
  revalidatePath("/", "layout");
  return { ok: true, message: "Payout account saved." };
}

export async function toggleSaved(eventId: string, save: boolean): Promise<ActionResult> {
  const { supabase, user } = await me();
  if (save) await supabase.from("saved_events").upsert({ user_id: user.id, event_id: eventId });
  else await supabase.from("saved_events").delete().eq("user_id", user.id).eq("event_id", eventId);
  revalidatePath("/talent");
  return { ok: true, message: save ? "Saved for later." : "Removed from saved." };
}

export async function toggleFavorite(talentId: string, fav: boolean): Promise<ActionResult> {
  const { supabase, user } = await me();
  if (fav) await supabase.from("favorites").upsert({ host_id: user.id, talent_id: talentId });
  else await supabase.from("favorites").delete().eq("host_id", user.id).eq("talent_id", talentId);
  revalidatePath("/host", "layout");
  return { ok: true, message: fav ? "Added to favorites." : "Removed from favorites." };
}

export async function raiseDispute(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await me();
  const details = str(fd, "details");
  if (details.length < 10) return fail("Tell us a bit more (at least 10 characters).");
  const { error } = await supabase.from("disputes").insert({
    raised_by: user.id, event_id: str(fd, "event_id") || null, against_id: str(fd, "against_id") || null,
    kind: str(fd, "kind") || "other", details,
  });
  if (error) return fail("Couldn’t send that. Please try again.");
  return { ok: true, message: "Reported — our team will review within 48 hours." };
}

export async function sendMessage(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const body = str(fd, "body");
  if (!body) return fail("Write a message first.");
  const { error } = await supabase.rpc("send_message", { p_conversation: str(fd, "conversation"), p_body: body });
  if (error) return fail(error.message);
  revalidatePath("/messages", "layout");
  return { ok: true };
}
