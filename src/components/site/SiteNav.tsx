"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#why", label: "Why ModelClic" },
  { href: "/jobs", label: "Jobs" },
  { href: "/#faq", label: "FAQ" },
];

/** Floats over the dark hero as glass; turns solid white once you scroll. */
export function SiteNav({ overDark = false, signedIn = false }: { overDark?: boolean; signedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(!overDark);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!overDark) return;
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [overDark]);
  const dark = overDark && !scrolled && !open;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl py-2.5 pr-2.5 pl-3.5 transition-colors duration-300 ${
          dark ? "border border-white/10 bg-ink/30 backdrop-blur-xl" : "glass shadow-(--shadow-soft)"
        }`}
        aria-label="Main"
      >
        <Logo onDark={dark} size={38} />
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-[14.5px] font-semibold transition ${
                  dark ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-ink-600 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5">
          {signedIn ? (
            <Link href="/app" className="btn btn-sm btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className={`btn btn-sm hidden sm:inline-flex ${dark ? "text-white hover:bg-white/10" : "btn-ghost"}`}>Log in</Link>
              <Link href="/register" className="btn btn-sm btn-primary">Get started</Link>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className={`grid size-10 place-items-center rounded-xl lg:hidden ${dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5"}`}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-2 shadow-(--shadow-lift) lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-ink hover:bg-ice-50">
              {l.label}
            </Link>
          ))}
          {!signedIn && (
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-ink hover:bg-ice-50">Log in</Link>
          )}
        </div>
      )}
    </header>
  );
}
