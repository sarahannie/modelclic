import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { closeGig, setApplicationStatus } from "../actions";
import { eventDate, naira } from "@/lib/format";
import type { Application, Gig, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "My shifts" };

type HostGig = Gig & {
  applications: (Application & { talent: Pick<Profile, "full_name" | "city" | "verified"> | null })[];
};

export default async function HostDashboard({ searchParams }: { searchParams: Promise<{ posted?: string }> }) {
  const { supabase, profile } = await requireProfile("host");
  const { posted } = await searchParams;

  const { data } = await supabase
    .from("gigs")
    .select("*, applications(*, talent:profiles(full_name, city, verified))")
    .eq("host_id", profile.id)
    .order("event_date", { ascending: true });

  const gigs = (data as HostGig[]) ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{profile.full_name}</p>
          <h1 className="mt-2 text-4xl font-medium">My shifts</h1>
        </div>
        <Link href="/dashboard/host/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden /> Post a shift
        </Link>
      </header>

      {posted && (
        <p className="mb-8 rounded-xl bg-success-50 px-4 py-3 text-sm text-success">
          Shift posted. Our team reviews it shortly, then it goes live.
        </p>
      )}

      {gigs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-display text-2xl">No shifts yet.</p>
          <p className="mt-2 text-ink-500">Post your first one — it takes about two minutes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {gigs.map((g) => {
            const active = g.applications.filter((a) => a.status !== "withdrawn");
            const accepted = active.filter((a) => a.status === "accepted").length;
            return (
              <section key={g.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-ice-50 px-6 py-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-sans text-lg font-semibold">{g.title}</h2>
                      <StatusBadge status={g.status} />
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                      {eventDate(g.event_date)} · {g.venue}, {g.city} · {naira(g.pay_ngn)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold">
                      {accepted}/{g.slots} booked
                    </span>
                    {(g.status === "open" || g.status === "pending") && (
                      <form action={closeGig}>
                        <input type="hidden" name="id" value={g.id} />
                        <SubmitButton className="btn btn-sm btn-ghost" pendingLabel="…">
                          Close
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
                {active.length === 0 ? (
                  <p className="px-6 py-5 text-sm text-ink-500">No applicants yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {active.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                        <div>
                          <p className="flex items-center gap-1.5 font-medium">
                            {a.talent?.full_name ?? "Member"}
                            {a.talent?.verified && <BadgeCheck className="size-4 text-vermilion-700" aria-label="Verified" />}
                          </p>
                          <p className="text-sm text-ink-500">{a.talent?.city}</p>
                        </div>
                        {a.status === "applied" ? (
                          <div className="flex gap-2">
                            <form action={setApplicationStatus}>
                              <input type="hidden" name="id" value={a.id} />
                              <input type="hidden" name="status" value="declined" />
                              <SubmitButton className="btn btn-sm btn-ghost" pendingLabel="…">
                                Decline
                              </SubmitButton>
                            </form>
                            <form action={setApplicationStatus}>
                              <input type="hidden" name="id" value={a.id} />
                              <input type="hidden" name="status" value="accepted" />
                              <SubmitButton className="btn btn-sm btn-primary" pendingLabel="…">
                                Book
                              </SubmitButton>
                            </form>
                          </div>
                        ) : (
                          <StatusBadge status={a.status} />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
