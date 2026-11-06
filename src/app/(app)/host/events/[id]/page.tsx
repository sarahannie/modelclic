import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, CalendarDays, CheckCircle2, KeyRound, MapPin, MessageCircle, Pencil, Star, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { BidBadge, Empty, EventBadge, Rating, Tabs } from "@/components/ui/kit";
import { RpcButton } from "@/components/ui/RpcButton";
import { DeleteDraftButton, EventStatusButton } from "@/components/ui/EventActions";
import { Avatar } from "@/components/shell/AppChrome";
import { profilesById } from "@/lib/queries";
import { ago, dateLong, naira, time, timeRange } from "@/lib/format";
import type { Bid, Conversation, MCEvent } from "@/lib/types";

export const metadata: Metadata = { title: "Manage event" };

export default async function ManageEvent({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; saved?: string; sort?: string }> }) {
  const { id } = await params;
  const { tab = "applicants", saved, sort } = await searchParams;
  const { supabase, profile } = await requireUser("host");
  const { data: ev } = await supabase.from("events").select("*").eq("id", id).eq("host_id", profile.id).maybeSingle();
  if (!ev) notFound();
  const e = ev as MCEvent;
  const [{ data: bidData }, { data: secret }, { data: convData }, { data: rated }] = await Promise.all([
    supabase.from("bids").select("*").eq("event_id", id).order("created_at"),
    supabase.from("event_secrets").select("checkin_code").eq("event_id", id).maybeSingle(),
    supabase.from("conversations").select("*").eq("event_id", id).eq("b_id", profile.id),
    supabase.from("ratings").select("ratee_id").eq("event_id", id).eq("rater_id", profile.id),
  ]);
  const bids = (bidData as Bid[]) ?? [];
  const people = await profilesById(supabase, bids.map((b) => b.talent_id));
  const convs = new Map(((convData as Conversation[]) ?? []).map((c) => [c.a_id, c.id]));
  const ratedSet = new Set(((rated as { ratee_id: string }[]) ?? []).map((r) => r.ratee_id));

  const applicants = bids.filter((b) => ["bid", "offered"].includes(b.status));
  const selected = bids.filter((b) => ["booked", "completed", "no_show"].includes(b.status));
  const past = bids.filter((b) => ["declined", "not_selected", "withdrawn"].includes(b.status));
  const booked = bids.filter((b) => b.status === "booked" || b.status === "completed").length;
  const started = new Date(e.starts_at) < new Date();
  const sorted = [...applicants].sort((a, b) => {
    const pa = people.get(a.talent_id), pb = people.get(b.talent_id);
    if (sort === "rating") return (pb?.rating_avg ?? 0) - (pa?.rating_avg ?? 0);
    if (sort === "gigs") return (pb?.gigs_completed ?? 0) - (pa?.gigs_completed ?? 0);
    return a.created_at.localeCompare(b.created_at);
  });

  const list = tab === "selected" ? selected : tab === "past" ? past : sorted;

  return (
    <>
      <BackLink href="/host">Back to events</BackLink>
      {saved && (
        <p className="mt-4 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-white">
          {saved === "published" ? "Event submitted — our team reviews it within 4 hours, then it goes live to talent." : "Draft saved."}
        </p>
      )}
      {e.status === "rejected" && e.review_note && (
        <p className="mt-4 rounded-2xl bg-vermilion-50 px-5 py-3.5 text-sm text-vermilion-700"><strong>Changes requested:</strong> {e.review_note}</p>
      )}

      <section className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-start gap-5 p-5 md:p-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><EventBadge status={e.status} /><span className="badge badge-line">{e.type}</span></div>
            <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.035em]">{e.name}</h1>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-600">
              <li className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {dateLong(e.starts_at)} · {timeRange(e.starts_at, e.ends_at)}</li>
              <li className="flex items-center gap-1.5"><MapPin className="size-4" /> {[e.venue, e.city, e.state].filter(Boolean).join(", ")}</li>
              <li className="flex items-center gap-1.5"><Users className="size-4" /> {booked}/{e.staff_needed} booked · {naira(e.pay_ngn)} each</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            {["draft", "rejected", "pending", "active"].includes(e.status) && <Link href={`/host/events/${e.id}/edit`} className="btn btn-sm btn-secondary"><Pencil className="size-4" /> Edit</Link>}
            {e.status === "draft" && <EventStatusButton id={e.id} to="pending" label="Publish" className="btn btn-sm btn-primary" />}
            {e.status === "draft" && <DeleteDraftButton id={e.id} />}
            {["pending", "active", "filled"].includes(e.status) && !started && (
              <EventStatusButton id={e.id} to="cancelled" label="Cancel event" className="btn btn-sm btn-ghost" confirm="Cancel this event? Booked staff are notified and escrow is returned." />
            )}
          </div>
        </div>
        <div className="grid gap-px bg-line-soft sm:grid-cols-3">
          <div className="bg-white p-5"><p className="text-xs font-semibold text-ink-400">Fill</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-ice"><div className="h-full rounded-full bg-vermilion" style={{ width: `${(booked / e.staff_needed) * 100}%` }} /></div><p className="mt-1.5 text-sm font-bold">{booked} of {e.staff_needed}</p></div>
          <div className="bg-white p-5"><p className="text-xs font-semibold text-ink-400">Bids received</p><p className="num mt-1 text-2xl font-extrabold">{bids.filter((b) => !b.invited).length}</p></div>
          <div className="flex items-center gap-3 bg-ink p-5 text-white">
            <KeyRound className="size-5 text-vermilion" />
            <div><p className="text-xs font-semibold text-white/60">Today’s check-in code</p><p className="num text-2xl font-extrabold tracking-[0.3em]">{(secret as { checkin_code: string } | null)?.checkin_code ?? "····"}</p></div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs current={tab} items={[
          { key: "applicants", label: "Applicants", href: `/host/events/${id}?tab=applicants`, count: applicants.length },
          { key: "selected", label: "Booked staff", href: `/host/events/${id}?tab=selected`, count: selected.length },
          { key: "past", label: "Declined", href: `/host/events/${id}?tab=past`, count: past.length },
        ]} />
        {tab === "applicants" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">Sort</span>
            {[["", "Newest"], ["rating", "Rating"], ["gigs", "Experience"]].map(([k, l]) => (
              <Link key={k} href={`/host/events/${id}?tab=applicants${k ? `&sort=${k}` : ""}`} className="chip" aria-current={(sort ?? "") === k ? "page" : undefined}>{l}</Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {list.length === 0 && (
          <div className="md:col-span-2">
            <Empty
              title={tab === "selected" ? "No one booked yet" : tab === "past" ? "Nothing here" : e.status === "active" ? "No bids yet" : "Applicants appear once your event is live"}
              body={tab === "applicants" ? "Invite verified talent directly to fill faster." : undefined}
              action={tab === "applicants" ? <Link href="/host/talent" className="btn btn-ink">Find talent</Link> : undefined}
              icon={<Users className="size-5" />}
            />
          </div>
        )}
        {list.map((b) => {
          const p = people.get(b.talent_id);
          if (!p) return null;
          const conv = convs.get(p.id);
          return (
            <article key={b.id} className="card p-5">
              <div className="flex items-start gap-4">
                <Avatar name={p.full_name} src={p.avatar_url} size={60} />
                <div className="min-w-0 flex-1">
                  <Link href={`/host/talent/${p.id}?event=${e.id}`} className="flex items-center gap-1.5 font-bold hover:underline">{p.full_name} {p.kyc === "verified" && <BadgeCheck className="size-4 text-vermilion-700" aria-label="Verified" />}</Link>
                  <p className="text-[13px] text-ink-500">{[p.gender, p.city].filter(Boolean).join(" · ")} · <Rating value={p.rating_avg} /> · {p.gigs_completed} gigs</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{p.skills.slice(0, 3).map((s) => <span key={s} className="badge badge-ice">{s}</span>)}</div>
                </div>
                <BidBadge status={b.status} host />
              </div>
              {b.note && <p className="mt-3 rounded-xl bg-ice-50 p-3 text-sm text-ink-700">“{b.note}”</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-4">
                <span className="mr-auto text-xs text-ink-400">{b.invited ? "Invited" : "Bid"} {ago(b.created_at)}</span>
                {b.status === "bid" && (
                  <>
                    <RpcButton fn="decline_bid" args={{ p_bid: b.id }} success="Declined." className="btn btn-sm btn-ghost">Decline</RpcButton>
                    <RpcButton fn="send_offer" args={{ p_event: e.id, p_talent: p.id }} success={`Offer sent to ${p.first_name}.`} className="btn btn-sm btn-primary">Send offer</RpcButton>
                  </>
                )}
                {b.status === "offered" && <span className="text-xs font-semibold text-ink-500">Waiting for {p.first_name} to accept…</span>}
                {b.status === "booked" && (
                  <>
                    {conv && <Link href={`/messages/${conv}`} className="btn btn-sm btn-secondary"><MessageCircle className="size-4" /> Chat</Link>}
                    {b.checked_in_at && <span className="badge badge-ice"><CheckCircle2 className="size-3.5" /> In at {time(b.checked_in_at)}</span>}
                    {started && !b.arrived_at && (
                      <>
                        <RpcButton fn="mark_attendance" args={{ p_bid: b.id, p_arrived: false }} confirm={`Report ${p.first_name} as a no-show? This opens a dispute and returns the escrow to you.`} success="No-show reported." className="btn btn-sm btn-ghost">No-show</RpcButton>
                        <RpcButton fn="mark_attendance" args={{ p_bid: b.id, p_arrived: true }} success="Marked as arrived." className="btn btn-sm btn-secondary">Arrived</RpcButton>
                      </>
                    )}
                    {started && (
                      <RpcButton fn="confirm_completion" args={{ p_bid: b.id }} confirm={`Confirm ${p.first_name} completed the job? This releases ${naira(e.pay_ngn)} from escrow.`} success="Job confirmed — pay released." className="btn btn-sm btn-primary">Confirm & release pay</RpcButton>
                    )}
                  </>
                )}
                {b.status === "completed" && (ratedSet.has(p.id) ? <span className="text-xs font-semibold text-ink-400">Paid · Rated ✓</span> : <Link href={`/host/rate/${b.id}`} className="btn btn-sm btn-primary"><Star className="size-4" /> Rate staff</Link>)}
                {b.status === "no_show" && <span className="text-xs font-semibold text-vermilion-700">No-show reported</span>}
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-ink-400">Your host profile: {profile.company_name || profile.full_name}. Pay releases automatically 12 hours after the event if you don’t confirm.</p>
    </>
  );
}
