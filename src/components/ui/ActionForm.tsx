"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/actions/rpc";
import { useToast } from "./Toast";

/** Wraps a server action (prev, formData) => ActionResult with toasts + inline error. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  inlineError = true,
  redirectTo,
}: {
  action: (prev: ActionResult | undefined, fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  inlineError?: boolean;
  redirectTo?: string;
}) {
  const [state, run] = useActionState(action, undefined);
  const toast = useToast();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      if (state.message) toast(state.message);
      if (resetOnSuccess) ref.current?.reset();
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } else if (!inlineError && state.error) toast(state.error, "error");
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <form ref={ref} action={run} className={className}>
      {children}
      {inlineError && state && !state.ok && state.error && (
        <p role="alert" className="mt-3 rounded-xl bg-vermilion-50 px-4 py-3 text-sm font-medium text-vermilion-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
