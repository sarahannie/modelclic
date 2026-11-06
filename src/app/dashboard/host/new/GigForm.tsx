"use client";

import { useActionState } from "react";
import { createGig } from "../../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { CATEGORIES, CITIES } from "@/lib/types";

export function GigForm() {
  const [state, action] = useActionState(createGig, undefined);
  return (
    <form action={action} className="card space-y-6 p-6 md:p-8">
      <div>
        <label htmlFor="title" className="label">Shift title</label>
        <input id="title" name="title" required placeholder="e.g. Wedding ushers — Oriental Hotel" className="field" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="label">Role type</label>
          <select id="category" name="category" className="field">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="label">City</label>
          <select id="city" name="city" className="field">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="venue" className="label">Venue / area</label>
        <input id="venue" name="venue" required placeholder="e.g. Victoria Island" className="field" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="label">Date</label>
          <input id="date" name="date" type="date" required className="field" />
        </div>
        <div>
          <label htmlFor="time" className="label">Start time</label>
          <input id="time" name="time" type="time" required className="field" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="pay_ngn" className="label">Pay per person (₦)</label>
          <input id="pay_ngn" name="pay_ngn" type="number" min={1000} step={500} required placeholder="25000" className="field" />
        </div>
        <div>
          <label htmlFor="slots" className="label">Staff needed</label>
          <input id="slots" name="slots" type="number" min={1} max={200} defaultValue={1} required className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="label">
          Details <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <textarea id="description" name="description" rows={4} placeholder="Dress code, hours, what to bring…" className="field" />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-vermilion-50 px-4 py-3 text-sm text-vermilion-700">{state.error}</p>
      )}
      <div className="flex justify-end">
        <SubmitButton className="btn btn-primary" pendingLabel="Posting…">Post shift</SubmitButton>
      </div>
    </form>
  );
}
