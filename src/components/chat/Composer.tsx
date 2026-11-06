"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/actions/account";
import { useToast } from "@/components/ui/Toast";

export function Composer({ conversation, quick }: { conversation: string; quick: string[] }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const ref = useRef<HTMLTextAreaElement>(null);
  // light polling for new messages
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(t);
  }, [router]);
  const send = (body: string) => {
    if (!body.trim()) return;
    const fd = new FormData();
    fd.set("conversation", conversation);
    fd.set("body", body);
    start(async () => {
      const r = await sendMessage(undefined, fd);
      if (r.ok) { setText(""); router.refresh(); ref.current?.focus(); }
      else toast(r.error ?? "Message not sent", "error");
    });
  };
  return (
    <div className="border-t border-line-soft bg-white p-3">
      {quick.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {quick.map((q) => <button key={q} type="button" onClick={() => send(q)} disabled={pending} className="chip shrink-0">{q}</button>)}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          rows={1}
          placeholder="Write a message…"
          aria-label="Message"
          className="field max-h-32 min-h-11 resize-none"
        />
        <button disabled={pending || !text.trim()} className="btn btn-primary shrink-0" aria-label="Send"><Send className="size-4" /> <span className="hidden sm:inline">Send</span></button>
      </form>
    </div>
  );
}
