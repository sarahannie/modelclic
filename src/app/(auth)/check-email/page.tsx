import Link from "next/link";
import { MailCheck } from "lucide-react";

export default async function CheckEmail({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <div className="text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ice text-ink">
        <MailCheck className="size-6" aria-hidden />
      </span>
      <h1 className="mt-6 text-4xl font-medium">Check your email</h1>
      <p className="mt-3 text-ink-500">
        We sent a confirmation link{email ? <> to <strong className="text-ink">{email}</strong></> : null}. Open it to
        finish signing up.
      </p>
      <Link href="/login" className="btn btn-secondary mt-8">
        Back to log in
      </Link>
    </div>
  );
}
