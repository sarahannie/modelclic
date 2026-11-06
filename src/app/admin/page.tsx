import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarDays, MapPin, Phone, ScanFace, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { profilesById, eventsById, hostName } from "@/lib/queries";
import { ago, dateShort, initials, naira, nairaShort, timeRange } from "@/lib/format";
import { Empty, EventBadge, KycBadge, Stat, TxBadge } from "@/components/ui/kit";
import { HBars, LineChart } from "@/components/ui/charts";
import { RpcButton } from "@/components/ui/RpcButton";
import { ActButton } from "@/components/ui/ActButton";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SKILL_GROUPS, JOB_GROUPS } from "@/lib/catalog";
import {
  addCatalogItem, removeCatalogItem, replyTicket, resolveDispute, saveSettings, setCaseStatus, setMemberKyc,
} from "@/app/actions/admin";
import type { CatalogItem, Dispute, MCEvent, Profile, SosAlert, Ticket, Verification, WalletTx } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type Tab = "verification" | "events" | "disputes" | "sos" | "tickets" | "payouts" | "analytics" | "catalog" | "members" | "settings";
const QUEUE_TABS: Tab[] = ["sos", "verification", "events", "disputes", "tickets"];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: raw } = await searchParams;
  const tab = (raw ?? "verification") as Tab;
  const { supabase, profile } = await requireUser("admin");

  const head = (t: string) => supabase.from(t).select("id", { count: "exact", head: true });
  const [s, v, e, d, t] = await Promise.all([
    head("sos_alerts").neq("status", "resolved"),
    head("verifications").eq("status", "pending"),
    head("events").eq("status", "pending"),
    head("disputes").neq("status", "resolved"),
    head("tickets").neq("status", "resolved"),
  ]);

  const titles: Record<Tab, [string, string]> = {
    verification: ["Identity checks", "Work the queues top to bottom. Safety first, then identity, then money."],
    events: ["Events to review", "Approve events before talent can see them."],
    disputes: ["Disputes", "No-shows, payment and conduct issues. Escrow stays on hold while a dispute is open."],
    sos: ["SOS alerts", "Call back within the SLA. Every alert includes the shift and last known location."],
    tickets: ["Support tickets", "Reply within 24 hours. Replies notify the member."],
    payouts: ["Payments", "Confirm bank-transfer top-ups and pay out withdrawals until a payment provider is connected."],
    analytics: ["Analytics", "How the marketplace is growing and where bookings drop off."],
    catalog: ["Skills & job types", "The options talent pick on their profile and hosts filter by. Removing one doesn't change existing profiles."],
    members: ["Members", "Everyone on ModelClic. Override identity status here if needed."],
    settings: ["Settings", "Fees, bid points and payout details. Changes apply immediately."],
  };
  const [title, sub] = titles[tab] ?? titles.verification;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7">
        <h1 className="t-h1">{title}</h1>
        <p className="t-sub mt-1.5">{sub}</p>
      </header>

      {QUEUE_TABS.includes(tab) && (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["sos", "Active SOS", s.count, "Respond within 2 minutes"],
            ["verification", "Identity checks", v.count, "Target: under 15 minutes"],
            ["events", "Events to review", e.count, "Target: under 4 hours"],
            ["disputes", "Open disputes", d.count, "Target: under 48 hours"],
            ["tickets", "Open tickets", t.count, "Target: under 24 hours"],
          ].map(([k, label, n, hint]) => (
            <Link key={k as string} href={`/admin?tab=${k}`} className={`card p-4 transition hover:-translate-y-0.5 ${tab === k ? "ring-2 ring-ink" : ""} ${k === "sos" && Number(n) > 0 ? "bg-vermilion-50" : ""}`}>
              <p className="text-[13px] font-semibold text-ink-500">{label as string}</p>
              <p className={`num mt-1 text-[28px] font-extrabold tracking-[-0.03em] ${k === "sos" && Number(n) > 0 ? "text-vermilion-700" : ""}`}>{n ?? 0}</p>
              <p className="mt-0.5 text-[11px] text-ink-400">{hint as string}</p>
            </Link>
          ))}
        </div>
      )}

      {tab === "verification" && <Verifications supabase={supabase} />}
      {tab === "events" && <EventsQueue supabase={supabase} />}
      {tab === "disputes" && <Disputes supabase={supabase} />}
      {tab === "sos" && <Sos supabase={supabase} />}
      {tab === "tickets" && <Tickets supabase={supabase} />}
      {tab === "payouts" && <Payouts supabase={supabase} />}
      {tab === "analytics" && <Analytics supabase={supabase} />}
      {tab === "catalog" && <Catalog supabase={supabase} />}
      {tab === "members" && <Members supabase={supabase} />}
      {tab === "settings" && <SettingsTab supabase={supabase} staffTitle={profile.staff_title} />}
    </div>
  );
}

