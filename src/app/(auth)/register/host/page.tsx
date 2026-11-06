import type { Metadata } from "next";
import { AuthShell } from "../../AuthShell";
import { HostRegisterForm } from "../forms";

export const metadata: Metadata = { title: "Join as Host" };

export default function RegisterHost() {
  return (
    <AuthShell tab="signup" back={{ href: "/login?side=host", label: "Back to login" }} headline={<>Verified staff for your event. <span className="text-ice-300">Pay only when the job is done.</span></>}>
      <p className="eyebrow">Hosts</p>
      <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.045em]">Join as Host</h1>
      <p className="mt-1.5 mb-7 text-ink-500">For event planners, companies, churches and brands hiring verified talent.</p>
      <HostRegisterForm />
    </AuthShell>
  );
}
