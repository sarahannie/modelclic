import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export default async function DashboardHome() {
  const { profile } = await requireProfile();
  redirect(`/dashboard/${profile.role}`);
}
