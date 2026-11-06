import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, LockKeyhole, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BackLink } from "@/components/ui/BackLink";

/**
 * Auth layout: full-bleed event photo under an ink wash, a frosted-glass card,
 * and glass "Log in / Sign up" tabs above it.
 */
export function AuthShell({
  children,
  back = { href: "/", label: "Back to home" },
  tab,
  headline = (
    <>
      Every shift verified, booked and <span className="text-ice-300">paid through escrow.</span>
    </>
  ),
}: {
  children: React.ReactNode;
  back?: { href: string; label: string };
  tab?: "login" | "signup";
  headline?: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink text-white">
      <Image src="/images/hero.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_30%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(14_26_43/0.94)_0%,rgb(14_26_43/0.78)_45%,rgb(14_26_43/0.55)_100%)]" />
      <div aria-hidden className="absolute -bottom-40 -left-40 -z-10 size-[36rem] rounded-full bg-vermilion/25 blur-[140px]" />
      <div aria-hidden className="absolute -top-40 right-0 -z-10 size-[30rem] rounded-full bg-ice-500/20 blur-[130px]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-5 md:px-8">
        <Logo onDark />
        <BackLink href={back.href} onDark>{back.label}</BackLink>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-10 md:px-8 lg:grid-cols-[1fr_minmax(0,460px)]">
        <section className="hidden lg:block">
          <h2 className="max-w-md text-[44px] leading-[1.04] font-extrabold tracking-[-0.045em] text-white">{headline}</h2>
          <ul className="mt-8 flex max-w-md flex-wrap gap-2">
            {[
              [BadgeCheck, "NIN-verified members"],
              [LockKeyhole, "Pay held in escrow"],
              [ShieldAlert, "SOS on every shift"],
            ].map(([Icon, t]) => {
              const I = Icon as typeof BadgeCheck;
              return (
                <li key={t as string} className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold">
                  <I className="size-4 text-vermilion" aria-hidden /> {t as string}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="w-full">
          {tab && (
            <nav aria-label="Account" className="glass-dark mx-auto mb-4 grid w-full max-w-[300px] grid-cols-2 rounded-full p-1 text-sm font-bold">
              {(
                [
                  ["login", "Log in", "/login"],
                  ["signup", "Sign up", "/register"],
                ] as const
              ).map(([k, label, href]) => (
                <Link
                  key={k}
                  href={href}
                  aria-current={tab === k ? "page" : undefined}
                  className={`grid h-10 place-items-center rounded-full transition ${
                    tab === k ? "bg-white text-ink shadow-[0_6px_20px_-8px_rgb(0_0_0/0.5)]" : "text-white/75 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
          <div className="rounded-[28px] border border-white/60 bg-white/[0.86] p-6 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 pb-6 text-[13px] text-white/55">
        <span>© {new Date().getFullYear()} ModelClic</span>
        <Link href="/legal/terms" className="hover:text-white">Terms</Link>
        <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
        <Link href="/legal/guidelines" className="hover:text-white">Guidelines</Link>
      </footer>
    </div>
  );
}
