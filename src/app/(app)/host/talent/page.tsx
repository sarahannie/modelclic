import type { Metadata } from "next";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { Empty, PageHeader } from "@/components/ui/kit";
import { TalentGrid } from "@/components/host/TalentGrid";
import { loadCatalog } from "@/lib/catalogData";
import { GENDERS } from "@/lib/constants";
import type { TalentCard } from "@/lib/types";

export const metadata: Metadata = { title: "Find talent" };

export default async function FindTalent({ searchParams }: { searchParams: Promise<{ q?: string; gender?: string; rating?: string; skill?: string; filters?: string }> }) {
  const sp = await searchParams;
  const { supabase, profile } = await requireUser("host");
  const [{ data }, { data: favData }, cat] = await Promise.all([
    supabase.rpc("search_talent", { p_q: sp.q || null, p_gender: sp.gender || null, p_min_rating: sp.rating ? Number(sp.rating) : null, p_skill: sp.skill || null }),
    supabase.from("favorites").select("talent_id").eq("host_id", profile.id),
    loadCatalog(supabase),
  ]);
  const people = (data as TalentCard[]) ?? [];
  const favs = new Set(((favData as { talent_id: string }[]) ?? []).map((f) => f.talent_id));
  const showFilters = sp.filters || sp.gender || sp.rating || sp.skill;
  return (
    <>
      <PageHeader title="Find talent" sub="Search verified talent and invite them straight to your events." />
      <form className="flex flex-wrap gap-3">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Search</span>
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input name="q" defaultValue={sp.q} placeholder="Search by name, skill or location…" className="field pl-10" />
        </label>
        {showFilters && (
          <>
            <select name="gender" defaultValue={sp.gender ?? ""} className="field w-auto" aria-label="Gender"><option value="">Any gender</option>{GENDERS.slice(0, 2).map((g) => <option key={g}>{g}</option>)}</select>
            <select name="rating" defaultValue={sp.rating ?? ""} className="field w-auto" aria-label="Minimum rating"><option value="">Any rating</option>{["4.5", "4", "3.5"].map((r) => <option key={r} value={r}>{r}★ and up</option>)}</select>
            <select name="skill" defaultValue={sp.skill ?? ""} className="field w-auto" aria-label="Skill"><option value="">Any skill</option>{cat.skills.map((g) => <optgroup key={g.grp} label={g.grp}>{g.items.map((s) => <option key={s}>{s}</option>)}</optgroup>)}</select>
            <input type="hidden" name="filters" value="1" />
          </>
        )}
        <button className="btn btn-ink">Search</button>
        <Link href={showFilters ? "/host/talent" : "/host/talent?filters=1"} className="btn btn-secondary"><SlidersHorizontal className="size-4" /> {showFilters ? "Clear" : "Filters"}</Link>
      </form>
      <p className="mt-6 mb-4 text-sm font-semibold text-ink-500">{people.length} verified-first results</p>
      {people.length ? <TalentGrid people={people} favs={favs} /> : <Empty title="No talent matches" body="Try a broader search or fewer filters." icon={<Users className="size-5" />} />}
    </>
  );
}
