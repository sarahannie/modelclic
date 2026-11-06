import type { Role } from "./types";

export type NavIcon =
  | "jobs" | "gigs" | "bids" | "messages" | "wallet" | "events" | "talent" | "favorites" | "settings" | "help"
  | "shield" | "alert" | "scale" | "ticket" | "chart" | "list" | "cash" | "user" | "bell" | "swap";

export type NavItem = { href: string; label: string; short: string; icon: NavIcon; match: string[]; count?: number | null };

export const TALENT_NAV: NavItem[] = [
  { href: "/talent", label: "Find jobs", short: "Jobs", icon: "jobs", match: ["/talent", "/talent/jobs"] },
  { href: "/talent/gigs", label: "My Gigs", short: "Gigs", icon: "gigs", match: ["/talent/gigs", "/talent/rate", "/talent/shift-pass"] },
  { href: "/talent/bids", label: "My bids", short: "Bids", icon: "bids", match: ["/talent/bids"] },
  { href: "/messages", label: "Messages", short: "Messages", icon: "messages", match: ["/messages"] },
  { href: "/talent/wallet", label: "Wallet", short: "Wallet", icon: "wallet", match: ["/talent/wallet"] },
];

export const HOST_NAV: NavItem[] = [
  { href: "/host", label: "Events", short: "Events", icon: "events", match: ["/host", "/host/events"] },
  { href: "/host/talent", label: "Find talent", short: "Talent", icon: "talent", match: ["/host/talent"] },
  { href: "/host/favorites", label: "Favorites", short: "Saved", icon: "favorites", match: ["/host/favorites"] },
  { href: "/messages", label: "Messages", short: "Messages", icon: "messages", match: ["/messages"] },
  { href: "/host/wallet", label: "Wallet", short: "Wallet", icon: "wallet", match: ["/host/wallet"] },
];

export const UTIL_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", short: "Settings", icon: "settings", match: ["/settings"] },
  { href: "/settings/help", label: "Help & support", short: "Help", icon: "help", match: ["/settings/help"] },
];

export const ADMIN_NAV: { section: string; items: (NavItem & { tab: string })[] }[] = [
  {
    section: "Queues",
    items: [
      { tab: "verification", href: "/admin?tab=verification", label: "Identity checks", short: "IDs", icon: "shield", match: [] },
      { tab: "events", href: "/admin?tab=events", label: "Events", short: "Events", icon: "events", match: [] },
      { tab: "disputes", href: "/admin?tab=disputes", label: "Disputes", short: "Disputes", icon: "scale", match: [] },
      { tab: "sos", href: "/admin?tab=sos", label: "SOS alerts", short: "SOS", icon: "alert", match: [] },
      { tab: "tickets", href: "/admin?tab=tickets", label: "Support", short: "Support", icon: "ticket", match: [] },
      { tab: "payouts", href: "/admin?tab=payouts", label: "Payments", short: "Pay", icon: "cash", match: [] },
      { tab: "analytics", href: "/admin?tab=analytics", label: "Analytics", short: "Stats", icon: "chart", match: [] },
    ],
  },
  {
    section: "Platform",
    items: [
      { tab: "catalog", href: "/admin?tab=catalog", label: "Skills & job types", short: "Catalog", icon: "list", match: [] },
      { tab: "members", href: "/admin?tab=members", label: "Members", short: "Members", icon: "user", match: [] },
      { tab: "settings", href: "/admin?tab=settings", label: "Settings", short: "Settings", icon: "settings", match: [] },
    ],
  },
];

/** Page titles for breadcrumbs, longest prefix wins. */
export const TITLES: [string, string][] = [
  ["/talent/jobs", "Job details"],
  ["/talent/gigs", "My Gigs"],
  ["/talent/bids", "My bids"],
  ["/talent/wallet", "Wallet"],
  ["/talent/shift-pass", "Shift pass"],
  ["/talent/rate", "Rate your host"],
  ["/talent/verify", "Verify identity"],
  ["/talent/profile", "Edit profile"],
  ["/talent/account", "Profile"],
  ["/talent", "Find jobs"],
  ["/host/events/new", "New event"],
  ["/host/events", "Manage event"],
  ["/host/talent", "Find talent"],
  ["/host/favorites", "Favorites"],
  ["/host/wallet", "Wallet"],
  ["/host/verify", "Verify business"],
  ["/host/account", "Profile"],
  ["/host/rate", "Rate your staff"],
  ["/host", "Events"],
  ["/messages", "Messages"],
  ["/notifications", "Notifications"],
  ["/settings/help", "Help & legal"],
  ["/settings", "Settings"],
];

export const titleFor = (path: string) => TITLES.find(([p]) => path === p || path.startsWith(p + "/") || path.startsWith(p + "?"))?.[1] ?? "ModelClic";

export const roleLabel = (r: Role) => (r === "host" ? "Host" : r === "admin" ? "Admin" : "Talent");
