import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "../AuthShell";

export default async function CheckEmail({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <AuthShell back={{ href: "/login", label: "Back to login" }}>
      <span className="grid size-14 place-items-center rounded-2xl bg-ice text-ink"><MailCheck className="size-6" aria-hidden /></span>
      <h1 className="mt-6 text-[28px] font-extrabold tracking-[-0.045em]">Check your email</h1>
      <p className="mt-2 text-ink-500">
        We sent a confirmation link{email ? <> to <strong className="text-ink">{email}</strong></> : null}. Open it to continue to step 2 — verifying your identity.
      </p>
      <Link href="/login" className="btn btn-secondary btn-lg mt-8 w-full">Back to log in</Link>
    </AuthShell>
  );
}
