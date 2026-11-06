/* A tiny in-memory stand-in for the Supabase client, used in demo mode only.
   Supports the subset of the query builder this app uses. Writes persist in memory until the server restarts. */
import { DEMO_IDS, seed } from "./seed";
import type { Role } from "../types";

type Row = Record<string, unknown>;
type Res = { data: unknown; error: { message: string } | null; count?: number | null };

const g = globalThis as unknown as { __mcDemo?: Record<string, Row[]> };
const db = () => (g.__mcDemo ??= seed());

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));

class Query implements PromiseLike<Res> {
  private filters: ((r: Row) => boolean)[] = [];
  private sorts: { col: string; asc: boolean }[] = [];
  private lim: number | null = null;
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: Row | Row[] | null = null;
  private one: "single" | "maybe" | null = null;
  private countOpt = false;
  private headOnly = false;
  private returning = false;

  constructor(private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (this.mode !== "select") this.returning = true;
    if (opts?.count) this.countOpt = true;
    if (opts?.head) this.headOnly = true;
    return this;
  }
  insert(v: Row | Row[]) { this.mode = "insert"; this.payload = v; return this; }
  upsert(v: Row | Row[]) { this.mode = "upsert"; this.payload = v; return this; }
  update(v: Row) { this.mode = "update"; this.payload = v; return this; }
  delete() { this.mode = "delete"; return this; }

