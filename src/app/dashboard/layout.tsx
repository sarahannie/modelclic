import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, LayoutGrid, LogOut, Plus, Search, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";
import { requireProfile } from "@/lib/auth";
import type { Role } from "@/lib/types";

const NAV: Record<Role, { href: string; label: string; icon: typeof LayoutGrid }[]> = {
  talent: [{ href: "/dashboard/talent", label: "Find shifts", icon: Search }],
  host: [
    { href: "/dashboard/host", label: "My shifts", icon: BriefcaseBusiness },
    { href: "/dashboard/host/new", label: "Post a shift", icon: Plus },
  ],
  admin: [{ href: "/dashboard/admin", label: "Overview", icon: Shield }],
};

const ROLE_LABEL: Record<Role, string> = { talent: "Talent", host: "Event host", admin: "Admin" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();
  const initials = profile.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16rem_1fr] md:bg-[linear-gradient(to_right,var(--color-ink)_16rem,transparent_16rem)]">
      <aside className="flex flex-col bg-ink p-5 text-white md:sticky md:top-0 md:h-dvh">
        <Logo dark />
        <nav className="mt-8 flex gap-1 md:flex-col" aria-label="Dashboard">
          {NAV[profile.role].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-4" aria-hidden /> {label}
            </Link>
          ))}
          <form action="/auth/signout" method="post" className="ml-auto md:hidden">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
        </nav>
        <div className="glass-dark mt-auto hidden rounded-2xl p-3 md:block">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-ice text-xs font-bold text-ink">{initials}</span>
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-sm font-semibold">
                {profile.full_name}
                {profile.verified && <BadgeCheck className="size-3.5 shrink-0 text-vermilion" aria-label="Verified" />}
              </p>
              <p className="text-xs text-white/55">{ROLE_LABEL[profile.role]}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post" className="mt-3">
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white">
              <LogOut className="size-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 px-5 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
