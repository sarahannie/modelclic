const TZ = "Africa/Lagos";

export const naira = (n: number | null | undefined) =>
  "₦" + new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Math.round(n ?? 0));

export const nairaShort = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m` : n >= 1000 ? `₦${Math.round(n / 1000)}k` : naira(n);

export const dateShort = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));

export const dateLong = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));

export const time = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }).format(new Date(iso)).toUpperCase();

export const timeRange = (a: string, b: string) => `${time(a)} – ${time(b)}`;

export const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const fmt = (x: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(x);
  const today = fmt(now);
  const tomorrow = fmt(new Date(now.getTime() + 864e5));
  if (fmt(d) === today) return "Today";
  if (fmt(d) === tomorrow) return "Tomorrow";
  return dateShort(iso);
};

export const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return dateShort(iso);
};

export const clock = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date(iso));

export const initials = (name: string | null | undefined) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "MC";

/** "2026-11-12" + "14:00" in Lagos → ISO string */
export const lagosISO = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+01:00`).toISOString();
