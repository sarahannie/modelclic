"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deleteDraft, setEventStatus } from "@/app/actions/host";
import { useToast } from "./Toast";

export function EventStatusButton({ id, to, label, className = "btn btn-sm btn-secondary", confirm }: { id: string; to: "pending" | "cancelled" | "completed"; label: string; className?: string; confirm?: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => { const r = await setEventStatus(id, to); toast(r.ok ? r.message! : r.error!, r.ok ? "ok" : "error"); router.refresh(); });
      }}
    >
      {pending && <Loader2 className="size-4 animate-spin" />} {label}
    </button>
  );
}

export function DeleteDraftButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className="btn btn-sm btn-ghost" onClick={() => { if (window.confirm("Delete this draft?")) start(async () => { await deleteDraft(id); }); }}>
      Delete draft
    </button>
  );
}
