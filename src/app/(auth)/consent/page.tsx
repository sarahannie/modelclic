import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { ConsentForm } from "./ConsentForm";

export const metadata: Metadata = { title: "Your data & consent" };

export default async function ConsentPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell back={{ href: "/", label: "Back to home" }}>
      <p className="eyebrow">One last step</p>
      <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.045em]">Your data &amp; consent</h1>
      <p className="mt-1.5 mb-6 text-ink-500">Before we create your ModelClic account, please confirm how we may use your information.</p>
      <ConsentForm next={next?.startsWith("/") && !next.startsWith("//") ? next : "/app"} />
    </AuthShell>
  );
}
