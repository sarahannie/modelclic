import Link from "next/link";
import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/session";
import { BackLink } from "@/components/ui/BackLink";
import { Empty } from "@/components/ui/kit";
import { MarkAllRead } from "./MarkAllRead";
import { ago } from "@/lib/format";
import type { Notification } from "@/lib/types";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { supabase, profile } = await requireUser(["talent", "host"]);
  const { data } = await supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(100);
  const items = (data as Notification[]) ?? [];
  return (
    <div className="max-w-3xl">
      <BackLink href={profile.role === "host" ? "/host" : "/talent"}>Back</BackLink>
      <header className="mt-5 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="t-h1">Notifications</h1><p className="t-sub mt-1">Bids, offers, pay and safety updates.</p></div>
        {items.some((n) => !n.read) && <MarkAllRead />}
      </header>
      {items.length === 0 ? (
        <Empty title="You’re all caught up" body="We’ll let you know about bids, offers, payments and messages." icon={<Bell className="size-5" />} />
      ) : (
        <ul className="card divide-y divide-line-soft">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={n.link ?? "#"} className={`flex items-start gap-3 px-5 py-4 transition hover:bg-ice-50 ${n.read ? "text-ink-500" : "font-semibold"}`}>
                <span className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-vermilion"}`} />
                <span className="flex-1">{n.text}</span>
                <span className="shrink-0 text-xs font-normal text-ink-400">{ago(n.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
