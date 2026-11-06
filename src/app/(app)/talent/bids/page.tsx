import Link from "next/link";
import type { Metadata } from "next";
import { Target } from "lucide-react";
import { requireUser, getSettings } from "@/lib/session";
import { BidBadge, Empty, PageHeader, Progress } from "@/components/ui/kit";
import { Donut, CHART } from "@/components/ui/charts";
import { RpcButton } from "@/components/ui/RpcButton";
import { WithdrawBidButton } from "@/components/ui/SmallActions";
import { eventsById } from "@/lib/queries";
import { ago, dayLabel, naira } from "@/lib/format";
import { BID_BUNDLES } from "@/lib/constants";
import type { Bid } from "@/lib/types";

export const metadata: Metadata = { title: "My bids" };

export default async function MyBids() {
  const { supabase, profile } = await requireUser("talent");
  const settings = await getSettings();
  const { data } = await supabase.from("bids").select("*").eq("talent_id", profile.id).order("created_at", { ascending: false });
  const bids = ((data as Bid[]) ?? []).filter((b) => !b.invited || b.points_spent > 0);
  const events = await eventsById(supabase, bids.map((b) => b.event_id));

  const offered = bids.filter((b) => ["offered", "booked", "completed"].includes(b.status)).length;
  const waiting = bids.filter((b) => b.status === "bid").length;
  const lost = bids.filter((b) => ["not_selected", "declined"].includes(b.status)).length;
  const decided = offered + lost;
  const winRate = decided ? Math.round((offered / decided) * 100) : 0;

  return (
    <>
      <PageHeader title="My bids" sub={`Every job you’ve bid on and where it stands. Each bid costs ${settings.bid_cost} points.`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {bids.length === 0 ? (
            <Empty title="No bids yet" body="Find a job you like and bid in one tap. Hosts usually reply within a day." action={<Link href="/talent" className="btn btn-ink">Browse jobs</Link>} icon={<Target className="size-5" />} />
          ) : (
            <div className="card divide-y divide-line-soft">
              {bids.map((b) => {
                const e = events.get(b.event_id);
                return (
                  <div key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <Link href={`/talent/jobs/${b.event_id}`} className="font-bold hover:underline">{e?.name ?? "Job"}</Link>
                      <p className="text-[13px] text-ink-500">{e ? `${dayLabel(e.starts_at)} · ${e.city} · ${naira(e.pay_ngn)}` : ""} · bid {ago(b.created_at)}</p>
                    </div>
                    <BidBadge status={b.status} />
                    {b.status === "bid" && <WithdrawBidButton bidId={b.id} />}
                    {b.status === "offered" && <Link href="/talent/gigs?tab=offers" className="btn btn-xs btn-primary">Respond</Link>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <section id="buy" className="card card-pad scroll-mt-24">
            <p className="eyebrow">Bid points</p>
            <p className="mt-2"><span className="num text-4xl font-extrabold tracking-[-0.04em]">{profile.bid_points}</span> <span className="text-ink-500">points left</span></p>
            <div className="mt-3"><Progress value={profile.bid_points} max={settings.monthly_points} /></div>
            <p className="mt-3 text-xs text-ink-500">{settings.monthly_points} free points every month. Unused free points don’t roll over; bought points never expire.</p>
            <div className="mt-4 grid gap-2">
              {BID_BUNDLES.map((b) => (
                <RpcButton key={b.points} fn="buy_bid_points" args={{ p_points: b.points }} success={`${b.points} points added.`} confirm={`Buy ${b.points} points for ${naira(b.price)} from your wallet?`} className="btn btn-secondary w-full justify-between">
                  <span>{b.points} points <span className="text-ink-400">· {b.label}</span></span>
                  <span className="num font-extrabold">{naira(b.price)}</span>
                </RpcButton>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-400">Paid from your wallet balance.</p>
          </section>

          <section className="card card-pad">
            <h2 className="t-h3">Bid results</h2>
            <p className="t-small">All bids you’ve placed</p>
            <div className="mt-4 flex items-center gap-5">
              <Donut center={`${winRate}%`} sub="win rate" parts={[{ label: "Offered", value: offered, color: CHART.INK }, { label: "Waiting", value: waiting, color: CHART.ICE }, { label: "Not selected", value: lost, color: CHART.RED }]} />
              <ul className="flex-1 space-y-2 text-sm">
                {[["Offered", offered, "bg-ink"], ["Waiting", waiting, "bg-ice-400"], ["Not selected", lost, "bg-vermilion"]].map(([l, n, c]) => (
                  <li key={l as string} className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${c}`} /> {l} <strong className="num ml-auto">{n}</strong></li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-xs text-ink-400">Win rate counts bids with a decision. {bids.length} bids in total.</p>
          </section>

          <section className="rounded-2xl border border-line bg-white/60 p-5">
            <h2 className="t-h3">How bidding works</h2>
            <ol className="mt-3 space-y-2 text-sm text-ink-600">
              {[`Bid on a job (${settings.bid_cost} points).`, "The host reviews and sends an offer.", "Accept it and the gig moves to My Gigs.", "Pay is held in escrow and released after the job."].map((t, i) => (
                <li key={t} className="flex gap-3"><span className="num grid size-5 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span> {t}</li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
