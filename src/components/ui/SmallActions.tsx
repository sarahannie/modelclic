"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toggleFavorite, toggleSaved } from "@/app/actions/account";
import { withdrawBid } from "@/app/actions/profile";
import { useToast } from "./Toast";

export function SaveButton({ eventId, saved, label = false }: { eventId: string; saved: boolean; label?: boolean }) {
  const [on, setOn] = useState(saved);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => start(async () => { const r = await toggleSaved(eventId, !on); if (r.ok) { setOn(!on); toast(r.message!); } })}
      aria-pressed={on}
      aria-label={on ? "Remove from saved" : "Save job"}
      disabled={pending}
      className={`relative z-10 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition ${on ? "text-vermilion-700" : "text-ink-400 hover:text-ink"}`}
    >
      <Heart className={`size-[18px] ${on ? "fill-vermilion text-vermilion" : ""}`} /> {label && (on ? "Saved" : "Save")}
    </button>
  );
}

export function FavoriteButton({ talentId, fav, className = "" }: { talentId: string; fav: boolean; className?: string }) {
  const [on, setOn] = useState(fav);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => start(async () => { const r = await toggleFavorite(talentId, !on); if (r.ok) { setOn(!on); toast(r.message!); router.refresh(); } })}
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      disabled={pending}
      className={`grid size-9 place-items-center rounded-full bg-white/90 shadow backdrop-blur transition hover:scale-105 ${className}`}
    >
      <Heart className={`size-4 ${on ? "fill-vermilion text-vermilion" : "text-ink"}`} />
    </button>
  );
}

export function WithdrawBidButton({ bidId }: { bidId: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Withdraw this bid? Points aren’t refunded.")) return;
        start(async () => { const r = await withdrawBid(bidId); toast(r.ok ? r.message! : r.error!, r.ok ? "ok" : "error"); router.refresh(); });
      }}
      className="btn btn-xs btn-ghost"
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />} Withdraw
    </button>
  );
}
