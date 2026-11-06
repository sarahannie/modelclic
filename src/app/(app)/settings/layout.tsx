import { requireUser } from "@/lib/session";
import { SettingsNav } from "./SettingsNav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser(["talent", "host"]);
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <SettingsNav role={profile.role} />
      <div className="min-w-0 max-w-3xl">{children}</div>
    </div>
  );
}
