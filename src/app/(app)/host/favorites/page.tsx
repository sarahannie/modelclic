import Link from "next/link";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Empty, PageHeader } from "@/components/ui/kit";
import { TalentGrid } from "@/components/host/TalentGrid";
import type { TalentCard } from "@/lib/types";

export const metadata: Metadata = { title: "Favorites" };

export default async function Favorites() {
  const { supabase, profile } = await requireUser("host");
  const { data: favData } = await supabase.from("favorites").select("talent_id").eq("host_id", profile.id);
  const ids = new Set(((favData as { talent_id: string }[]) ?? []).map((f) => f.talent_id));
  const { data } = await supabase.rpc("search_talent", {});
  const people = ((data as TalentCard[]) ?? []).filter((t) => ids.has(t.id));
  return (
    <>
      <PageHeader title="Favorites" sub="Talent you’d book again. Invite them straight to your next event." />
      {people.length ? (
        <TalentGrid people={people} favs={ids} />
      ) : (
        <Empty title="No favorites yet" body="Star talent you’d hire again and they’ll be saved here." action={<Link href="/host/talent" className="btn btn-ink">Find talent</Link>} icon={<Heart className="size-5" />} />
      )}
    </>
  );
}
