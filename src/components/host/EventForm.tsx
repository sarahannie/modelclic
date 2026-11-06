"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveEvent } from "@/app/actions/host";
import { NG_STATES } from "@/lib/constants";
import { naira } from "@/lib/format";
import type { MCEvent } from "@/lib/types";

const toLocal = (iso: string | undefined, part: "date" | "time") => {
  if (!iso) return "";
  const s = new Date(new Date(iso).getTime() + 36e5).toISOString(); // Lagos = UTC+1
  return part === "date" ? s.slice(0, 10) : s.slice(11, 16);
};

export function EventForm({ event, jobTypes, feePct }: { event?: MCEvent | null; jobTypes: { grp: string; items: { label: string; typical_pay: number | null }[] }[]; feePct: number }) {
  const [type, setType] = useState(event?.type ?? "");
  const [pay, setPay] = useState<number>(event?.pay_ngn ?? 0);
  const [staff, setStaff] = useState<number>(event?.staff_needed ?? 0);
  const typical = jobTypes.flatMap((g) => g.items).find((t) => t.label === type)?.typical_pay;
  const isDraft = !event || event.status === "draft";
  const total = pay * staff;
  return (
    <ActionForm action={saveEvent} className="space-y-5">
      {event && <input type="hidden" name="id" value={event.id} />}
      <section className="card card-pad space-y-4">
        <h2 className="t-h3">The event</h2>
        <div><label className="label" htmlFor="name">Event name</label><input id="name" name="name" defaultValue={event?.name} required placeholder="e.g. Adeyemi–Okafor Wedding" className="field" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="type">Event type</label>
            <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="field">
              <option value="">Select</option>
              {jobTypes.map((g) => <optgroup key={g.grp} label={g.grp}>{g.items.map((t) => <option key={t.label}>{t.label}</option>)}</optgroup>)}
            </select>
          </div>
          <div><label className="label" htmlFor="staff_needed">Staff required</label><input id="staff_needed" name="staff_needed" type="number" min={1} max={500} defaultValue={event?.staff_needed} onChange={(e) => setStaff(Number(e.target.value))} placeholder="e.g. 8" className="field" /></div>
        </div>
        <div><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={3} defaultValue={event?.description ?? ""} placeholder="What will staff be doing?" className="field" /></div>
      </section>

      <section className="card card-pad space-y-4">
        <h2 className="t-h3">When & where</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="state">State</label><select id="state" name="state" defaultValue={event?.state ?? "Lagos"} className="field">{NG_STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="label" htmlFor="city">City / area</label><input id="city" name="city" defaultValue={event?.city === "—" ? "" : event?.city} placeholder="e.g. Lekki" className="field" /></div>
        </div>
        <div><label className="label" htmlFor="venue">Venue <span className="font-normal text-ink-400">(shared with booked staff)</span></label><input id="venue" name="venue" defaultValue={event?.venue ?? ""} placeholder="e.g. Oriental Hotel" className="field" /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="date">Date</label><input id="date" name="date" type="date" defaultValue={toLocal(event?.starts_at, "date")} className="field" /></div>
          <div><label className="label" htmlFor="start">Start time</label><input id="start" name="start" type="time" defaultValue={toLocal(event?.starts_at, "time")} className="field" /></div>
          <div><label className="label" htmlFor="end">End time</label><input id="end" name="end" type="time" defaultValue={toLocal(event?.ends_at, "time")} className="field" /></div>
        </div>
      </section>

      <section className="card card-pad space-y-4">
        <h2 className="t-h3">Pay & requirements</h2>
        <div>
          <label className="label" htmlFor="pay_ngn">Payment per person (₦)</label>
          <input id="pay_ngn" name="pay_ngn" type="number" min={1000} step={500} defaultValue={event?.pay_ngn} onChange={(e) => setPay(Number(e.target.value))} placeholder="e.g. 15000" className="field" />
          <p className="hint">{typical ? `Typical pay for ${type}: around ${naira(typical)} per person.` : "Choose an event type to see typical pay."}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="dress_code">Dress code</label><input id="dress_code" name="dress_code" defaultValue={event?.dress_code ?? ""} placeholder="e.g. Black tie" className="field" /></div>
          <div>
            <label className="label" htmlFor="gender_req">Gender requirement (if any)</label>
            <select id="gender_req" name="gender_req" defaultValue={event?.gender_req ?? "No preference"} className="field">
              {["No preference", "Female", "Male"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label" htmlFor="checkin_location">Check-in location</label><input id="checkin_location" name="checkin_location" defaultValue={event?.checkin_location ?? ""} placeholder="Where staff should report to" className="field" /></div>
        <div><label className="label" htmlFor="instructions">Special instructions</label><textarea id="instructions" name="instructions" rows={2} defaultValue={event?.instructions ?? ""} placeholder="Anything else staff should know" className="field" /></div>
      </section>

      {total > 0 && (
        <div className="rounded-2xl bg-ink p-5 text-white">
          <div className="flex justify-between text-sm text-white/70"><span>Staff pay ({staff} × {naira(pay)})</span><span className="num">{naira(total)}</span></div>
          <div className="mt-1 flex justify-between text-sm text-white/70"><span>Service fee ({feePct}%)</span><span className="num">{naira(Math.round((total * feePct) / 100))}</span></div>
          <div className="mt-3 flex justify-between border-t border-white/15 pt-3 font-extrabold"><span>Estimated total</span><span className="num">{naira(Math.round(total * (1 + feePct / 100)))}</span></div>
          <p className="mt-2 text-xs text-white/55">Pay goes into escrow per person as they accept your offers. The fee is charged when the job completes.</p>
        </div>
      )}

      <div className="card flex flex-wrap items-center justify-end gap-3 p-4">
        <p className="mr-auto text-xs text-ink-400">Only published events are visible to talent. We review new events within 4 hours.</p>
        {isDraft && <SubmitButton name="intent" value="draft" className="btn btn-secondary" pendingLabel="Saving…">Save draft</SubmitButton>}
        <SubmitButton name="intent" value="publish" className="btn btn-primary" pendingLabel="Publishing…">{isDraft ? "Publish event" : event?.status === "rejected" ? "Resubmit for review" : "Save changes"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
