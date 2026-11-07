import type { Metadata } from "next";
import { requireUser, getPrivate } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Toggle } from "@/components/ui/kit";
import { requestAccountDeletion, updatePrivacy } from "@/app/actions/account";

export const metadata: Metadata = { title: "Privacy & safety" };

export default async function PrivacySettings() {
  const { profile } = await requireUser(["talent", "host"]);
  const priv = await getPrivate(profile.id);
  return (
    <>
      <h1 className="t-h1">Privacy & safety</h1>
      <p className="t-sub mt-1">Control what others see and who we contact in an emergency.</p>
      <ActionForm action={updatePrivacy} className="mt-6 space-y-5">
        <section className="card divide-y divide-line-soft">
          <div className="flex items-center justify-between gap-4 p-5"><div><p className="font-bold">Show my extra photos to hosts</p><p className="t-small">Your main photo is always shown on bids.</p></div><Toggle name="show_photos" defaultChecked={priv?.privacy_prefs?.show_photos ?? true} label="Show photos" /></div>
          <div className="flex items-center justify-between gap-4 p-5"><div><p className="font-bold">Share my location during shifts</p><p className="t-small">Only used by our safety team if you send an SOS.</p></div><Toggle name="share_location" defaultChecked={priv?.privacy_prefs?.share_location_on_shift ?? true} label="Share location on shift" /></div>
        </section>
        <section className="card card-pad">
          <h2 className="t-h3">Emergency contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="ec_name">Name</label><input id="ec_name" name="ec_name" defaultValue={priv?.ec_name ?? ""} className="field" /></div>
            <div><label className="label" htmlFor="ec_relationship">Relationship</label><input id="ec_relationship" name="ec_relationship" defaultValue={priv?.ec_relationship ?? ""} className="field" /></div>
            <div><label className="label" htmlFor="ec_phone">Phone</label><input id="ec_phone" name="ec_phone" type="tel" defaultValue={priv?.ec_phone ?? ""} className="field" /></div>
          </div>
        </section>
        <div className="flex justify-end"><SubmitButton className="btn btn-ink" pendingLabel="Saving…">Save</SubmitButton></div>
      </ActionForm>

      <section className="card card-pad mt-8">
        <h2 className="t-h3">How long we keep your data</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-600">
          <li><strong className="text-ink">Account &amp; profile:</strong> while your account is open; deleted within 30 days of closing it.</li>
          <li><strong className="text-ink">ID photo, selfie &amp; face scan:</strong> deleted 90 days after verification. Only the pass/fail result is kept.</li>
          <li><strong className="text-ink">Payments &amp; transaction records:</strong> 6 years, as Nigerian financial law requires.</li>
        </ul>
        <p className="mt-3 text-xs text-ink-400">To see, correct or export your data, email privacy@modelclic.com — we reply within 30 days.</p>
      </section>

      <section className="card card-pad mt-5 border-vermilion-100">
        <h2 className="t-h3 text-vermilion-700">Withdraw consent &amp; delete my account</h2>
        <p className="t-small mt-1">This closes your account and deletes your personal data within 30 days. Payment records are kept for 6 years by law. Pay owed to you for completed work is still paid out.</p>
        <ActionForm action={requestAccountDeletion} className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div><label className="label" htmlFor="reason">Reason <span className="font-normal text-ink-400">(optional)</span></label><input id="reason" name="reason" className="field" /></div>
          <div><label className="label" htmlFor="confirm">Type DELETE</label><input id="confirm" name="confirm" autoComplete="off" className="field" /></div>
          <SubmitButton className="btn btn-danger" pendingLabel="Sending…">Delete my account</SubmitButton>
        </ActionForm>
      </section>
    </>
  );
}
