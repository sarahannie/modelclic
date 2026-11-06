"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "@/app/actions/rpc";
import { useToast } from "./Toast";

/** Runs a bound server action (no form fields) with a toast. */
export function ActButton({
  action,
  className = "btn btn-sm btn-secondary",
  confirm,
  children,
  title,
}: {
  action: () => Promise<ActionResult>;
  className?: string;
  confirm?: string;
  children: React.ReactNode;
  title?: string;
}) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      title={title}
      className={className}
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const r = await action();
          if (!r.ok) toast(r.error ?? "Something went wrong", "error");
          else {
            if (r.message) toast(r.message);
            router.refresh();
          }
        });
      }}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
