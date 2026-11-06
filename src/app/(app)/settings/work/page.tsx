import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ChipChecks } from "@/components/ui/ChipChecks";
import { Toggle } from "@/components/ui/kit";
import { updateWork } from "@/app/actions/account";
import { loadCatalog } from "@/lib/catalogData";
import { DAYS } from "@/lib/constants";

export const metadata: Metadata = { title: "Work & hiring" };

export default async function WorkSettings() {
  const { supabase, profile } = await requireUser(["talent", "host"]);
  if (profile.role === "host") {
    return (
      <>
        <h1 className="t-h1">Hiring</h1>
        <p className="t-sub mt-1">Manage how you hire on ModelClic.</p>
        <div className="card card-pad mt-6 space-y-3 text-sm">
          <Link href="/host/account" className="btn btn-secondary">Edit public host profile</Link>
          <Link href="/host/verify" className="btn btn-secondary ml-2">Business verification</Link>
          <p className="text-ink-500">Default service fee and escrow rules are shown on each event before you publish.</p>
        </div>
      </>
    );
  }
  const cat = await loadCatalog(supabase);
  return (
    <>
      <h1 className="t-h1">Work & hiring</h1>
      <p className="t-sub mt-1">When you’re available and which jobs we recommend.</p>
      <ActionForm action={updateWork} className="mt-6 space-y-5">
        <section className="card card-pad flex items-center justify-between gap-4">
          <div><p className="font-bold">Available for work</p><p className="t-small">Turn off to hide your profile from host searches.</p></div>
          <Toggle name="available" defaultChecked={profile.available_for_work} label="Available for work" />
        </section>
        <section className="card card-pad">
          <h2 className="t-h3">Availability</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="days">Days</label><select id="days" name="days" defaultValue={profile.availability.days ?? "Weekends"} className="field">{DAYS.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div><label className="label" htmlFor="start">From</label><input id="start" name="start" type="time" defaultValue={profile.availability.start ?? "09:00"} className="field" /></div>
            <div><label className="label" htmlFor="end">To</label><input id="end" name="end" type="time" defaultValue={profile.availability.end ?? "20:00"} className="field" /></div>
          </div>
        </section>
        <section className="card card-pad">
          <h2 className="t-h3">Jobs you want</h2>
          <div className="mt-4"><ChipChecks name="job_prefs" groups={cat.jobs} selected={profile.job_prefs} /></div>
        </section>
        <div className="flex justify-end"><SubmitButton className="btn btn-ink" pendingLabel="Saving…">Save preferences</SubmitButton></div>
      </ActionForm>
    </>
  );
}
