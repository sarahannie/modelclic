import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/session";

/** Post-login router: sends each person to their home screen. */
export default async function AppRouter() {
  const { profile } = await getSession();
  redirect(profile ? homeFor(profile.role) : "/login");
}
