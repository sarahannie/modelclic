import type { Metadata } from "next";
import { requireUser, getSettings } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { EventForm } from "@/components/host/EventForm";
import { loadCatalog } from "@/lib/catalogData";

export const metadata: Metadata = { title: "Create event" };

export default async function NewEvent() {
  const { supabase } = await requireUser("host");
  const [cat, settings] = await Promise.all([loadCatalog(supabase), getSettings()]);
  const jobTypes = cat.jobs.map((g) => ({ grp: g.grp, items: g.items.map((label) => ({ label, typical_pay: cat.jobRows.find((r) => r.label === label)?.typical_pay ?? null })) }));
  return (
    <div className="max-w-3xl">
      <BackLink href="/host">Back to events</BackLink>
      <h1 className="t-h1 mt-5">Create event</h1>
      <p className="t-sub mt-1 mb-6">Save as a draft or publish once you’re ready — only published events are visible to talent.</p>
      <EventForm jobTypes={jobTypes} feePct={settings.fee_pct} />
    </div>
  );
}
