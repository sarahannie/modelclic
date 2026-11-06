"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { lagosISO } from "@/lib/format";
import type { ActionResult } from "./rpc";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const fail = (error: string): ActionResult => ({ ok: false, error });

async function host() {
  const s = await getSession();
  if (!s.user || !s.profile || s.profile.role !== "host") throw new Error("Switch to your hiring side first.");
  return { ...s, user: s.user, profile: s.profile };
}

function readEvent(fd: FormData) {
  const date = str(fd, "date"), start = str(fd, "start"), end = str(fd, "end");
  const starts_at = date && start ? lagosISO(date, start) : "";
  let ends_at = date && end ? lagosISO(date, end) : "";
  if (starts_at && ends_at && ends_at <= starts_at) ends_at = new Date(new Date(ends_at).getTime() + 864e5).toISOString(); // overnight
  return {
    name: str(fd, "name"), type: str(fd, "type"), description: str(fd, "description") || null,
    staff_needed: Number(str(fd, "staff_needed")), state: str(fd, "state"), city: str(fd, "city"), venue: str(fd, "venue") || null,
    starts_at, ends_at, pay_ngn: Math.round(Number(str(fd, "pay_ngn"))), dress_code: str(fd, "dress_code") || null,
    gender_req: str(fd, "gender_req") || null, checkin_location: str(fd, "checkin_location") || null, instructions: str(fd, "instructions") || null,
  };
}

function validate(e: ReturnType<typeof readEvent>, publishing: boolean) {
  if (e.name.length < 3) return "Give your event a name.";
  if (!publishing) return null;
  if (!e.type) return "Choose an event type.";
  if (!Number.isInteger(e.staff_needed) || e.staff_needed < 1) return "How many staff do you need?";
  if (!e.state || !e.city) return "Add the state and city/area.";
  if (!e.starts_at || !e.ends_at) return "Add the date, start and end time.";
  if (new Date(e.starts_at) < new Date()) return "The event date is in the past.";
  if (!Number.isFinite(e.pay_ngn) || e.pay_ngn < 1000) return "Pay must be at least ₦1,000 per person.";
  return null;
}

export async function saveEvent(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await host();
  const publish = str(fd, "intent") === "publish";
  const id = str(fd, "id");
  const e = readEvent(fd);
  const err = validate(e, publish);
  if (err) return fail(err);
  // drafts may be incomplete — fill safe placeholders the database requires
  const now = new Date(Date.now() + 7 * 864e5).toISOString();
  const row = {
    ...e,
    type: e.type || "Corporate Events",
    staff_needed: e.staff_needed || 1,
    state: e.state || "Lagos",
    city: e.city || "—",
    starts_at: e.starts_at || now,
    ends_at: e.ends_at || new Date(new Date(e.starts_at || now).getTime() + 4 * 36e5).toISOString(),
    pay_ngn: e.pay_ngn >= 1000 ? e.pay_ngn : 1000,
    status: publish ? "pending" : "draft",
  };
  let eventId = id;
  if (id) {
    const { data: cur } = await supabase.from("events").select("status").eq("id", id).eq("host_id", user.id).single();
    const status = (cur as { status: string } | null)?.status;
    const patch: Record<string, unknown> = { ...row };
    if (status === "rejected") patch.status = "rejected"; // the database moves it back into review
    else if (status !== "draft") delete patch.status; // live events keep their status
    const { error } = await supabase.from("events").update(patch).eq("id", id).eq("host_id", user.id);
    if (error) return fail(error.message.replace(/^.*ERROR:\s*/, ""));
  } else {
    const { data, error } = await supabase.from("events").insert({ ...row, host_id: user.id }).select("id").single();
    if (error || !data) return fail("Couldn’t save the event. Please try again.");
    eventId = (data as { id: string }).id;
  }
  revalidatePath("/host", "layout");
  redirect(`/host/events/${eventId}?saved=${publish ? "published" : "draft"}`);
}

export async function setEventStatus(eventId: string, status: "pending" | "cancelled" | "completed"): Promise<ActionResult> {
  const { supabase, user } = await host();
  const { error } = await supabase.from("events").update({ status }).eq("id", eventId).eq("host_id", user.id);
  if (error) return fail(error.message.replace(/^.*ERROR:\s*/, ""));
  revalidatePath("/host", "layout");
  return { ok: true, message: status === "pending" ? "Sent for review — usually live within 4 hours." : status === "cancelled" ? "Event cancelled." : "Marked complete." };
}

export async function deleteDraft(eventId: string): Promise<ActionResult> {
  const { supabase, user } = await host();
  await supabase.from("events").delete().eq("id", eventId).eq("host_id", user.id).eq("status", "draft");
  revalidatePath("/host", "layout");
  redirect("/host?tab=draft");
}

export async function inviteTalent(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase } = await host();
  const event = str(fd, "event"), talent = str(fd, "talent");
  if (!event) return fail("Choose one of your live events.");
  const { error } = await supabase.rpc("send_offer", { p_event: event, p_talent: talent });
  if (error) return fail(error.message.replace(/^.*ERROR:\s*/, ""));
  revalidatePath("/host", "layout");
  return { ok: true, message: "Offer sent — they’ll get a notification." };
}
