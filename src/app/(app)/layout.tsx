import { AppChrome } from "@/components/shell/AppChrome";
import { HOST_NAV, TALENT_NAV, UTIL_NAV } from "@/lib/nav";
import { getSettings, requireUser } from "@/lib/session";
import type { Bid, Notification, WalletSummary } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, demo } = await requireUser(["talent", "host"]);
  const settings = await getSettings();

  const [{ data: notes }, { count: unread }] = await Promise.all([
    supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(6),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("read", false),
  ]);

  let nav = profile.role === "host" ? HOST_NAV : TALENT_NAV;
  let shiftPassHref: string | null = null;
  let wallet: WalletSummary | null = null;

  if (profile.role === "talent") {
    const { data: mine } = await supabase.from("bids").select("*").eq("talent_id", profile.id).in("status", ["offered", "booked"]);
    const bids = (mine as Bid[]) ?? [];
    nav = nav.map((n) => (n.href === "/talent/gigs" ? { ...n, count: bids.length || null } : n));
    const booked = bids.filter((b) => b.status === "booked");
    if (booked.length) {
      const { data: evs } = await supabase.from("events").select("id, starts_at, ends_at").in("id", booked.map((b) => b.event_id)).order("starts_at");
      const now = Date.now();
      const next = (evs as { id: string; starts_at: string; ends_at: string }[] | null)?.find((e) => new Date(e.ends_at).getTime() > now);
      if (next) shiftPassHref = `/talent/shift-pass/${booked.find((b) => b.event_id === next.id)!.id}`;
    }
  } else {
    const [{ count: favs }, { data: w }] = await Promise.all([
      supabase.from("favorites").select("talent_id", { count: "exact", head: true }).eq("host_id", profile.id),
      supabase.rpc("wallet_summary"),
    ]);
    nav = nav.map((n) => (n.href === "/host/favorites" ? { ...n, count: favs || null } : n));
    wallet = ((w as WalletSummary[] | null)?.[0]) ?? { available: 0, escrow: 0, pending_in: 0, total_earned: 0, total_withdrawn: 0, total_deposits: 0, fees: 0 };
  }

  return (
    <AppChrome
      role={profile.role}
      name={profile.role === "host" ? profile.company_name || profile.full_name : profile.full_name}
      avatar={profile.avatar_url}
      verified={(profile.role === "host" ? profile.host_kyc : profile.kyc) === "verified"}
      sides={profile.sides}
      nav={nav}
      util={UTIL_NAV}
      bidPoints={profile.bid_points}
      monthlyPoints={settings.monthly_points}
      shiftPassHref={shiftPassHref}
      wallet={wallet ? { available: wallet.available, escrow: wallet.escrow } : null}
      notifications={(notes as Notification[]) ?? []}
      unread={unread ?? 0}
      demo={demo}
    >
      {children}
    </AppChrome>
  );
}
