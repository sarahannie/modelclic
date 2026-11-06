"use client";

import { useActionState, useState } from "react";
import { BriefcaseBusiness, Sparkles } from "lucide-react";
import { signup } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { CITIES } from "@/lib/types";

const roles = [
  { value: "talent", label: "I want to work", hint: "Talent", icon: Sparkles },
  { value: "host", label: "I want to hire", hint: "Event host", icon: BriefcaseBusiness },
] as const;

export function SignupForm({ initialRole }: { initialRole: "talent" | "host" }) {
  const [state, action] = useActionState(signup, undefined);
  const [role, setRole] = useState(initialRole);

  return (
    <form action={action} className="space-y-5">
      <fieldset>
        <legend className="label">I&rsquo;m joining to…</legend>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ value, label, hint, icon: Icon }) => {
            const active = role === value;
            return (
              <label
                key={value}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={active}
                  onChange={() => setRole(value)}
                  className="sr-only"
                />
                <Icon className={`size-5 ${active ? "text-vermilion" : "text-ink-500"}`} aria-hidden />
                <span className="mt-3 block font-semibold">{label}</span>
                <span className={`text-xs ${active ? "text-white/60" : "text-ink-500"}`}>{hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="full_name" className="label">
          {role === "host" ? "Your name or business name" : "Full name"}
        </label>
        <input id="full_name" name="full_name" autoComplete="name" required className="field" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label">Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="080…" required className="field" />
        </div>
        <div>
          <label htmlFor="city" className="label">City</label>
          <select id="city" name="city" className="field" defaultValue="Lagos">
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="field" />
        <p className="mt-1.5 text-xs text-ink-500">At least 8 characters.</p>
      </div>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-vermilion-50 px-4 py-3 text-sm text-vermilion-700">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
    </form>
  );
}
