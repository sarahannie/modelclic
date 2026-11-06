import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { Inbox } from "@/components/chat/Inbox";
import { ChatPane } from "@/components/chat/ChatPane";
import { loadThreads } from "@/components/chat/data";
import type { Message } from "@/lib/types";

export const metadata: Metadata = { title: "Messages" };

export default async function Chat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireUser(["talent", "host"]);
  const threads = await loadThreads(supabase, profile.id);
  const thread = threads.find((t) => t.id === id);
  if (!thread) notFound();
  const { data } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at");
  await supabase.rpc("mark_conversation_read", { p_conversation: id });
  const quick = thread.kind === "support" ? ["I need help with a payment", "Question about verification"] : profile.role === "host" ? ["Briefing is 45 min before start", "Please confirm you’re coming", "Thanks for today!"] : ["I’m on my way", "I’ve arrived at the venue", "Running 10 minutes late"];
  return (
    <Inbox threads={threads} active={id}>
      <ChatPane thread={thread} messages={(data as Message[]) ?? []} me={profile.id} quick={quick} />
    </Inbox>
  );
}
