"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import type { ActionResult } from "./rpc";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const done = (message: string): ActionResult => {
  revalidatePath("/admin");
  return { ok: true, message };
};

export async function addCatalogItem(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser("admin");
  const kind = s(fd, "kind") === "job_type" ? "job_type" : "skill";
  const label = s(fd, "label");
  if (label.length < 2) return { ok: false, error: "Type a name first." };
  const { error } = await supabase.from("catalog_items").insert({ kind, label, grp: s(fd, "grp") });
  if (error) return { ok: false, error: error.message.includes("duplicate") ? "That's already in the list." : "Couldn't add it." };
  return done(`Added “${label}”`);
}

export async function removeCatalogItem(id: string): Promise<ActionResult> {
  const { supabase } = await requireUser("admin");
  await supabase.from("catalog_items").delete().eq("id", id);
  return done("Removed. Existing profiles keep it.");
}

export async function saveSettings(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, profile } = await requireUser("admin");
  const n = (k: string, min: number, max: number) => Math.min(max, Math.max(min, Number(fd.get(k)) || min));
  const { error } = await supabase
    .from("app_settings")
    .update({
      fee_pct: n("fee_pct", 0, 30),
      monthly_points: n("monthly_points", 0, 200),
      bid_cost: n("bid_cost", 1, 20),
      auto_release_hours: n("auto_release_hours", 1, 168),
      sos_sla_minutes: n("sos_sla_minutes", 1, 60),
      topup_bank: s(fd, "topup_bank"),
      topup_account_name: s(fd, "topup_account_name"),
      topup_account_no: s(fd, "topup_account_no"),
      support_email: s(fd, "support_email"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) return { ok: false, error: "Couldn't save settings." };
  const title = s(fd, "staff_title");
  if (title) await supabase.from("profiles").update({ staff_title: title }).eq("id", profile.id);
  return done("Settings saved");
}

export async function setCaseStatus(table: "sos_alerts" | "disputes", id: string, status: "in_progress" | "resolved", resolution?: string): Promise<ActionResult> {
  const { supabase, profile } = await requireUser("admin");
  const patch: Record<string, unknown> = { status };
  if (table === "sos_alerts") {
    patch.handled_by = profile.id;
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
  } else if (resolution) patch.resolution = resolution;
  await supabase.from(table).update(patch).eq("id", id);
  return done(status === "resolved" ? "Marked resolved" : "Marked in progress");
}

export async function resolveDispute(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const res = s(fd, "resolution");
  if (!res) return { ok: false, error: "Write the outcome first." };
  return setCaseStatus("disputes", s(fd, "id"), "resolved", res);
}

export async function replyTicket(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser("admin");
  const reply = s(fd, "reply");
  if (!reply) return { ok: false, error: "Write a reply first." };
  const status = fd.get("close") ? "resolved" : "in_progress";
  const id = s(fd, "id");
  const { data: t } = await supabase.from("tickets").update({ reply, status, updated_at: new Date().toISOString() }).eq("id", id).select("user_id, subject").maybeSingle();
  if (t) await supabase.from("notifications").insert({ user_id: t.user_id, text: `Support replied: ${t.subject}`, link: "/settings/help" });
  return done(status === "resolved" ? "Reply sent and ticket closed" : "Reply sent");
}

export async function setMemberKyc(id: string, side: "talent" | "host", status: "verified" | "rejected" | "unverified"): Promise<ActionResult> {
  const { supabase } = await requireUser("admin");
  await supabase.from("profiles").update(side === "host" ? { host_kyc: status } : { kyc: status }).eq("id", id);
  return done("Member updated");
}
