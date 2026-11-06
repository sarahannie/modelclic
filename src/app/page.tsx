import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  LockKeyhole,
  MapPin,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { GigCard } from "@/components/GigCard";
import { getOpenGigs } from "@/lib/gigs";

export const revalidate = 300;

const events = [
  "Weddings",
  "Owambe parties",
  "Brand activations",
  "Conferences",
  "Concerts",
  "Product launches",
  "Fashion shows",
  "Award nights",
  "Festivals",
  "Trade fairs",
];

const steps = [
  { n: "01", title: "Get verified", body: "ID, selfie and liveness — once." },
  { n: "02", title: "Book or apply", body: "Hosts post shifts. Talent apply." },
  { n: "03", title: "Get paid", body: "Escrow releases pay after the event." },
];

const safety = [
  { icon: BadgeCheck, title: "Verified people", body: "Every member is ID-checked." },
  { icon: LockKeyhole, title: "Escrow pay", body: "Money is held before the shift." },
  { icon: ShieldAlert, title: "SOS on shift", body: "One slide alerts our safety team." },
];

export default async function Home() {
  const gigs = (await getOpenGigs(3)).slice(0, 3);

  return (
    <>
      {/* ─── Hero: dark ink + ice glow, glass cards ─────────────────── */}
      <section className="grain relative isolate overflow-hidden bg-ink text-white">
        <SiteNav dark />
        <div
          aria-hidden
          className="absolute -top-40 right-[-10%] -z-10 size-[44rem] rounded-full bg-ice-400/30 blur-[120px]"
        />
        <div
          aria-hidden
          className="absolute bottom-[-30%] left-[-10%] -z-10 size-[36rem] rounded-full bg-vermilion/25 blur-[140px]"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pt-36 pb-24 md:grid-cols-[1.15fr_1fr] md:pt-44 md:pb-32">
          <div className="rise">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-ice backdrop-blur">
              <span className="size-1.5 rounded-full bg-vermilion" /> Live in Lagos, Abuja &amp; Port Harcourt
            </p>
            <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] font-medium">
              Event staff,
              <br />
              <em className="text-ice italic">verified</em> &amp; paid
              <br />
              on time.
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/70">
              Ushers, hostesses, models and promoters — booked safely, paid through escrow.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/signup?role=host" className="btn btn-lg btn-primary">
                Hire staff <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/signup?role=talent" className="btn btn-lg btn-secondary-dark">
                Find shifts
              </Link>
            </div>
          </div>

          {/* Product preview — glass over the gradient */}
          <div className="rise relative mx-auto w-full max-w-sm [animation-delay:150ms]" aria-hidden>
            <div className="glass-dark rounded-3xl p-5 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between">
                <span className="badge bg-white/10 text-ice">Ushering</span>
                <span className="font-display text-2xl">₦25,000</span>
              </div>
              <p className="mt-4 font-display text-xl">Wedding ushers — Oriental Hotel</p>
              <div className="mt-3 space-y-1.5 text-sm text-white/65">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4" /> Sat · 2:00 PM
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4" /> Victoria Island
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/5 p-3">
                <div className="flex -space-x-2">
                  {["AO", "TK", "FB"].map((i) => (
                    <span
                      key={i}
                      className="grid size-8 place-items-center rounded-full border-2 border-ink bg-ice text-[11px] font-bold text-ink"
                    >
                      {i}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-white/60">3 of 6 booked</span>
              </div>
            </div>

            <div className="glass absolute -bottom-8 -left-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-ink shadow-xl md:-left-12">
              <span className="grid size-9 place-items-center rounded-full bg-success-50 text-success">
                <Wallet className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">₦25,000 released</p>
                <p className="text-xs text-ink-500">From escrow · just now</p>
              </div>
            </div>
            <div className="glass absolute -top-6 -right-4 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-ink shadow-xl">
              <BadgeCheck className="size-4 text-vermilion-700" /> ID verified
            </div>
          </div>
        </div>

        {/* Event marquee */}
        <div className="border-t border-white/10 py-5">
          <div className="flex gap-10 overflow-hidden whitespace-nowrap text-sm text-white/45 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
            <div className="flex shrink-0 animate-[marquee_40s_linear_infinite] gap-10 motion-reduce:animate-none">
              {[...events, ...events].map((e, i) => (
                <span key={i} className="flex items-center gap-10">
                  {e} <Sparkles className="size-3 text-vermilion/70" aria-hidden />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ─── Numbers ───────────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-line border-b border-line">
          {[
            ["₦0", "fees for talent"],
            ["12 h", "auto pay release"],
            ["2 min", "SOS response target"],
          ].map(([big, small]) => (
            <div key={small} className="px-3 py-8 text-center sm:px-6 sm:py-10">
              <p className="font-display text-2xl font-medium sm:text-4xl">{big}</p>
              <p className="mt-1 text-xs text-ink-500 sm:text-sm">{small}</p>
            </div>
          ))}
        </section>

        {/* ─── Two roles ─────────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-24 md:grid-cols-2">
          <RoleCard
            tone="ice"
            eyebrow="For talent"
            title="Paid shifts near you."
            points={["Keep 100% of your pay", "20 free bids every month", "Pay held before you arrive"]}
            cta={{ href: "/signup?role=talent", label: "Join as talent" }}
          />
          <RoleCard
            tone="ink"
            eyebrow="For hosts"
            title="Verified staff, fast."
            points={["Post a shift in 2 minutes", "Only ID-checked applicants", "Pay only when the job is done"]}
            cta={{ href: "/signup?role=host", label: "Start hiring" }}
          />
        </section>

        {/* ─── How it works ──────────────────────────────────────────── */}
        <section id="how" className="scroll-mt-24 bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-4xl font-medium md:text-5xl">Three steps. That&rsquo;s it.</h2>
            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {steps.map((s) => (
                <li key={s.n} className="border-t-2 border-ink pt-6">
                  <span className="font-display text-sm text-vermilion-700 italic">{s.n}</span>
                  <h3 className="mt-2 text-2xl font-medium">{s.title}</h3>
                  <p className="mt-2 text-ink-500">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Safety ────────────────────────────────────────────────── */}
        <section id="safety" className="scroll-mt-24 mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
            <div>
              <p className="eyebrow">Safety</p>
              <h2 className="mt-3 text-4xl font-medium md:text-5xl">Built on trust.</h2>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {safety.map(({ icon: Icon, title, body }) => (
                <li key={title} className="card p-5">
                  <Icon className="size-6 text-vermilion-700" aria-hidden />
                  <p className="mt-4 font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-ink-500">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Live jobs (only when there are real ones) ─────────────── */}
        {gigs.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-24">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-3xl font-medium">Hiring now</h2>
              <Link href="/jobs" className="btn btn-ghost">
                All jobs <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {gigs.map((g) => (
                <GigCard key={g.id} gig={g} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Final CTA ─────────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="grain relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center text-white md:py-20">
            <div aria-hidden className="absolute inset-x-0 -bottom-40 -z-10 mx-auto size-[30rem] rounded-full bg-vermilion/30 blur-[120px]" />
            <h2 className="text-4xl font-medium md:text-5xl">Your next shift is a tap away.</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup?role=talent" className="btn btn-lg btn-primary">
                Find work
              </Link>
              <Link href="/signup?role=host" className="btn btn-lg btn-secondary-dark">
                <BriefcaseBusiness className="size-4" aria-hidden /> Hire staff
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function RoleCard({
  tone,
  eyebrow,
  title,
  points,
  cta,
}: {
  tone: "ice" | "ink";
  eyebrow: string;
  title: string;
  points: string[];
  cta: { href: string; label: string };
}) {
  const dark = tone === "ink";
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] p-8 md:p-10 ${
        dark ? "bg-ink-800 text-white" : "bg-ice text-ink"
      }`}
    >
      <p className={`text-xs font-semibold tracking-[0.18em] uppercase ${dark ? "text-ice-400" : "text-vermilion-700"}`}>
        {eyebrow}
      </p>
      <h3 className="mt-3 text-3xl font-medium md:text-4xl">{title}</h3>
      <ul className="mt-8 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-3">
            <BadgeCheck className={`size-5 shrink-0 ${dark ? "text-vermilion" : "text-vermilion-700"}`} aria-hidden />
            <span className={dark ? "text-white/85" : "text-ink-700"}>{p}</span>
          </li>
        ))}
      </ul>
      <Link href={cta.href} className={`btn mt-10 ${dark ? "btn-primary" : "btn-secondary"}`}>
        {cta.label} <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
