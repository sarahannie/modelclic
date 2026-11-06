"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowRight, BadgeCheck, Bell, ChevronDown, LogOut, PanelLeft, Search, Ticket, User, X,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { NavGlyph } from "./icons";
import { HelpWidget } from "./HelpWidget";
import { titleFor, type NavItem } from "@/lib/nav";
import { ago, initials, naira } from "@/lib/format";
import { markAllRead, switchSide } from "@/app/actions/account";
import type { Notification, Role } from "@/lib/types";

export type ChromeProps = {
  role: Role;
  name: string;
  avatar: string | null;
  verified: boolean;
  sides: Role[];
  nav: NavItem[];
  util: NavItem[];
  bidPoints?: number;
  monthlyPoints?: number;
  shiftPassHref?: string | null;
  wallet?: { available: number; escrow: number } | null;
  notifications: Notification[];
  unread: number;
  demo: boolean;
  children: React.ReactNode;
};

const isActive = (path: string, item: NavItem) =>
  item.match.some((m) => path === m || (m !== "/talent" && m !== "/host" && path.startsWith(m + "/")) || path === m);

export function AppChrome(p: ChromeProps) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("mc-side") === "1");
    } catch {}
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("mc-side", c ? "0" : "1");
      } catch {}
      return !c;
    });

  const sideLabel = p.role === "host" ? "Host" : "Talent";
  const title = titleFor(path);

  return (
    <div className="min-h-dvh bg-ice-50">
      {p.demo && (
        <div className="bg-ink px-4 py-1.5 text-center text-xs font-semibold text-ice">
          Demo mode — sample data, nothing is saved permanently.{" "}
          <Link href="/demo" className="underline decoration-vermilion underline-offset-2">Switch role</Link>
        </div>
      )}
      <div className={`md:grid ${collapsed ? "md:grid-cols-[76px_1fr] md:bg-[linear-gradient(to_right,var(--color-ink)_76px,transparent_76px)]" : "md:grid-cols-[256px_1fr] md:bg-[linear-gradient(to_right,var(--color-ink)_256px,transparent_256px)]"} transition-[grid-template-columns]`}>
        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside className="sticky top-0 hidden h-dvh flex-col bg-ink px-3 pt-5 pb-4 text-white md:flex">
          <div className={`px-2 ${collapsed ? "flex justify-center px-0" : ""}`}>
            {collapsed ? <Link href="/" aria-label="Home"><LogoMark size={40} onDark /></Link> : <Logo onDark />}
          </div>
          {!collapsed && <p className="mt-7 mb-2 px-3 text-[11px] font-bold tracking-[0.16em] text-white/40 uppercase">{sideLabel}</p>}
          <nav className={`flex flex-col gap-1 ${collapsed ? "mt-7" : ""}`} aria-label="Main">
            {p.nav.map((item) => (
              <SideLink key={item.href} item={item} active={isActive(path, item)} collapsed={collapsed} />
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2">
            {!collapsed && p.role === "talent" && (
              <>
                <Link
                  href={p.shiftPassHref ?? "/talent/gigs?tab=booked"}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-white/25 px-3 py-2.5 text-sm font-semibold text-white/85 transition hover:border-vermilion hover:text-white"
                >
                  <Ticket className="size-[18px]" aria-hidden /> Shift pass
                  {p.shiftPassHref && <span className="ml-auto size-2 rounded-full bg-vermilion" aria-label="You have a shift" />}
                </Link>
                <div className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-white/70">
                      <strong className="num text-lg font-extrabold text-white">{p.bidPoints ?? 0}</strong> bids left
                    </p>
                    <Link href="/talent/bids#buy" className="text-xs font-bold text-vermilion hover:underline">Buy</Link>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-vermilion" style={{ width: `${Math.min(100, ((p.bidPoints ?? 0) / (p.monthlyPoints || 20)) * 100)}%` }} />
                  </div>
                </div>
              </>
            )}
            {!collapsed && p.role === "host" && p.wallet && (
              <div className="rounded-xl bg-white/[0.06] p-3.5 ring-1 ring-white/10">
                <p className="text-[11px] font-bold tracking-[0.14em] text-white/45 uppercase">Wallet balance</p>
                <p className="num mt-1 text-2xl font-extrabold">{naira(p.wallet.available)}</p>
                <p className="text-xs text-white/55">{naira(p.wallet.escrow)} held in escrow</p>
                <Link href="/host/wallet" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-vermilion hover:underline">
                  Fund wallet <ArrowRight className="size-3" aria-hidden />
                </Link>
              </div>
            )}
            <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-3">
              {p.util.map((item) => (
                <SideLink key={item.href} item={item} active={path === item.href || (item.href === "/settings" && path.startsWith("/settings") && path !== "/settings/help")} collapsed={collapsed} />
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main column ───────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
              <button onClick={toggle} className="hidden size-9 place-items-center rounded-lg text-ink-500 hover:bg-ink/5 hover:text-ink md:grid" aria-label="Toggle sidebar">
                <PanelLeft className="size-[18px]" />
              </button>
              <Link href="/" className="md:hidden" aria-label="Home"><LogoMark size={34} /></Link>
              <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden text-ink-400 sm:inline">{sideLabel}</span>
                <span className="hidden text-ink-200 sm:inline">/</span>
                <span className="truncate font-bold text-ink">{title}</span>
              </nav>
              <button
                onClick={() => setPalette(true)}
                className="ml-auto hidden h-10 w-full max-w-sm items-center gap-2.5 rounded-xl border border-line bg-ice-25 px-3 text-sm text-ink-400 transition hover:border-ink-200 lg:flex"
              >
                <Search className="size-4" aria-hidden /> Search jobs, pages and actions…
                <span className="kbd ml-auto">Ctrl K</span>
              </button>
              <div className="ml-auto flex items-center gap-1 lg:ml-2">
                <button onClick={() => setPalette(true)} className="grid size-10 place-items-center rounded-xl text-ink-600 hover:bg-ink/5 lg:hidden" aria-label="Search">
                  <Search className="size-[18px]" />
                </button>
                <NotificationsMenu items={p.notifications} unread={p.unread} />
                <AccountMenu {...p} />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-16">{p.children}</main>
        </div>
      </div>

      {/* ── Mobile tab bar ──────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Main">
        {p.nav.map((item) => {
          const on = isActive(path, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-[62px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold ${on ? "text-ink" : "text-ink-400"}`}
              aria-current={on ? "page" : undefined}
            >
              {on && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-vermilion" />}
              <span className="relative">
                <NavGlyph name={item.icon} className="size-5" />
                {!!item.count && <span className="absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-vermilion px-1 text-[10px] text-white">{item.count}</span>}
              </span>
              {item.short}
            </Link>
          );
        })}
      </nav>

      {palette && <CommandPalette role={p.role} nav={[...p.nav, ...p.util]} onClose={() => setPalette(false)} />}
      <HelpWidget />
    </div>
  );
}

function SideLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-11 items-center gap-3 rounded-xl text-[14.5px] font-semibold transition ${
        collapsed ? "justify-center px-0" : "px-3"
      } ${active ? "bg-white/[0.09] text-white" : "text-white/65 hover:bg-white/[0.05] hover:text-white"}`}
    >
      {active && <span className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-vermilion" />}
      <NavGlyph name={item.icon} />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && !!item.count && (
        <span className="grid min-w-6 place-items-center rounded-full bg-vermilion px-1.5 text-[11px] font-bold text-white">{item.count}</span>
      )}
    </Link>
  );
}

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [open, close]);
  return ref;
}

function NotificationsMenu({ items, unread }: { items: Notification[]; unread: number }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const ref = useOutside(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid size-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink/5 hover:text-ink"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-[19px]" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 grid min-w-[18px] place-items-center rounded-full bg-vermilion px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-line bg-white shadow-(--shadow-lift)">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <p className="font-bold">Notifications</p>
            {unread > 0 && (
              <button
                disabled={pending}
                onClick={() => start(async () => { await markAllRead(); router.refresh(); })}
                className="text-xs font-bold text-vermilion-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="scroll-thin max-h-[360px] overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-400">You’re all caught up.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.link ?? "/notifications"}
                  onClick={() => setOpen(false)}
                  className={`flex gap-3 px-4 py-3 text-sm transition hover:bg-ice-50 ${n.read ? "text-ink-500" : "font-semibold text-ink"}`}
                >
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-vermilion"}`} />
                  <span className="flex-1">
                    {n.text}
                    <span className="mt-0.5 block text-xs font-normal text-ink-400">{ago(n.created_at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-line-soft px-4 py-3 text-center text-sm font-bold text-ink hover:bg-ice-50">
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

function AccountMenu(p: ChromeProps) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const ref = useOutside(open, () => setOpen(false));
  const both = p.sides.includes("host") && p.sides.includes("talent");
  const profileHref = p.role === "host" ? "/host/account" : "/talent/account";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 transition hover:bg-ink/5" aria-expanded={open} aria-label="Account menu">
        <Avatar name={p.name} src={p.avatar} size={36} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="flex items-center gap-1 text-sm font-bold text-ink">
            {p.name.split(" ")[0] || "Your account"}
            {p.verified && <BadgeCheck className="size-3.5 text-vermilion" aria-label="Verified" />}
          </span>
          <span className="block text-xs text-ink-400">{p.role === "host" ? "Host account" : "Talent account"}</span>
        </span>
        <ChevronDown className="hidden size-4 text-ink-400 sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-(--shadow-lift)">
          <MenuLink href={profileHref} onClick={() => setOpen(false)}><User className="size-4" /> View profile</MenuLink>
          {p.role === "talent" && (
            <MenuLink href="/talent/bids" onClick={() => setOpen(false)}>
              <NavGlyph name="bids" className="size-4" /> My bids <span className="badge badge-ice ml-auto">{p.bidPoints} left</span>
            </MenuLink>
          )}
          <MenuLink href="/settings" onClick={() => setOpen(false)}><NavGlyph name="settings" className="size-4" /> Settings</MenuLink>
          {both ? (
            <button
              disabled={pending}
              onClick={() => start(async () => { const to = await switchSide(); setOpen(false); router.push(to); router.refresh(); })}
              className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-ink-700 hover:bg-ice-50"
            >
              <NavGlyph name="swap" className="size-4" /> {p.role === "host" ? "Switch to working" : "Switch to hiring"}
            </button>
          ) : (
            <MenuLink href="/settings/add-side" onClick={() => setOpen(false)}>
              <NavGlyph name="swap" className="size-4" /> {p.role === "host" ? "Also work on ModelClic" : "Also hire on ModelClic"}
            </MenuLink>
          )}
          <MenuLink href="/settings/help" onClick={() => setOpen(false)}><NavGlyph name="help" className="size-4" /> Help & support</MenuLink>
          <div className="my-1 h-px bg-line-soft" />
          <form action="/auth/signout" method="post">
            <button className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-vermilion-700 hover:bg-vermilion-50">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-ink-700 hover:bg-ice-50 hover:text-ink">
      {children}
    </Link>
  );
}

export function Avatar({ name, src, size = 40, ring = false }: { name: string; src?: string | null; size?: number; ring?: boolean }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className={`shrink-0 rounded-full object-cover ${ring ? "ring-2 ring-white" : ""}`} style={{ width: size, height: size }} />
  ) : (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-ink font-bold text-white ${ring ? "ring-2 ring-white" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

function CommandPalette({ role, nav, onClose }: { role: Role; nav: NavItem[]; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();
  const actions = useMemo(
    () => [
      ...nav.map((n) => ({ label: n.label, hint: "Page", href: n.href })),
      ...(role === "talent"
        ? [
            { label: "Complete my profile", hint: "Action", href: "/talent/profile" },
            { label: "Verify my identity", hint: "Action", href: "/talent/verify" },
            { label: "Buy bid points", hint: "Action", href: "/talent/bids#buy" },
            { label: "Withdraw earnings", hint: "Action", href: "/talent/wallet#withdraw" },
          ]
        : [
            { label: "Post an event", hint: "Action", href: "/host/events/new" },
            { label: "Fund wallet", hint: "Action", href: "/host/wallet#fund" },
            { label: "Verify my business", hint: "Action", href: "/host/verify" },
          ]),
      { label: "Notifications", hint: "Page", href: "/notifications" },
      { label: "Change password", hint: "Settings", href: "/settings/password" },
      { label: "Terms of Service", hint: "Legal", href: "/legal/terms" },
    ],
    [nav, role],
  );
  const list = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
  const searchJobs = role === "talent" && q.trim().length > 1;
  const go = (href: string) => {
    onClose();
    router.push(href);
  };
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-(--shadow-lift)" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className="flex items-center gap-3 border-b border-line-soft px-4">
          <Search className="size-5 text-ink-400" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, list.length - 1 + (searchJobs ? 1 : 0))); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter") {
                if (searchJobs && idx === 0) go(`/talent?q=${encodeURIComponent(q)}`);
                else { const a = list[idx - (searchJobs ? 1 : 0)]; if (a) go(a.href); }
              }
            }}
            placeholder={role === "talent" ? "Search jobs, pages and actions…" : "Search pages and actions…"}
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-300"
          />
          <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink/5"><X className="size-4" /></button>
        </div>
        <ul className="scroll-thin max-h-[50vh] overflow-y-auto p-2">
          {searchJobs && (
            <li>
              <button onMouseEnter={() => setIdx(0)} onClick={() => go(`/talent?q=${encodeURIComponent(q)}`)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${idx === 0 ? "bg-ice-100" : ""}`}>
                <Search className="size-4 text-ink-400" /> Search jobs for “<strong>{q}</strong>”
              </button>
            </li>
          )}
          {list.map((a, i) => {
            const k = i + (searchJobs ? 1 : 0);
            return (
              <li key={a.label}>
                <button onMouseEnter={() => setIdx(k)} onClick={() => go(a.href)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold ${idx === k ? "bg-ice-100 text-ink" : "text-ink-700"}`}>
                  {a.label}
                  <span className="ml-auto text-xs font-medium text-ink-400">{a.hint}</span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && !searchJobs && <li className="px-3 py-6 text-center text-sm text-ink-400">No matches.</li>}
        </ul>
      </div>
    </div>
  );
}
