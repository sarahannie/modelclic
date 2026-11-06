"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BriefcaseBusiness, CircleHelp, Lock, Repeat, ShieldCheck, User } from "lucide-react";
import type { Role } from "@/lib/types";

export function SettingsNav({ role }: { role: Role }) {
  const path = usePathname();
  const items = [
    { href: "/settings", label: "Account", icon: User },
    { href: "/settings/work", label: role === "host" ? "Hiring" : "Work & hiring", icon: BriefcaseBusiness },
    { href: "/settings/notifications", label: "Notifications", icon: Bell },
    { href: "/settings/password", label: "Password & security", icon: Lock },
    { href: "/settings/privacy", label: "Privacy & safety", icon: ShieldCheck },
    { href: "/settings/add-side", label: role === "host" ? "Also work" : "Also hire", icon: Repeat },
    { href: "/settings/help", label: "Help & legal", icon: CircleHelp },
  ];
  return (
    <nav aria-label="Settings" className="lg:sticky lg:top-24 lg:self-start">
      <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.16em] text-ink-400 uppercase">Settings</p>
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
        {items.map(({ href, label, icon: I }) => {
          const on = path === href;
          return (
            <li key={href}>
              <Link href={href} aria-current={on ? "page" : undefined} className={`flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold whitespace-nowrap transition ${on ? "bg-ink text-white" : "text-ink-600 hover:bg-white hover:text-ink"}`}>
                <I className="size-4" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
