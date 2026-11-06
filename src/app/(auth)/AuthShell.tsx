import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BackLink } from "@/components/ui/BackLink";

/** Split layout from the original prototype: event photo on the left, form on the right. */
export function AuthShell({
  children,
  back = { href: "/", label: "Back to home" },
  headline = (
    <>
      Every shift verified, booked and <span className="text-ice-300">paid through escrow.</span>
    </>
  ),
}: {
  children: React.ReactNode;
  back?: { href: string; label: string };
  headline?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] lg:p-3">
      <aside className="relative isolate hidden overflow-hidden rounded-[1.75rem] bg-ink lg:flex lg:flex-col lg:justify-between lg:p-10">
        <Image src="/images/hero.webp" alt="" fill priority sizes="50vw" className="-z-20 object-cover object-[50%_30%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(14_26_43/0.55)_0%,rgb(14_26_43/0.15)_35%,rgb(14_26_43/0.85)_78%,#0e1a2b_100%)]" />
        <Logo onDark href="/" />
        <div>
          <h2 className="max-w-md text-[40px] leading-[1.05] font-extrabold tracking-[-0.045em] text-white">{headline}</h2>
          <ul className="mt-7 flex flex-wrap gap-2">
            {["NIN-verified members only", "Pay held in escrow", "SOS on every shift"].map((t, i) => (
              <li key={t} className="glass-dark inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold text-white">
                <span className={`size-2 rounded-full ${i === 0 ? "bg-ice-300" : i === 1 ? "bg-vermilion" : "bg-white"}`} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:min-h-0">
        <div className="flex items-center justify-between">
          <span className="lg:hidden"><Logo /></span>
          <span className="ml-auto"><BackLink href={back.href}>{back.label}</BackLink></span>
        </div>
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10">{children}</div>
        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] text-ink-400">
          <span>© {new Date().getFullYear()} ModelClic</span>
          <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/staff" className="hover:text-ink">Staff login</Link>
        </footer>
      </main>
    </div>
  );
}
