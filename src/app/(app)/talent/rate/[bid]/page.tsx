import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { RatingForm } from "@/components/ui/Stars";
import { Avatar } from "@/components/shell/AppChrome";
import { hostName } from "@/lib/queries";
import { RATING_HOST } from "@/lib/constants";
import { dateShort } from "@/lib/format";
import type { Bid, MCEvent, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Rate your host" };

export default async function RateHost({ params }: { params: Promise<{ bid: string }> }) {
  const { bid: id } = await params;
  const { supabase, profile } = await requireUser("talent");
  const { data: b } = await supabase.from("bids").select("*").eq("id", id).eq("talent_id", profile.id).maybeSingle();
  if (!b) notFound();
  const bid = b as Bid;
  const { data: ev } = await supabase.from("events").select("*").eq("id", bid.event_id).single();
  const e = ev as MCEvent;
  const { data: h } = await supabase.from("profiles").select("*").eq("id", e.host_id).single();
  const host = h as Profile;
  return (
    <div className="max-w-2xl">
      <BackLink href="/talent/gigs?tab=completed">Back to My Gigs</BackLink>
      <h1 className="t-h1 mt-5">Rate this host</h1>
      <p className="t-sub mt-1">Ratings are revealed together, so be honest.</p>
      <section className="card card-pad mt-6">
        <div className="flex items-center gap-3 border-b border-line-soft pb-4">
          <Avatar name={hostName(host)} src={host.avatar_url} size={44} />
          <div><p className="font-bold">{hostName(host)}</p><p className="text-sm text-ink-500">{e.name} · {dateShort(e.starts_at)}</p></div>
        </div>
        <RatingForm eventId={e.id} rateeId={host.id} criteria={RATING_HOST} done="/talent/gigs?tab=completed" />
      </section>
    </div>
  );
}
