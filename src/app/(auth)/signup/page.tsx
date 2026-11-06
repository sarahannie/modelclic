import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <>
      <h1 className="text-4xl font-medium">Create your account</h1>
      <p className="mt-2 mb-8 text-ink-500">Free to join. Takes a minute.</p>
      <SignupForm initialRole={role === "host" ? "host" : "talent"} />
      <p className="mt-6 text-center text-xs text-ink-500">
        By joining you agree to our{" "}
        <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
        <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
      </p>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already a member?{" "}
        <Link href="/login" className="font-semibold text-ink underline decoration-vermilion underline-offset-4">
          Log in
        </Link>
      </p>
    </>
  );
}
