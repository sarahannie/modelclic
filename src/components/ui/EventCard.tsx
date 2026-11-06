import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { dayLabel, naira, timeRange } from "@/lib/format";
import type { MCEvent } from "@/lib/types";
import { Rating } from "./kit";

export function EventCard({
  event,
  host,
  spotsLeft,
  match,
  href,
  action,
  compact = false,
  topRight,
}: {
  event: MCEvent;
  host?: { name: string; rating: number | null } | null;
  spotsLeft?: number;
  match?: number | null;
  href?: string;
  action?: React.ReactNode;
  compact?: boolean;
  topRight?: React.ReactNode;
}) {
  return (
    <article className="card group relative flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-(--shadow-lift)">
      <div className="flex items-center justify-between gap-2">
        <span className="badge badge-ice">{event.type}</span>
        {topRight ?? (match != null && <span className="text-[13px] font-bold text-ink-500"><span className="text-vermilion-700">{match}%</span> match</span>)}
      </div>
      <h3 className="mt-3 text-[17px] leading-snug font-bold tracking-[-0.015em]">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[inherit]">{event.name}</Link>
        ) : (
          event.name
        )}
      </h3>
      {host && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
          {host.name} <span className="text-ink-200">·</span> <Rating value={host.rating} />
        </p>
      )}
      <p className="num mt-3 text-[28px] font-extrabold tracking-[-0.035em]">{naira(event.pay_ngn)}</p>
      {!compact && (
        <ul className="mt-2 space-y-1 text-[13px] text-ink-600">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-ink-400" aria-hidden />
            <span className="font-semibold text-ink">{dayLabel(event.starts_at)}</span> · {timeRange(event.starts_at, event.ends_at)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 text-ink-400" aria-hidden /> {[event.venue, event.city, event.state].filter(Boolean).join(", ")}
          </li>
          {spotsLeft != null && (
            <li className="flex items-center gap-2">
              <Users className="size-3.5 text-ink-400" aria-hidden /> {spotsLeft} of {event.staff_needed} spots left
            </li>
          )}
        </ul>
      )}
      {action && (
        <div className="mt-auto pt-4">
          <div className="relative z-10 flex items-center gap-2 border-t border-line-soft pt-4">{action}</div>
        </div>
      )}
    </article>
  );
}
