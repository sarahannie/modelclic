import Link from "next/link";
import type { Metadata } from "next";
import { CalendarPlus, ChevronRight, ShieldCheck, Star, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Empty, EventBadge, PageHeader, Stat, Tabs } from "@/components/ui/kit";
import { HBars } from "@/components/ui/charts";
import { fillById } from "@/lib/queries";
import { dayLabel, naira, timeRange } from "@/lib/format";
import type { MCEvent } from "@/lib/types";

export const metadata: Metadata = { title: "Events" };

const TABS = [
  { key: "active", label: "Active", statuses: ["active", "filled"] },
  { key: "pending", label: "Pending review", statuses: ["pending", "rejected"] },
  { key: "draft", label: "Drafts", statuses: ["draft"] },
  { key: "completed", label: "Completed", statuses: ["completed", "cancelled"] },
] as const;

export default async function HostEvents({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const { supabase, profile } = await requireUser("host");
  const { data } = await supabase.from("events").select("*").eq("host_id", profile.id).order("starts_at", { ascending: true });
  const events = (data as MCEvent[]) ?? [];
  const fill = await fillById(supabase, events.map((e) => e.id));

  const live = events.filter((e) => e.status === "active" || e.status === "filled");
  const booked = events.reduce((a, e) => a + (fill.get(e.id)?.booked ?? 0), 0);
  const liveNeeded = live.reduce((a, e) => a + e.staff_needed, 0);
  const liveBooked = live.reduce((a, e) => a + (fill.get(e.id)?.booked ?? 0), 0);
  const open = Math.max(0, liveNeeded - liveBooked);
  const fillRate = liveNeeded ? Math.round((liveBooked / liveNeeded) * 100) : null;

  const current = TABS.find((t) => t.key === tab) ?? (live.length ? TABS[0] : events.some((e) => e.status === "pending") ? TABS[1] : events.some((e) => e.status === "draft") ? TABS[2] : TABS[0]);
  const list = events.filter((e) => (current.statuses as readonly string[]).includes(e.status));
  const bidsPerEvent = events
    .filter((e) => e.status !== "draft")
    .slice(-8)
    .map((e) => ({ label: e.name.length > 22 ? e.name.slice(0, 21) + "…" : e.name, value: fill.get(e.id)?.bids ?? 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHeader
        title="Events"
        sub={
          <>Post, staff and run your events.{profile.rating_avg != null && <> <span className="inline-flex items-center gap-1 font-bold text-ink"><Star className="size-3.5 fill-vermilion text-vermilion" /> {Number(profile.rating_avg).toFixed(1)}</span> host rating</>}</>
        }
        actions={<Link href="/host/events/new" className="btn btn-primary"><CalendarPlus className="size-4" /> Post an event</Link>}
      />

      {profile.host_kyc !== "verified" && (
        <Link href="/host/verify" className="mb-6 flex items-center gap-4 rounded-2xl bg-ink p-4 text-white transition hover:bg-ink-800 md:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10"><ShieldCheck className="size-5 text-vermilion" /></span>
          <span className="flex-1">
            <span className="block font-bold">{profile.host_kyc === "pending" ? "Business check in progress" : "Verify your business"}</span>
            <span className="block text-sm text-white/65">{profile.host_kyc === "pending" ? "We’ll notify you as soon as it’s done." : "Verified hosts get more bids and faster event approval."}</span>
          </span>
          <ChevronRight className="size-5" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Live events" value={live.length} sub={`${events.length} posted in total`} />
        <Stat label="Staff booked" value={booked} sub="across all events" />
        <Stat label="Open positions" value={open} sub="still to fill" />
        <Stat label="Fill rate" value={fillRate == null ? "—" : `${fillRate}%`} sub="booked ÷ needed (live)" />
      </div>

      <section className="card card-pad mt-6">
        <h2 className="t-h3">Bids per event</h2>
        <p className="t-small">How much interest each of your recent events got.</p>
        <div className="mt-5">
          {bidsPerEvent.length ? <HBars data={bidsPerEvent} /> : <p className="panel-dashed p-8 text-center text-sm text-ink-500">Post your first event and you’ll see how many bids it gets here.</p>}
        </div>
      </section>

      <div className="mt-8">
        <Tabs current={current.key} items={TABS.map((t) => ({ key: t.key, label: t.label, href: `/host?tab=${t.key}`, count: events.filter((e) => (t.statuses as readonly string[]).includes(e.status)).length }))} />
      </div>

      <div className="mt-5 space-y-4">
        {list.length === 0 ? (
          <Empty title="No events here yet" body="Create an event in about two minutes. We review it within 4 hours." action={<Link href="/host/events/new" className="btn btn-primary">Create one</Link>} icon={<CalendarPlus className="size-5" />} />
        ) : (
          list.map((e) => {
            const f = fill.get(e.id);
            const pct = Math.round(((f?.booked ?? 0) / e.staff_needed) * 100);
            return (
              <Link key={e.id} href={`/host/events/${e.id}`} className="card group flex flex-wrap items-center gap-5 p-5 transition hover:shadow-(--shadow-lift)">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ice text-center leading-none text-ink">
                  <span className="text-[11px] font-bold text-ink-500 uppercase">{new Date(e.starts_at).toLocaleString("en-NG", { month: "short", timeZone: "Africa/Lagos" })}</span>
                  <span className="num text-xl font-extrabold">{new Date(e.starts_at).toLocaleString("en-NG", { day: "numeric", timeZone: "Africa/Lagos" })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><EventBadge status={e.status} /><span className="badge badge-line">{e.type}</span></div>
                  <p className="mt-1.5 text-[17px] font-bold group-hover:underline">{e.name}</p>
                  <p className="text-[13px] text-ink-500">{dayLabel(e.starts_at)} · {timeRange(e.starts_at, e.ends_at)} · {e.city}, {e.state} · {naira(e.pay_ngn)} each</p>
                </div>
                <div className="w-full sm:w-56">
                  <div className="flex justify-between text-xs font-semibold text-ink-500"><span className="flex items-center gap-1"><Users className="size-3.5" /> {f?.booked ?? 0}/{e.staff_needed} booked</span><span>{f?.bids ?? 0} bids</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ice"><div className="h-full rounded-full bg-vermilion" style={{ width: `${pct}%` }} /></div>
                </div>
                <ChevronRight className="hidden size-5 text-ink-300 sm:block" />
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
