"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-vermilion-50 px-4 py-3 text-sm text-vermilion-700">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
    </form>
  );
}