type P = { supabase: SupabaseClient };

function Person({ p, sub }: { p?: Profile | null; sub?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {p?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar_url} alt="" className="size-10 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ice text-xs font-extrabold">{initials(p?.full_name)}</span>
      )}
      <div className="min-w-0">
        <p className="truncate font-bold">{p ? (p.role === "host" ? hostName(p) : p.full_name) : "Member"}</p>
        {sub && <p className="truncate text-[13px] text-ink-500">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Identity checks ─────────────────────────────────────────────── */
async function Verifications({ supabase }: P) {
  const { data } = await supabase.from("verifications").select("*").order("created_at", { ascending: false }).limit(40);
  const rows = (data as Verification[]) ?? [];
  const people = await profilesById(supabase, rows.map((r) => r.user_id));
  const pending = rows.filter((r) => r.status === "pending");
  const done = rows.filter((r) => r.status !== "pending").slice(0, 10);
  const photo = async (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("/") || path.startsWith("http")) return path;
    const { data: u } = await supabase.storage.from("kyc").createSignedUrl(path, 600);
    return u?.signedUrl ?? null;
  };
  const withPhotos = await Promise.all(pending.map(async (r) => ({ r, selfie: await photo(r.selfie_path), idDoc: await photo(r.id_doc_path) })));

  return (
    <div className="space-y-8">
      {withPhotos.length === 0 ? (
        <Empty title="Queue clear" body="New identity checks appear here as members submit them." icon={<ShieldCheck className="size-5" />} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {withPhotos.map(({ r, selfie, idDoc }) => {
            const p = people.get(r.user_id);
            return (
              <article key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <Person p={p} sub={<>{r.side === "host" ? "Event host" : "Talent"} · submitted {ago(r.created_at)}</>} />
                  <span className="badge badge-ice">{r.side === "host" ? "Host" : "Talent"}</span>
                </div>
                <div className="mt-4 grid grid-cols-[96px_96px_1fr] gap-3">
                  {[selfie, idDoc].map((src, i) => (
                    <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl border border-line bg-ice-50">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt={i ? "ID document" : "Selfie"} className="size-full object-cover" />
                      ) : (
                        <span className="grid size-full place-items-center text-[11px] text-ink-400">{i ? "No ID photo" : "No selfie"}</span>
                      )}
                    </div>
                  ))}
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-[11px] font-bold tracking-wide text-ink-400 uppercase">NIN</dt><dd className="num font-semibold">{r.nin.replace(/^(\d{3})\d{5}/, "$1•••••")}</dd></div>
                    {r.cac && <div><dt className="text-[11px] font-bold tracking-wide text-ink-400 uppercase">CAC</dt><dd className="font-semibold">{r.cac}</dd></div>}
                    <div className="flex items-center gap-1.5 font-semibold"><ScanFace className="size-4 text-ink-500" /> Liveness {r.liveness ? "passed" : "not done"}</div>
                  </dl>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <RpcButton fn="admin_review_verification" args={{ p_id: r.id, p_approve: false, p_notes: "Photos unclear — please retake." }} success="Sent back for another try" className="btn btn-sm btn-secondary">Ask to retake</RpcButton>
                  <RpcButton fn="admin_review_verification" args={{ p_id: r.id, p_approve: true }} success="Verified ✓" className="btn btn-sm btn-ink"><BadgeCheck className="size-4" /> Approve</RpcButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {done.length > 0 && (
        <section>
          <h2 className="t-h3 mb-3">Recently reviewed</h2>
          <div className="card divide-y divide-line-soft">
            {done.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Person p={people.get(r.user_id)} sub={`${r.side === "host" ? "Event host" : "Student talent"} account · ${r.reviewed_at ? ago(r.reviewed_at) : ""}`} />
                <KycBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Events queue ────────────────────────────────────────────────── */
async function EventsQueue({ supabase }: P) {
  const { data } = await supabase.from("events").select("*").in("status", ["pending", "active", "filled", "rejected"]).order("created_at", { ascending: false }).limit(60);
  const rows = (data as MCEvent[]) ?? [];
  const hosts = await profilesById(supabase, rows.map((r) => r.host_id));
  const pending = rows.filter((r) => r.status === "pending");
  const others = rows.filter((r) => r.status !== "pending").slice(0, 15);
  return (
    <div className="space-y-8">
      {pending.length === 0 ? (
        <Empty title="No events waiting" body="Hosts' new events land here for a quick check before going live." icon={<CalendarDays className="size-5" />} />
      ) : (
        <div className="space-y-3">
          {pending.map((ev) => {
            const h = hosts.get(ev.host_id);
            return (
              <article key={ev.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="badge badge-ice">{ev.type}</span><EventBadge status={ev.status} /></div>
                    <h3 className="mt-2 text-lg font-extrabold tracking-[-0.02em]">{ev.name}</h3>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                      <span>{hostName(h)} {h?.host_kyc === "verified" ? "· verified host" : "· host not verified"}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{dateShort(ev.starts_at)} · {timeRange(ev.starts_at, ev.ends_at)}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{[ev.venue, ev.city, ev.state].filter(Boolean).join(", ")}</span>
                    </p>
                    {ev.description && <p className="mt-2 max-w-2xl text-sm text-ink-700">{ev.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="num text-2xl font-extrabold">{naira(ev.pay_ngn)}</p>
                    <p className="text-xs text-ink-500">per person × {ev.staff_needed}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line-soft pt-4">
                  <RpcButton fn="admin_review_event" args={{ p_id: ev.id, p_approve: false, p_note: "Please add clearer details about the role and venue." }} success="Sent back to the host" className="btn btn-sm btn-secondary">Request changes</RpcButton>
                  <RpcButton fn="admin_review_event" args={{ p_id: ev.id, p_approve: true }} success="Event is live" className="btn btn-sm btn-ink">Approve &amp; publish</RpcButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {others.length > 0 && (
        <section>
          <h2 className="t-h3 mb-3">Live and recent</h2>
          <div className="card overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Event</th><th>Host</th><th>Date</th><th>Pay</th><th>Status</th></tr></thead>
              <tbody>
                {others.map((ev) => (
                  <tr key={ev.id}>
                    <td className="font-semibold">{ev.name}</td>
                    <td>{hostName(hosts.get(ev.host_id))}</td>
                    <td className="whitespace-nowrap">{dateShort(ev.starts_at)}</td>
                    <td className="num">{naira(ev.pay_ngn)} × {ev.staff_needed}</td>
                    <td><EventBadge status={ev.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Disputes ────────────────────────────────────────────────────── */
async function Disputes({ supabase }: P) {
  const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false }).limit(40);
  const rows = (data as Dispute[]) ?? [];
  const people = await profilesById(supabase, rows.flatMap((r) => [r.raised_by, r.against_id]));
  const events = await eventsById(supabase, rows.map((r) => r.event_id));
  if (!rows.length) return <Empty title="No disputes" body="When a host reports a no-show or someone raises a payment issue, it appears here." />;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <article key={r.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-red">{r.kind.replace("_", "-")}</span>
                <span className={`badge ${r.status === "resolved" ? "badge-ink" : "badge-line"}`}>{r.status.replace("_", " ")}</span>
                <span className="text-xs text-ink-400">{ago(r.created_at)}</span>
              </div>
              <p className="mt-2 font-bold">{events.get(r.event_id ?? "")?.name ?? "General"}</p>
              <p className="mt-1 text-sm text-ink-700">{r.details}</p>
              <p className="mt-2 text-[13px] text-ink-500">
                Raised by <strong className="text-ink">{hostName(people.get(r.raised_by)) }</strong>
                {r.against_id && <> · against <strong className="text-ink">{people.get(r.against_id)?.full_name ?? "member"}</strong></>}
              </p>
              {r.resolution && <p className="mt-2 rounded-xl bg-ice-50 px-3 py-2 text-sm"><strong>Outcome:</strong> {r.resolution}</p>}
            </div>
          </div>
          {r.status !== "resolved" && (
            <ActionForm action={resolveDispute} className="mt-4 flex flex-col gap-2 border-t border-line-soft pt-4 sm:flex-row">
              <input type="hidden" name="id" value={r.id} />
              <input name="resolution" placeholder="Outcome, e.g. Refunded host; warning issued to talent" className="field flex-1" />
              <div className="flex gap-2">
                {r.status === "open" && <ActButton action={setCaseStatus.bind(null, "disputes", r.id, "in_progress", undefined)}>Take it</ActButton>}
                <SubmitButton className="btn btn-sm btn-ink" pendingLabel="Saving…">Resolve</SubmitButton>
              </div>
            </ActionForm>
          )}
        </article>
      ))}
    </div>
  );
}

/* ── SOS ─────────────────────────────────────────────────────────── */
async function Sos({ supabase }: P) {
  const { data } = await supabase.from("sos_alerts").select("*").order("created_at", { ascending: false }).limit(40);
  const rows = (data as SosAlert[]) ?? [];
  const people = await profilesById(supabase, rows.map((r) => r.user_id));
  const events = await eventsById(supabase, rows.map((r) => r.event_id));
  const priv = rows.length
    ? new Map((((await supabase.from("private_details").select("id, phone, ec_name, ec_relationship, ec_phone").in("id", rows.map((r) => r.user_id))).data) as { id: string; phone: string | null; ec_name: string | null; ec_relationship: string | null; ec_phone: string | null }[] ?? []).map((x) => [x.id, x]))
    : new Map();
  const active = rows.filter((r) => r.status !== "resolved");
  return (
    <div className="space-y-8">
      {active.length === 0 ? (
        <Empty title="No active SOS alerts." body="Alerts sound here the moment someone slides SOS on their shift pass." icon={<ShieldCheck className="size-5" />} />
      ) : (
        <div className="space-y-3">
          {active.map((r) => {
            const p = people.get(r.user_id), ev = events.get(r.event_id ?? ""), pd = priv.get(r.user_id);
            return (
              <article key={r.id} className="card border-vermilion/40 bg-vermilion-50/40 p-5 ring-2 ring-vermilion/40">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-vermilion text-white"><AlertTriangle className="size-5" /></span>
                    <div>
                      <p className="text-lg font-extrabold">{p?.full_name ?? "Member"} needs help</p>
                      <p className="text-sm text-ink-600">{ev ? `${ev.name} · ${[ev.venue, ev.city].filter(Boolean).join(", ")}` : "No shift linked"} · raised {ago(r.created_at)}</p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                        {pd?.phone && <span className="inline-flex items-center gap-1.5 font-semibold"><Phone className="size-4" /> {pd.phone}</span>}
                        {pd?.ec_name && <span className="text-ink-600">Emergency contact: <strong className="text-ink">{pd.ec_name}</strong> ({pd.ec_relationship}) {pd.ec_phone}</span>}
                        {r.lat != null && <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-vermilion-700 underline"><MapPin className="size-4" /> Last location</a>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {r.status === "open" && <ActButton action={setCaseStatus.bind(null, "sos_alerts", r.id, "in_progress", undefined)} className="btn btn-sm btn-secondary">I&rsquo;m on it</ActButton>}
                    <ActButton action={setCaseStatus.bind(null, "sos_alerts", r.id, "resolved", undefined)} className="btn btn-sm btn-ink">Mark safe</ActButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {rows.length > active.length && (
        <section>
          <h2 className="t-h3 mb-3">Resolved</h2>
          <div className="card divide-y divide-line-soft">
            {rows.filter((r) => r.status === "resolved").slice(0, 10).map((r) => (
              <div key={r.id} className="flex justify-between gap-3 px-5 py-3 text-sm">
                <span className="font-semibold">{people.get(r.user_id)?.full_name}</span>
                <span className="text-ink-500">{ago(r.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Tickets ─────────────────────────────────────────────────────── */
async function Tickets({ supabase }: P) {
  const { data } = await supabase.from("tickets").select("*").order("updated_at", { ascending: false }).limit(40);
  const rows = (data as Ticket[]) ?? [];
  const people = await profilesById(supabase, rows.map((r) => r.user_id));
  if (!rows.length) return <Empty title="Inbox zero" body="Support tickets from members appear here." />;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <article key={r.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Person p={people.get(r.user_id)} sub={<>{r.subject} · {ago(r.created_at)}</>} />
            <span className={`badge ${r.status === "resolved" ? "badge-ink" : r.status === "open" ? "badge-red" : "badge-ice"}`}>{r.status.replace("_", " ")}</span>
          </div>
          <p className="mt-3 text-sm text-ink-700">{r.body}</p>
          {r.reply && <p className="mt-3 rounded-xl bg-ice-50 px-3 py-2 text-sm"><strong>Our reply:</strong> {r.reply}</p>}
          {r.status !== "resolved" && (
            <ActionForm action={replyTicket} resetOnSuccess className="mt-4 space-y-2 border-t border-line-soft pt-4">
              <input type="hidden" name="id" value={r.id} />
              <textarea name="reply" rows={2} placeholder="Write a reply…" className="field" />
              <div className="flex items-center justify-end gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-600"><input type="checkbox" name="close" className="size-4 accent-[#0e1a2b]" /> Close ticket</label>
                <SubmitButton className="btn btn-sm btn-ink" pendingLabel="Sending…">Send reply</SubmitButton>
              </div>
            </ActionForm>
          )}
        </article>
      ))}
    </div>
  );
}

/* ── Payments (manual settlement) ───────────────────────────────── */
async function Payouts({ supabase }: P) {
  const { data } = await supabase.from("wallet_tx").select("*").in("type", ["deposit", "withdrawal"]).order("created_at", { ascending: false }).limit(60);
  const rows = (data as WalletTx[]) ?? [];
  const people = await profilesById(supabase, rows.map((r) => r.user_id));
  const banks = rows.length
    ? new Map((((await supabase.from("private_details").select("id, bank_name, account_number").in("id", rows.map((r) => r.user_id))).data) as { id: string; bank_name: string | null; account_number: string | null }[] ?? []).map((x) => [x.id, x]))
    : new Map();
  const pending = rows.filter((r) => r.status === "pending");
  const sumOf = (t: string) => pending.filter((r) => r.type === t).reduce((a, r) => a + Math.abs(r.amount), 0);
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Top-ups to confirm" value={pending.filter((r) => r.type === "deposit").length} sub={naira(sumOf("deposit"))} />
        <Stat label="Withdrawals to pay" value={pending.filter((r) => r.type === "withdrawal").length} sub={naira(sumOf("withdrawal"))} />
        <Stat label="Settled (last 60)" value={rows.length - pending.length} />
      </div>
      <div className="card overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Member</th><th>Type</th><th>Amount</th><th>Reference / bank</th><th>When</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-ink-500">No top-ups or withdrawals yet.</td></tr>}
            {rows.map((r) => {
              const b = banks.get(r.user_id);
              return (
                <tr key={r.id}>
                  <td className="font-semibold">{hostName(people.get(r.user_id)) }</td>
                  <td>{r.type === "deposit" ? "Top-up" : "Withdrawal"}</td>
                  <td className={`num font-bold ${r.amount > 0 ? "" : "text-vermilion-700"}`}>{r.amount > 0 ? "+" : "−"}{naira(Math.abs(r.amount))}</td>
                  <td className="text-[13px] text-ink-600">{r.type === "deposit" ? r.reference ?? "—" : b?.account_number ? `${b.bank_name ?? "Bank"} ••••${b.account_number.slice(-4)}` : "No payout account yet"}</td>
                  <td className="whitespace-nowrap text-ink-500">{ago(r.created_at)}</td>
                  <td><TxBadge status={r.status} /></td>
                  <td className="text-right">
                    {r.status === "pending" && (
                      <span className="inline-flex gap-1.5">
                        <RpcButton fn="admin_settle_tx" args={{ p_id: r.id, p_ok: false }} success="Marked failed" className="btn btn-xs btn-secondary" confirm="Mark this as failed?">Fail</RpcButton>
                        <RpcButton fn="admin_settle_tx" args={{ p_id: r.id, p_ok: true }} success={r.type === "deposit" ? "Top-up confirmed" : "Marked paid"} className="btn btn-xs btn-ink">{r.type === "deposit" ? "Confirm received" : "Mark paid"}</RpcButton>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Analytics ───────────────────────────────────────────────────── */
type AnalyticsData = {
  verified_members: number; verified_14d: number; events_30d: number; revenue_30d: number; escrow_now: number;
  checks_per_day: { day: string; count: number }[];
  funnel: { bids: number; offers: number; booked: number; completed: number };
  by_type: { type: string; count: number }[];
  members: { talent: number; hosts: number };
};
async function Analytics({ supabase }: P) {
  const { data } = await supabase.rpc("admin_analytics");
  const a = data as AnalyticsData | null;
  if (!a) return <Empty title="No data yet" />;
  const f = a.funnel;
  const drop = f.bids ? Math.round((1 - f.offers / f.bids) * 100) : 0;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Verified members" value={a.verified_members.toLocaleString("en-NG")} sub={<span className="font-semibold text-vermilion-700">+{a.verified_14d} in 14 days</span>} />
        <Stat label="Events created" value={a.events_30d} sub="last 30 days" />
        <Stat label="Service revenue" value={nairaShort(a.revenue_30d)} sub="last 30 days" />
        <Stat label="Held in escrow" value={nairaShort(a.escrow_now)} sub="right now" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <section className="card p-5">
          <h2 className="t-h3">Identity checks passed per day</h2>
          <p className="mb-4 text-xs text-ink-500">Last 14 days · hover for the day&rsquo;s count</p>
          <LineChart data={a.checks_per_day.map((d) => ({ label: new Date(d.day).toLocaleDateString("en-NG", { month: "short", day: "numeric" }), value: d.count }))} height={220} />
        </section>
        <section className="card p-5">
          <h2 className="t-h3">Booking funnel</h2>
          <p className="mb-4 text-xs text-ink-500">Last 30 days · share of bids</p>
          <HBars data={[{ label: "Bids placed", value: f.bids }, { label: "Offers sent", value: f.offers }, { label: "Booked", value: f.booked }, { label: "Completed", value: f.completed }]} />
          <p className="mt-4 rounded-xl bg-ice-50 px-3 py-2 text-xs text-ink-600">
            Biggest drop: bids → offers ({drop}%). Hosts pick about 1 in {f.offers ? Math.round(f.bids / f.offers) : "—"} bidders.
          </p>
        </section>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <section className="card p-5">
          <h2 className="t-h3">Events by type</h2>
          <p className="mb-4 text-xs text-ink-500">Last 30 days</p>
          <HBars data={a.by_type.map((t) => ({ label: t.type, value: t.count }))} />
        </section>
        <section className="card p-5">
          <h2 className="t-h3">Members</h2>
          <p className="mb-4 text-xs text-ink-500">All time</p>
          <div className="flex h-4 overflow-hidden rounded-full">
            <span className="bg-ink" style={{ flex: a.members.talent }} />
            <span className="bg-vermilion" style={{ flex: a.members.hosts }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div><p className="flex items-center gap-2 text-[13px] font-semibold text-ink-500"><span className="size-2.5 rounded-full bg-ink" />Talent</p><p className="num text-2xl font-extrabold">{a.members.talent.toLocaleString("en-NG")}</p></div>
            <div><p className="flex items-center gap-2 text-[13px] font-semibold text-ink-500"><span className="size-2.5 rounded-full bg-vermilion" />Hosts</p><p className="num text-2xl font-extrabold">{a.members.hosts.toLocaleString("en-NG")}</p></div>
          </div>
          <p className="mt-4 text-xs text-ink-500">{a.members.hosts ? Math.round(a.members.talent / a.members.hosts) : "—"} talent per host.</p>
        </section>
      </div>
    </div>
  );
}

/* ── Catalog ─────────────────────────────────────────────────────── */
async function Catalog({ supabase }: P) {
  const { data } = await supabase.from("catalog_items").select("*").order("label");
  const items = (data as CatalogItem[]) ?? [];
  const block = (kind: "skill" | "job_type", groups: readonly string[], title: string) => {
    const list = items.filter((i) => i.kind === kind);
    return (
      <section className="card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="t-h3">{title}</h2>
          <span className="text-xs font-semibold text-ink-400">{list.length} total</span>
        </div>
        <ActionForm action={addCatalogItem} resetOnSuccess className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="kind" value={kind} />
          <input name="label" placeholder={kind === "skill" ? "New skill, e.g. Tour guide" : "New job type, e.g. Carnivals"} className="field flex-1" />
          <select name="grp" className="field sm:w-44">{groups.map((g) => <option key={g}>{g}</option>)}</select>
          <SubmitButton className="btn btn-ink" pendingLabel="…">Add</SubmitButton>
        </ActionForm>
        <div className="mt-5 space-y-4">
          {groups.map((g) => {
            const inG = list.filter((i) => i.grp === g);
            if (!inG.length) return null;
            return (
              <div key={g}>
                <p className="mb-2 text-[11px] font-bold tracking-[0.12em] text-ink-400 uppercase">{g}</p>
                <div className="flex flex-wrap gap-1.5">
                  {inG.map((i) => (
                    <span key={i.id} className="inline-flex items-center gap-1 rounded-full border border-line bg-white py-1 pr-1 pl-3 text-[13px] font-semibold">
                      {i.label}
                      <ActButton action={removeCatalogItem.bind(null, i.id)} className="grid size-6 place-items-center rounded-full text-ink-400 hover:bg-vermilion-50 hover:text-vermilion-700" confirm={`Remove “${i.label}”?`} title="Remove">×</ActButton>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };
  return <div className="grid gap-5 lg:grid-cols-2">{block("skill", SKILL_GROUPS, "Skills")}{block("job_type", JOB_GROUPS, "Job types")}</div>;
}

/* ── Members ─────────────────────────────────────────────────────── */
async function Members({ supabase }: P) {
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data as Profile[]) ?? [];
  return (
    <div className="card overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Name</th><th>Role</th><th>Location</th><th>Rating</th><th>Joined</th><th>Identity</th><th /></tr></thead>
        <tbody>
          {rows.map((p) => {
            const side = p.role === "host" ? "host" : "talent";
            const k = side === "host" ? p.host_kyc : p.kyc;
            return (
              <tr key={p.id}>
                <td><Person p={p} /></td>
                <td className="capitalize">{p.role}</td>
                <td className="text-ink-600">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</td>
                <td className="num">{p.rating_avg ? `★ ${Number(p.rating_avg).toFixed(1)}` : "—"}</td>
                <td className="whitespace-nowrap text-ink-500">{dateShort(p.created_at)}</td>
                <td>{p.role === "admin" ? <span className="badge badge-ink">Staff</span> : <KycBadge status={k} />}</td>
                <td className="text-right">
                  {p.role !== "admin" && (k === "verified"
                    ? <ActButton action={setMemberKyc.bind(null, p.id, side, "unverified")} className="btn btn-xs btn-ghost" confirm="Remove this member's verified badge?">Unverify</ActButton>
                    : <ActButton action={setMemberKyc.bind(null, p.id, side, "verified")} className="btn btn-xs btn-secondary">Mark verified</ActButton>)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Settings ────────────────────────────────────────────────────── */
async function SettingsTab({ supabase, staffTitle }: P & { staffTitle: string | null }) {
  const { data } = await supabase.from("app_settings").select("*").maybeSingle();
  const st = (data ?? {}) as Record<string, string | number>;
  const num = (name: string, label: string, hint: string, suffix: string) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <div className="relative">
        <input id={name} name={name} type="number" defaultValue={st[name] as number} className="field pr-16" />
        <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs font-semibold text-ink-400">{suffix}</span>
      </div>
      <p className="hint">{hint}</p>
    </div>
  );
  return (
    <ActionForm action={saveSettings} className="grid gap-5 lg:grid-cols-2">
      <section className="card space-y-4 p-5">
        <h2 className="t-h3">Marketplace</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {num("fee_pct", "Service fee", "Charged to hosts on each completed booking.", "%")}
          {num("bid_cost", "Bid cost", "Points per bid.", "points")}
          {num("monthly_points", "Free points / month", "Talent are topped up to this on the 1st.", "points")}
          {num("auto_release_hours", "Auto-release pay", "After the event ends, if the host doesn't confirm.", "hours")}
          {num("sos_sla_minutes", "SOS response target", "Shown to talent on their shift pass.", "min")}
        </div>
      </section>
      <section className="card space-y-4 p-5">
        <h2 className="t-h3">Top-up bank details</h2>
        <p className="-mt-2 text-xs text-ink-500">Shown to hosts when they fund their wallet by bank transfer.</p>
        <div><label className="label" htmlFor="topup_bank">Bank</label><input id="topup_bank" name="topup_bank" defaultValue={st.topup_bank as string} className="field" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="topup_account_name">Account name</label><input id="topup_account_name" name="topup_account_name" defaultValue={st.topup_account_name as string} className="field" /></div>
          <div><label className="label" htmlFor="topup_account_no">Account number</label><input id="topup_account_no" name="topup_account_no" defaultValue={st.topup_account_no as string} className="field num" /></div>
        </div>
        <div><label className="label" htmlFor="support_email">Support email</label><input id="support_email" name="support_email" type="email" defaultValue={st.support_email as string} className="field" /></div>
        <div><label className="label" htmlFor="staff_title">Your staff title</label><input id="staff_title" name="staff_title" defaultValue={staffTitle ?? ""} placeholder="e.g. Trust & Safety lead" className="field" /></div>
      </section>
      <div className="flex justify-end lg:col-span-2">
        <SubmitButton className="btn btn-ink btn-lg" pendingLabel="Saving…">Save settings</SubmitButton>
      </div>
    </ActionForm>
  );
}
