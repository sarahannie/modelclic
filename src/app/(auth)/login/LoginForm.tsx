"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { GoogleButton } from "../GoogleButton";
import { login } from "../actions";

export function PasswordInput({
  name = "password",
  placeholder,
  autoComplete = "current-password",
  id,
}: {
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id ?? name}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={autoComplete === "new-password" ? 8 : undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-ice-50 hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next, initialSide }: { next: string; initialSide: "talent" | "host" }) {
  const [side, setSide] = useState<"talent" | "host">(initialSide);
  return (
    <>
      <div role="tablist" aria-label="Account type" className="mb-6 grid grid-cols-2 rounded-2xl border border-line bg-ice-50 p-1">
        {(
          [
            ["talent", "Student / Talent"],
            ["host", "Event Host"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={side === v}
            onClick={() => setSide(v)}
            className={`min-h-11 rounded-xl text-sm font-bold transition ${
              side === v ? "bg-white text-ink shadow-[0_1px_3px_rgb(14_26_43/0.12)]" : "text-ink-500 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ActionForm action={login} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="side" value={side} />
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="e.g. ada@email.com" className="field" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="label mb-0">Password</label>
            <Link href="/forgot-password" className="text-sm font-bold text-vermilion-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput />
        </div>
        <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </ActionForm>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold text-ink-300"><span className="h-px flex-1 bg-line-soft" />or<span className="h-px flex-1 bg-line-soft" /></div>
      <GoogleButton role={side} next={next} label="Continue with Google" />

      <p className="mt-7 text-center text-sm text-ink-500">
        New to ModelClic?{" "}
        <Link href="/register/talent" className="font-bold text-ink hover:text-vermilion-700">Register as Student</Link>
        <span className="mx-1.5 text-ink-200">·</span>
        <Link href="/register/host" className="font-bold text-ink hover:text-vermilion-700">Register as Event Host</Link>
      </p>
    </>
  );
}
