import Link from "next/link";
import { Lock, Search } from "lucide-react";
import { Avatar } from "@/components/shell/AppChrome";
import { clock } from "@/lib/format";
import type { Thread } from "./data";

export function Inbox({ threads, active, base = "/messages", children, q }: { threads: Thread[]; active?: string; base?: string; children: React.ReactNode; q?: string }) {
  const list = q ? threads.filter((t) => (t.title + t.sub).toLowerCase().includes(q.toLowerCase())) : threads;
  return (
    <div className="card grid h-[calc(100dvh-180px)] min-h-[520px] overflow-hidden md:grid-cols-[320px_1fr]">
      <aside className={`flex min-h-0 flex-col border-r border-line-soft ${active ? "hidden md:flex" : "flex"}`}>
        <div className="border-b border-line-soft p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-[-0.03em]">Messages</h1>
            <span className="badge badge-ice"><Lock className="size-3" /> Private</span>
          </div>
          <form className="relative mt-3">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Search conversations" aria-label="Search conversations" className="field min-h-10 py-2 pl-9 text-sm" />
          </form>
        </div>
        <ul className="scroll-thin flex-1 overflow-y-auto p-2">
          {list.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-400">No conversations yet.</li>}
          {list.map((t) => (
            <li key={t.id}>
              <Link href={`${base}/${t.id}`} aria-current={t.id === active ? "page" : undefined} className={`flex gap-3 rounded-xl p-3 transition ${t.id === active ? "bg-ice-100" : "hover:bg-ice-50"}`}>
                {t.kind === "support" && !t.avatar ? <span className="grid size-11 shrink-0 place-items-center rounded-full bg-vermilion text-sm font-extrabold text-white">MC</span> : <Avatar name={t.title} src={t.avatar} size={44} />}
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2"><span className="truncate font-bold">{t.title}</span>{t.last && <span className="shrink-0 text-[11px] text-ink-400">{clock(t.last.created_at)}</span>}</span>
                  <span className="flex items-center gap-2"><span className={`flex-1 truncate text-[13px] ${t.unread ? "font-semibold text-ink" : "text-ink-500"}`}>{t.last?.body ?? t.sub}</span>{t.unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-vermilion px-1 text-[10px] font-bold text-white">{t.unread}</span>}</span>
                  <span className="block truncate text-[11px] text-ink-400">{t.sub}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="border-t border-line-soft px-4 py-3 text-xs text-ink-400">Chats with hosts open once you’re booked.</p>
      </aside>
      <section className={`min-h-0 flex-col ${active ? "flex" : "hidden md:flex"}`}>{children}</section>
    </div>
  );
}
