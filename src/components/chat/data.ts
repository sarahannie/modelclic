import type { SupabaseClient } from "@supabase/supabase-js";
import { eventsById, hostName, profilesById } from "@/lib/queries";
import type { Conversation, Message } from "@/lib/types";

export type Thread = { id: string; title: string; sub: string; avatar: string | null; last: Message | null; unread: number; kind: "booking" | "support" };

export async function loadThreads(supabase: SupabaseClient, me: string, admin = false): Promise<Thread[]> {
  const q = supabase.from("conversations").select("*").order("last_at", { ascending: false });
  const { data } = admin ? await q.eq("kind", "support") : await q;
  const convs = ((data as Conversation[]) ?? []).filter((c) => admin || c.a_id === me || c.b_id === me);
  if (!convs.length) return [];
  const { data: msgs } = await supabase.from("messages").select("*").in("conversation_id", convs.map((c) => c.id)).order("created_at", { ascending: false });
  const all = (msgs as Message[]) ?? [];
  const people = await profilesById(supabase, convs.flatMap((c) => [c.a_id, c.b_id]));
  const events = await eventsById(supabase, convs.map((c) => c.event_id));
  return convs.map((c) => {
    const other = people.get(c.a_id === me ? c.b_id ?? "" : c.a_id);
    const ev = c.event_id ? events.get(c.event_id) : null;
    const m = all.filter((x) => x.conversation_id === c.id);
    return {
      id: c.id,
      kind: c.kind,
      title: c.kind === "support" ? (admin ? other?.full_name ?? "Member" : "ModelClic Support") : hostName(other),
      sub: c.kind === "support" ? (admin ? `${other?.role ?? ""} · support` : "Help · replies within an hour") : ev?.name ?? "Booking",
      avatar: c.kind === "support" && !admin ? null : other?.avatar_url ?? null,
      last: m[0] ?? null,
      unread: m.filter((x) => x.sender_id !== me && !x.read_at).length,
    };
  });
}
