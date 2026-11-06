import { redirect } from "next/navigation";
import { BriefcaseBusiness, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BackLink } from "@/components/ui/BackLink";
import { demoMode } from "@/lib/supabase/env";
import { enterDemo } from "../(auth)/actions";

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  if (!demoMode) redirect("/login");
  const { google } = await searchParams;
  const roles = [
    { role: "talent", title: "Talent", body: "Ada Okafor — find jobs, bids, gigs, wallet, shift pass.", icon: BriefcaseBusiness },
    { role: "host", title: "Event host", body: "Bloom Events — events, applicants, find talent, wallet.", icon: Users },
    { role: "admin", title: "Admin", body: "Identity checks, events, SOS, payments, analytics.", icon: ShieldCheck },
  ];
  return (
    <div className="min-h-dvh bg-ice-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between"><Logo /><BackLink href="/">Back to home</BackLink></div>
        <h1 className="mt-12 text-4xl font-extrabold tracking-[-0.045em]">Explore the demo</h1>
        <p className="mt-2 text-ink-500">
          {google ? "Google sign-in switches on once Supabase is connected. Meanwhile, " : ""}pick a role to look around with sample data. Nothing is saved permanently.
        </p>
        <div className="mt-8 grid gap-3">
          {roles.map(({ role, title, body, icon: Icon }) => (
            <form key={role} action={enterDemo}>
              <input type="hidden" name="role" value={role} />
              <button className="cta-tile w-full border border-line bg-white text-left hover:border-ink">
                <span className="cta-tile-icon bg-ice text-ink"><Icon className="size-5" /></span>
                <span><span className="block font-bold">{title}</span><span className="block text-sm text-ink-500">{body}</span></span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
