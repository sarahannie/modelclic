import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requireUser, getPrivate } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ChipChecks } from "@/components/ui/ChipChecks";
import { PhotoInput } from "@/components/verify/VerifyForm";
import { BackLink } from "@/components/ui/BackLink";
import { saveProfileStep } from "@/app/actions/profile";
import { loadCatalog } from "@/lib/catalogData";
import { BODY_TYPES, DAYS, NG_STATES, SKIN_TONES } from "@/lib/constants";

export const metadata: Metadata = { title: "Complete your profile" };

const STEPS = [
  { title: "Photos & about you", sub: "Photo, bio, appearance" },
  { title: "Work preferences", sub: "Location, availability, skills" },
  { title: "Emergency contact", sub: "Private, for SOS only" },
];

export default async function ProfileWizard({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const step = Math.min(2, Math.max(0, Number((await searchParams).step ?? 0) || 0));
  const { supabase, profile } = await requireUser("talent");
  const [priv, cat] = await Promise.all([getPrivate(profile.id), loadCatalog(supabase)]);

  const strength = [Boolean(profile.avatar_url), (profile.bio ?? "").length >= 20, profile.skills.length > 0, Boolean(profile.state), Boolean(priv?.ec_name), profile.photos.length > 0, Boolean(profile.height_cm)].filter(Boolean).length;
  const pct = Math.round((strength / 7) * 100);

  return (
    <>
      {profile.profile_done && <BackLink href="/talent/account">Back to profile</BackLink>}
      <header className="mt-4 mb-7">
        <h1 className="t-h1">{profile.profile_done ? "Edit profile" : "Complete your profile"}</h1>
        <p className="t-sub mt-1.5">Hosts see your photos, bio, skills and preferences — never your contact details.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="card self-start p-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between text-sm font-bold"><span>Profile strength</span><span className="num">{pct}%</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ice"><div className="h-full rounded-full bg-vermilion" style={{ width: `${pct}%` }} /></div>
          <ol className="mt-4 space-y-1">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Link href={`/talent/profile?step=${i}`} aria-current={i === step ? "step" : undefined} className={`flex items-center gap-3 rounded-xl p-2.5 transition ${i === step ? "bg-ice-100" : "hover:bg-ice-50"}`}>
                  <span className={`num grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i < step ? "bg-ink text-white" : i === step ? "bg-vermilion text-white" : "border-2 border-line text-ink-400"}`}>{i < step ? <Check className="size-3.5" /> : i + 1}</span>
                  <span><span className="block text-sm font-bold">{s.title}</span><span className="block text-xs text-ink-400">{s.sub}</span></span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>

        <ActionForm action={saveProfileStep} className="space-y-5">
          <input type="hidden" name="step" value={step} />
          {step === 0 && (
            <>
              <section className="card card-pad">
                <h2 className="t-h3">Photos</h2>
                <p className="t-small">A clear, smiling headshot gets more offers. Add up to three full-length or event photos.</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div>
                    {profile.avatar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="Current main photo" className="mb-2 size-14 rounded-full object-cover ring-2 ring-white" />
                    )}
                    <PhotoInput name="avatar" label="Main photo" hint="Add photo" shape="circle" />
                  </div>
                  {["Full length", "At an event", "Optional"].map((l, i) => <PhotoInput key={l} name={`photo${i + 1}`} label={l} hint="Photo" />)}
                </div>
              </section>
              <section className="card card-pad">
                <h2 className="t-h3">About you</h2>
                <label className="label mt-3" htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" rows={4} defaultValue={profile.bio ?? ""} className="field" placeholder="e.g. Final-year student at UNILAG. Two years of wedding ushering and brand activations. Calm under pressure, fluent in Yoruba." />
              </section>
              <section className="card card-pad">
                <h2 className="t-h3">Appearance</h2>
                <p className="t-small">Some hosts book for a look (fashion shows, promo modelling). This helps them match you.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="skin_tone">Skin tone</label><select id="skin_tone" name="skin_tone" defaultValue={profile.skin_tone ?? ""} className="field"><option value="">Select</option>{SKIN_TONES.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div><label className="label" htmlFor="body_type">Body type</label><select id="body_type" name="body_type" defaultValue={profile.body_type ?? ""} className="field"><option value="">Select</option>{BODY_TYPES.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div><label className="label" htmlFor="height_cm">Height (cm)</label><input id="height_cm" name="height_cm" type="number" min={120} max={230} defaultValue={profile.height_cm ?? ""} placeholder="e.g. 168" className="field" /></div>
                  <div><label className="label" htmlFor="weight_kg">Weight (kg)</label><input id="weight_kg" name="weight_kg" type="number" min={35} max={200} defaultValue={profile.weight_kg ?? ""} placeholder="e.g. 58" className="field" /></div>
                </div>
              </section>
            </>
          )}
          {step === 1 && (
            <>
              <section className="card card-pad">
                <h2 className="t-h3">Where and when you work</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="state">State</label><select id="state" name="state" defaultValue={profile.state ?? "Lagos"} className="field">{NG_STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div><label className="label" htmlFor="city">City / area</label><input id="city" name="city" defaultValue={profile.city ?? ""} placeholder="e.g. Surulere" className="field" /></div>
                  <div><label className="label" htmlFor="days">Days</label><select id="days" name="days" defaultValue={profile.availability.days ?? "Weekends"} className="field">{DAYS.map((d) => <option key={d}>{d}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label" htmlFor="start">From</label><input id="start" name="start" type="time" defaultValue={profile.availability.start ?? "09:00"} className="field" /></div>
                    <div><label className="label" htmlFor="end">To</label><input id="end" name="end" type="time" defaultValue={profile.availability.end ?? "20:00"} className="field" /></div>
                  </div>
                </div>
              </section>
              <section className="card card-pad">
                <h2 className="t-h3">Skills</h2>
                <p className="t-small mb-4">Pick everything you’re good at — hosts filter by these.</p>
                <ChipChecks name="skills" groups={cat.skills} selected={profile.skills} />
              </section>
              <section className="card card-pad">
                <h2 className="t-h3">Jobs you want</h2>
                <p className="t-small mb-4">We’ll recommend these first.</p>
                <ChipChecks name="job_prefs" groups={cat.jobs} selected={profile.job_prefs} />
              </section>
            </>
          )}
          {step === 2 && (
            <section className="card card-pad">
              <h2 className="t-h3">Emergency contact</h2>
              <p className="t-small">Private. Only our safety team uses this — for example if you send an SOS.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="ec_name">Full name</label><input id="ec_name" name="ec_name" defaultValue={priv?.ec_name ?? ""} required className="field" /></div>
                <div><label className="label" htmlFor="ec_relationship">Relationship</label><input id="ec_relationship" name="ec_relationship" defaultValue={priv?.ec_relationship ?? ""} placeholder="e.g. Sister" className="field" /></div>
                <div className="sm:col-span-2"><label className="label" htmlFor="ec_phone">Phone</label><input id="ec_phone" name="ec_phone" type="tel" defaultValue={priv?.ec_phone ?? ""} required className="field" /></div>
              </div>
            </section>
          )}
          <div className="card flex items-center justify-between gap-3 p-4">
            {step > 0 ? <Link href={`/talent/profile?step=${step - 1}`} className="btn btn-ghost">Back</Link> : <span />}
            <SubmitButton className="btn btn-primary" pendingLabel="Saving…">{step === 2 ? "Finish profile" : "Continue"}</SubmitButton>
          </div>
        </ActionForm>
      </div>
    </>
  );
}
