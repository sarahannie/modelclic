import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { GigCard } from "@/components/GigCard";
import { getOpenGigs } from "@/lib/gigs";

export const metadata: Metadata = { title: "Jobs" };
export const revalidate = 120;

export default async function JobsPage() {
  const gigs = await getOpenGigs(60);
  return (
    <>
      <SiteNav />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
        <p className="eyebrow">Open shifts</p>
        <h1 className="mt-3 text-5xl font-medium">Jobs</h1>
        {gigs.length === 0 ? (
          <div className="card mt-12 p-12 text-center">
            <p className="font-display text-2xl">New shifts are posted every week.</p>
            <p className="mt-2 text-ink-500">Create a free account to apply as soon as they go live.</p>
            <Link href="/signup?role=talent" className="btn btn-primary mt-6">
              Join as talent
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gigs.map((g) => (
              <GigCard
                key={g.id}
                gig={g}
                action={
                  <Link href="/dashboard/talent" className="btn btn-sm btn-secondary w-full">
                    Apply
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
