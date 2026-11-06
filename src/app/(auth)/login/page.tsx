import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./LoginForm";
import { demoMode } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; side?: string; error?: string }>;
}) {
  const { next, side, error } = await searchParams;
  return (
    <AuthShell tab="login">
      <h1 className="text-[32px] font-extrabold tracking-[-0.045em]">Welcome back</h1>
      <p className="mt-1.5 mb-7 text-ink-500">Log in to keep working or hiring.</p>
      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-vermilion-50 px-4 py-3 text-sm font-medium text-vermilion-700">
          {error === "google" ? "Google sign-in didn't complete. Please try again." : "That link has expired. Please log in again."}
        </p>
      )}
      {demoMode && (
        <Link href="/demo" className="mb-6 flex items-center gap-3 rounded-2xl border border-dashed border-ice-400 bg-ice-50 px-4 py-3 text-sm hover:border-ink">
          <Sparkles className="size-4 text-vermilion-700" aria-hidden />
          <span><strong>Demo mode.</strong> Explore as talent, host or admin with sample data →</span>
        </Link>
      )}
      <LoginForm next={next ?? "/app"} initialSide={side === "host" ? "host" : "talent"} />
    </AuthShell>
  );
}
