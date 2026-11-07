import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Check, ChevronDown, ShieldAlert, Star, Target, Ticket,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EventCard } from "@/components/ui/EventCard";
import { HowItWorks } from "@/components/site/HowItWorks";
import { HeroCinematic } from "@/components/site/Heroes";
import { cookies } from "next/headers";
import { getUpcomingJobs } from "@/lib/publicData";
import { DEMO_COOKIE } from "@/lib/supabase/env";
import { FAQ } from "@/lib/constants";
import type { MCEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

const EVENTS = ["Weddings", "Owambe parties", "Brand activations", "Corporate conferences", "Concerts", "Product launches", "Fashion shows", "Church events", "Trade fairs", "Award nights", "Hotel shifts", "Festivals", "Campus events", "Photoshoots", "Charity galas"];

export default async function Home() {
  // Signed-in check from the cookie only (no database call); jobs come from a 60s cache.
  const jar = await cookies();
  const signedIn = jar.getAll().some((c) => (c.name.startsWith("sb-") && c.name.includes("auth-token")) || c.name === DEMO_COOKIE);
  const jobs: MCEvent[] = await getUpcomingJobs();

  return (
    <>
      <SiteNav overDark signedIn={signedIn} />

      <HeroCinematic />

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
