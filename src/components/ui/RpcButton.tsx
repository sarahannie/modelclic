"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { runRpc } from "@/app/actions/rpc";
import { useToast } from "./Toast";

/** A button that runs one database action, shows a toast and refreshes the page. */
export function RpcButton({
  fn,
  args,
  success,
  confirm,
  className = "btn btn-primary",
  children,
  redirectTo,
  disabled,
}: {
  fn: string;
  args: Record<string, unknown>;
  success?: string;
  confirm?: string;
  className?: string;
  children: React.ReactNode;
  redirectTo?: string;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      disabled={pending || disabled}
      aria-busy={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const r = await runRpc(fn, args, success);
          if (!r.ok) toast(r.error ?? "Something went wrong", "error");
          else {
            if (r.message) toast(r.message);
            if (redirectTo) router.push(redirectTo);
            router.refresh();
          }
        });
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
