import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BackLink } from "@/components/ui/BackLink";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { staffLogin } from "../(auth)/actions";
import { PasswordInput } from "../(auth)/login/LoginForm";
import { demoMode } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Admin console", robots: { index: false } };

export default function StaffLogin() {
  return (
    <div className="grain relative isolate grid min-h-dvh place-items-center bg-ink px-4 py-10">
      <div aria-hidden className="absolute top-[-20%] left-[-10%] -z-10 size-[40rem] rounded-full bg-[radial-gradient(closest-side,var(--color-ice-500),transparent)] opacity-30" />
      <div aria-hidden className="absolute right-[-10%] bottom-[-25%] -z-10 size-[36rem] rounded-full bg-[radial-gradient(closest-side,var(--color-vermilion),transparent)] opacity-25" />
      <div className="w-full max-w-[400px]">
        <div className="mb-5"><BackLink href="/" onDark>Back to site</BackLink></div>
        <div className="rounded-[1.5rem] bg-white p-8 shadow-2xl shadow-black/40">
          <Logo href={null} />
          <h1 className="mt-7 text-[28px] font-extrabold tracking-[-0.04em]">Admin console</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500"><ShieldCheck className="size-4 text-vermilion-700" /> Staff sign-in. Every action is logged.</p>
          <ActionForm action={staffLogin} className="mt-6 space-y-3">
            <input name="email" type="email" required={!demoMode} placeholder="Staff email" aria-label="Staff email" autoComplete="username" className="field" />
            {demoMode ? <input name="password" type="password" placeholder="Password" aria-label="Password" className="field" /> : <PasswordInput placeholder="Password" />}
            <SubmitButton className="btn btn-ink w-full" pendingLabel="Signing in…">Sign in</SubmitButton>
          </ActionForm>
          {demoMode && <p className="mt-4 text-center text-xs text-ink-400">Demo mode: press Sign in to open the console with sample data.</p>}
        </div>
      </div>
    </div>
  );
}
