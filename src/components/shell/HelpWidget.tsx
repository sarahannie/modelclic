"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bot, CircleHelp, Headset, ListChecks, Send, Ticket, X } from "lucide-react";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createTicket } from "@/app/actions/account";
import { FAQ } from "@/lib/constants";

type View = "menu" | "ai" | "ticket";

const answer = (q: string) => {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  let best: (typeof FAQ)[number] | null = null;
  let score = 0;
  for (const f of FAQ) {
    const s = words.filter((w) => (f.q + " " + f.a).toLowerCase().includes(w)).length;
    if (s > score) { score = s; best = f; }
  }
  return best && score > 0 ? best.a : "I couldn’t find that in our quick answers. Talk to a live agent and we’ll help — usually within an hour.";
};

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ from: "you" | "mc"; text: string }[]>([
    { from: "mc", text: "Hi! Ask me about bids, pay, verification or safety." },
  ]);

  return (
    <div className="fixed right-4 bottom-[84px] z-50 md:right-6 md:bottom-6">
      {open && (
        <div className="mb-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-line bg-white shadow-(--shadow-lift)" role="dialog" aria-label="Help">
          <div className="flex items-center gap-2 bg-ink px-4 py-3 text-white">
            {view !== "menu" && (
              <button onClick={() => setView("menu")} className="grid size-7 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Back">
                <ArrowLeft className="size-4" />
              </button>
            )}
            <p className="font-bold">{view === "ai" ? "Quick answers" : view === "ticket" ? "Submit a ticket" : "How can we help?"}</p>
            <button onClick={() => setOpen(false)} className="ml-auto grid size-7 place-items-center rounded-full hover:bg-white/10" aria-label="Close help">
              <X className="size-4" />
            </button>
          </div>

          {view === "menu" && (
            <div className="grid gap-1.5 p-2">
              <HelpItem icon={<Bot className="size-4" />} title="Quick answers" sub="Instant answers to common questions" onClick={() => setView("ai")} />
              <Link href="/messages?support=1" onClick={() => setOpen(false)} className="flex min-h-14 items-center gap-3 rounded-xl px-3 hover:bg-ice-50">
                <span className="grid size-9 place-items-center rounded-lg bg-ice text-ink"><Headset className="size-4" /></span>
                <span><span className="block text-sm font-bold">Talk to a live agent</span><span className="block text-xs text-ink-400">Mon–Sat, 8am–8pm · replies within an hour</span></span>
              </Link>
              <HelpItem icon={<Ticket className="size-4" />} title="Submit a ticket" sub="For anything that needs a follow-up" onClick={() => setView("ticket")} />
              <Link href="/settings/help#tickets" onClick={() => setOpen(false)} className="flex min-h-14 items-center gap-3 rounded-xl px-3 hover:bg-ice-50">
                <span className="grid size-9 place-items-center rounded-lg bg-ice text-ink"><ListChecks className="size-4" /></span>
                <span className="text-sm font-bold">My tickets</span>
              </Link>
            </div>
          )}

          {view === "ai" && (
            <div className="flex h-[340px] flex-col">
              <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-3">
                {chat.map((m, i) => (
                  <p key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === "you" ? "ml-auto bg-ink text-white" : "bg-ice-100 text-ink"}`}>{m.text}</p>
                ))}
              </div>
              <form
                className="flex gap-2 border-t border-line-soft p-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!q.trim()) return;
                  setChat((c) => [...c, { from: "you", text: q }, { from: "mc", text: answer(q) }]);
                  setQ("");
                }}
              >
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a question…" className="field min-h-10 py-2" />
                <button className="btn btn-sm btn-primary" aria-label="Ask"><Send className="size-4" /></button>
              </form>
            </div>
          )}

          {view === "ticket" && (
            <ActionForm action={createTicket} className="grid gap-3 p-4" resetOnSuccess>
              <div>
                <label className="label" htmlFor="t-subject">Subject</label>
                <input id="t-subject" name="subject" required className="field" placeholder="e.g. Payment not received" />
              </div>
              <div>
                <label className="label" htmlFor="t-body">Details</label>
                <textarea id="t-body" name="body" required rows={4} className="field" placeholder="Tell us what happened" />
              </div>
              <SubmitButton pendingLabel="Sending…">Submit ticket</SubmitButton>
            </ActionForm>
          )}
        </div>
      )}
      <button
        onClick={() => { setOpen((o) => !o); setView("menu"); }}
        className="ml-auto flex h-12 items-center gap-2 rounded-full bg-ink px-4 font-bold text-white shadow-(--shadow-lift) transition hover:bg-ink-700"
        aria-expanded={open}
      >
        <CircleHelp className="size-5 text-vermilion" aria-hidden /> Help
      </button>
    </div>
  );
}

function HelpItem({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-14 items-center gap-3 rounded-xl px-3 text-left hover:bg-ice-50">
      <span className="grid size-9 place-items-center rounded-lg bg-ice text-ink">{icon}</span>
      <span><span className="block text-sm font-bold">{title}</span><span className="block text-xs text-ink-400">{sub}</span></span>
    </button>
  );
}
