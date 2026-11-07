import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, LockKeyhole, ShieldAlert, Sparkles, Star, Users, Wallet } from "lucide-react";

const FACES = ["ngozi", "tunde", "amaka", "chidinma", "daniel"];

function HeroButtons({ center = false }: { center?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${center ? "justify-center" : ""}`}>
      <Link
        href="/register/talent"
        className="group relative inline-flex h-[60px] items-center gap-3 overflow-hidden rounded-full bg-vermilion-600 py-2 pr-6 pl-2 text-[17px] font-bold text-white shadow-[0_18px_40px_-14px_rgb(227_66_52/0.9)] ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:bg-vermilion-700"
      >
        <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
        <span className="grid size-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/30"><Sparkles className="size-5" aria-hidden /></span>
        Talent
        <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
      </Link>
      <Link
        href="/register/host"
        className="group inline-flex h-[60px] items-center gap-3 rounded-full border border-white/25 bg-white/[0.08] py-2 pr-6 pl-2 text-[17px] font-bold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-ink"
      >
        <span className="grid size-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition group-hover:bg-ink group-hover:text-white"><Users className="size-5" aria-hidden /></span>
        Host
        <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
      </Link>
    </div>
  );
}

function SocialProof({ center = false }: { center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
      <div className="flex -space-x-3">
        {FACES.map((f) => (
          <Image key={f} src={`/images/talent/${f}.webp`} alt="" width={40} height={40} className="size-10 rounded-full object-cover ring-2 ring-ink" />
        ))}
      </div>
      <div className="text-left text-[13px] leading-tight">
        <p className="flex items-center gap-1 font-bold text-white">
          {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-3.5 fill-vermilion text-vermilion" aria-hidden />)}
        </p>
        <p className="mt-1 text-white/65">Verified talent across Lagos, Abuja &amp; PH</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Option A — Cinematic: the photo fills the hero, copy sits on a dark
   wash on the left, glass cards float on the photo, glass stat bar below.
   ───────────────────────────────────────────────────────────────────── */
export function HeroCinematic() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-white">
      <Image src="/images/hero.webp" alt="ModelClic event staff at a gala" fill priority sizes="100vw" className="-z-30 object-cover object-[70%_30%] lg:object-[85%_30%]" />
      <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#0e1a2b_0%,rgb(14_26_43/0.92)_32%,rgb(14_26_43/0.45)_62%,rgb(14_26_43/0.15)_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-20 h-56 bg-gradient-to-t from-ink to-transparent" />
      <div aria-hidden className="absolute -bottom-40 -left-40 -z-10 size-[40rem] rounded-full bg-vermilion/25 blur-[150px]" />

      <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col px-5 pt-32 pb-8 md:px-6 lg:pt-36">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="rise">
            <p className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-ice">
              <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-vermilion/70" /><span className="relative size-2 rounded-full bg-vermilion" /></span>
              Live in Lagos, Abuja &amp; Port Harcourt
            </p>
            <h1 className="mt-6 text-[clamp(2.8rem,6.4vw,5.4rem)] leading-[0.98] font-extrabold tracking-[-0.055em] text-white">
              Event work,
              <br />
              <span className="bg-gradient-to-r from-ice-200 via-ice-300 to-white bg-clip-text text-transparent">verified</span> &amp;{" "}
              <span className="relative inline-block">
                paid.
                <svg aria-hidden viewBox="0 0 200 14" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none"><path d="M3 10 C 60 2, 140 2, 197 9" stroke="#e34234" strokeWidth="6" fill="none" strokeLinecap="round" /></svg>
              </span>
            </h1>
            <div className="mt-10"><HeroButtons /></div>
            <div className="mt-10"><SocialProof /></div>
          </div>

          {/* Floating glass cards over the photo */}
          <div aria-hidden className="relative hidden h-[460px] lg:block">
            <div className="glass float absolute top-4 right-6 w-[300px] rounded-3xl p-5 text-ink shadow-(--shadow-lift)">
              <div className="flex items-center justify-between">
                <span className="badge badge-ice">Wedding ushering</span>
                <span className="num text-xl font-extrabold">₦25,000</span>
              </div>
              <p className="mt-3 text-[15px] font-bold">Wedding ushers — Oriental Hotel</p>
              <p className="text-xs text-ink-500">Sat · 2:00 PM · Victoria Island</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {FACES.slice(0, 3).map((f) => <Image key={f} src={`/images/talent/${f}.webp`} alt="" width={28} height={28} className="size-7 rounded-full object-cover ring-2 ring-white" />)}
                </div>
                <span className="text-xs font-bold text-ink-500">5 of 8 booked</span>
              </div>
            </div>
            <div className="glass float absolute top-[52%] left-0 flex items-center gap-3 rounded-2xl px-4 py-3 text-ink shadow-(--shadow-lift) [animation-delay:1.2s]">
              <span className="grid size-10 place-items-center rounded-full bg-ink text-white"><Wallet className="size-4" /></span>
              <div><p className="num text-sm font-extrabold">₦25,000 released</p><p className="text-xs text-ink-500">From escrow · just now</p></div>
            </div>
            <div className="glass absolute right-10 bottom-4 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-ink shadow-(--shadow-lift)">
              <BadgeCheck className="size-4 text-vermilion-700" /> Identity verified
            </div>
          </div>
        </div>

        {/* Glass stat bar */}
        <dl className="glass-dark mt-10 grid grid-cols-2 overflow-hidden rounded-3xl md:grid-cols-4">
          {[
            ["₦0", "fees for talent"],
            ["20", "free bids / month"],
            ["12 h", "auto pay release"],
            ["2 min", "SOS response"],
          ].map(([big, small], i) => (
            <div key={big} className={`px-6 py-5 ${i ? "md:border-l" : ""} ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""} border-white/10`}>
              <dt className="num text-3xl font-extrabold tracking-[-0.04em]">{big}</dt>
              <dd className="mt-0.5 text-[13px] text-white/60">{small}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Option B — Centered + bento: big centred headline, buttons in the
   middle, then a bento of photo + glass tiles.
   ───────────────────────────────────────────────────────────────────── */
export function HeroCentered() {
  return (
    <section className="grain relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(106_164_207/0.35),transparent_70%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />
      <div aria-hidden className="absolute -bottom-60 left-1/2 -z-10 size-[50rem] -translate-x-1/2 rounded-full bg-vermilion/20 blur-[160px]" />

      <div className="mx-auto max-w-6xl px-5 pt-36 pb-20 text-center md:px-6 lg:pt-40">
        <p className="glass-dark rise mx-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-ice">
          <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-vermilion/70" /><span className="relative size-2 rounded-full bg-vermilion" /></span>
          Live in Lagos, Abuja &amp; Port Harcourt
          <ArrowUpRight className="size-3.5 opacity-60" />
        </p>
        <h1 className="rise mx-auto mt-7 max-w-4xl text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.96] font-extrabold tracking-[-0.06em] text-white">
          Event work that&rsquo;s <span className="bg-gradient-to-r from-ice-200 to-ice-400 bg-clip-text text-transparent">verified</span> &amp;{" "}
          <span className="relative inline-block">
            paid on time
            <svg aria-hidden viewBox="0 0 300 14" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none"><path d="M3 10 C 90 2, 210 2, 297 9" stroke="#e34234" strokeWidth="6" fill="none" strokeLinecap="round" /></svg>
          </span>
        </h1>
        <div className="rise mt-11 [animation-delay:120ms]"><HeroButtons center /></div>
        <div className="mt-8"><SocialProof center /></div>

        {/* Bento */}
        <div className="rise mt-16 grid gap-4 text-left [animation-delay:200ms] md:grid-cols-12 md:grid-rows-[220px_220px]">
          <div className="relative h-[380px] overflow-hidden rounded-[28px] ring-1 ring-white/10 md:col-span-7 md:row-span-2 md:h-auto">
            <Image src="/images/hero.webp" alt="ModelClic event staff at a gala" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover object-[50%_30%]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="glass absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3 rounded-2xl p-4 text-ink">
              <div>
                <p className="text-[15px] font-bold">Wedding ushers — Oriental Hotel</p>
                <p className="text-xs text-ink-500">Sat · 2:00 PM · Victoria Island</p>
              </div>
              <span className="num shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-sm font-extrabold text-white">₦25,000</span>
            </div>
          </div>
          <div className="glass-dark flex flex-col justify-between rounded-[28px] p-6 md:col-span-5">
            <span className="grid size-11 place-items-center rounded-2xl bg-vermilion text-white"><LockKeyhole className="size-5" /></span>
            <div>
              <p className="num text-4xl font-extrabold tracking-[-0.04em]">₦25,000 <span className="text-base font-bold text-ice-300">released</span></p>
              <p className="mt-1 text-sm text-white/60">Escrow pays out after every shift.</p>
            </div>
          </div>
          <div className="grid gap-4 md:col-span-5 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-[28px] bg-ice p-6 text-ink">
              <BadgeCheck className="size-7 text-vermilion-700" />
              <p className="text-lg leading-tight font-extrabold">NIN, selfie &amp; liveness checked</p>
            </div>
            <div className="flex flex-col justify-between rounded-[28px] bg-vermilion-600 p-6 text-white">
              <ShieldAlert className="size-7" />
              <p className="text-lg leading-tight font-extrabold">SOS on every shift</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
