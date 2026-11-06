import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser, getSettings } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { EventForm } from "@/components/host/EventForm";
import { loadCatalog } from "@/lib/catalogData";
import type { MCEvent } from "@/lib/types";

export const metadata: Metadata = { title: "Edit event" };

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireUser("host");
  const { data } = await supabase.from("events").select("*").eq("id", id).eq("host_id", profile.id).maybeSingle();
  if (!data) notFound();
  const [cat, settings] = await Promise.all([loadCatalog(supabase), getSettings()]);
  const jobTypes = cat.jobs.map((g) => ({ grp: g.grp, items: g.items.map((label) => ({ label, typical_pay: cat.jobRows.find((r) => r.label === label)?.typical_pay ?? null })) }));
  return (
    <div className="max-w-3xl">
      <BackLink href={`/host/events/${id}`}>Back to event</BackLink>
      <h1 className="t-h1 mt-5 mb-6">Edit event</h1>
      <EventForm event={data as MCEvent} jobTypes={jobTypes} feePct={settings.fee_pct} />
    </div>
  );
}
