import type { Metadata } from "next";
import { requireUser, getPrivate } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { KycBadge } from "@/components/ui/kit";
import { updateAccount } from "@/app/actions/account";
import { NG_STATES } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };

export default async function AccountSettings() {
  const { profile } = await requireUser(["talent", "host"]);
  const priv = await getPrivate(profile.id);
  return (
    <>
      <h1 className="t-h1">Account</h1>
      <p className="t-sub mt-1">Your personal details. Contact details are never shown to other members.</p>
      <ActionForm action={updateAccount} className="card card-pad mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-ice-50 p-3 text-sm">
          <span>Identity: <strong>{profile.role === "host" ? "Business" : "Talent"} check</strong></span>
          <KycBadge status={profile.role === "host" ? profile.host_kyc : profile.kyc} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="first_name">First name</label><input id="first_name" name="first_name" defaultValue={profile.first_name} required className="field" /></div>
          <div><label className="label" htmlFor="last_name">Last name</label><input id="last_name" name="last_name" defaultValue={profile.last_name} className="field" /></div>
          {profile.role === "host" && <div className="sm:col-span-2"><label className="label" htmlFor="company_name">Company / organisation</label><input id="company_name" name="company_name" defaultValue={profile.company_name ?? ""} className="field" /></div>}
          <div><label className="label" htmlFor="email">Email</label><input id="email" value={priv?.email ?? ""} disabled className="field opacity-70" /></div>
          <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" defaultValue={priv?.phone ?? ""} className="field" /></div>
          <div><label className="label" htmlFor="state">State</label><select id="state" name="state" defaultValue={profile.state ?? "Lagos"} className="field">{NG_STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="label" htmlFor="city">City</label><input id="city" name="city" defaultValue={profile.city ?? ""} className="field" /></div>
          {profile.role === "host" && <div className="sm:col-span-2"><label className="label" htmlFor="address">Business address</label><input id="address" name="address" defaultValue={priv?.address ?? ""} className="field" /></div>}
        </div>
        <div className="flex justify-end"><SubmitButton className="btn btn-ink" pendingLabel="Saving…">Save changes</SubmitButton></div>
      </ActionForm>
    </>
  );
}
