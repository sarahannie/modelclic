import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SUPPORT_EMAIL } from "@/lib/constants";

const cols = [
  { title: "Product", links: [["How it works", "/#how"], ["Safety", "/#why"], ["Jobs", "/jobs"], ["FAQ", "/#faq"]] },
  { title: "Get started", links: [["Join as talent", "/register/talent"], ["Hire staff", "/register/host"], ["Log in", "/login"]] },
  { title: "Legal", links: [["Terms", "/legal/terms"], ["Privacy", "/legal/privacy"], ["Community Guidelines", "/legal/guidelines"]] },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm text-white/60">Part-time event jobs for students and talent, with verified hosts and escrow pay.</p>
          <p className="mt-4 text-sm text-white/60">{SUPPORT_EMAIL}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-[11px] font-bold tracking-[0.16em] text-white/40 uppercase">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} prefetch={false} className="text-sm font-medium text-white/75 transition hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-white/45">
          <span>© {new Date().getFullYear()} ModelClic · Lagos, Nigeria</span>
          <span>Safe. Verified. Paid.</span>
        </div>
      </div>
    </footer>
  );
}
