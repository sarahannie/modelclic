import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BriefcaseBusiness, Users } from "lucide-react";
import { AuthShell } from "../AuthShell";

export const metadata: Metadata = { title: "Get started" };

export default function RegisterChooser() {
  return (
    <AuthShell tab="signup">
      <h1 className="text-[32px] font-extrabold tracking-[-0.045em]">Join ModelClic</h1>
      <p className="mt-1.5 mb-8 text-ink-500">How will you use ModelClic? You can add the other side later.</p>
      <div className="grid gap-3">
        <Link href="/register/talent" className="cta-tile bg-ink text-white hover:bg-ink-700">
          <span className="cta-tile-icon bg-white/10"><BriefcaseBusiness className="size-5" /></span>
          <span className="flex-1 text-[17px] font-bold">Talent</span>
          <ArrowRight className="size-4" />
        </Link>
        <Link href="/register/host" className="cta-tile border border-line bg-white hover:border-ink">
          <span className="cta-tile-icon bg-ice text-ink"><Users className="size-5" /></span>
          <span className="flex-1 text-[17px] font-bold">Host</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <p className="mt-8 text-center text-sm text-ink-500">
        Already a member? <Link href="/login" className="font-bold text-ink hover:text-vermilion-700">Log in</Link>
      </p>
    </AuthShell>
  );
}
