import { BadgeCheck, CalendarClock, MapPin, Ruler, Star } from "lucide-react";
import { Avatar } from "@/components/shell/AppChrome";
import { KycBadge, Rating } from "@/components/ui/kit";
import { ago } from "@/lib/format";
import type { Profile, Rating as R } from "@/lib/types";

export function TalentProfileView({ p, age, ratings, actions }: { p: Profile; age?: number | null; ratings: (R & { rater?: string })[]; actions?: React.ReactNode }) {
  const breakdown: Record<string, number[]> = {};
  ratings.forEach((r) => Object.entries(r.scores).forEach(([k, v]) => (breakdown[k] ??= []).push(Number(v))));
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card overflow-hidden">
          <div className="relative aspect-[4/5] bg-ice">
            {p.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatar_url} alt={p.full_name} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center"><Avatar name={p.full_name} size={120} /></div>
            )}
            <div className="glass absolute inset-x-3 bottom-3 rounded-2xl p-3">
              <p className="flex items-center gap-1.5 text-lg font-extrabold">{p.full_name} {p.kyc === "verified" && <BadgeCheck className="size-5 text-vermilion-700" aria-label="Verified" />}</p>
              <p className="text-sm text-ink-600">{[age ? `${age}` : null, p.gender, [p.city, p.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft text-center">
            <div className="p-3"><dt className="text-[11px] font-semibold text-ink-400">Rating</dt><dd className="mt-0.5"><Rating value={p.rating_avg} /></dd></div>
            <div className="p-3"><dt className="text-[11px] font-semibold text-ink-400">Gigs</dt><dd className="num mt-0.5 font-extrabold">{p.gigs_completed}</dd></div>
            <div className="p-3"><dt className="text-[11px] font-semibold text-ink-400">No-shows</dt><dd className="num mt-0.5 font-extrabold">{p.no_shows}</dd></div>
          </dl>
        </div>
        {actions}
      </aside>

      <div className="space-y-5">
        <section className="card card-pad">
          <div className="flex flex-wrap items-center gap-2"><KycBadge status={p.kyc} />{p.available_for_work ? <span className="badge badge-ink">Available for work</span> : <span className="badge badge-line">Not taking work</span>}</div>
          {p.bio && <p className="mt-4 leading-relaxed text-ink-700">{p.bio}</p>}
          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {p.availability?.days && <li className="flex items-center gap-2"><CalendarClock className="size-4 text-ink-400" /> {p.availability.days}{p.availability.start ? `, ${p.availability.start}–${p.availability.end}` : ""}</li>}
            {(p.city || p.state) && <li className="flex items-center gap-2"><MapPin className="size-4 text-ink-400" /> {[p.city, p.state].filter(Boolean).join(", ")}</li>}
            {(p.height_cm || p.body_type) && <li className="flex items-center gap-2"><Ruler className="size-4 text-ink-400" /> {[p.height_cm ? `${p.height_cm} cm` : null, p.weight_kg ? `${p.weight_kg} kg` : null, p.body_type, p.skin_tone].filter(Boolean).join(" · ")}</li>}
          </ul>
        </section>

        {p.skills.length > 0 && (
          <section className="card card-pad">
            <h2 className="t-h3">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">{p.skills.map((s) => <span key={s} className="badge badge-ice px-3 py-1 text-[13px]">{s}</span>)}</div>
          </section>
        )}

        {p.photos.length > 0 && (
          <section className="card card-pad">
            <h2 className="t-h3">Photos</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {p.photos.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="aspect-[3/4] w-full rounded-xl object-cover" />
              ))}
            </div>
          </section>
        )}

        <section className="card card-pad">
          <h2 className="t-h3">Reviews</h2>
          {Object.keys(breakdown).length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(breakdown).map(([k, v]) => {
                const avg = v.reduce((a, b) => a + b, 0) / v.length;
                return (
                  <li key={k} className="flex items-center gap-3 text-sm">
                    <span className="w-32 text-ink-600">{k}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-ice"><span className="block h-full rounded-full bg-ink" style={{ width: `${(avg / 5) * 100}%` }} /></span>
                    <span className="num w-8 text-right font-bold">{avg.toFixed(1)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <ul className="mt-4 space-y-3">
            {ratings.length === 0 && <li className="text-sm text-ink-400">No reviews yet.</li>}
            {ratings.filter((r) => r.comment).map((r) => (
              <li key={r.id} className="rounded-xl bg-ice-50 p-4 text-sm">
                <p className="flex items-center gap-1 font-bold"><Star className="size-3.5 fill-vermilion text-vermilion" /> {Number(r.overall).toFixed(1)} <span className="font-normal text-ink-400">· {r.rater ?? "Host"} · {ago(r.created_at)}</span></p>
                <p className="mt-1 text-ink-700">“{r.comment}”</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
