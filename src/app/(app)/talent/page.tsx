import Link from "next/link";
import type { Metadata } from "next";
import { Check, ChevronRight, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { requireUser, getPrivate, getSettings } from "@/lib/session";
import { EventCard } from "@/components/ui/EventCard";
import { Empty, PageHeader, Rating } from "@/components/ui/kit";
import { RpcButton } from "@/components/ui/RpcButton";
import { SaveButton } from "@/components/ui/SmallActions";
import { fillById, hostName, matchScore, profilesById } from "@/lib/queries";
import { dayLabel, naira, timeRange } from "@/lib/format";
import { NG_STATES } from "@/lib/constants";
import type { Bid, MCEvent } from "@/lib/types";

export const metadata: Metadata = { title: "Find jobs" };

type SP = { q?: string; sort?: string; view?: string; when?: string; list?: string; state?: string; min?: string; filters?: string; welcome?: string };

export default async function FindJobs({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase, profile } = await requireUser("talent");
  const [priv, settings] = await Promise.all([getPrivate(profile.id), getSettings()]);

  const [{ data: evData }, { data: bidData }, { data: savedData }] = await Promise.all([
    supabase.from("events").select("*").eq("status", "active").gte("starts_at", new Date().toISOString()).order("starts_at").limit(200),
    supabase.from("bids").select("*").eq("talent_id", profile.id),
    supabase.from("saved_events").select("event_id").eq("user_id", profile.id),
  ]);
  let events = (evData as MCEvent[]) ?? [];
  const myBids = new Map(((bidData as Bid[]) ?? []).map((b) => [b.event_id, b]));
  const saved = new Set(((savedData as { event_id: string }[]) ?? []).map((s) => s.event_id));

  // Filters
  const q = (sp.q ?? "").toLowerCase().trim();
  if (q) events = events.filter((e) => [e.name, e.type, e.city, e.state, e.venue].join(" ").toLowerCase().includes(q));
  if (sp.list === "saved") events = events.filter((e) => saved.has(e.id));
  if (sp.state) events = events.filter((e) => e.state === sp.state);
  if (sp.min) events = events.filter((e) => e.pay_ngn >= Number(sp.min));
  if (sp.when && sp.when !== "all") {
    const now = new Date();
    const end = new Date(now);
    if (sp.when === "today") end.setHours(23, 59, 59);
    if (sp.when === "tomorrow") { now.setDate(now.getDate() + 1); now.setHours(0, 0, 0); end.setDate(end.getDate() + 1); end.setHours(23, 59, 59); }
    if (sp.when === "week") end.setDate(end.getDate() + 7);
    if (sp.when === "month") end.setDate(end.getDate() + 31);
    events = events.filter((e) => new Date(e.starts_at) >= (sp.when === "tomorrow" ? now : new Date(0)) && new Date(e.starts_at) <= end);
  }
  const sort = sp.sort ?? "match";
  events = [...events].sort((a, b) =>
    sort === "pay" ? b.pay_ngn - a.pay_ngn : sort === "soon" ? a.starts_at.localeCompare(b.starts_at) : matchScore(profile, b) - matchScore(profile, a),
  );

  const [hosts, fill] = await Promise.all([profilesById(supabase, events.map((e) => e.host_id)), fillById(supabase, events.map((e) => e.id))]);

  const steps = [
    { done: true, title: "Create your account", sub: "Done", href: null },
    { done: profile.kyc === "verified", title: "Verify your identity", sub: profile.kyc === "pending" ? "Check in progress" : profile.kyc === "verified" ? "Done" : "NIN, selfie and liveness", href: "/talent/verify" },
    { done: profile.profile_done, title: "Complete your profile", sub: profile.profile_done ? "Done" : "Photos, skills and availability", href: "/talent/profile" },
    { done: Boolean(priv?.account_number), title: "Add your bank account", sub: priv?.account_number ? "Done" : "So you can withdraw your pay", href: "/talent/wallet#payout" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const canBid = profile.profile_done && (profile.kyc === "verified" || profile.kyc === "pending");
  const view = sp.view === "list" ? "list" : "grid";
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch, welcome: undefined }).filter(([, v]) => v) as [string, string][]);
    return `/talent${p.size ? `?${p}` : ""}`;
  };

  const bidAction = (e: MCEvent) => {
    const mine = myBids.get(e.id);
    if (mine && mine.status !== "withdrawn") return <Link href="/talent/bids" className="btn btn-sm btn-secondary">Bid placed ✓</Link>;
    if (!profile.profile_done) return <Link href="/talent/profile" className="btn btn-sm btn-secondary">Complete profile</Link>;
    if (!canBid) return <Link href="/talent/verify" className="btn btn-sm btn-secondary">Verify to bid</Link>;
    return (
      <RpcButton fn="place_bid" args={{ p_event: e.id }} success={`Bid placed — ${settings.bid_cost} points used.`} className="btn btn-sm btn-primary">
        Bid · {settings.bid_cost} pts
      </RpcButton>
    );
  };

  return (
    <>
      <PageHeader
        title="Find jobs"
        sub={profile.profile_done ? `Shifts that match your skills${profile.state ? ` around ${profile.state}` : ""}.` : "Complete your profile to see local matches."}
        actions={
          <Link href="/talent/bids" className="btn btn-secondary">
            <strong className="num text-vermilion-700">{profile.bid_points}</strong> bids left
          </Link>
        }
      />

      {sp.welcome && (
        <p className="mb-6 rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-white">🎉 Your profile is live. Hosts can now see you — start bidding below.</p>
      )}

      {doneCount < 4 && (
        <section className="card card-pad mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="t-h2">Get job-ready</h2>
              <p className="t-small mt-0.5">Finish these to bid on jobs and get paid.</p>
            </div>
            <span className="text-sm font-semibold text-ink-500">{doneCount} of 4 done</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ice"><div className="h-full rounded-full bg-vermilion" style={{ width: `${doneCount * 25}%` }} /></div>
          <ol className="mt-5 grid gap-3 md:grid-cols-4">
            {steps.map((s) => {
              const inner = (
                <>
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full ${s.done ? "bg-ink text-white" : "border-2 border-ink-200"}`}>{s.done && <Check className="size-4" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${s.done ? "text-ink-500" : "text-ink"}`}>{s.title}</span>
                    <span className="block truncate text-xs text-ink-400">{s.sub}</span>
                  </span>
                  {!s.done && s.href && <ChevronRight className="size-4 text-ink-400" />}
                </>
              );
              return (
                <li key={s.title}>
                  {!s.done && s.href ? (
                    <Link href={s.href} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-ice-50">{inner}</Link>
                  ) : (
                    <div className="flex items-center gap-3 p-2">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Search + sort */}
      <form action="/talent" className="flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search</span>
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input name="q" defaultValue={sp.q} placeholder="Search by event, type or location…" className="field pl-10" />
        </label>
        <select name="sort" defaultValue={sort} className="field w-auto" aria-label="Sort">
          <option value="match">Best match</option>
          <option value="pay">Highest pay</option>
          <option value="soon">Soonest</option>
        </select>
        {sp.list && <input type="hidden" name="list" value={sp.list} />}
        {sp.when && <input type="hidden" name="when" value={sp.when} />}
        {sp.view && <input type="hidden" name="view" value={sp.view} />}
        {sp.filters && (
          <>
            <select name="state" defaultValue={sp.state ?? ""} className="field w-auto" aria-label="State">
              <option value="">All states</option>
              {NG_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select name="min" defaultValue={sp.min ?? ""} className="field w-auto" aria-label="Minimum pay">
              <option value="">Any pay</option>
              {[10000, 15000, 20000, 30000, 50000].map((n) => <option key={n} value={n}>{naira(n)}+</option>)}
            </select>
            <input type="hidden" name="filters" value="1" />
          </>
        )}
        <button className="btn btn-ink">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={qs({ list: undefined })} className="chip" aria-current={!sp.list ? "page" : undefined}>All jobs</Link>
        <Link href={qs({ list: "saved" })} className="chip" aria-current={sp.list === "saved" ? "page" : undefined}>Saved <span className="num rounded-full bg-ice px-1.5 text-[11px] text-ink">{saved.size}</span></Link>
        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
        {[["all", "All dates"], ["today", "Today"], ["tomorrow", "Tomorrow"], ["week", "This week"], ["month", "This month"]].map(([k, l]) => (
          <Link key={k} href={qs({ when: k === "all" ? undefined : k })} className="chip" aria-current={(sp.when ?? "all") === k ? "page" : undefined}>{l}</Link>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-full border border-line bg-white p-0.5">
            <Link href={qs({ view: undefined })} aria-label="Grid view" aria-current={view === "grid" ? "page" : undefined} className={`grid size-8 place-items-center rounded-full ${view === "grid" ? "bg-ink text-white" : "text-ink-500"}`}><LayoutGrid className="size-4" /></Link>
            <Link href={qs({ view: "list" })} aria-label="List view" aria-current={view === "list" ? "page" : undefined} className={`grid size-8 place-items-center rounded-full ${view === "list" ? "bg-ink text-white" : "text-ink-500"}`}><List className="size-4" /></Link>
          </div>
          <Link href={qs({ filters: sp.filters ? undefined : "1", state: undefined, min: undefined })} className="chip" aria-current={sp.filters ? "page" : undefined}>
            <SlidersHorizontal className="size-3.5" /> Filters
          </Link>
        </div>
      </div>

      <h2 className="mt-8 mb-4 text-lg font-extrabold tracking-[-0.02em]">{q ? `Results for “${sp.q}”` : sp.list === "saved" ? "Saved jobs" : "Recommended for you"} <span className="font-semibold text-ink-400">· {events.length}</span></h2>

      {events.length === 0 ? (
        <Empty title="No jobs match yet" body="Try fewer filters, or check back — hosts post new shifts every day." action={<Link href="/talent" className="btn btn-secondary">Clear filters</Link>} icon={<Search className="size-5" />} />
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => {
            const h = hosts.get(e.host_id);
            const f = fill.get(e.id);
            return (
              <EventCard
                key={e.id}
                event={e}
                host={{ name: hostName(h), rating: h?.rating_avg ?? null }}
                spotsLeft={f ? Math.max(0, e.staff_needed - f.booked) : undefined}
                match={profile.profile_done ? matchScore(profile, e) : null}
                href={`/talent/jobs/${e.id}`}
                action={
                  <>
                    <Link href={`/talent/jobs/${e.id}`} className="btn btn-sm btn-ghost px-1 font-bold">View details</Link>
                    <SaveButton eventId={e.id} saved={saved.has(e.id)} />
                    <span className="ml-auto">{bidAction(e)}</span>
                  </>
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="card divide-y divide-line-soft">
          {events.map((e) => {
            const h = hosts.get(e.host_id);
            return (
              <div key={e.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="badge badge-ice">{e.type}</span><Rating value={h?.rating_avg ?? null} /></div>
                  <Link href={`/talent/jobs/${e.id}`} className="mt-1 block font-bold hover:underline">{e.name}</Link>
                  <p className="text-[13px] text-ink-500">{dayLabel(e.starts_at)} · {timeRange(e.starts_at, e.ends_at)} · {e.city}, {e.state}</p>
                </div>
                <p className="num text-xl font-extrabold">{naira(e.pay_ngn)}</p>
                <SaveButton eventId={e.id} saved={saved.has(e.id)} />
                {bidAction(e)}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
