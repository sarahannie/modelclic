import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PasswordInput } from "../login/LoginForm";
import { resetPassword } from "../actions";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPassword() {
  return (
    <AuthShell back={{ href: "/login", label: "Back to login" }}>
      <p className="eyebrow">Step 2 of 2 — New password</p>
      <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.045em]">Choose a new password</h1>
      <p className="mt-1.5 mb-7 text-ink-500">At least 8 characters. You&rsquo;ll be logged in straight after.</p>
      <ActionForm action={resetPassword} className="space-y-4">
        <div><label htmlFor="password" className="label">New password</label><PasswordInput autoComplete="new-password" /></div>
        <div><label htmlFor="confirm" className="label">Confirm password</label><PasswordInput name="confirm" autoComplete="new-password" /></div>
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Saving…">Save password</SubmitButton>
      </ActionForm>
    </AuthShell>
  );
}
