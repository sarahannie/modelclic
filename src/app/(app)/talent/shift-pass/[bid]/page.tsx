import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { CheckIn } from "@/components/ui/CheckIn";
import { SosSlider } from "@/components/ui/Sos";
import { hostName } from "@/lib/queries";
import { dateLong, naira, time, timeRange } from "@/lib/format";
import type { Bid, MCEvent, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Shift pass" };

export default async function ShiftPass({ params }: { params: Promise<{ bid: string }> }) {
  const { bid: id } = await params;
  const { supabase, profile } = await requireUser("talent");
  const { data: b } = await supabase.from("bids").select("*").eq("id", id).eq("talent_id", profile.id).maybeSingle();
  if (!b) notFound();
  const bid = b as Bid;
  const [{ data: ev }, { data: conv }] = await Promise.all([
    supabase.from("events").select("*").eq("id", bid.event_id).single(),
    supabase.from("conversations").select("id").eq("event_id", bid.event_id).eq("a_id", profile.id).maybeSingle(),
  ]);
  const e = ev as MCEvent;
  const { data: h } = await supabase.from("profiles").select("*").eq("id", e.host_id).single();
  const host = h as Profile;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.city, e.state, "Nigeria"].filter(Boolean).join(", "))}`;

  return (
    <div className="-mx-4 -mt-6 md:-mx-8 md:-mt-8">
      <section className="grain relative isolate overflow-hidden bg-ink px-4 pt-6 pb-24 text-white md:px-8">
        <div aria-hidden className="absolute -top-24 -right-24 -z-10 size-80 rounded-full bg-vermilion/30 blur-3xl" />
        <BackLink href="/talent/gigs?tab=booked" onDark>My Gigs</BackLink>
        <p className="mt-6 text-xs font-bold tracking-[0.16em] text-white/50 uppercase">Shift pass</p>
        <h1 className="mt-1 text-[34px] font-extrabold tracking-[-0.04em] text-white">{e.name}</h1>
        <p className="mt-1 text-white/70">{dateLong(e.starts_at)} · {timeRange(e.starts_at, e.ends_at)}</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
          {bid.checked_in_at ? <><CheckCircle2 className="size-4 text-ice-300" /> Checked in at {time(bid.checked_in_at)}</> : <><span className="size-2 rounded-full bg-vermilion" /> Not checked in yet</>}
        </p>
      </section>

      <div className="relative z-10 mx-auto -mt-16 max-w-xl space-y-4 px-4 md:px-0">
        <section className="card card-pad">
          {bid.checked_in_at ? (
            <div className="py-4 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-ink text-white"><CheckCircle2 className="size-7" /></span>
              <p className="mt-3 text-lg font-extrabold">You’re checked in</p>
              <p className="text-sm text-ink-500">Pay ({naira(e.pay_ngn)}) is safe in escrow and releases after the event.</p>
            </div>
          ) : (
            <>
              <h2 className="t-h3 text-center">Host’s check-in code</h2>
              <p className="t-small mb-5 text-center">Ask the event lead for today’s 4-digit code when you arrive.</p>
              <CheckIn bidId={bid.id} />
            </>
          )}
        </section>

        <section className="card divide-y divide-line-soft">
          {conv && (
            <Link href={`/messages/${conv.id}`} className="flex min-h-14 items-center gap-3 px-5 font-semibold hover:bg-ice-50">
              <MessageCircle className="size-4" /> Chat with {hostName(host)} <ChevronRight className="ml-auto size-4 text-ink-400" />
            </Link>
          )}
          <a href={maps} target="_blank" rel="noreferrer" className="flex min-h-14 items-center gap-3 px-5 font-semibold hover:bg-ice-50">
            <MapPin className="size-4" /> Venue directions <span className="ml-2 truncate text-sm font-normal text-ink-400">{[e.venue, e.city].filter(Boolean).join(", ")}</span> <ChevronRight className="ml-auto size-4 shrink-0 text-ink-400" />
          </a>
          <div className="flex min-h-14 items-center justify-between gap-3 px-5 text-sm"><span className="text-ink-500">Check-in point</span><span className="text-right font-semibold">{e.checkin_location || "Ask the host when you arrive"}</span></div>
          <div className="flex min-h-14 items-center justify-between gap-3 px-5 text-sm"><span className="text-ink-500">Dress code</span><span className="text-right font-semibold">{e.dress_code || "As agreed with the host"}</span></div>
          {e.instructions && <div className="px-5 py-4 text-sm"><p className="text-ink-500">Instructions</p><p className="mt-1 font-semibold">{e.instructions}</p></div>}
        </section>

        <section className="card card-pad">
          <SosSlider eventId={e.id} />
        </section>
      </div>
    </div>
  );
}
