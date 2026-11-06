import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EventCard } from "@/components/ui/EventCard";
import { getSession } from "@/lib/session";
import { fillById } from "@/lib/queries";
import type { MCEvent } from "@/lib/types";

export const metadata: Metadata = { title: "Jobs", description: "Paid event shifts from verified hosts in Lagos, Abuja and Port Harcourt." };

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  const { supabase, user } = await getSession();
  let jobs: MCEvent[] = [];
  try {
    let q = supabase.from("events").select("*").eq("status", "active").gte("starts_at", new Date().toISOString()).order("starts_at").limit(60);
    if (city) q = q.eq("state", city);
    const { data } = await q;
    jobs = (data as MCEvent[]) ?? [];
  } catch {}
  const fill = await fillById(supabase, jobs.map((j) => j.id)).catch(() => new Map());
  const cities = ["Lagos", "Abuja (FCT)", "Rivers"];

  return (
    <>
      <SiteNav signedIn={Boolean(user)} />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-5 py-14 md:px-6">
        <p className="eyebrow">Open shifts</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="t-display text-[44px]">Jobs</h1>
          <nav className="flex flex-wrap gap-2" aria-label="Filter by city">
            <Link href="/jobs" className="chip" aria-current={!city ? "page" : undefined}>All</Link>
            {cities.map((c) => (
              <Link key={c} href={`/jobs?city=${encodeURIComponent(c)}`} className="chip" aria-current={city === c ? "page" : undefined}>{c.replace(" (FCT)", "")}</Link>
            ))}
          </nav>
        </div>
        {jobs.length === 0 ? (
          <div className="panel-dashed mt-10 p-12 text-center">
            <p className="text-xl font-bold">New shifts are posted every week.</p>
            <p className="mt-1 text-ink-500">Create a free account to bid as soon as they go live.</p>
            <Link href="/register/talent" className="btn btn-primary mt-6">Join as talent</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((e) => {
              const f = fill.get(e.id);
              return (
                <div key={e.id} id={e.id} className="scroll-mt-28">
                  <EventCard
                    event={e}
                    spotsLeft={f ? e.staff_needed - f.booked : undefined}
                    action={<Link href={user ? `/talent/jobs/${e.id}` : `/login?next=/talent/jobs/${e.id}`} className="btn btn-sm btn-ink w-full">View &amp; bid</Link>}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
