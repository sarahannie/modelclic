"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NavGlyph } from "./icons";
import { ADMIN_NAV } from "@/lib/nav";
import { initials } from "@/lib/format";

export function AdminChrome({
  name,
  title,
  avatar,
  counts,
  demo,
  children,
}: {
  name: string;
  title: string | null;
  avatar: string | null;
  counts: Record<string, number>;
  demo: boolean;
  children: React.ReactNode;
}) {
  const tab = useSearchParams().get("tab") ?? "verification";
  const all = ADMIN_NAV.flatMap((s) => s.items);
  const current = all.find((i) => i.tab === tab) ?? all[0];
  const urgent = (counts.sos ?? 0) > 0;

  return (
    <div className="min-h-dvh bg-ice-50">
      {demo && (
        <div className="bg-ink px-4 py-1.5 text-center text-xs font-semibold text-white/80">
          Demo mode — sample data, nothing is saved permanently. <Link href="/demo" className="underline decoration-vermilion underline-offset-2">Switch role</Link>
        </div>
      )}
      <div className="md:grid md:grid-cols-[256px_1fr] md:bg-[linear-gradient(to_right,var(--color-ink)_256px,transparent_256px)]">
        <aside className="sticky top-0 hidden h-dvh flex-col bg-ink px-3 pt-5 pb-4 text-white md:flex">
          <div className="px-2"><Logo onDark href="/admin" /></div>
          <nav className="mt-7 flex-1 space-y-6 overflow-y-auto" aria-label="Admin">
            {ADMIN_NAV.map((sec) => (
              <div key={sec.section}>
                <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.16em] text-white/40 uppercase">{sec.section}</p>
                <ul className="space-y-0.5">
                  {sec.items.map((it) => {
                    const on = it.tab === current.tab;
                    const c = counts[it.tab];
                    return (
                      <li key={it.tab}>
                        <Link
                          href={it.href}
                          aria-current={on ? "page" : undefined}
                          className={`relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                            on ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {on && <span className="absolute top-2 bottom-2 -left-3 w-1 rounded-r bg-vermilion" />}
                          <NavGlyph name={it.icon} className="size-[18px]" />
                          <span className="flex-1">{it.label}</span>
                          {c ? (
                            <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${it.tab === "sos" ? "bg-vermilion text-white" : "bg-white/15 text-white"}`}>{c}</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="glass-dark mt-4 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="size-9 rounded-full object-cover" />
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-ice text-xs font-extrabold text-ink">{initials(name)}</span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{name}</p>
                <p className="truncate text-xs text-white/55">{title ?? "Staff"}</p>
              </div>
            </div>
            <form action="/auth/signout" method="post" className="mt-2">
              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-vermilion-100 hover:bg-white/10">
                <LogOut className="size-3.5" /> Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-xl md:px-8">
            <p className="text-sm text-ink-400">
              Admin <span className="mx-1 text-ink-200">/</span> <span className="font-bold text-ink">{current.label}</span>
            </p>
            <div className="flex items-center gap-3">
              <span className={`badge ${urgent ? "badge-red" : "badge-ice"}`}>
                <span className={`size-1.5 rounded-full ${urgent ? "bg-vermilion" : "bg-ink"}`} />
                {urgent ? `${counts.sos} active SOS` : "All systems normal"}
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-ink text-xs font-extrabold text-white">{initials(name)}</span>
            </div>
          </header>
          {/* Mobile tab strip */}
          <nav className="flex gap-1.5 overflow-x-auto border-b border-line bg-white px-3 py-2 md:hidden" aria-label="Admin sections">
            {all.map((it) => (
              <Link key={it.tab} href={it.href} aria-current={it.tab === current.tab ? "page" : undefined} className="chip shrink-0">
                {it.short}{counts[it.tab] ? ` · ${counts[it.tab]}` : ""}
              </Link>
            ))}
          </nav>
          <main className="px-4 py-7 md:px-8 md:py-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
