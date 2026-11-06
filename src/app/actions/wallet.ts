"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./rpc";

const amount = (fd: FormData) => Math.round(Number(String(fd.get("amount") ?? "").replace(/[^\d.]/g, "")));
const clean = (m: string) => m.replace(/^.*?ERROR:\s*/i, "").trim();

export async function withdraw(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const n = amount(fd);
  if (!n) return { ok: false, error: "Enter an amount." };
  const { error } = await supabase.rpc("request_withdrawal", { p_amount: n });
  if (error) return { ok: false, error: clean(error.message) };
  revalidatePath("/", "layout");
  return { ok: true, message: "Withdrawal requested — it usually lands within 24 hours." };
}

export async function topUp(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const n = amount(fd);
  if (!n) return { ok: false, error: "Enter an amount." };
  const { error } = await supabase.rpc("request_deposit", { p_amount: n });
  if (error) return { ok: false, error: clean(error.message) };
  revalidatePath("/", "layout");
  return { ok: true, message: "Top-up requested. Use the bank details shown to complete the transfer." };
}
