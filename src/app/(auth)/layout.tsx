import { BadgeCheck, LockKeyhole, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="grain relative isolate hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -top-32 -left-24 -z-10 size-[34rem] rounded-full bg-ice-400/25 blur-[120px]" />
        <div aria-hidden className="absolute -right-24 -bottom-40 -z-10 size-[28rem] rounded-full bg-vermilion/25 blur-[120px]" />
        <Logo dark />
        <div>
          <h2 className="max-w-sm text-5xl leading-[1.05] font-medium">
            Every shift <em className="text-ice">verified</em>, booked and paid.
          </h2>
          <ul className="glass-dark mt-10 max-w-sm space-y-4 rounded-3xl p-6 text-sm text-white/80">
            <li className="flex items-center gap-3">
              <BadgeCheck className="size-5 text-vermilion" aria-hidden /> ID-verified members only
            </li>
            <li className="flex items-center gap-3">
              <LockKeyhole className="size-5 text-vermilion" aria-hidden /> Pay held in escrow
            </li>
            <li className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-vermilion" aria-hidden /> SOS on every shift
            </li>
          </ul>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} ModelClic</p>
      </aside>
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
