"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const STEPS = {
  talent: [
    ["Create & verify", "Sign up free, then pass a quick NIN, selfie and liveness check."],
    ["Bid on shifts", "Browse jobs near you and bid with points. Hosts reply within a day."],
    ["Work & get paid", "Check in with your shift pass. Pay lands in your wallet after the event."],
  ],
  host: [
    ["Post your event", "Add the date, venue, roles and pay. We review it within 4 hours."],
    ["Pick verified staff", "Compare bids, ratings and photos — or invite talent directly."],
    ["Pay through escrow", "Fund once. Staff are paid only after the job is done."],
  ],
} as const;

export function HowItWorks() {
  const [side, setSide] = useState<"talent" | "host">("talent");
  return (
    <div className="mt-10">
      <div className="inline-flex rounded-full border border-line bg-ice-50 p-1" role="tablist">
        {(["talent", "host"] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={side === s}
            onClick={() => setSide(s)}
            className={`min-h-10 rounded-full px-5 text-sm font-bold transition ${side === s ? "bg-ink text-white shadow" : "text-ink-500 hover:text-ink"}`}
          >
            {s === "talent" ? "For talent" : "For hosts"}
          </button>
        ))}
      </div>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {STEPS[side].map(([t, b], i) => (
          <li key={t} className="relative border-t-2 border-ink pt-6">
            <span className="num absolute -top-[15px] left-0 grid size-7 place-items-center rounded-full bg-vermilion text-xs font-extrabold text-white">{i + 1}</span>
            <h3 className="text-xl font-extrabold tracking-[-0.025em]">{t}</h3>
            <p className="mt-2 text-ink-500">{b}</p>
          </li>
        ))}
      </ol>
      <Link href={side === "talent" ? "/register/talent" : "/register/host"} className="btn btn-ink mt-10">
        {side === "talent" ? "Start working" : "Start hiring"} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
