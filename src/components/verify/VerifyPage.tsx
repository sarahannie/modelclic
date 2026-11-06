import Link from "next/link";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { VerifyForm } from "./VerifyForm";
import type { Kyc } from "@/lib/types";

export function VerifyPage({ side, status, note }: { side: "talent" | "host"; status: Kyc; note?: string | null }) {
  const home = side === "talent" ? "/talent" : "/host";
  return (
    <div className="mx-auto max-w-xl">
      {side === "talent" && <p className="text-[13px] font-semibold text-ink-400">Step 2 of 3 — Verification</p>}
      <h1 className="t-h1 mt-1">{side === "talent" ? "Verify your identity" : "Verify your business"}</h1>
      <p className="t-sub mt-1.5">
        {side === "talent"
          ? "Required before you can bid on events. Your NIN and photos are never shown to event hosts."
          : "Verified hosts get more bids and can post events without extra review."}
      </p>
      <div className="card card-pad mt-6">
        {status === "verified" ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-ink text-white"><BadgeCheck className="size-8" /></span>
            <p className="mt-4 text-xl font-extrabold">You’re verified</p>
            <p className="text-sm text-ink-500">Your badge now shows on your profile.</p>
            <Link href={home} className="btn btn-primary mt-6">{side === "talent" ? "Find jobs" : "Go to events"}</Link>
          </div>
        ) : status === "pending" ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-ice text-ink"><Clock className="size-8" /></span>
            <p className="mt-4 text-xl font-extrabold">Check in progress</p>
            <p className="text-sm text-ink-500">Most checks finish in under 15 minutes. We’ll notify you.</p>
            <Link href={side === "talent" ? "/talent/profile" : "/host"} className="btn btn-ink mt-6">{side === "talent" ? "Continue to your profile" : "Go to events"}</Link>
          </div>
        ) : (
          <>
            {status === "rejected" && (
              <p className="mb-5 rounded-xl bg-vermilion-50 px-4 py-3 text-sm text-vermilion-700"><strong>Your last check didn’t pass.</strong> {note || "Please retake a clear selfie and ID photo."}</p>
            )}
            <VerifyForm side={side} />
          </>
        )}
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-400"><ShieldCheck className="size-3.5" /> Protected under the Nigeria Data Protection Act 2023</p>
    </div>
  );
}
