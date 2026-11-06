import type { Metadata } from "next";
import { AuthShell } from "../../AuthShell";
import { TalentRegisterForm } from "../forms";

export const metadata: Metadata = { title: "Join as talent" };

export default function RegisterTalent() {
  return (
    <AuthShell tab="signup" back={{ href: "/login", label: "Back to login" }} headline={<>Find paid shifts near you. <span className="text-ice-300">Keep 100% of your pay.</span></>}>
      <p className="eyebrow">Step 1 of 3 — Account</p>
      <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.045em]">Join as Talent</h1>
      <p className="mt-1.5 mb-7 text-ink-500">You must be 18 or older to join ModelClic.</p>
      <TalentRegisterForm />
    </AuthShell>
  );
}
