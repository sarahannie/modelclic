import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { changePassword } from "@/app/actions/account";

export const metadata: Metadata = { title: "Password & security" };

export default async function PasswordSettings() {
  await requireUser(["talent", "host"]);
  return (
    <>
      <h1 className="t-h1">Password & security</h1>
      <p className="t-sub mt-1">Use at least 8 characters. If you signed up with Google, you can set a password here too.</p>
      <ActionForm action={changePassword} className="card card-pad mt-6 space-y-4" resetOnSuccess>
        <div><label className="label" htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="field" /></div>
        <div><label className="label" htmlFor="confirm">Confirm new password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="field" /></div>
        <div className="flex justify-end"><SubmitButton className="btn btn-ink" pendingLabel="Saving…">Change password</SubmitButton></div>
      </ActionForm>
      <div className="card card-pad mt-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-bold">Sign out everywhere</p><p className="t-small">Signs you out on this device.</p></div>
        <form action="/auth/signout" method="post"><button className="btn btn-danger">Sign out</button></form>
      </div>
    </>
  );
}
