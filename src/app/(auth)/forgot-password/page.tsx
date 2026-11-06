import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { forgotPassword } from "../actions";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPassword() {
  return (
    <AuthShell back={{ href: "/login", label: "Back to login" }}>
      <p className="eyebrow">Step 1 of 2 — Reset password</p>
      <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.045em]">Reset your password</h1>
      <p className="mt-1.5 mb-7 text-ink-500">Enter the email on your account. We&rsquo;ll send you a secure reset link.</p>
      <ActionForm action={forgotPassword} className="space-y-4" resetOnSuccess>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="e.g. ada@email.com" className="field" />
        </div>
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Sending…">Send reset link</SubmitButton>
      </ActionForm>
    </AuthShell>
  );
}
