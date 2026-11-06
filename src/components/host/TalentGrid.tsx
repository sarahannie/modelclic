import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { FavoriteButton } from "@/components/ui/SmallActions";
import { Avatar } from "@/components/shell/AppChrome";
import type { TalentCard } from "@/lib/types";

export function TalentGrid({ people, favs }: { people: TalentCard[]; favs: Set<string> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {people.map((t) => (
        <article key={t.id} className="card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-(--shadow-lift)">
          <div className="relative aspect-[4/5] bg-ice">
            {t.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.avatar_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-[1.03]" />
            ) : (
              <div className="grid size-full place-items-center"><Avatar name={t.full_name} size={96} /></div>
            )}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent" />
            <span className="glass absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold">
              <Star className="size-3.5 fill-vermilion text-vermilion" /> {t.rating_avg != null ? Number(t.rating_avg).toFixed(1) : "New"}
            </span>
            <span className="absolute top-3 right-3 z-10"><FavoriteButton talentId={t.id} fav={favs.has(t.id)} /></span>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/host/talent/${t.id}`} className="truncate font-bold after:absolute after:inset-0">{t.full_name}</Link>
              {t.verified && <span className="badge badge-ice shrink-0"><BadgeCheck className="size-3.5 text-vermilion-700" /> Verified</span>}
            </div>
            <p className="text-[13px] text-ink-500">{[t.age, t.gender, [t.city, t.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}</p>
            <p className="mt-1.5 truncate text-[13px] font-semibold text-ink-700">{t.skills.slice(0, 2).join(" · ") || "—"}</p>
            <p className="mt-0.5 text-xs text-ink-400">{t.gigs_completed} gigs completed</p>
          </div>
        </article>
      ))}
    </div>
  );
}
