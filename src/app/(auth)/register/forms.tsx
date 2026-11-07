"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock, Mail, ShieldCheck } from "lucide-react";
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

function Or({ label = "or" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-semibold text-ink-300">
      <span className="h-px flex-1 bg-line-soft" />{label}<span className="h-px flex-1 bg-line-soft" />
    </div>
  );
}

const maxDob = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
};

type Step = { label: string; title: string; body: React.ReactNode };

/** Step dots + labels. Step 0 is always "Consent". */
function Progress({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-start gap-2" aria-label={`Step ${current + 1} of ${labels.length}`}>
      {labels.map((l, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <li key={l} className="flex min-w-0 flex-1 flex-col gap-1.5" aria-current={on ? "step" : undefined}>
            <span className={`h-1.5 rounded-full transition-colors ${done || on ? "bg-ink" : "bg-ice-200"}`} />
            <span className={`flex items-center gap-1 truncate text-[11px] font-semibold whitespace-nowrap ${on ? "text-ink" : done ? "text-ink-500" : "max-sm:sr-only text-ink-300"}`}>
              {done && <Check className="size-3" aria-hidden />}
              {l}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Sign-up in short steps. Step 1 is consent (and the Google shortcut); the rest are
 * slices of one form, so every value is still submitted together at the end.
 */
function StepSignup({
  role,
  action,
  steps,
  submitLabel,
}: {
  role: "talent" | "host";
  action: typeof registerTalent;
  steps: Step[];
  submitLabel: string;
}) {
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(0); // 0 = consent, 1..n = steps[i-1]
  const formRef = useRef<HTMLFormElement>(null);
  const last = steps.length;
  const labels = ["Consent", ...steps.map((s) => s.label)];

  const validStep = () => {
    const box = formRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (!box) return true;
    const fields = Array.from(box.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select, textarea"));
    const bad = fields.find((f) => !f.checkValidity());
    if (bad) {
      bad.reportValidity();
      return false;
    }
    return true;
  };
  const go = (n: number) => {
    setStep(n);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-step="${n}"] input, [data-step="${n}"] select`)?.focus());
  };
  const next = () => validStep() && go(step + 1);

  return (
    <>
      <Progress labels={labels} current={step} />

      {step === 0 && (
        <div>
          <ConsentBlock agreed={agreed} onChange={setAgreed} />
          <div className="mt-5">
            <GoogleButton role={role} next={`/${role}/verify`} label="Continue with Google" consent={agreed} disabled={!agreed} />
          </div>
          <Or label="or sign up with email" />
          <button type="button" onClick={() => go(1)} disabled={!agreed} className="btn btn-ink btn-lg w-full disabled:opacity-50">
            <Mail className="size-4" aria-hidden /> Continue with email
          </button>
          {!agreed && <p className="mt-2 text-center text-xs text-ink-400">Tick the consent box to continue.</p>}
        </div>
      )}

      <div ref={(el) => { if (el) formRef.current = el.querySelector("form"); }} className={step === 0 ? "hidden" : undefined}>
        <ActionForm action={action} className="space-y-4">
          <input type="hidden" name="consent" value={agreed ? "1" : ""} />
          <input type="hidden" name="consent_version" value={CONSENT_VERSION} />
          {steps.map((s, i) => (
            <div key={s.label} data-step={i + 1} hidden={step !== i + 1} className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight">{s.title}</h2>
              {s.body}
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => go(step - 1)} className="btn btn-secondary btn-lg" aria-label="Back">
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            {step < last ? (
              <button type="button" onClick={next} className="btn btn-ink btn-lg flex-1">
                Next <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <SubmitButton className="btn btn-ink btn-lg flex-1" pendingLabel="Creating account…" disabled={!agreed}>
                {submitLabel}
              </SubmitButton>
            )}
          </div>
          {/* Enter on an earlier step moves forward instead of submitting */}
          <EnterToNext active={step < last} onNext={next} />
        </ActionForm>
      </div>
    </>
  );
}

/** Captures Enter inside the form on non-final steps. */
function EnterToNext({ active, onNext }: { active: boolean; onNext: () => void }) {
  return (
    <span
      hidden
      ref={(el) => {
        const form = el?.closest("form") as (HTMLFormElement & { __enter?: (e: KeyboardEvent) => void }) | null;
        if (!form) return;
        if (form.__enter) form.removeEventListener("keydown", form.__enter);
        form.__enter = (e: KeyboardEvent) => {
          if (active && e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            onNext();
          }
        };
        form.addEventListener("keydown", form.__enter);
      }}
    />
  );
}

const PasswordPair = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    <Field label="Password" htmlFor="password"><PasswordInput autoComplete="new-password" /></Field>
    <Field label="Confirm password" htmlFor="confirm"><PasswordInput name="confirm" autoComplete="new-password" /></Field>
  </div>
);

export function TalentRegisterForm() {
  return (
    <StepSignup
      role="talent"
      action={registerTalent}
      submitLabel="Create account"
      steps={[
        {
          label: "About you",
          title: "Tell us about you",
          body: (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" htmlFor="first_name"><input id="first_name" name="first_name" required autoComplete="given-name" className="field" /></Field>
                <Field label="Last name" htmlFor="last_name"><input id="last_name" name="last_name" required autoComplete="family-name" className="field" /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date of birth" htmlFor="dob" hint="You must be 18 or older."><input id="dob" name="dob" type="date" required max={maxDob()} className="field" /></Field>
                <Field label="Gender" htmlFor="gender">
                  <select id="gender" name="gender" required className="field" defaultValue="">
                    <option value="" disabled>Select</option>
                    {GENDERS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
            </>
          ),
        },
        {
          label: "Login",
          title: "How you'll log in",
          body: (
            <>
              <Field label="Phone number" htmlFor="phone"><input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="080X XXX XXXX" className="field" /></Field>
              <Field label="Email address" htmlFor="email"><input id="email" name="email" type="email" required autoComplete="email" placeholder="ada@email.com" className="field" /></Field>
              <PasswordPair />
            </>
          ),
        },
      ]}
    />
  );
}

export function HostRegisterForm() {
  return (
    <StepSignup
      role="host"
      action={registerHost}
      submitLabel="Create host account"
      steps={[
        {
          label: "About you",
          title: "Who's hiring?",
          body: (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" htmlFor="first_name"><input id="first_name" name="first_name" required autoComplete="given-name" className="field" /></Field>
                <Field label="Last name" htmlFor="last_name"><input id="last_name" name="last_name" required autoComplete="family-name" className="field" /></Field>
              </div>
              <Field label="Email" htmlFor="email"><input id="email" name="email" type="email" required autoComplete="email" className="field" /></Field>
              <Field label="Phone" htmlFor="phone"><input id="phone" name="phone" type="tel" required autoComplete="tel" className="field" /></Field>
            </>
          ),
        },
        {
          label: "Business",
          title: "Your business",
          body: (
            <>
              <Field label="Company / organisation name" htmlFor="company" hint="Leave blank if you're hiring as an individual.">
                <input id="company" name="company" autoComplete="organization" className="field" />
              </Field>
              <Field label="Registered name" htmlFor="registered_name" hint="Legal name on file with CAC, if applicable.">
                <input id="registered_name" name="registered_name" className="field" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CAC number" htmlFor="cac"><input id="cac" name="cac" placeholder="If registered" className="field" /></Field>
                <Field label="NIN" htmlFor="nin"><input id="nin" name="nin" inputMode="numeric" pattern="\d{11}" maxLength={11} placeholder="11 digits" className="field" /></Field>
              </div>
            </>
          ),
        },
        {
          label: "Location",
          title: "Where you're based",
          body: (
            <>
              <Field label="Business address" htmlFor="address"><input id="address" name="address" autoComplete="street-address" className="field" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="State" htmlFor="state">
                  <select id="state" name="state" required className="field" defaultValue="">
                    <option value="" disabled>Select</option>
                    {NG_STATES.map((st) => <option key={st}>{st}</option>)}
                  </select>
                </Field>
                <Field label="City" htmlFor="city"><input id="city" name="city" required className="field" /></Field>
              </div>
            </>
          ),
        },
        {
          label: "Password",
          title: "Secure your account",
          body: <PasswordPair />,
        },
      ]}
    />
  );
}
