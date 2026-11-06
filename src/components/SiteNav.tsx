import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/jobs", label: "Jobs" },
  { href: "/#safety", label: "Safety" },
];

/** Glass navigation — floats over the dark hero, stays readable on light pages. */
export function SiteNav({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`${dark ? "absolute inset-x-0" : "sticky"} top-0 z-50 px-4 pt-4`}>
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pr-2 pl-4 ${
          dark ? "glass-dark" : "glass shadow-(--shadow-soft)"
        }`}
      >
        <Logo dark={dark} />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  dark ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-ink-700 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className={`btn btn-sm ${dark ? "text-white/85 hover:bg-white/10 hover:text-white" : "btn-ghost"}`}
          >
            Log in
          </Link>
          <Link href="/signup" className="btn btn-sm btn-primary">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
