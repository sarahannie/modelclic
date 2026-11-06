import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="text-4xl font-medium">Welcome back</h1>
      <p className="mt-2 mb-8 text-ink-500">Log in to keep working or hiring.</p>
      <LoginForm next={next ?? "/dashboard"} />
      <p className="mt-8 text-center text-sm text-ink-500">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-ink underline decoration-vermilion underline-offset-4">
          Create an account
        </Link>
      </p>
    </>
  );
}
