"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string; message?: string; data?: unknown };

/** Database actions the app may call. Each one checks permissions inside Postgres. */
const ALLOWED = new Set([
  "place_bid", "send_offer", "decline_bid", "respond_offer", "cancel_booking", "check_in", "mark_attendance",
  "confirm_completion", "rate_user", "send_message", "raise_sos", "request_deposit", "request_withdrawal",
  "buy_bid_points", "admin_review_verification", "admin_review_event", "admin_settle_tx", "set_initial_role", "add_side",
  "support_conversation",
]);

const clean = (msg: string) =>
  msg.replace(/^.*?ERROR:\s*/i, "").replace(/\(SQLSTATE.*\)$/, "").trim() || "Something went wrong. Please try again.";

export async function runRpc(fn: string, args: Record<string, unknown>, success?: string): Promise<ActionResult> {
  if (!ALLOWED.has(fn)) return { ok: false, error: "Not allowed" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, error: clean(error.message) };
  revalidatePath("/", "layout");
  return { ok: true, message: success, data };
}
