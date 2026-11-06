import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { setGigStatus, setVerified } from "../actions";
import { eventDate, naira } from "@/lib/format";
import type { Gig, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Admin" };

type AdminGig = Gig & { host: Pick<Profile, "full_name"> | null };

export default async function AdminDashboard() {
  const { supabase } = await requireProfile("admin");

  const [{ data: gigs }, { data: users }, { count: appCount }] = await Promise.all([
    supabase.from("gigs").select("*, host:profiles(full_name)").order("created_at", { ascending: false }).limit(100),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("applications").select("id", { count: "exact", head: true }),
  ]);

  const allGigs = (gigs as AdminGig[]) ?? [];
  const allUsers = (users as Profile[]) ?? [];
  const pending = allGigs.filter((g) => g.status === "pending");

  const stats = [
    ["Talent", allUsers.filter((u) => u.role === "talent").length],
    ["Hosts", allUsers.filter((u) => u.role === "host").length],
    ["Live shifts", allGigs.filter((g) => g.status === "open").length],
    ["Applications", appCount ?? 0],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-4xl font-medium">Overview</h1>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-ink-500">{label}</p>
            <p className="mt-1 font-display text-4xl">{value}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-medium">
          Shifts awaiting review <span className="text-ink-300">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <div className="card p-8 text-center text-ink-500">All caught up.</div>
        ) : (
          <div className="card divide-y divide-line">
            {pending.map((g) => (
              <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold">{g.title}</p>
                  <p className="text-sm text-ink-500">
                    {g.host?.full_name} · {eventDate(g.event_date)} · {g.city} · {naira(g.pay_ngn)} × {g.slots}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={setGigStatus}>
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <SubmitButton className="btn btn-sm btn-ghost" pendingLabel="…">Reject</SubmitButton>
                  </form>
                  <form action={setGigStatus}>
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="status" value="open" />
                    <SubmitButton className="btn btn-sm btn-primary" pendingLabel="…">Approve</SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-medium">Members</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-ice-50 text-xs tracking-wide text-ink-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">City</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 text-right font-semibold">ID check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium">
                    <span className="flex items-center gap-1.5">
                      {u.full_name}
                      {u.verified && <BadgeCheck className="size-4 text-vermilion-700" aria-label="Verified" />}
                    </span>
                  </td>
                  <td className="px-5 py-3 capitalize">{u.role}</td>
                  <td className="px-5 py-3">{u.city}</td>
                  <td className="px-5 py-3 text-ink-500">
                    {new Date(u.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.role !== "admin" && (
                      <form action={setVerified}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="verified" value={String(!u.verified)} />
                        <SubmitButton
                          className={`btn btn-sm ${u.verified ? "btn-ghost" : "btn-secondary"}`}
                          pendingLabel="…"
                        >
                          {u.verified ? "Unverify" : "Mark verified"}
                        </SubmitButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-medium">All shifts</h2>
        <div className="card divide-y divide-line">
          {allGigs.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <span>
                <strong className="font-semibold">{g.title}</strong>{" "}
                <span className="text-ink-500">· {g.host?.full_name} · {eventDate(g.event_date)}</span>
              </span>
              <span className="flex items-center gap-2">
                <StatusBadge status={g.status} />
                {g.status === "open" && (
                  <form action={setGigStatus}>
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="status" value="closed" />
                    <SubmitButton className="btn btn-sm btn-ghost" pendingLabel="…">Take down</SubmitButton>
                  </form>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
