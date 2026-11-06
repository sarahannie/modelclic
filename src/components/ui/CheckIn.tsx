"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { runRpc } from "@/app/actions/rpc";
import { useToast } from "./Toast";

export function CheckIn({ bidId }: { bidId: string }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) refs.current[i + 1]?.focus();
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        start(async () => {
          const r = await runRpc("check_in", { p_bid: bidId, p_code: digits.join("") });
          if (r.ok) { toast("You’re checked in. Have a great shift!"); router.refresh(); }
          else setErr(r.error ?? "Check-in failed");
        });
      }}
    >
      <div className="flex justify-center gap-3" onPaste={(e) => { const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4); if (t) { e.preventDefault(); setDigits(t.padEnd(4, " ").split("").map((c) => c.trim())); } }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            className="num size-16 rounded-2xl border-2 border-line bg-white text-center text-3xl font-extrabold outline-none focus:border-ink focus:ring-4 focus:ring-ice"
          />
        ))}
      </div>
      {err && <p role="alert" className="mt-3 text-center text-sm font-semibold text-vermilion-700">{err}</p>}
      <button disabled={pending || digits.join("").length < 4} className="btn btn-ink btn-lg mt-5 w-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Check in
      </button>
    </form>
  );
}
