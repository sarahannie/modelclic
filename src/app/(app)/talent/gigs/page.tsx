import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, MapPin, MessageCircle, Star, Ticket } from "lucide-react";
import { requireUser } from "@/lib/session";
import { BidBadge, Empty, PageHeader, Tabs } from "@/components/ui/kit";
import { RpcButton } from "@/components/ui/RpcButton";
import { SosButton } from "@/components/ui/Sos";
import { eventsById, hostName, profilesById } from "@/lib/queries";
import { dayLabel, naira, timeRange } from "@/lib/format";
import type { Bid, Conversation } from "@/lib/types";

export const metadata: Metadata = { title: "My Gigs" };

const TABS = [
  { key: "bids", label: "Bids", statuses: ["bid"] },
  { key: "offers", label: "Offers", statuses: ["offered"] },
  { key: "booked", label: "Booked", statuses: ["booked"] },
  { key: "completed", label: "Completed", statuses: ["completed", "no_show"] },
] as const;

export default async function MyGigs({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "booked" } = await searchParams;
  const { supabase, profile } = await requireUser("talent");
  const [{ data: bidData }, { data: convData }, { data: rated }] = await Promise.all([
    supabase.from("bids").select("*").eq("talent_id", profile.id).order("updated_at", { ascending: false }),
    supabase.from("conversations").select("*").eq("a_id", profile.id).eq("kind", "booking"),
    supabase.from("ratings").select("event_id").eq("rater_id", profile.id),
  ]);
  const bids = (bidData as Bid[]) ?? [];
  const events = await eventsById(supabase, bids.map((b) => b.event_id));
  const hosts = await profilesById(supabase, [...events.values()].map((e) => e.host_id));
  const convs = new Map(((convData as Conversation[]) ?? []).map((c) => [c.event_id, c.id]));
  const ratedSet = new Set(((rated as { event_id: string }[]) ?? []).map((r) => r.event_id));

  const active = TABS.find((t) => t.key === tab) ?? TABS[2];
  const list = bids.filter((b) => (active.statuses as readonly string[]).includes(b.status));
  const count = (k: (typeof TABS)[number]) => bids.filter((b) => (k.statuses as readonly string[]).includes(b.status)).length;
  const nextBooked = bids.find((b) => b.status === "booked");

  return (
    <>
      <PageHeader
        title="My Gigs"
        sub="Every gig from bid to payout. Chat with a host opens once they book you."
        actions={<Link href="/talent/bids" className="btn btn-secondary">My bids · <strong className="num text-vermilion-700">{profile.bid_points}</strong> left</Link>}
      />
      <Tabs current={active.key} items={TABS.map((t) => ({ key: t.key, label: t.label, href: `/talent/gigs?tab=${t.key}`, count: count(t) }))} />

      <div className="mt-6 max-w-4xl space-y-4">
        {list.length === 0 ? (
          <Empty
            title={active.key === "offers" ? "No offers yet" : active.key === "booked" ? "Nothing booked yet" : "Nothing here yet"}
            body="When a host picks you, the job appears here with every step to getting paid."
            action={<Link href="/talent" className="btn btn-ink">Browse jobs</Link>}
          />
        ) : (
          list.map((b) => {
            const e = events.get(b.event_id);
            if (!e) return null;
            const host = hosts.get(e.host_id);
            const conv = convs.get(e.id);
            return (
              <article key={b.id} className="card flex flex-wrap items-start gap-5 p-5">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink text-center leading-none text-white">
                  <span className="text-[11px] font-bold text-white/60 uppercase">{new Date(e.starts_at).toLocaleString("en-NG", { month: "short", timeZone: "Africa/Lagos" })}</span>
                  <span className="num text-xl font-extrabold">{new Date(e.starts_at).toLocaleString("en-NG", { day: "numeric", timeZone: "Africa/Lagos" })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <BidBadge status={b.status} />
                    {b.invited && <span className="badge badge-line">Invited by host</span>}
                    {b.checked_in_at && <span className="badge badge-ice">Checked in</span>}
                  </div>
                  <Link href={`/talent/jobs/${e.id}`} className="mt-2 block text-[17px] font-bold hover:underline">{e.name}</Link>
                  <p className="text-sm text-ink-500">{hostName(host)}</p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-600">
                    <li className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {dayLabel(e.starts_at)} · {timeRange(e.starts_at, e.ends_at)}</li>
                    <li className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {e.city}, {e.state}</li>
                  </ul>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="num text-2xl font-extrabold">{naira(e.pay_ngn)}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    {b.status === "offered" && (
                      <>
                        <RpcButton fn="respond_offer" args={{ p_bid: b.id, p_accept: false }} success="Offer declined." className="btn btn-sm btn-secondary">Decline</RpcButton>
                        <RpcButton fn="respond_offer" args={{ p_bid: b.id, p_accept: true }} success="You’re booked! 🎉 Pay is now in escrow." className="btn btn-sm btn-primary">Accept offer</RpcButton>
                      </>
                    )}
                    {b.status === "booked" && (
                      <>
                        {conv && <Link href={`/messages/${conv}`} className="btn btn-sm btn-secondary"><MessageCircle className="size-4" /> Chat</Link>}
                        <Link href={`/talent/shift-pass/${b.id}`} className="btn btn-sm btn-ink"><Ticket className="size-4" /> Shift pass</Link>
                      </>
                    )}
                    {b.status === "completed" && !ratedSet.has(e.id) && (
                      <Link href={`/talent/rate/${b.id}`} className="btn btn-sm btn-primary"><Star className="size-4" /> Rate host</Link>
                    )}
                    {b.status === "completed" && ratedSet.has(e.id) && <span className="text-xs font-semibold text-ink-400">Rated ✓ · Paid</span>}
                  </div>
                  {b.status === "booked" && (
                    <RpcButton fn="cancel_booking" args={{ p_bid: b.id }} confirm="Cancel this booking? Repeated cancellations affect your rating." success="Booking cancelled." className="text-xs font-semibold text-ink-400 hover:text-vermilion-700">
                      Can’t make it?
                    </RpcButton>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-10"><SosButton eventId={nextBooked?.event_id} /></div>
    </>
  );
}
