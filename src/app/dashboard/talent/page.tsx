import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { GigCard } from "@/components/GigCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { applyToGig, withdrawApplication } from "../actions";
import { eventDate, naira } from "@/lib/format";
import type { Application, Gig } from "@/lib/types";

export const metadata: Metadata = { title: "Find shifts" };

type MyApp = Application & { gig: Gig | null };

export default async function TalentDashboard() {
  const { supabase, profile } = await requireProfile("talent");

  const [{ data: gigs }, { data: apps }] = await Promise.all([
    supabase
      .from("gigs")
      .select("*")
      .eq("status", "open")
      .gte("event_date", new Date().toISOString())
      .order("event_date"),
    supabase
      .from("applications")
      .select("*, gig:gigs(*)")
      .eq("talent_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const myApps = (apps as MyApp[]) ?? [];
  const appliedIds = new Set(myApps.filter((a) => a.status !== "withdrawn").map((a) => a.gig_id));

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10">
        <p className="eyebrow">Hi {profile.full_name.split(" ")[0]}</p>
        <h1 className="mt-2 text-4xl font-medium">Find shifts</h1>
        {!profile.verified && (
          <p className="mt-4 inline-flex rounded-xl bg-warn-50 px-4 py-2 text-sm text-warn">
            Your ID check is pending — you can apply now; hosts see your badge once verified.
          </p>
        )}
      </header>

      {myApps.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-medium">My applications</h2>
          <div className="card divide-y divide-line">
            {myApps.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold">{a.gig?.title ?? "Shift removed"}</p>
                  {a.gig && (
                    <p className="text-sm text-ink-500">
                      {eventDate(a.gig.event_date)} · {a.gig.city} · {naira(a.gig.pay_ngn)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  {a.status === "applied" && (
                    <form action={withdrawApplication}>
                      <input type="hidden" name="id" value={a.id} />
                      <SubmitButton className="btn btn-sm btn-ghost" pendingLabel="…">
                        Withdraw
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-medium">Open shifts</h2>
        {!gigs?.length ? (
          <div className="card p-10 text-center text-ink-500">No open shifts right now. Check back soon.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(gigs as Gig[]).map((g) => (
              <GigCard
                key={g.id}
                gig={g}
                action={
                  appliedIds.has(g.id) ? (
                    <span className="btn btn-sm w-full bg-ice-100 text-ink-700">Applied ✓</span>
                  ) : (
                    <form action={applyToGig}>
                      <input type="hidden" name="gig_id" value={g.id} />
                      <SubmitButton className="btn btn-sm btn-primary w-full" pendingLabel="Applying…">
                        Apply
                      </SubmitButton>
                    </form>
                  )
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
