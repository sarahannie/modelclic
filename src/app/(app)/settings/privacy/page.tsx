import type { Metadata } from "next";
import { requireUser, getPrivate } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Toggle } from "@/components/ui/kit";
import { updatePrivacy } from "@/app/actions/account";

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
    </>
  );
}
