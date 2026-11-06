import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Send } from "lucide-react";
import { requireUser } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { TalentProfileView } from "@/components/profile/TalentProfileView";
import { FavoriteButton } from "@/components/ui/SmallActions";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { inviteTalent } from "@/app/actions/host";
import { hostName, profilesById } from "@/lib/queries";
import { dateShort, naira } from "@/lib/format";
import type { MCEvent, Profile, Rating } from "@/lib/types";

export const metadata: Metadata = { title: "Talent profile" };

export default async function TalentProfile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ event?: string }> }) {
  const { id } = await params;
  const { event: fromEvent } = await searchParams;
  const { supabase, profile } = await requireUser("host");
  const { data: p } = await supabase.from("profiles").select("*").eq("id", id).eq("role", "talent").maybeSingle();
  if (!p) notFound();
  const [{ data: r }, { data: age }, { data: evs }, { data: fav }] = await Promise.all([
    supabase.from("ratings").select("*").eq("ratee_id", id).order("created_at", { ascending: false }),
    supabase.rpc("talent_age", { p_id: id }),
    supabase.from("events").select("*").eq("host_id", profile.id).eq("status", "active").order("starts_at"),
    supabase.from("favorites").select("talent_id").eq("host_id", profile.id).eq("talent_id", id).maybeSingle(),
  ]);
  const ratings = (r as Rating[]) ?? [];
  const raters = await profilesById(supabase, ratings.map((x) => x.rater_id));
  const events = (evs as MCEvent[]) ?? [];
  const t = p as Profile;
  return (
    <>
      <BackLink href={fromEvent ? `/host/events/${fromEvent}` : "/host/talent"}>{fromEvent ? "Back to event" : "Back to search"}</BackLink>
      <div className="mt-5">
        <TalentProfileView
          p={t}
          age={age as number | null}
          ratings={ratings.map((x) => ({ ...x, rater: hostName(raters.get(x.rater_id)) }))}
          actions={
            <div className="card card-pad space-y-3">
              <div className="flex items-center justify-between"><p className="font-bold">Invite to an event</p><FavoriteButton talentId={t.id} fav={Boolean(fav)} className="ring-1 ring-line" /></div>
              {events.length === 0 ? (
                <p className="text-sm text-ink-500">You need a live event to send an offer.</p>
              ) : (
                <ActionForm action={inviteTalent} className="space-y-3">
                  <input type="hidden" name="talent" value={t.id} />
                  <select name="event" defaultValue={fromEvent ?? events[0]?.id} className="field" aria-label="Event">
                    {events.map((e) => <option key={e.id} value={e.id}>{e.name} · {dateShort(e.starts_at)} · {naira(e.pay_ngn)}</option>)}
                  </select>
                  <SubmitButton className="btn btn-primary w-full" pendingLabel="Sending…"><Send className="size-4" /> Send offer</SubmitButton>
                  <p className="text-xs text-ink-400">Offers need enough wallet balance to cover pay in escrow.</p>
                </ActionForm>
              )}
            </div>
          }
        />
      </div>
    </>
  );
}
