import type { Metadata } from "next";
import { requireUser, getPrivate } from "@/lib/session";
import { PageHeader } from "@/components/ui/kit";
import { WalletView } from "@/components/wallet/WalletView";
import type { WalletSummary, WalletTx } from "@/lib/types";

export const metadata: Metadata = { title: "Wallet" };

export default async function TalentWallet({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "all" } = await searchParams;
  const { supabase, profile } = await requireUser("talent");
  const [{ data: s }, { data: tx }, priv] = await Promise.all([
    supabase.rpc("wallet_summary"),
    supabase.from("wallet_tx").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(200),
    getPrivate(profile.id),
  ]);
  return (
    <>
      <PageHeader title="Wallet" sub="Earnings, payouts and bid point purchases in one place." />
      <WalletView role="talent" summary={(s as WalletSummary[])[0]} txs={(tx as WalletTx[]) ?? []} priv={priv} filter={f} basePath="/talent/wallet" />
    </>
  );
}
