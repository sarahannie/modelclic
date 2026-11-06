import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { VerifyPage } from "@/components/verify/VerifyPage";

export const metadata: Metadata = { title: "Verify your business" };

export default async function HostVerify() {
  const { supabase, profile } = await requireUser("host");
  const { data } = await supabase.from("verifications").select("notes").eq("user_id", profile.id).eq("side", "host").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return <VerifyPage side="host" status={profile.host_kyc} note={(data as { notes: string | null } | null)?.notes} />;
}
