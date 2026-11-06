import { ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/shell/AppChrome";
import { BackLink } from "@/components/ui/BackLink";
import { clock, dateShort } from "@/lib/format";
import type { Message } from "@/lib/types";
import { Composer } from "./Composer";
import type { Thread } from "./data";

export function ChatPane({ thread, messages, me, back = "/messages", quick }: { thread: Thread; messages: Message[]; me: string; back?: string; quick: string[] }) {
  let lastDay = "";
  return (
    <>
      <header className="flex items-center gap-3 border-b border-line-soft px-4 py-3">
        <span className="md:hidden"><BackLink href={back}>Back</BackLink></span>
        {thread.kind === "support" && !thread.avatar ? <span className="grid size-10 place-items-center rounded-full bg-vermilion text-xs font-extrabold text-white">MC</span> : <Avatar name={thread.title} src={thread.avatar} size={40} />}
        <div className="min-w-0 flex-1"><p className="truncate font-bold">{thread.title}</p><p className="truncate text-xs text-ink-400">{thread.sub}</p></div>
        <span className="badge badge-ice hidden sm:inline-flex"><ShieldCheck className="size-3.5" /> Protected chat</span>
      </header>
      <div className="scroll-thin flex flex-1 flex-col-reverse overflow-y-auto bg-ice-25 px-4 py-4">
        <div className="space-y-2">
          <p className="mx-auto mb-4 max-w-md rounded-xl bg-ice-100 px-4 py-2.5 text-center text-xs text-ink-600">
            Phone numbers, emails and social handles are hidden automatically so every booking stays in-app and safe.
          </p>
          {messages.map((m) => {
            const day = dateShort(m.created_at);
            const showDay = day !== lastDay;
            lastDay = day;
            const mine = m.sender_id === me;
            return (
              <div key={m.id}>
                {showDay && <p className="my-3 text-center text-[11px] font-bold text-ink-400">{day}</p>}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${mine ? "rounded-br-md bg-ink text-white" : "rounded-bl-md border border-line-soft bg-white text-ink"}`}>
                    {m.body}
                    <span className={`mt-0.5 block text-right text-[10px] ${mine ? "text-white/50" : "text-ink-400"}`}>{clock(m.created_at)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Composer conversation={thread.id} quick={quick} />
    </>
  );
}
