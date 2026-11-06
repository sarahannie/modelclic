"use client";

import Link from "next/link";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field } from "@/components/ui/kit";
import { GENDERS, NG_STATES } from "@/lib/constants";
import { PasswordInput } from "../login/LoginForm";
import { GoogleButton } from "../GoogleButton";
import { registerHost, registerTalent } from "../actions";

function Agree() {
  return (
    <p className="text-[13px] leading-relaxed text-ink-500">
      By creating an account you agree to ModelClic&rsquo;s{" "}
      <Link href="/legal/terms" className="font-semibold text-ink underline decoration-ice-400 underline-offset-2">Terms of Service</Link>,{" "}
      <Link href="/legal/guidelines" className="font-semibold text-ink underline decoration-ice-400 underline-offset-2">Community Guidelines</Link> and{" "}
      <Link href="/legal/privacy" className="font-semibold text-ink underline decoration-ice-400 underline-offset-2">Privacy Policy</Link>.
    </p>
  );
}

function Or() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-semibold text-ink-300">
      <span className="h-px flex-1 bg-line-soft" />or sign up with email<span className="h-px flex-1 bg-line-soft" />
    </div>
  );
}

const maxDob = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
};

export function TalentRegisterForm() {
  return (
    <>
      <GoogleButton role="talent" next="/talent/verify" label="Sign up with Google" />
      <Or />
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
        <Agree />
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Creating account…">Create account</SubmitButton>
      </ActionForm>
    </>
  );
}

export function HostRegisterForm() {
  return (
    <>
      <GoogleButton role="host" next="/host/verify" label="Sign up with Google" />
      <Or />
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
        <Agree />
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Creating account…">Create host account</SubmitButton>
      </ActionForm>
    </>
  );
}
