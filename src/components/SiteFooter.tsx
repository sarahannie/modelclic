import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-ink-500">Safe. Verified. Paid.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
          <Link href="/jobs" className="hover:text-ink">Jobs</Link>
          <Link href="/signup?role=talent" className="hover:text-ink">Join as talent</Link>
          <Link href="/signup?role=host" className="hover:text-ink">Hire staff</Link>
          <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
        </nav>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} ModelClic · Lagos, Nigeria
      </div>
    </footer>
  );
}
