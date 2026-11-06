import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Check, ChevronDown, ShieldAlert, Sparkles, Star, Target, Ticket, Users, Wallet,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EventCard } from "@/components/ui/EventCard";
import { HowItWorks } from "@/components/site/HowItWorks";
import { getSession } from "@/lib/session";
import { FAQ } from "@/lib/constants";
import type { MCEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

const EVENTS = ["Weddings", "Owambe parties", "Brand activations", "Corporate conferences", "Concerts", "Product launches", "Fashion shows", "Church events", "Trade fairs", "Award nights", "Hotel shifts", "Festivals", "Campus events", "Photoshoots", "Charity galas"];

export default async function Home() {
  const { supabase, user } = await getSession();
  let jobs: MCEvent[] = [];
  try {
    const { data } = await supabase.from("events").select("*").eq("status", "active").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3);
    jobs = (data as MCEvent[]) ?? [];
  } catch {}

  return (
    <>
      <SiteNav overDark signedIn={Boolean(user)} />

      {/* ═══ Hero ═══════════════════════════════════════════════════════ */}
      <section className="grain relative isolate overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute -top-48 -left-32 -z-10 size-[44rem] rounded-full bg-ice-500/20 blur-[130px]" />
        <div aria-hidden className="absolute right-[-15%] bottom-[-35%] -z-10 size-[40rem] rounded-full bg-vermilion/25 blur-[150px]" />

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-32 pb-20 md:px-6 lg:grid-cols-[1.08fr_1fr] lg:pt-40 lg:pb-28">
          <div className="rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-semibold text-ice backdrop-blur">
              <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-vermilion/70" /><span className="relative size-2 rounded-full bg-vermilion" /></span>
              Live in Lagos, Abuja and Port Harcourt
            </p>
            <h1 className="t-display mt-6 text-white">
              Event work that’s <span className="text-ice-300">safe</span>, <span className="text-ice-300">verified</span> and{" "}
              <span className="relative whitespace-nowrap">
                paid on time
                <svg aria-hidden viewBox="0 0 300 12" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none"><path d="M2 9 C 80 2, 220 2, 298 8" stroke="#e34234" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
              </span>
              .
            </h1>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/register/talent"
                className="group inline-flex h-[60px] items-center gap-3 rounded-full bg-vermilion-600 py-2 pr-6 pl-2 text-[17px] font-bold text-white shadow-(--shadow-cta) ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-vermilion-700 active:translate-y-0"
              >
                <span className="grid size-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/25"><Sparkles className="size-5" aria-hidden /></span>
                Talent
                <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/register/host"
                className="group inline-flex h-[60px] items-center gap-3 rounded-full border border-white/25 bg-white/[0.08] py-2 pr-6 pl-2 text-[17px] font-bold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-ink active:translate-y-0"
              >
                <span className="grid size-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition group-hover:bg-ink group-hover:text-white"><Users className="size-5" aria-hidden /></span>
                Host
                <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2 text-[13px] font-semibold text-white/80">
              {["NIN-verified", "Escrow pay", "SOS on every shift"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur"><Check className="size-3.5 text-vermilion" aria-hidden /> {t}</li>
              ))}
            </ul>
          </div>

          {/* Photo + glass cards */}
          <div className="rise relative mx-auto w-full max-w-[520px] [animation-delay:120ms]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image src="/images/hero.webp" alt="ModelClic event staff in uniform at a gala" fill priority sizes="(max-width: 1024px) 90vw, 520px" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10" />
            </div>

            <div aria-hidden className="glass float absolute top-[8%] -left-4 w-[62%] rounded-2xl p-4 text-ink shadow-(--shadow-lift) sm:-left-10">
              <div className="flex items-center justify-between">
                <span className="badge badge-ice">Wedding ushering</span>
                <span className="text-xs font-semibold text-ink-500">Victoria Island</span>
              </div>
              <p className="mt-2.5 font-bold leading-snug">Wedding ushers — Oriental Hotel</p>
              <p className="text-xs text-ink-500">Sat · 2:00 PM</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="num text-2xl font-extrabold tracking-tight">₦25,000</span>
                <span className="badge badge-ink">Bid · 3 pts</span>
              </div>
            </div>

            <div aria-hidden className="glass absolute top-[46%] -right-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-ink shadow-(--shadow-lift) [animation-delay:1.5s] float sm:-right-8">
              <span className="grid size-10 place-items-center rounded-full bg-ink text-white"><Wallet className="size-4" /></span>
              <div>
                <p className="num text-sm font-extrabold">₦25,000 released</p>
                <p className="text-xs text-ink-500">From escrow · just now</p>
              </div>
            </div>

            <div aria-hidden className="glass absolute bottom-[7%] left-[6%] w-[64%] rounded-2xl p-4 text-ink shadow-(--shadow-lift)">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-ice font-bold text-ink">AO</span>
                <div>
                  <p className="font-bold">Ada Okafor</p>
                  <p className="flex items-center gap-1 text-xs font-semibold text-vermilion-700"><BadgeCheck className="size-3.5" /> Identity verified</p>
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                {["NIN", "Selfie", "Liveness"].map((c) => <span key={c} className="badge badge-line">{c}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-white/10 bg-white/[0.03]">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
            {[
              ["₦0", "fees for talent — keep 100% of your pay"],
              ["20", "free bid points every month"],
              ["12 h", "automatic pay release after the event"],
              ["2 min", "safety response target on SOS"],
            ].map(([big, small], i) => (
              <div key={big} className={`px-5 py-7 md:px-6 ${i ? "md:border-l" : ""} ${i % 2 ? "border-l" : ""} border-white/10 ${i > 1 ? "border-t md:border-t-0" : ""}`}>
                <dt className="num text-3xl font-extrabold tracking-[-0.04em] md:text-4xl">{big}</dt>
                <dd className="mt-1 text-[13px] text-white/60">{small}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-b border-line bg-white py-5" aria-label="Events we staff">
        <div className="flex w-max animate-[marquee_45s_linear_infinite] gap-3 motion-reduce:animate-none [&:hover]:[animation-play-state:paused]">
          {[...EVENTS, ...EVENTS].map((e, i) => (
            <span key={i} className="rounded-full border border-line bg-ice-25 px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink-600">{e}</span>
          ))}
        </div>
      </div>

      <main>
        {/* ═══ Why ModelClic ═══════════════════════════════════════════ */}
        <section id="why" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Why ModelClic</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] md:text-5xl">Built for trust on both sides of the job.</h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-6">
            <Bento className="md:col-span-6" icon={<BadgeCheck className="size-5" />} title="Everyone is verified before the first shift." body="Talent pass NIN, selfie and liveness checks. Hosts are checked too, and registered businesses add their CAC number.">
              <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[["NIN matched", "NIMC"], ["Selfie matched to ID", "98% match"], ["Liveness passed", "2 sec"], ["CAC confirmed for hosts", "RC 1234567"]].map(([a, b]) => (
                  <li key={a} className="flex items-center gap-3 rounded-xl border border-line-soft bg-ice-25 px-3 py-2.5 text-sm">
                    <span className="grid size-6 place-items-center rounded-full bg-ink text-white"><Check className="size-3.5" /></span>
                    <span className="font-semibold">{a}</span>
                    <span className="ml-auto text-xs text-ink-400">{b}</span>
                  </li>
                ))}
              </ul>
            </Bento>

            <Bento className="md:col-span-2" icon={<Target className="size-5" />} title="20 free bids a month." body="Each bid costs 3 points, so hosts see serious applicants.">
              <div className="mt-6 flex items-end gap-1.5" aria-hidden>
                {[14, 20, 9, 17, 12, 20, 6].map((h, i) => <span key={i} className={`flex-1 rounded-t-md ${i === 5 ? "bg-vermilion" : "bg-ice"}`} style={{ height: h * 3 }} />)}
              </div>
            </Bento>

            <Bento className="md:col-span-2" icon={<Ticket className="size-5" />} title="Check in with a code." body="Your shift pass holds the venue, the host chat and the check-in code.">
              <div className="mt-6 flex justify-center gap-2" aria-hidden>
                {["4", "8", "2", "1"].map((d) => <span key={d} className="num grid size-12 place-items-center rounded-xl border-2 border-ink text-2xl font-extrabold">{d}</span>)}
              </div>
            </Bento>

            <Bento className="md:col-span-2" icon={<ShieldAlert className="size-5" />} title="SOS in one slide." body="Feel unsafe? Slide to alert our safety team and your emergency contact.">
              <div className="mt-6 flex h-12 items-center rounded-full bg-vermilion-50 p-1 ring-1 ring-vermilion-100" aria-hidden>
                <span className="grid size-10 place-items-center rounded-full bg-vermilion text-white"><ShieldAlert className="size-4" /></span>
                <span className="flex-1 text-center text-sm font-bold text-vermilion-700">Slide to send SOS →</span>
              </div>
            </Bento>

            <Bento className="md:col-span-6" icon={<Star className="size-5" />} title="Ratings both ways, revealed together." body="Talent rate hosts and hosts rate talent. Neither sees the other’s rating until both have rated, so reviews stay honest." row>
              <div className="flex items-center gap-1" aria-label="5 stars">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-7 fill-vermilion text-vermilion" />)}
              </div>
            </Bento>
          </div>
        </section>

        {/* ═══ How it works ════════════════════════════════════════════ */}
        <section id="how" className="scroll-mt-24 bg-white py-24">
          <div className="mx-auto max-w-6xl px-5 md:px-6">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] md:text-5xl">From sign-up to paid in three steps.</h2>
            <HowItWorks />
          </div>
        </section>

        {/* ═══ Jobs ════════════════════════════════════════════════════ */}
        {jobs.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-24 md:px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Hiring now</p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em]">Shifts hosts are hiring for.</h2>
              </div>
              <Link href="/jobs" className="btn btn-secondary">See all jobs <ArrowRight className="size-4" /></Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {jobs.map((e) => <EventCard key={e.id} event={e} href={`/jobs#${e.id}`} />)}
            </div>
          </section>
        )}

        {/* ═══ FAQ ═════════════════════════════════════════════════════ */}
        <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-5 py-24 md:grid-cols-[1fr_1.5fr] md:px-6">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em]">Questions, answered.</h2>
            <div className="card mt-8 p-5">
              <p className="font-bold">Still have a question?</p>
              <p className="mt-1 text-sm text-ink-500">Our team replies within an hour, Mon–Sat, 8am–8pm.</p>
              <Link href="/login?next=/messages?support=1" className="btn btn-sm btn-ink mt-4">Chat with support</Link>
            </div>
          </div>
          <div className="divide-y divide-line rounded-2xl border border-line bg-white">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 font-bold">
                  {f.q}
                  <ChevronDown className="size-5 shrink-0 text-ink-400 transition group-open:rotate-180" aria-hidden />
                </summary>
                <p className="pb-5 text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ Final CTA ═══════════════════════════════════════════════ */}
        <section className="px-4 pb-24">
          <div className="grain relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white md:py-20">
            <Image src="/images/hero.webp" alt="" fill sizes="1200px" className="-z-20 object-cover object-[50%_35%] opacity-25" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 to-ink" />
            <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">Your next shift is a tap away.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/65">Join verified talent and hosts across Nigeria.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register/talent" className="btn btn-lg btn-primary">Find work <ArrowRight className="size-4" /></Link>
              <Link href="/register/host" className="btn btn-lg btn-glass">Hire staff</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Bento({
  className = "", icon, title, body, children, dark = false, row = false,
}: {
  className?: string; icon: React.ReactNode; title: string; body: string; children?: React.ReactNode; dark?: boolean; row?: boolean;
}) {
  return (
    <div className={`rounded-[1.5rem] p-6 md:p-7 ${dark ? "bg-ink text-white" : "border border-line bg-white shadow-(--shadow-soft)"} ${row ? "flex flex-wrap items-center justify-between gap-6" : ""} ${className}`}>
      <div className={row ? "max-w-xl" : ""}>
        <span className={`grid size-10 place-items-center rounded-xl ${dark ? "bg-white/10 text-vermilion" : "bg-ice text-ink"}`}>{icon}</span>
        <h3 className={`mt-4 text-xl font-extrabold tracking-[-0.025em] ${dark ? "text-white" : ""}`}>{title}</h3>
        <p className={`mt-2 text-[15px] ${dark ? "text-white/65" : "text-ink-500"}`}>{body}</p>
      </div>
      {children}
    </div>
  );
}
