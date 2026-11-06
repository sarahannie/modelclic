import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { VerifyPage } from "@/components/verify/VerifyPage";

export const metadata: Metadata = { title: "Verify your identity" };

export default async function TalentVerify() {
  const { supabase, profile } = await requireUser("talent");
  const { data } = await supabase.from("verifications").select("notes").eq("user_id", profile.id).eq("side", "talent").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return <VerifyPage side="talent" status={profile.kyc} note={(data as { notes: string | null } | null)?.notes} />;
}
