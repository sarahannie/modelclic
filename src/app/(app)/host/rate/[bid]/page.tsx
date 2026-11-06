import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { RatingForm } from "@/components/ui/Stars";
import { Avatar } from "@/components/shell/AppChrome";
import { RATING_STAFF } from "@/lib/constants";
import type { Bid, MCEvent, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Rate your staff" };

export default async function RateStaff({ params }: { params: Promise<{ bid: string }> }) {
  const { bid: id } = await params;
  const { supabase, profile } = await requireUser("host");
  const { data: b } = await supabase.from("bids").select("*").eq("id", id).maybeSingle();
  if (!b) notFound();
  const bid = b as Bid;
  const { data: ev } = await supabase.from("events").select("*").eq("id", bid.event_id).eq("host_id", profile.id).maybeSingle();
  if (!ev) notFound();
  const e = ev as MCEvent;
  const { data: t } = await supabase.from("profiles").select("*").eq("id", bid.talent_id).single();
  const talent = t as Profile;
  return (
    <div className="max-w-2xl">
      <BackLink href={`/host/events/${e.id}?tab=selected`}>Back to event</BackLink>
      <h1 className="t-h1 mt-5">Rate your staff</h1>
      <p className="t-sub mt-1">Ratings are revealed together, so both sides stay honest.</p>
      <section className="card card-pad mt-6">
        <div className="flex items-center gap-3 border-b border-line-soft pb-4">
          <Avatar name={talent.full_name} src={talent.avatar_url} size={48} />
          <div><p className="font-bold">{talent.full_name}</p><p className="text-sm text-ink-500">{e.name}</p></div>
        </div>
        <RatingForm eventId={e.id} rateeId={talent.id} criteria={RATING_STAFF} done={`/host/events/${e.id}?tab=selected`} />
      </section>
    </div>
  );
}
