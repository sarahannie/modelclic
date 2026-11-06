import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Inbox } from "@/components/chat/Inbox";
import { loadThreads } from "@/components/chat/data";

export const metadata: Metadata = { title: "Messages" };

export default async function Messages({ searchParams }: { searchParams: Promise<{ support?: string; q?: string }> }) {
  const sp = await searchParams;
  const { supabase, profile } = await requireUser(["talent", "host"]);
  if (sp.support) {
    const { data } = await supabase.rpc("support_conversation");
    if (data) redirect(`/messages/${data}`);
  }
  const threads = await loadThreads(supabase, profile.id);
  return (
    <Inbox threads={threads} q={sp.q}>
      <div className="m-auto max-w-sm px-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ice text-ink"><Lock className="size-6" /></span>
        <p className="mt-4 text-lg font-extrabold">Pick a conversation</p>
        <p className="mt-1 text-sm text-ink-500">Messages are private to you and the people in the chat. Contact details are hidden automatically.</p>
      </div>
    </Inbox>
  );
}
