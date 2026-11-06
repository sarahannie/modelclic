import Link from "next/link";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/kit";
import { TalentProfileView } from "@/components/profile/TalentProfileView";
import { hostName, profilesById } from "@/lib/queries";
import type { Rating } from "@/lib/types";

export const metadata: Metadata = { title: "Profile" };

export default async function TalentAccount() {
  const { supabase, profile } = await requireUser("talent");
  const [{ data: r }, { data: age }] = await Promise.all([
    supabase.from("ratings").select("*").eq("ratee_id", profile.id).order("created_at", { ascending: false }),
    supabase.rpc("talent_age", { p_id: profile.id }),
  ]);
  const ratings = (r as Rating[]) ?? [];
  const raters = await profilesById(supabase, ratings.map((x) => x.rater_id));
  return (
    <>
      <PageHeader title="Your profile" sub="This is how hosts see you." actions={<Link href="/talent/profile" className="btn btn-ink"><Pencil className="size-4" /> Edit profile</Link>} />
      <TalentProfileView p={profile} age={age as number | null} ratings={ratings.map((x) => ({ ...x, rater: hostName(raters.get(x.rater_id)) }))} />
    </>
  );
}
