"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field } from "@/components/ui/kit";
import { GENDERS, NG_STATES } from "@/lib/constants";
import { PasswordInput } from "../login/LoginForm";
import { GoogleButton } from "../GoogleButton";
import { registerHost, registerTalent } from "../actions";

export const CONSENT_VERSION = "2026-11-06";

const RETENTION: [string, string][] = [
  ["Account & profile", "While your account is open; deleted within 30 days of closing it"],
  ["ID photo, selfie & face scan", "Deleted 90 days after verification (only the pass/fail result is kept)"],
  ["Payments & transaction records", "6 years, as Nigerian financial law requires"],
];

const legal = "font-semibold text-ink underline decoration-ice-400 underline-offset-2";

/** Explicit consent + plain-language retention periods (NDPA 2023). Required before any sign-up. */
export function ConsentBlock({ agreed, onChange }: { agreed: boolean; onChange: (v: boolean) => void }) {
  return (
    <section aria-labelledby="consent-title" className="rounded-2xl border border-line bg-ice-50/80 p-4">
      <p id="consent-title" className="flex items-center gap-2 text-sm font-bold">
        <ShieldCheck className="size-4 text-vermilion-700" aria-hidden /> Your data &amp; consent
      </p>
      <p className="mt-1 text-[13px] text-ink-500">We use your details to verify you, run bookings and payments, and keep everyone safe. We never sell your data.</p>
      <ul className="mt-3 divide-y divide-line-soft rounded-xl border border-line-soft bg-white text-[13px]">
        {RETENTION.map(([what, how]) => (
          <li key={what} className="flex gap-3 px-3 py-2.5">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden />
            <span><strong className="font-semibold text-ink">{what}:</strong> <span className="text-ink-600">{how}</span></span>
          </li>
        ))}
      </ul>
      <label className="mt-3 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink-700">
        <input
          type="checkbox"
          name="consent"
          value="1"
          required
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-[18px] shrink-0 accent-[#0e1a2b]"
        />
        <span>
          I agree to the <Link href="/legal/terms" target="_blank" className={legal}>Terms</Link>,{" "}
          <Link href="/legal/guidelines" target="_blank" className={legal}>Community Guidelines</Link> and{" "}
          <Link href="/legal/privacy" target="_blank" className={legal}>Privacy Policy</Link>, and I consent to ModelClic processing my
          personal data as described above. I can withdraw consent or delete my account at any time in Settings.
        </span>
      </label>
    </section>
  );
}

function Or() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-semibold text-ink-300">
      <span className="h-px flex-1 bg-line-soft" />or<span className="h-px flex-1 bg-line-soft" />
    </div>
  );
}

const maxDob = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
};

export function TalentRegisterForm() {
  const [agreed, setAgreed] = useState(false);
  return (
    <>
      <ActionForm action={registerTalent} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="first_name"><input id="first_name" name="first_name" required autoComplete="given-name" className="field" /></Field>
          <Field label="Last name" htmlFor="last_name"><input id="last_name" name="last_name" required autoComplete="family-name" className="field" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="dob"><input id="dob" name="dob" type="date" required max={maxDob()} className="field" /></Field>
          <Field label="Gender" htmlFor="gender">
            <select id="gender" name="gender" required className="field" defaultValue="">
              <option value="" disabled>Select</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Phone number" htmlFor="phone"><input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="080X XXX XXXX" className="field" /></Field>
        <Field label="Email address" htmlFor="email"><input id="email" name="email" type="email" required autoComplete="email" placeholder="ada@email.com" className="field" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password"><PasswordInput autoComplete="new-password" /></Field>
          <Field label="Confirm password" htmlFor="confirm"><PasswordInput name="confirm" autoComplete="new-password" /></Field>
        </div>
        <ConsentBlock agreed={agreed} onChange={setAgreed} />
        <input type="hidden" name="consent_version" value={CONSENT_VERSION} />
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Creating account…" disabled={!agreed}>Create account</SubmitButton>
      </ActionForm>
      <Or />
      <GoogleButton role="talent" next="/talent/verify" label="Sign up with Google" consent={agreed} disabled={!agreed} />
      {!agreed && <p className="mt-2 text-center text-xs text-ink-400">Tick the consent box above to continue.</p>}
    </>
  );
}

export function HostRegisterForm() {
  const [agreed, setAgreed] = useState(false);
  return (
    <>
      <ActionForm action={registerHost} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="first_name"><input id="first_name" name="first_name" required autoComplete="given-name" className="field" /></Field>
          <Field label="Last name" htmlFor="last_name"><input id="last_name" name="last_name" required autoComplete="family-name" className="field" /></Field>
        </div>
        <Field label="Registered name" htmlFor="registered_name" hint="Legal name on file with CAC, if applicable.">
          <input id="registered_name" name="registered_name" className="field" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email"><input id="email" name="email" type="email" required autoComplete="email" className="field" /></Field>
          <Field label="Phone" htmlFor="phone"><input id="phone" name="phone" type="tel" required autoComplete="tel" className="field" /></Field>
        </div>
        <Field label="Company / organisation name" htmlFor="company" hint="Leave blank if you're hiring as an individual.">
          <input id="company" name="company" autoComplete="organization" className="field" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CAC number" htmlFor="cac"><input id="cac" name="cac" placeholder="If registered" className="field" /></Field>
          <Field label="NIN" htmlFor="nin"><input id="nin" name="nin" inputMode="numeric" pattern="\d{11}" maxLength={11} placeholder="11 digits" className="field" /></Field>
        </div>
        <Field label="Business address" htmlFor="address"><input id="address" name="address" autoComplete="street-address" className="field" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="State" htmlFor="state">
            <select id="state" name="state" required className="field" defaultValue="">
              <option value="" disabled>Select</option>
              {NG_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="City" htmlFor="city"><input id="city" name="city" required className="field" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password"><PasswordInput autoComplete="new-password" /></Field>
          <Field label="Confirm password" htmlFor="confirm"><PasswordInput name="confirm" autoComplete="new-password" /></Field>
        </div>
        <ConsentBlock agreed={agreed} onChange={setAgreed} />
        <input type="hidden" name="consent_version" value={CONSENT_VERSION} />
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Creating account…" disabled={!agreed}>Create host account</SubmitButton>
      </ActionForm>
      <Or />
      <GoogleButton role="host" next="/host/verify" label="Sign up with Google" consent={agreed} disabled={!agreed} />
      {!agreed && <p className="mt-2 text-center text-xs text-ink-400">Tick the consent box above to continue.</p>}
    </>
  );
}
