import type { Metadata } from "next";
import { BadgeCheck, CalendarDays, Star } from "lucide-react";
import { requireUser } from "@/lib/session";
import { PageHeader, KycBadge, Rating } from "@/components/ui/kit";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PhotoInput } from "@/components/verify/VerifyForm";
import { Avatar } from "@/components/shell/AppChrome";
import { updateHostProfile } from "@/app/actions/profile";
import { profilesById } from "@/lib/queries";
import { NG_STATES } from "@/lib/constants";
import { ago } from "@/lib/format";
import type { Rating as R } from "@/lib/types";

export const metadata: Metadata = { title: "Profile" };

export default async function HostAccount() {
  const { supabase, profile } = await requireUser("host");
  const [{ data: r }, { count: events }] = await Promise.all([
    supabase.from("ratings").select("*").eq("ratee_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("host_id", profile.id).in("status", ["active", "filled", "completed"]),
  ]);
  const ratings = (r as R[]) ?? [];
  const raters = await profilesById(supabase, ratings.map((x) => x.rater_id));
  const name = profile.company_name || profile.full_name;
  return (
    <>
      <PageHeader title="Host profile" sub="What talent see when they bid on your events." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="card card-pad self-start text-center">
          <div className="flex justify-center"><Avatar name={name} src={profile.avatar_url} size={96} /></div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xl font-extrabold">{name} {profile.host_kyc === "verified" && <BadgeCheck className="size-5 text-vermilion-700" />}</p>
          <p className="text-sm text-ink-500">{[profile.city, profile.state].filter(Boolean).join(", ")}</p>
          <div className="mt-3 flex justify-center"><KycBadge status={profile.host_kyc} /></div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-ice-50 p-3"><dt className="text-xs text-ink-400">Rating</dt><dd className="mt-0.5"><Rating value={profile.rating_avg} count={profile.rating_count} /></dd></div>
            <div className="rounded-xl bg-ice-50 p-3"><dt className="text-xs text-ink-400">Events</dt><dd className="num mt-0.5 flex items-center gap-1 font-extrabold"><CalendarDays className="size-3.5" /> {events ?? 0}</dd></div>
          </dl>
          {profile.bio && <p className="mt-5 text-left text-sm text-ink-600">{profile.bio}</p>}
        </aside>
        <div className="space-y-5">
          <ActionForm action={updateHostProfile} className="card card-pad space-y-4">
            <h2 className="t-h3">Edit profile</h2>
            <PhotoInput name="avatar" label="Logo or photo" hint="Upload" shape="circle" />
            <div><label className="label" htmlFor="company_name">Business / display name</label><input id="company_name" name="company_name" defaultValue={profile.company_name ?? ""} className="field" /></div>
            <div><label className="label" htmlFor="bio">About</label><textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ""} placeholder="What kind of events do you run?" className="field" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="state">State</label><select id="state" name="state" defaultValue={profile.state ?? "Lagos"} className="field">{NG_STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div><label className="label" htmlFor="city">City</label><input id="city" name="city" defaultValue={profile.city ?? ""} className="field" /></div>
            </div>
            <div className="flex justify-end"><SubmitButton className="btn btn-ink" pendingLabel="Saving…">Save profile</SubmitButton></div>
          </ActionForm>
          <section className="card card-pad">
            <h2 className="t-h3">What staff say</h2>
            <ul className="mt-4 space-y-3">
              {ratings.length === 0 && <li className="text-sm text-ink-400">No reviews yet.</li>}
              {ratings.map((x) => (
                <li key={x.id} className="rounded-xl bg-ice-50 p-4 text-sm">
                  <p className="flex items-center gap-1 font-bold"><Star className="size-3.5 fill-vermilion text-vermilion" /> {Number(x.overall).toFixed(1)} <span className="font-normal text-ink-400">· {raters.get(x.rater_id)?.first_name ?? "Talent"} · {ago(x.created_at)}</span></p>
                  {x.comment && <p className="mt-1 text-ink-700">“{x.comment}”</p>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
