import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Hourglass, Landmark, Plus } from "lucide-react";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TxBadge, Stat, Tabs } from "@/components/ui/kit";
import { BarChart } from "@/components/ui/charts";
import { savePayout } from "@/app/actions/account";
import { topUp, withdraw } from "@/app/actions/wallet";
import { BANKS } from "@/lib/constants";
import { dateShort, naira, nairaShort } from "@/lib/format";
import type { PrivateDetails, Role, WalletSummary, WalletTx } from "@/lib/types";

const TOPUP_ACCOUNT = process.env.NEXT_PUBLIC_TOPUP_ACCOUNT; // e.g. "Wema Bank · 0123456789 · ModelClic Ltd"

export function WalletView({
  role, summary, txs, priv, filter, basePath,
}: {
  role: Role; summary: WalletSummary; txs: WalletTx[]; priv: PrivateDetails | null; filter: string; basePath: string;
}) {
  const host = role === "host";
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const value = txs
      .filter((t) => (host ? t.type === "escrow_hold" && t.status !== "cancelled" : t.type === "earning" && t.status === "completed"))
      .filter((t) => { const c = new Date(t.created_at); return `${c.getFullYear()}-${c.getMonth()}` === key; })
      .reduce((a, t) => a + Math.abs(t.amount), 0);
    return { label: d.toLocaleString("en-NG", { month: "short" }), value };
  });
  const sixTotal = months.reduce((a, m) => a + m.value, 0);
  const best = months.reduce((a, m) => (m.value > a.value ? m : a), months[0]);
  const last30 = txs.filter((t) => t.type === "earning" && t.status === "completed" && Date.now() - new Date(t.created_at).getTime() < 30 * 864e5).reduce((a, t) => a + t.amount, 0);
  const incoming = txs.filter((t) => t.type === "earning" && t.status === "held");
  const pendingTopups = txs.filter((t) => t.type === "deposit" && t.status === "pending");

  const shown = txs.filter((t) =>
    filter === "in" ? t.amount > 0 : filter === "out" ? t.amount < 0 && t.type !== "escrow_hold" : filter === "escrow" ? t.status === "held" || t.type === "escrow_hold" : true,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-6">
        {/* Balance */}
        <section className="grain relative isolate overflow-hidden rounded-[1.5rem] bg-ink p-6 text-white md:p-8">
          <div aria-hidden className="absolute -top-24 -right-16 -z-10 size-80 rounded-full bg-vermilion/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-28 left-10 -z-10 size-72 rounded-full bg-ice-500/25 blur-3xl" />
          <p className="text-sm font-semibold text-white/60">Available balance</p>
          <p className="num mt-1 text-[44px] font-extrabold tracking-[-0.045em]">{naira(summary.available)}</p>
          <p className="text-sm text-white/60">
            {host ? `${naira(summary.escrow)} held in escrow for booked staff` : `${naira(summary.pending_in)} in escrow · released after each gig is confirmed`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {host ? (
              <>
                <a href="#fund" className="btn btn-sm bg-white text-ink hover:bg-ice"><Plus className="size-4" /> Fund wallet</a>
                <Link href="/host/events/new" className="btn btn-sm btn-glass">Post an event</Link>
              </>
            ) : (
              <>
                <a href="#withdraw" className="btn btn-sm bg-white text-ink hover:bg-ice"><ArrowUpRight className="size-4" /> Withdraw</a>
                <Link href="/talent/bids#buy" className="btn btn-sm btn-glass">Buy bid points</Link>
                <a href="#fund" className="btn btn-sm btn-glass">Top up</a>
              </>
            )}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {host ? (
            <>
              <Stat label="Total deposits" value={naira(summary.total_deposits)} />
              <Stat label="Held in escrow" value={naira(summary.escrow)} />
              <Stat label="Service fees" value={naira(summary.fees)} />
            </>
          ) : (
            <>
              <Stat label="Total earned" value={naira(summary.total_earned)} />
              <Stat label="Earned, last 30 days" value={naira(last30)} />
              <Stat label="Withdrawn" value={naira(summary.total_withdrawn)} />
            </>
          )}
        </div>

        <section className="card card-pad">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="t-h3">{host ? "Staff spend, last 6 months" : "Earnings, last 6 months"}</h2>
              <p className="num mt-1 text-3xl font-extrabold tracking-[-0.04em]">{naira(sixTotal)}</p>
              {best.value > 0 && <p className="t-small">{best.label} was your {host ? "busiest" : "best"} month ({naira(best.value)})</p>}
            </div>
            <span className="text-xs text-ink-400">Lighter bar = month in progress</span>
          </div>
          <div className="mt-5"><BarChart data={months} format={nairaShort} highlightLast /></div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
            <h2 className="t-h3">Transactions</h2>
            <Tabs current={filter} items={[
              { key: "all", label: "All", href: `${basePath}?f=all` },
              { key: "in", label: "Money in", href: `${basePath}?f=in` },
              { key: "out", label: "Money out", href: `${basePath}?f=out` },
              { key: "escrow", label: "Escrow", href: `${basePath}?f=escrow` },
            ]} />
          </div>
          {shown.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-400">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {shown.map((t) => (
                <li key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full ${t.status === "held" ? "bg-ice text-ink" : t.amount > 0 ? "bg-ink text-white" : "bg-vermilion-50 text-vermilion-700"}`}>
                    {t.status === "held" ? <Hourglass className="size-4" /> : t.amount > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t.description}</p>
                    <p className="text-xs text-ink-400">{label(t)} · {dateShort(t.created_at)}{t.reference ? ` · Ref ${t.reference}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className={`num font-extrabold ${t.amount > 0 ? "text-ink" : "text-ink-600"}`}>{t.amount > 0 ? "+" : "−"}{naira(Math.abs(t.amount))}</p>
                    <TxBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Side column */}
      <aside className="space-y-5">
        {!host && (
          <section className="card card-pad">
            <div className="flex items-center justify-between"><h2 className="t-h3">Coming your way</h2><span className="num font-extrabold">{naira(summary.pending_in)}</span></div>
            <p className="t-small mt-1">Held in escrow. Released when the host confirms, or automatically 12 hours after the event.</p>
            <ul className="mt-3 space-y-2">
              {incoming.length === 0 && <li className="text-sm text-ink-400">Nothing pending.</li>}
              {incoming.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-ice-50 p-3 text-sm">
                  <Hourglass className="size-4 text-ink-500" />
                  <span className="flex-1 truncate font-semibold">{t.description}</span>
                  <span className="num font-bold">{naira(t.amount)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!host && (
          <section id="withdraw" className="card card-pad scroll-mt-24">
            <h2 className="t-h3">Withdraw</h2>
            <ActionForm action={withdraw} className="mt-3" resetOnSuccess>
              <div className="flex gap-2">
                <input name="amount" inputMode="numeric" placeholder="Amount (₦)" aria-label="Amount" className="field" />
                <SubmitButton className="btn btn-ink shrink-0" pendingLabel="…">Withdraw</SubmitButton>
              </div>
            </ActionForm>
            <p className="hint">{priv?.account_number ? `To ${priv.bank_name} ••••${priv.account_number.slice(-4)}. Minimum ₦500.` : "Add a payout account first."}</p>
          </section>
        )}

        <section id="payout" className="card card-pad scroll-mt-24">
          <h2 className="t-h3 flex items-center gap-2"><Landmark className="size-4" /> {host ? "Refund account" : "Payout account"}</h2>
          {priv?.account_number && (
            <p className="mt-2 rounded-xl bg-ice-50 px-3 py-2 text-sm"><strong>{priv.bank_name}</strong> ••••{priv.account_number.slice(-4)} {priv.account_verified && <span className="badge badge-ice ml-1">Verified</span>}</p>
          )}
          <ActionForm action={savePayout} className="mt-3 space-y-2">
            <select name="bank" defaultValue={priv?.bank_name ?? ""} className="field" aria-label="Bank">
              <option value="" disabled>Select bank</option>
              {BANKS.map((b) => <option key={b}>{b}</option>)}
            </select>
            <input name="account" inputMode="numeric" maxLength={10} placeholder="10-digit account number" aria-label="Account number" className="field" />
            <SubmitButton className="btn btn-secondary w-full" pendingLabel="Saving…">{priv?.account_number ? "Update bank account" : "Add bank account"}</SubmitButton>
          </ActionForm>
          <p className="hint">We check the account name matches your verified ID.</p>
        </section>

        <section id="fund" className="card card-pad scroll-mt-24">
          <h2 className="t-h3">{host ? "Fund wallet" : "Top up"}</h2>
          <p className="t-small mt-1">{host ? "Offers need enough balance to cover staff pay in escrow." : "For buying bid points."}</p>
          <ActionForm action={topUp} className="mt-3" resetOnSuccess>
            <div className="flex gap-2">
              <input name="amount" inputMode="numeric" placeholder="Amount (₦)" aria-label="Amount" className="field" />
              <SubmitButton className="btn btn-primary shrink-0" pendingLabel="…">{host ? "Fund" : "Add"}</SubmitButton>
            </div>
          </ActionForm>
          <div className="mt-3 rounded-xl border border-dashed border-line p-3 text-xs text-ink-500">
            {TOPUP_ACCOUNT ? (
              <>Pay by bank transfer to <strong className="text-ink">{TOPUP_ACCOUNT}</strong> and use your reference as the narration. We confirm within an hour.</>
            ) : (
              <>Card and bank payments are being connected. Until then, our team confirms top-ups manually — contact support for transfer details.</>
            )}
          </div>
          {pendingTopups.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs">
              {pendingTopups.map((t) => <li key={t.id} className="flex justify-between"><span>Ref <strong>{t.reference}</strong></span><span className="num font-bold">{naira(t.amount)} · pending</span></li>)}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}

function label(t: WalletTx) {
  return ({ deposit: "Top-up", escrow_hold: "Escrow", escrow_release: "Escrow release", earning: "Gig pay", withdrawal: "Bank transfer", fee: "Service fee", refund: "Refund", bid_purchase: "Bid points" } as const)[t.type];
}
