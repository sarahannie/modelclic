"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllRead } from "@/app/actions/account";

export function MarkAllRead() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button disabled={pending} onClick={() => start(async () => { await markAllRead(); router.refresh(); })} className="btn btn-secondary">
      Mark all read
    </button>
  );
}
