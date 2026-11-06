import type { Metadata } from "next";
import { requireUser, getPrivate } from "@/lib/session";
import { PageHeader } from "@/components/ui/kit";
import { WalletView } from "@/components/wallet/WalletView";
import type { WalletSummary, WalletTx } from "@/lib/types";

export const metadata: Metadata = { title: "Wallet" };

export default async function HostWallet({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "all" } = await searchParams;
  const { supabase, profile } = await requireUser("host");
  const [{ data: s }, { data: tx }, priv] = await Promise.all([
    supabase.rpc("wallet_summary"),
    supabase.from("wallet_tx").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(200),
    getPrivate(profile.id),
  ]);
  return (
    <>
      <PageHeader title="Wallet" sub="Fund escrow, track staff pay and service fees." />
      <WalletView role="host" summary={(s as WalletSummary[])[0]} txs={(tx as WalletTx[]) ?? []} priv={priv} filter={f} basePath="/host/wallet" />
    </>
  );
}
