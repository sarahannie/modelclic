"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { CATEGORIES, CITIES } from "@/lib/types";

/* ── Talent ─────────────────────────────────────────────────── */

export async function applyToGig(formData: FormData) {
  const { supabase, profile } = await requireProfile("talent");
  await supabase.from("applications").insert({
    gig_id: String(formData.get("gig_id")),
    talent_id: profile.id,
    message: String(formData.get("message") ?? "").slice(0, 500) || null,
  });
  revalidatePath("/dashboard/talent");
}

export async function withdrawApplication(formData: FormData) {
  const { supabase } = await requireProfile("talent");
  await supabase.from("applications").update({ status: "withdrawn" }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/talent");
}

/* ── Host ───────────────────────────────────────────────────── */

export type GigFormState = { error?: string } | undefined;

export async function createGig(_: GigFormState, formData: FormData): Promise<GigFormState> {
  const { supabase, profile } = await requireProfile("host");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category"));
  const city = String(formData.get("city"));
  const venue = String(formData.get("venue") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const pay_ngn = Number(formData.get("pay_ngn"));
  const slots = Number(formData.get("slots"));
  const description = String(formData.get("description") ?? "").trim() || null;

  if (title.length < 4) return { error: "Give the shift a clear title." };
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return { error: "Pick a role type." };
  if (!CITIES.includes(city as (typeof CITIES)[number])) return { error: "Pick a city." };
  if (!venue) return { error: "Add the venue." };
  if (!date || !time) return { error: "Add the date and start time." };
  if (!Number.isFinite(pay_ngn) || pay_ngn < 1000) return { error: "Pay must be at least ₦1,000." };
  if (!Number.isInteger(slots) || slots < 1 || slots > 200) return { error: "Number of staff must be 1–200." };

  const event_date = new Date(`${date}T${time}:00+01:00`); // Lagos time
  if (event_date.getTime() < Date.now()) return { error: "The event date is in the past." };

  const { error } = await supabase.from("gigs").insert({
    host_id: profile.id,
    title,
    category,
    city,
    venue,
    event_date: event_date.toISOString(),
    pay_ngn,
    slots,
    description,
  });
  if (error) return { error: "Couldn't save the shift. Please try again." };

  revalidatePath("/dashboard/host");
  redirect("/dashboard/host?posted=1");
}

export async function setApplicationStatus(formData: FormData) {
  const { supabase } = await requireProfile("host");
  const status = formData.get("status") === "accepted" ? "accepted" : "declined";
  await supabase.from("applications").update({ status }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/host");
}

export async function closeGig(formData: FormData) {
  const { supabase } = await requireProfile("host");
  await supabase.from("gigs").update({ status: "closed" }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/host");
}

/* ── Admin ──────────────────────────────────────────────────── */

export async function setGigStatus(formData: FormData) {
  const { supabase } = await requireProfile("admin");
  const status = String(formData.get("status"));
  if (!["open", "rejected", "closed"].includes(status)) return;
  await supabase.from("gigs").update({ status }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/admin");
  revalidatePath("/jobs");
  revalidatePath("/");
}

export async function setVerified(formData: FormData) {
  const { supabase } = await requireProfile("admin");
  await supabase
    .from("profiles")
    .update({ verified: formData.get("verified") === "true" })
    .eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/admin");
}
