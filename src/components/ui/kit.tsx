import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { BidStatus, EventStatus, Kyc, TxStatus } from "@/lib/types";

export function PageHeader({
  title,
  sub,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="t-h1">{title}</h1>
        {sub && <p className="t-sub mt-1.5">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Empty({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="panel-dashed flex flex-col items-center px-6 py-12 text-center">
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-ice text-ink">{icon}</div>}
      <p className="text-[17px] font-bold">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, highlight }: { label: string; value: React.ReactNode; sub?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`card p-4 md:p-5 ${highlight ? "ring-2 ring-vermilion/70" : ""}`}>
      <p className="text-[13px] font-semibold text-ink-500">{label}</p>
      <p className="num mt-1 text-[26px] font-extrabold tracking-[-0.03em]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

export function Tabs({ items, current }: { items: { key: string; label: string; href: string; count?: number }[]; current: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {items.map((t) => (
        <Link key={t.key} href={t.href} scroll={false} role="tab" aria-selected={t.key === current} aria-current={t.key === current ? "page" : undefined} className="chip">
          {t.label}
          {!!t.count && <span className={`num rounded-full px-1.5 text-[11px] ${t.key === current ? "bg-white/20" : "bg-ice"}`}>{t.count}</span>}
        </Link>
      ))}
    </div>
  );
}

const BID: Record<BidStatus, [string, string]> = {
  bid: ["Waiting", "badge-ice"],
  offered: ["Offer received", "badge-red"],
  booked: ["Booked", "badge-ink"],
  declined: ["Declined", "badge-line"],
  not_selected: ["Not selected", "badge-line"],
  withdrawn: ["Withdrawn", "badge-line"],
  completed: ["Completed", "badge-ice"],
  no_show: ["No-show", "badge-red"],
};
export const BidBadge = ({ status, host = false }: { status: BidStatus; host?: boolean }) => {
  const [label, cls] = BID[status];
  return <span className={`badge ${cls}`}>{host && status === "offered" ? "Offer sent" : host && status === "bid" ? "New bid" : label}</span>;
};

const EV: Record<EventStatus, [string, string]> = {
  draft: ["Draft", "badge-line"],
  pending: ["Pending review", "badge-ice"],
  active: ["Live", "badge-red"],
  filled: ["Filled", "badge-ink"],
  completed: ["Completed", "badge-ice"],
  rejected: ["Needs changes", "badge-red"],
  cancelled: ["Cancelled", "badge-line"],
};
export const EventBadge = ({ status }: { status: EventStatus }) => {
  const [label, cls] = EV[status];
  return (
    <span className={`badge ${cls}`}>
      {status === "active" && <span className="size-1.5 rounded-full bg-vermilion" />}
      {label}
    </span>
  );
};

export const KycBadge = ({ status }: { status: Kyc }) =>
  status === "verified" ? (
    <span className="badge badge-ice"><BadgeCheck className="size-3.5 text-vermilion-700" aria-hidden /> Verified</span>
  ) : status === "pending" ? (
    <span className="badge badge-line">Check in progress</span>
  ) : status === "rejected" ? (
    <span className="badge badge-red">Needs another try</span>
  ) : (
    <span className="badge badge-line">Not verified</span>
  );

export const TxBadge = ({ status }: { status: TxStatus }) => {
  const m: Record<TxStatus, [string, string]> = {
    pending: ["Pending", "badge-line"], held: ["In escrow", "badge-ice"], completed: ["Completed", "badge-ink"],
    failed: ["Failed", "badge-red"], cancelled: ["Cancelled", "badge-line"],
  };
  const [l, c] = m[status];
  return <span className={`badge ${c}`}>{l}</span>;
};

export function Rating({ value, count, size = "sm" }: { value: number | null; count?: number; size?: "sm" | "md" }) {
  if (value == null) return <span className="text-xs text-ink-400">New</span>;
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${size === "md" ? "text-base" : "text-[13px]"}`}>
      <Star className={`${size === "md" ? "size-4" : "size-3.5"} fill-vermilion text-vermilion`} aria-hidden />
      {Number(value).toFixed(1)}
      {count != null && <span className="font-medium text-ink-400">({count})</span>}
    </span>
  );
}

export function Toggle({ name, defaultChecked, label, disabled }: { name: string; defaultChecked?: boolean; label: string; disabled?: boolean }) {
  return (
    <label className={`relative inline-flex cursor-pointer items-center ${disabled ? "opacity-50" : ""}`}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} disabled={disabled} className="peer sr-only" aria-label={label} />
      <span className="h-6 w-11 rounded-full bg-ink-200 transition peer-checked:bg-ink peer-focus-visible:ring-4 peer-focus-visible:ring-ice" />
      <span className="absolute left-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
    </label>
  );
}

export function Field({ label, htmlFor, hint, children, className }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function Progress({ value, max = 100, tone = "red" }: { value: number; max?: number; tone?: "red" | "ink" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ice" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={`h-full rounded-full ${tone === "red" ? "bg-vermilion" : "bg-ink"}`} style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%` }} />
    </div>
  );
}
