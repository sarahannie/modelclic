import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, CalendarDays, Clock, LockKeyhole, MapPin, Shirt, ShieldAlert, Users, UserRound, Info } from "lucide-react";
import { requireUser, getSettings } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { BidBadge, Rating } from "@/components/ui/kit";
import { RpcButton } from "@/components/ui/RpcButton";
import { SaveButton } from "@/components/ui/SmallActions";
import { Avatar } from "@/components/shell/AppChrome";
import { fillById, hostName, matchScore } from "@/lib/queries";
import { dateLong, naira, timeRange } from "@/lib/format";
import type { Bid, MCEvent, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Job details" };

export default async function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireUser("talent");
  const settings = await getSettings();
  const { data: ev } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!ev) notFound();
  const e = ev as MCEvent;
  const [{ data: hostData }, { data: bidData }, { data: savedData }, fill] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", e.host_id).maybeSingle(),
    supabase.from("bids").select("*").eq("event_id", e.id).eq("talent_id", profile.id).maybeSingle(),
    supabase.from("saved_events").select("event_id").eq("user_id", profile.id).eq("event_id", e.id).maybeSingle(),
    fillById(supabase, [e.id]),
  ]);
  const host = hostData as Profile | null;
  const bid = bidData as Bid | null;
  const f = fill.get(e.id);
  const left = Math.max(0, e.staff_needed - (f?.booked ?? 0));
  const open = e.status === "active" && new Date(e.starts_at) > new Date();
  const hasBid = bid && bid.status !== "withdrawn";

  const details = [
    { icon: CalendarDays, label: "Date", value: dateLong(e.starts_at) },
    { icon: Clock, label: "Time", value: timeRange(e.starts_at, e.ends_at) },
    { icon: MapPin, label: "Location", value: [e.venue, e.city, e.state].filter(Boolean).join(", ") },
    { icon: Users, label: "Spots", value: `${left} of ${e.staff_needed} left${f?.bids ? ` · ${f.bids} bids so far` : ""}` },
    e.dress_code && { icon: Shirt, label: "Dress code", value: e.dress_code },
    e.gender_req && e.gender_req !== "No preference" && { icon: UserRound, label: "Looking for", value: e.gender_req },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  return (
    <>
      <BackLink href="/talent">Back to Find jobs</BackLink>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="grain relative isolate bg-ink p-6 text-white md:p-8">
              <div aria-hidden className="absolute -top-20 -right-20 -z-10 size-72 rounded-full bg-vermilion/25 blur-3xl" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-white/10 text-ice">{e.type}</span>
                {profile.profile_done && <span className="badge bg-white/10 text-white"><span className="text-vermilion">{matchScore(profile, e)}%</span> match</span>}
                <span className="ml-auto"><SaveButton eventId={e.id} saved={Boolean(savedData)} label /></span>
              </div>
              <h1 className="mt-4 text-[30px] leading-tight font-extrabold tracking-[-0.035em] text-white md:text-[36px]">{e.name}</h1>
              <p className="num mt-4 text-4xl font-extrabold tracking-[-0.04em]">{naira(e.pay_ngn)} <span className="text-base font-semibold text-white/60">per person</span></p>
            </div>
            <dl className="grid gap-px bg-line-soft sm:grid-cols-2">
              {details.map(({ icon: I, label, value }) => (
                <div key={label} className="flex items-start gap-3 bg-white p-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ice text-ink"><I className="size-4" /></span>
                  <div><dt className="text-xs font-semibold text-ink-400">{label}</dt><dd className="font-bold">{value}</dd></div>
                </div>
              ))}
            </dl>
          </section>

          {e.description && (
            <section className="card card-pad">
              <h2 className="t-h2">About the job</h2>
              <p className="mt-2 leading-relaxed whitespace-pre-line text-ink-700">{e.description}</p>
            </section>
          )}
          {(e.checkin_location || e.instructions) && (
            <section className="card card-pad">
              <h2 className="t-h2">On the day</h2>
              {e.checkin_location && <p className="mt-3 text-ink-700"><strong className="text-ink">Check-in point:</strong> {e.checkin_location}</p>}
              {e.instructions && <p className="mt-2 text-ink-700"><strong className="text-ink">Instructions:</strong> {e.instructions}</p>}
              <p className="mt-4 flex items-center gap-2 text-xs text-ink-400"><Info className="size-3.5" /> Exact address and the host chat unlock once you’re booked.</p>
            </section>
          )}

          {host && (
            <section className="card card-pad flex flex-wrap items-center gap-4">
              <Avatar name={hostName(host)} src={host.avatar_url} size={52} />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 font-bold">{hostName(host)} {host.host_kyc === "verified" && <BadgeCheck className="size-4 text-vermilion-700" aria-label="Verified host" />}</p>
                <p className="text-sm text-ink-500">Event host · <Rating value={host.rating_avg} count={host.rating_count} /></p>
              </div>
              {host.host_kyc === "verified" && <span className="badge badge-ice">ID & business verified</span>}
            </section>
          )}
        </div>

        {/* Bid panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card card-pad">
            {hasBid ? (
              <>
                <p className="text-sm font-semibold text-ink-500">Your bid</p>
                <div className="mt-2"><BidBadge status={bid!.status} /></div>
                <p className="mt-3 text-sm text-ink-600">
                  {bid!.status === "bid" && "The host is reviewing bids. You’ll get a notification when they reply — usually within a day."}
                  {bid!.status === "offered" && "You have an offer! Accept it to lock in the shift — pay goes into escrow."}
                  {bid!.status === "booked" && "You’re booked. Your shift pass has the check-in code and host chat."}
                  {bid!.status === "not_selected" && "The host picked other staff this time. Keep bidding!"}
                  {bid!.status === "completed" && "Job done — thanks for working with ModelClic."}
                </p>
                {bid!.status === "offered" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <RpcButton fn="respond_offer" args={{ p_bid: bid!.id, p_accept: false }} success="Offer declined." className="btn btn-secondary">Decline</RpcButton>
                    <RpcButton fn="respond_offer" args={{ p_bid: bid!.id, p_accept: true }} success="You’re booked! 🎉" className="btn btn-primary">Accept</RpcButton>
                  </div>
                )}
                {bid!.status === "booked" && <Link href={`/talent/shift-pass/${bid!.id}`} className="btn btn-ink mt-4 w-full">Open shift pass</Link>}
                <Link href="/talent/gigs" className="btn btn-ghost mt-2 w-full">Go to My Gigs</Link>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="font-bold">Bid on this job</p>
                  <p className="text-sm text-ink-500"><strong className="num text-ink">{settings.bid_cost}</strong> points</p>
                </div>
                <p className="mt-1 text-sm text-ink-500">You have <strong className="text-ink">{profile.bid_points}</strong> points left.</p>
                {!open ? (
                  <p className="mt-4 rounded-xl bg-ice-50 p-3 text-sm font-semibold text-ink-600">This job isn’t taking bids anymore.</p>
                ) : !profile.profile_done ? (
                  <Link href="/talent/profile" className="btn btn-primary mt-4 w-full">Complete profile to bid</Link>
                ) : profile.kyc === "unverified" || profile.kyc === "rejected" ? (
                  <Link href="/talent/verify" className="btn btn-primary mt-4 w-full">Verify identity to bid</Link>
                ) : profile.bid_points < settings.bid_cost ? (
                  <Link href="/talent/bids#buy" className="btn btn-primary mt-4 w-full">Buy bid points</Link>
                ) : (
                  <RpcButton fn="place_bid" args={{ p_event: e.id }} success="Bid placed — the host will review it soon." className="btn btn-primary btn-lg mt-4 w-full">
                    Place bid · {settings.bid_cost} pts
                  </RpcButton>
                )}
              </>
            )}
          </div>
          <ul className="mt-4 space-y-3 rounded-2xl border border-line bg-white/60 p-5 text-sm text-ink-600">
            <li className="flex gap-3"><LockKeyhole className="size-4 shrink-0 text-ink" /> Pay is held in escrow before the event.</li>
            <li className="flex gap-3"><BadgeCheck className="size-4 shrink-0 text-ink" /> The host is identity-checked by ModelClic.</li>
            <li className="flex gap-3"><ShieldAlert className="size-4 shrink-0 text-vermilion-700" /> SOS on your shift pass if you ever feel unsafe.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}
