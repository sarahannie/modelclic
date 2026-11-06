"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { runRpc } from "@/app/actions/rpc";
import { useToast } from "./Toast";

export function RatingForm({ eventId, rateeId, criteria, done }: { eventId: string; rateeId: string; criteria: readonly string[]; done: string }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const complete = criteria.every((c) => scores[c]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await runRpc("rate_user", { p_event: eventId, p_ratee: rateeId, p_scores: scores, p_comment: comment || null });
          if (r.ok) { toast("Thanks — your rating is saved. It’s revealed once they rate you too."); router.push(done); router.refresh(); }
          else toast(r.error ?? "Couldn’t save rating", "error");
        });
      }}
    >
      <ul className="divide-y divide-line-soft">
        {criteria.map((c) => (
          <li key={c} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="font-semibold">{c}</span>
            <span className="flex gap-1.5" role="radiogroup" aria-label={c}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={scores[c] === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setScores((s) => ({ ...s, [c]: n }))}
                  className={`grid size-10 place-items-center rounded-xl border transition ${(scores[c] ?? 0) >= n ? "border-vermilion bg-vermilion-50" : "border-line bg-white hover:border-ink-300"}`}
                >
                  <Star className={`size-5 ${(scores[c] ?? 0) >= n ? "fill-vermilion text-vermilion" : "text-ink-300"}`} />
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <label className="label mt-4" htmlFor="comment">Comment <span className="font-normal text-ink-400">(optional)</span></label>
      <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="field" placeholder="What went well? What could be better?" />
      <button disabled={!complete || pending} className="btn btn-ink btn-lg mt-5 w-full">Submit rating</button>
    </form>
  );
}
