import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminChrome } from "@/components/shell/AdminChrome";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, demo } = await requireUser("admin");
  const head = (t: string) => supabase.from(t).select("id", { count: "exact", head: true });
  const [v, e, d, s, t, p] = await Promise.all([
    head("verifications").eq("status", "pending"),
    head("events").eq("status", "pending"),
    head("disputes").neq("status", "resolved"),
    head("sos_alerts").neq("status", "resolved"),
    head("tickets").neq("status", "resolved"),
    head("wallet_tx").eq("status", "pending").in("type", ["deposit", "withdrawal"]),
  ]);
  const counts = {
    verification: v.count ?? 0, events: e.count ?? 0, disputes: d.count ?? 0, sos: s.count ?? 0, tickets: t.count ?? 0, payouts: p.count ?? 0,
  };
  return (
    <Suspense>
      <AdminChrome name={profile.full_name} title={profile.staff_title} avatar={profile.avatar_url} counts={counts} demo={demo}>
        {children}
      </AdminChrome>
    </Suspense>
  );
}
