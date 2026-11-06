import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createTicket } from "@/app/actions/account";
import { LEGAL_DOCS, type LegalKey } from "@/lib/legal";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { ago } from "@/lib/format";
import type { Ticket } from "@/lib/types";

export const metadata: Metadata = { title: "Help & legal" };

export default async function HelpLegal() {
  const { supabase, profile } = await requireUser(["talent", "host"]);
  const { data } = await supabase.from("tickets").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });
  const tickets = (data as Ticket[]) ?? [];
  return (
    <>
      <h1 className="t-h1">Help & legal</h1>
      <h2 className="mt-6 mb-2 text-sm font-bold text-ink-500">Policies</h2>
      <ul className="card divide-y divide-line-soft">
        {(Object.keys(LEGAL_DOCS) as LegalKey[]).map((k) => (
          <li key={k}><Link href={`/legal/${k}`} className="flex min-h-14 items-center px-5 font-semibold hover:bg-ice-50">{LEGAL_DOCS[k].title}<ChevronRight className="ml-auto size-4 text-ink-400" /></Link></li>
        ))}
      </ul>
      <h2 className="mt-8 mb-2 text-sm font-bold text-ink-500">Support</h2>
      <ul className="card divide-y divide-line-soft">
        <li><Link href="/messages?support=1" className="flex min-h-14 items-center px-5 font-semibold hover:bg-ice-50">Chat with support<ChevronRight className="ml-auto size-4 text-ink-400" /></Link></li>
        <li className="px-5 py-4 text-sm text-ink-500">Email {SUPPORT_EMAIL} · Mon–Sat, 8am–8pm WAT<br />In danger at an event? Use the SOS button on your shift pass, or call 112.</li>
      </ul>

      <h2 id="tickets" className="mt-8 mb-2 scroll-mt-24 text-sm font-bold text-ink-500">My tickets</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <ul className="space-y-3">
          {tickets.length === 0 && <li className="panel-dashed p-6 text-center text-sm text-ink-400">No tickets yet.</li>}
          {tickets.map((t) => (
            <li key={t.id} className="card p-4">
              <div className="flex items-center justify-between gap-2"><p className="font-bold">{t.subject}</p><span className={`badge ${t.status === "resolved" ? "badge-ink" : t.status === "in_progress" ? "badge-ice" : "badge-line"}`}>{t.status.replace("_", " ")}</span></div>
              <p className="mt-1 text-sm text-ink-600">{t.body}</p>
              {t.reply && <p className="mt-3 rounded-xl bg-ice-50 p-3 text-sm"><strong>ModelClic:</strong> {t.reply}</p>}
              <p className="mt-2 text-xs text-ink-400">{ago(t.created_at)}</p>
            </li>
          ))}
        </ul>
        <ActionForm action={createTicket} className="card card-pad space-y-3" resetOnSuccess>
          <p className="font-bold">Open a support ticket</p>
          <input name="subject" required placeholder="Subject" aria-label="Subject" className="field" />
          <textarea name="body" required rows={4} placeholder="What happened?" aria-label="Details" className="field" />
          <SubmitButton className="btn btn-ink w-full" pendingLabel="Sending…">Send ticket</SubmitButton>
        </ActionForm>
      </div>
      <p className="mt-6 text-xs text-ink-400">ModelClic v1.0 · Policies are drafts for review by counsel before launch.</p>
    </>
  );
}