  eq(c: string, v: unknown) { this.filters.push((r) => r[c] === v); return this; }
  neq(c: string, v: unknown) { this.filters.push((r) => r[c] !== v); return this; }
  in(c: string, v: unknown[]) { this.filters.push((r) => v.includes(r[c])); return this; }
  gt(c: string, v: string | number) { this.filters.push((r) => (r[c] as string | number) > v); return this; }
  gte(c: string, v: string | number) { this.filters.push((r) => (r[c] as string | number) >= v); return this; }
  lt(c: string, v: string | number) { this.filters.push((r) => (r[c] as string | number) < v); return this; }
  lte(c: string, v: string | number) { this.filters.push((r) => (r[c] as string | number) <= v); return this; }
  is(c: string, v: unknown) { this.filters.push((r) => (r[c] ?? null) === v); return this; }
  not(c: string, op: string, v: unknown) { this.filters.push((r) => (op === "is" ? (r[c] ?? null) !== v : r[c] !== v)); return this; }
  ilike(c: string, pat: string) {
    const re = new RegExp("^" + pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*") + "$", "i");
    this.filters.push((r) => re.test(String(r[c] ?? "")));
    return this;
  }
  contains(c: string, v: unknown[]) { this.filters.push((r) => v.every((x) => (r[c] as unknown[] | undefined)?.includes(x))); return this; }
  order(col: string, o?: { ascending?: boolean }) { this.sorts.push({ col, asc: o?.ascending ?? true }); return this; }
  limit(n: number) { this.lim = n; return this; }
  range(a: number, b: number) { this.lim = b - a + 1; return this; }
  single() { this.one = "single"; return this; }
  maybeSingle() { this.one = "maybe"; return this; }

  private run(): Res {
    const rows = (db()[this.table] ??= []);
    const match = (r: Row) => this.filters.every((f) => f(r));
    if (this.mode === "insert" || this.mode === "upsert") {
      const list: Row[] = (Array.isArray(this.payload) ? this.payload : [this.payload!]).map((r) => ({
        id: uuid(), created_at: new Date().toISOString(), ...r,
      }));
      if (this.mode === "upsert") {
        for (const r of list) {
          const i = rows.findIndex((x) => x.id === r.id || (x.user_id && x.user_id === r.user_id && x.event_id === r.event_id) || (x.host_id && x.host_id === r.host_id && x.talent_id === r.talent_id));
          if (i >= 0) rows[i] = { ...rows[i], ...r }; else rows.push(r);
        }
      } else rows.push(...list);
      return this.shape(list);
    }
    if (this.mode === "update") {
      const hit = rows.filter(match);
      hit.forEach((r) => Object.assign(r, this.payload));
      return this.shape(hit);
    }
    if (this.mode === "delete") {
      const keep = rows.filter((r) => !match(r));
      const gone = rows.length - keep.length;
      db()[this.table] = keep;
      return { data: null, error: null, count: gone };
    }
    let out = rows.filter(match);
    for (const s of [...this.sorts].reverse()) {
      out = [...out].sort((a, b) => {
        const x = a[s.col] as string | number, y = b[s.col] as string | number;
        if (x === y) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        return (x < y ? -1 : 1) * (s.asc ? 1 : -1);
      });
    }
    const count = out.length;
    if (this.lim != null) out = out.slice(0, this.lim);
    if (this.headOnly) return { data: null, error: null, count };
    const res = this.shape(out);
    if (this.countOpt) res.count = count;
    return res;
  }

  private shape(list: Row[]): Res {
    const copy = list.map((r) => ({ ...r }));
    if (this.mode !== "select" && !this.returning && !this.one) return { data: null, error: null };
    if (this.one) {
      if (!copy.length) return { data: null, error: this.one === "single" ? { message: "Not found" } : null };
      return { data: copy[0], error: null };
    }
    return { data: copy, error: null };
  }

  then<A = Res, B = never>(ok?: ((v: Res) => A | PromiseLike<A>) | null, bad?: ((e: unknown) => B | PromiseLike<B>) | null) {
    try {
      return Promise.resolve(this.run()).then(ok, bad);
    } catch (e) {
      return Promise.reject(e).then(ok, bad);
    }
  }
}

const sum = (rows: Row[], f: (r: Row) => boolean) => rows.filter(f).reduce((a, r) => a + (r.amount as number), 0);

export function demoWallet(userId: string) {
  const rows = db().wallet_tx.filter((r) => r.user_id === userId);
  return {
    available: sum(rows, (r) => r.status === "completed") + sum(rows, (r) => (r.status === "pending" || r.status === "held") && (r.amount as number) < 0),
    escrow: -sum(rows, (r) => r.type === "escrow_hold" && r.status === "held"),
    pending_in: sum(rows, (r) => r.type === "earning" && r.status === "held"),
    total_earned: sum(rows, (r) => r.type === "earning" && r.status === "completed"),
    total_withdrawn: -sum(rows, (r) => r.type === "withdrawal" && r.status === "completed"),
    total_deposits: sum(rows, (r) => r.type === "deposit" && r.status === "completed"),
    fees: -sum(rows, (r) => r.type === "fee" && r.status === "completed"),
  };
}

export function createDemoClient(role: Role | null) {
  const userId = role ? DEMO_IDS[role] : null;
  const user = userId ? { id: userId, email: `${role}@demo.modelclic.com`, app_metadata: {}, user_metadata: {} } : null;

  const rpc = async (fn: string, args: Record<string, unknown> = {}): Promise<Res> => {
    const d = db();
    switch (fn) {
      case "wallet_summary":
        return { data: [demoWallet((args.uid as string) ?? userId!)], error: null };
      case "search_talent": {
        const q = String(args.p_q ?? "").toLowerCase();
        const rows = d.profiles
          .filter((p) => p.role === "talent" && p.id !== DEMO_IDS.talent)
          .filter((p) => !q || String(p.full_name).toLowerCase().includes(q) || String(p.city).toLowerCase().includes(q) || (p.skills as string[]).some((s) => s.toLowerCase().includes(q)))
          .filter((p) => !args.p_gender || p.gender === args.p_gender)
          .filter((p) => !args.p_min_rating || ((p.rating_avg as number) ?? 0) >= Number(args.p_min_rating))
          .filter((p) => !args.p_skill || (p.skills as string[]).includes(args.p_skill as string))
          .map((p) => ({ ...p, age: 21 + (String(p.id).charCodeAt(35) % 5), verified: p.kyc === "verified" }));
        return { data: rows, error: null };
      }
      case "event_fill": {
        const ids = (args.p_ids as string[]) ?? [];
        return {
          data: ids.map((id) => ({
            event_id: id,
            booked: d.bids.filter((b) => b.event_id === id && (b.status === "booked" || b.status === "completed")).length,
            bids: d.bids.filter((b) => b.event_id === id && b.status !== "withdrawn").length,
          })),
          error: null,
        };
      }
      case "talent_age":
        return { data: 22, error: null };
      case "admin_analytics": {
        const days = Array.from({ length: 14 }, (_, i) => {
          const t = new Date(Date.now() - (13 - i) * 864e5);
          return { day: t.toISOString().slice(0, 10), count: [8, 12, 10, 14, 13, 17, 21, 12, 15, 19, 16, 20, 23, 21][i] };
        });
        return {
          data: {
            verified_members: 2418, verified_14d: 212, events_30d: 146, revenue_30d: 1840000, escrow_now: 3260000,
            checks_per_day: days,
            funnel: { bids: 1240, offers: 410, booked: 352, completed: 331 },
            by_type: [{ type: "Weddings", count: 41 }, { type: "Brand Activations", count: 33 }, { type: "Corporate Events", count: 27 }, { type: "Church Events", count: 18 }, { type: "Concerts", count: 14 }, { type: "Other", count: 13 }],
            members: { talent: 2104, hosts: 314 },
          },
          error: null,
        };
      }
      case "support_conversation":
        return { data: d.conversations.find((c) => c.kind === "support" && c.a_id === userId)?.id ?? null, error: null };
      case "send_message": {
        d.messages.push({ id: uuid(), conversation_id: args.p_conversation, sender_id: userId, body: String(args.p_body), read_at: null, created_at: new Date().toISOString() });
        return { data: null, error: null };
      }
      case "place_bid": {
        const me = d.profiles.find((p) => p.id === userId)!;
        if ((me.bid_points as number) < 3) return { data: null, error: { message: "Not enough bid points" } };
        if (d.bids.some((b) => b.event_id === args.p_event && b.talent_id === userId)) return { data: null, error: { message: "You already bid on this job" } };
        me.bid_points = (me.bid_points as number) - 3;
        d.bids.push({ id: uuid(), event_id: args.p_event, talent_id: userId, status: "bid", invited: false, points_spent: 3, note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        return { data: null, error: null };
      }
      case "respond_offer": {
        const b = d.bids.find((x) => x.id === args.p_bid);
        if (b) b.status = args.p_accept ? "booked" : "declined";
        return { data: null, error: null };
      }
      case "send_offer": {
        const b = d.bids.find((x) => x.event_id === args.p_event && x.talent_id === args.p_talent);
        if (b) b.status = "offered";
        else d.bids.push({ id: uuid(), event_id: args.p_event, talent_id: args.p_talent, status: "offered", invited: true, points_spent: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        return { data: null, error: null };
      }
      case "decline_bid": {
        const b = d.bids.find((x) => x.id === args.p_bid);
        if (b) b.status = "not_selected";
        return { data: null, error: null };
      }
      case "check_in": {
        const b = d.bids.find((x) => x.id === args.p_bid);
        const ev = d.event_secrets.find((s) => s.event_id === b?.event_id);
        if (!b || ev?.checkin_code !== String(args.p_code).trim()) return { data: null, error: { message: "That code doesn’t match. Ask the host for today’s code." } };
        b.checked_in_at = new Date().toISOString();
        return { data: null, error: null };
      }
      case "mark_attendance": {
        const b = d.bids.find((x) => x.id === args.p_bid);
        if (b) { if (args.p_arrived) b.arrived_at = new Date().toISOString(); else b.status = "no_show"; }
        return { data: null, error: null };
      }
      case "confirm_completion": {
        const b = d.bids.find((x) => x.id === args.p_bid);
        if (b) { b.status = "completed"; b.completed_at = new Date().toISOString(); }
        return { data: null, error: null };
      }
      case "admin_review_event": {
        const e = d.events.find((x) => x.id === args.p_id);
        if (e) e.status = args.p_approve ? "active" : "rejected";
        return { data: null, error: null };
      }
      case "admin_review_verification": {
        const v = d.verifications.find((x) => x.id === args.p_id);
        if (v) {
          v.status = args.p_approve ? "verified" : "rejected";
          const p = d.profiles.find((x) => x.id === v.user_id);
          if (p) p[v.side === "host" ? "host_kyc" : "kyc"] = v.status;
        }
        return { data: null, error: null };
      }
      case "admin_settle_tx": {
        const t = d.wallet_tx.find((x) => x.id === args.p_id);
        if (t) t.status = args.p_ok ? "completed" : "failed";
        return { data: null, error: null };
      }
      case "request_deposit":
        d.wallet_tx.push({ id: uuid(), user_id: userId, type: "deposit", amount: Number(args.p_amount), status: "pending", description: "Wallet top-up", reference: "MC-DEMO", created_at: new Date().toISOString() });
        return { data: null, error: null };
      case "request_withdrawal":
        d.wallet_tx.push({ id: uuid(), user_id: userId, type: "withdrawal", amount: -Number(args.p_amount), status: "pending", description: "Withdrawal to bank", created_at: new Date().toISOString() });
        return { data: null, error: null };
      case "raise_sos":
        d.sos_alerts.push({ id: uuid(), user_id: userId, event_id: args.p_event ?? null, status: "open", created_at: new Date().toISOString() });
        return { data: null, error: null };
      default:
        return { data: null, error: null };
    }
  };

  return {
    demo: true as const,
    from: (t: string) => new Query(t),
    rpc,
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: {}, error: { message: "Demo mode — use the demo buttons below." } }),
      signUp: async () => ({ data: {}, error: { message: "Demo mode — sign-up is switched off." } }),
      signInWithOAuth: async () => ({ data: { url: null }, error: { message: "Demo mode — Google sign-in is switched off." } }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: {}, error: null }),
      exchangeCodeForSession: async () => ({ data: {}, error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: "demo" }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "/images/talent/amaka.webp" } }),
        createSignedUrl: async (p: string) => ({ data: { signedUrl: p }, error: null }),
      }),
    },
  };
}
