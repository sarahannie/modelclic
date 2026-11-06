import {
  AlertTriangle, BarChart3, Banknote, Bell, BriefcaseBusiness, CalendarDays, CircleHelp, Heart, ListChecks, MessageCircle,
  Repeat, Scale, Settings, ShieldCheck, Target, Ticket, User, Users, Wallet,
} from "lucide-react";
import type { NavIcon } from "@/lib/nav";

const MAP: Record<NavIcon, typeof Bell> = {
  jobs: BriefcaseBusiness, gigs: CalendarDays, bids: Target, messages: MessageCircle, wallet: Wallet, events: CalendarDays,
  talent: Users, favorites: Heart, settings: Settings, help: CircleHelp, shield: ShieldCheck, alert: AlertTriangle, scale: Scale,
  ticket: Ticket, chart: BarChart3, list: ListChecks, cash: Banknote, user: User, bell: Bell, swap: Repeat,
};

export function NavGlyph({ name, className = "size-[18px]" }: { name: NavIcon; className?: string }) {
  const I = MAP[name];
  return <I className={className} aria-hidden strokeWidth={1.9} />;
}
