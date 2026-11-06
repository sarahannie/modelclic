import { CalendarDays, MapPin, Users } from "lucide-react";
import { eventDate, naira } from "@/lib/format";
import type { Gig } from "@/lib/types";

export function GigCard({ gig, action }: { gig: Gig; action?: React.ReactNode }) {
  return (
    <article className="card flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-(--shadow-lift)">
      <div className="flex items-start justify-between gap-3">
        <span className="badge bg-ice-100 text-ink-700">{gig.category}</span>
        <span className="font-display text-xl font-semibold">{naira(gig.pay_ngn)}</span>
      </div>
      <h3 className="text-lg leading-snug font-semibold">{gig.title}</h3>
      <ul className="space-y-1.5 text-sm text-ink-500">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden /> {eventDate(gig.event_date)}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4" aria-hidden /> {gig.venue}, {gig.city}
        </li>
        <li className="flex items-center gap-2">
          <Users className="size-4" aria-hidden /> {gig.slots} {gig.slots === 1 ? "spot" : "spots"}
        </li>
      </ul>
      {gig.description && <p className="line-clamp-2 text-sm text-ink-700">{gig.description}</p>}
      {action && <div className="mt-auto pt-1">{action}</div>}
    </article>
  );
}
