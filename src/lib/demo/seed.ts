/* Sample data for demo mode (used only when Supabase isn't configured and DEMO_MODE=1). */
import { DEFAULT_JOB_TYPES, DEFAULT_SKILLS } from "../catalog";

export const DEMO_IDS = {
  admin: "00000000-0000-4000-8000-0000000000a1",
  host: "00000000-0000-4000-8000-0000000000b1",
  host2: "00000000-0000-4000-8000-0000000000b2",
  talent: "00000000-0000-4000-8000-0000000000c1",
} as const;

const day = (d: number, h = 12, m = 0) => {
  const t = new Date();
  t.setUTCDate(t.getUTCDate() + d);
  t.setUTCHours(h - 1, m, 0, 0); // Lagos = UTC+1
  return t.toISOString();
};
const uid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const baseProfile = {
  sides: ["talent"], company_name: null, staff_title: null, photos: [], bio: null, gender: null, skin_tone: null, body_type: null,
  height_cm: null, weight_kg: null, state: "Lagos", city: null, skills: [], job_prefs: [], availability: {}, available_for_work: true,
  profile_done: true, kyc: "verified", host_kyc: "unverified", bid_points: 20, rating_avg: null, rating_count: 0, gigs_completed: 0,
  no_shows: 0, avatar_url: null,
};
const person = (id: string, first: string, last: string, extra: Record<string, unknown>) => ({
  ...baseProfile, id, first_name: first, last_name: last, full_name: `${first} ${last}`.trim(), created_at: day(-40), role: "talent", ...extra,
});

export function seed() {
  const T = DEMO_IDS.talent, H = DEMO_IDS.host, H2 = DEMO_IDS.host2, A = DEMO_IDS.admin;
  const talents = [
    person(uid(11), "Ngozi", "Chukwu", { avatar_url: "/images/talent/ngozi.webp", gender: "Female", city: "Lekki", rating_avg: 4.9, rating_count: 38, gigs_completed: 41, skills: ["Wedding ushering", "Hospitality"], bio: "Final-year student, available weekends for ushering and hospitality across Lagos.", height_cm: 168 }),
    person(uid(12), "Tunde", "Bakare", { avatar_url: "/images/talent/tunde.webp", gender: "Male", city: "Ikeja", rating_avg: 4.7, rating_count: 25, gigs_completed: 28, skills: ["Brand activations", "Public speaking"], bio: "Confident on camera and great with crowds.", height_cm: 181 }),
    person(uid(13), "Amaka", "Obi", { avatar_url: "/images/talent/amaka.webp", gender: "Female", city: "Victoria Island", rating_avg: 4.8, rating_count: 31, gigs_completed: 35, skills: ["Registration desk", "Customer service"], bio: "Organised and calm on fast registration desks.", height_cm: 163 }),
    person(uid(14), "Chidinma", "Eze", { avatar_url: "/images/talent/chidinma.webp", gender: "Female", state: "Abuja (FCT)", city: "Wuse", rating_avg: 5, rating_count: 47, gigs_completed: 52, skills: ["Corporate events", "Wedding ushering"], bio: "Corporate event support across Abuja venues.", height_cm: 170 }),
    person(uid(15), "Daniel", "Okoro", { avatar_url: "/images/talent/daniel.webp", gender: "Male", city: "Yaba", rating_avg: 4.6, rating_count: 17, gigs_completed: 19, kyc: "pending", skills: ["Hospitality", "Customer service"], bio: "Friendly and reliable hotel-events hospitality.", height_cm: 175 }),
  ];
  const profiles = [
    person(T, "Ada", "Okafor", { avatar_url: "/images/talent/amaka.webp", gender: "Female", city: "Surulere", bid_points: 14, rating_avg: 4.8, rating_count: 9, gigs_completed: 11, skills: ["Wedding ushering", "Hostess / host", "Customer service", "Yoruba"], job_prefs: ["Weddings", "Corporate Events", "Brand Activations"], bio: "Final-year Mass Comm student at UNILAG. Two years of wedding ushering and brand activations.", availability: { days: "Weekends", start: "09:00", end: "20:00" }, height_cm: 168, weight_kg: 58, skin_tone: "Brown", body_type: "Slim" }),
    person(H, "Bloom", "Events", { role: "host", sides: ["host"], company_name: "Bloom Events Ltd", host_kyc: "verified", kyc: "unverified", rating_avg: 4.8, rating_count: 22 }),
    person(H2, "Capital", "Galas", { role: "host", sides: ["host"], company_name: "Capital Galas", state: "Abuja (FCT)", host_kyc: "pending", kyc: "unverified", rating_avg: 4.6, rating_count: 8 }),
    person(A, "Sarah", "Ndianekwu", { role: "admin", sides: ["admin"], staff_title: "Founder · Trust & Safety", kyc: "verified" }),
    ...talents,
  ];

  const ev = (n: number, host: string, name: string, type: string, d: number, h: number, len: number, pay: number, staff: number, city: string, state: string, status: string, extra: Record<string, unknown> = {}) => ({
    id: uid(100 + n), host_id: host, name, type, description: "Welcome guests, guide seating and support the host team through the programme.",
    staff_needed: staff, state, city, venue: city, starts_at: day(d, h), ends_at: day(d, h + len), pay_ngn: pay, dress_code: "All black, neat shoes",
    gender_req: null, checkin_location: "Main entrance, ask for the event lead", instructions: "Arrive 45 minutes early for briefing.",
    status, review_note: null, created_at: day(-5 + (n % 4)), ...extra,
  });
  const events = [
    ev(1, H, "Adeyemi–Okafor Wedding", "Weddings", 2, 14, 8, 25000, 8, "Victoria Island", "Lagos", "active", { venue: "Oriental Hotel" }),
    ev(2, H, "Pulse brand activation — Ikeja City Mall", "Brand Activations", 0, 11, 7, 18000, 12, "Ikeja", "Lagos", "active", { venue: "Ikeja City Mall" }),
    ev(3, H2, "Corporate Conference Hostesses", "Conferences", 1, 7, 10, 35000, 20, "Victoria Island", "Lagos", "active", { venue: "Eko Hotel" }),
    ev(4, H2, "Church Anniversary Ushers", "Church Events", 4, 8, 5, 12000, 15, "Lekki Phase 1", "Lagos", "active"),
    ev(5, H, "Owambe Hostesses — Eko Hotel", "Owambe parties", 5, 13, 8, 20000, 12, "Victoria Island", "Lagos", "active"),
    ev(6, H2, "Concert Ticketing & Crowd Control", "Concerts", 6, 16, 7, 22000, 30, "Eagle Square", "Abuja (FCT)", "active"),
    ev(7, H, "Product Launch Promo Models", "Product launches", 9, 10, 6, 30000, 6, "GRA", "Rivers", "active"),
    ev(8, H, "Lagos Fashion Week — Runway models", "Fashion shows", 12, 16, 6, 60000, 8, "Victoria Island", "Lagos", "pending"),
    ev(9, H2, "Convention assistants", "Crusades & conventions", 7, 8, 9, 15000, 12, "GRA Phase 2", "Rivers", "pending"),
    ev(10, H, "Tech Summit — registration desk", "Conferences", -4, 8, 9, 15000, 6, "Yaba", "Lagos", "completed"),
    ev(11, H, "Year-end staff party", "Corporate Events", 20, 18, 5, 20000, 10, "Ikoyi", "Lagos", "draft"),
  ];
  const secrets = events.map((e, i) => ({ event_id: e.id, checkin_code: String(1007 + i * 37).slice(-4) }));

  const bid = (n: number, e: number, t: string, status: string, extra: Record<string, unknown> = {}) => ({
    id: uid(300 + n), event_id: uid(100 + e), talent_id: t, status, invited: false, points_spent: 3, note: null,
    checked_in_at: null, arrived_at: null, completed_at: null, created_at: day(-2 + (n % 3)), updated_at: day(-1), ...extra,
  });
  const bids = [
    bid(1, 1, T, "booked"), bid(2, 2, T, "offered", { invited: true, points_spent: 0 }), bid(3, 3, T, "bid"), bid(4, 6, T, "not_selected"),
    bid(5, 10, T, "completed", { completed_at: day(-3) }), bid(6, 4, T, "bid"),
    bid(7, 1, uid(11), "booked", { arrived_at: null }), bid(8, 1, uid(12), "bid"), bid(9, 1, uid(13), "offered"), bid(10, 1, uid(15), "bid"),
    bid(11, 2, uid(12), "booked"), bid(12, 5, uid(11), "bid"), bid(13, 5, uid(14), "bid"), bid(14, 10, uid(13), "completed"),
  ];

  const tx = (n: number, user: string, type: string, amount: number, status: string, description: string, d: number, extra: Record<string, unknown> = {}) => ({
    id: uid(500 + n), user_id: user, type, amount, status, description, event_id: null, bid_id: null, reference: null, created_at: day(d), settled_at: status === "completed" ? day(d) : null, ...extra,
  });
  const wallet_tx = [
    tx(1, T, "earning", 25000, "held", "Adeyemi–Okafor Wedding", -1, { event_id: uid(101) }),
    tx(2, T, "earning", 15000, "completed", "Tech Summit — registration desk", -3),
    tx(3, T, "earning", 30000, "completed", "Sunday Praise Concert", -40),
    tx(4, T, "earning", 22000, "completed", "Zenith Brand Activation", -70),
    tx(5, T, "earning", 20000, "completed", "Corporate Gala", -100),
    tx(6, T, "earning", 12000, "completed", "Campus Week", -130),
    tx(7, T, "withdrawal", -15000, "completed", "Withdrawal to GTBank", -20),
    tx(8, T, "bid_purchase", -900, "completed", "9 bid points", -10),
    tx(9, H, "deposit", 400000, "completed", "Wallet top-up", -12, { reference: "MC-7F2A91C0" }),
    tx(10, H, "escrow_hold", -25000, "held", "Escrow · Adeyemi–Okafor Wedding", -1),
    tx(11, H, "escrow_hold", -25000, "held", "Escrow · Adeyemi–Okafor Wedding", -1),
    tx(12, H, "escrow_hold", -18000, "held", "Escrow · Pulse brand activation", -1),
    tx(13, H, "escrow_hold", -30000, "completed", "Escrow · Tech Summit", -5),
    tx(14, H, "fee", -3000, "completed", "Service fee · Tech Summit", -3),
    tx(15, H2, "deposit", 150000, "pending", "Wallet top-up", 0, { reference: "MC-3B8D0E44" }),
    tx(16, uid(13), "withdrawal", -20000, "pending", "Withdrawal to Kuda", 0),
  ];

  const notifications = [
    { id: uid(601), user_id: T, text: "You have an offer for Pulse brand activation", link: "/talent/gigs?tab=offers", read: false, created_at: day(0, 9) },
    { id: uid(602), user_id: T, text: "Booked: Adeyemi–Okafor Wedding", link: "/talent/gigs?tab=booked", read: false, created_at: day(-1, 15) },
    { id: uid(603), user_id: T, text: "Payment released for Tech Summit", link: "/talent/wallet", read: true, created_at: day(-3, 10) },
    { id: uid(604), user_id: H, text: "New bid on Adeyemi–Okafor Wedding", link: `/host/events/${uid(101)}`, read: false, created_at: day(0, 8) },
    { id: uid(605), user_id: H, text: "Lagos Fashion Week is awaiting review", link: `/host/events/${uid(108)}`, read: true, created_at: day(-1, 8) },
    { id: uid(606), user_id: A, text: "SOS alert raised", link: "/admin?tab=sos", read: false, created_at: day(0, 7) },
  ];

  const conversations = [
    { id: uid(701), kind: "booking", event_id: uid(101), a_id: T, b_id: H, last_at: day(0, 9), created_at: day(-1) },
    { id: uid(702), kind: "support", event_id: null, a_id: T, b_id: null, last_at: day(-2, 9), created_at: day(-2) },
    { id: uid(703), kind: "booking", event_id: uid(101), a_id: uid(11), b_id: H, last_at: day(-1, 18), created_at: day(-1) },
  ];
  const messages = [
    { id: uid(801), conversation_id: uid(701), sender_id: H, body: "Hi Ada, welcome to the team! Briefing is at 1:15 PM at the main entrance.", read_at: day(0), created_at: day(0, 8, 40) },
    { id: uid(802), conversation_id: uid(701), sender_id: T, body: "Thank you! I’ll be there early. All black outfit, right?", read_at: day(0), created_at: day(0, 8, 52) },
    { id: uid(803), conversation_id: uid(701), sender_id: H, body: "Yes — all black, neat shoes. See you Saturday.", read_at: null, created_at: day(0, 9, 3) },
    { id: uid(804), conversation_id: uid(702), sender_id: A, body: "Welcome to ModelClic! Ask us anything about bids, pay or safety. We usually reply within an hour.", read_at: day(-2), created_at: day(-2, 9, 12) },
    { id: uid(805), conversation_id: uid(703), sender_id: uid(11), body: "Good evening, what time should we arrive?", read_at: null, created_at: day(-1, 18) },
  ];

  const verifications = [
    { id: uid(901), user_id: uid(15), side: "talent", nin: "22345678901", cac: null, selfie_path: "/images/talent/daniel.webp", id_doc_path: null, liveness: true, consent: true, status: "pending", reviewer_id: null, notes: null, created_at: day(0, 7), reviewed_at: null },
    { id: uid(902), user_id: H2, side: "host", nin: "33345678901", cac: "RC 1234567", selfie_path: null, id_doc_path: null, liveness: true, consent: true, status: "pending", reviewer_id: null, notes: null, created_at: day(0, 6), reviewed_at: null },
    { id: uid(903), user_id: T, side: "talent", nin: "11145678901", cac: null, selfie_path: null, id_doc_path: null, liveness: true, consent: true, status: "verified", reviewer_id: A, notes: null, created_at: day(-30), reviewed_at: day(-30) },
  ];
  const ratings = [
    { id: uid(951), event_id: uid(110), rater_id: H, ratee_id: T, scores: { Punctuality: 5, Politeness: 5, Professionalism: 5, Communication: 4, Performance: 5 }, overall: 4.8, comment: "Great on the registration desk.", created_at: day(-2) },
  ];
  const sos_alerts = [{ id: uid(961), user_id: uid(12), event_id: uid(102), lat: 6.6018, lng: 3.3515, status: "open", handled_by: null, created_at: day(0, 7, 40), resolved_at: null }];
  const disputes = [{ id: uid(971), event_id: uid(110), raised_by: H, against_id: uid(15), kind: "no_show", details: "Talent did not arrive for the registration desk shift.", status: "open", resolution: null, created_at: day(-3) }];
  const tickets = [
    { id: uid(981), user_id: T, subject: "Bid points not refunded", body: "An event was cancelled after I bid. Will I get my points back?", status: "open", reply: null, created_at: day(-1), updated_at: day(-1) },
    { id: uid(982), user_id: H2, subject: "CAC verification", body: "Our CAC number is new — how long does verification take?", status: "in_progress", reply: "Usually under 4 hours.", created_at: day(-2), updated_at: day(-1) },
  ];
  const catalog_items = [...DEFAULT_SKILLS, ...DEFAULT_JOB_TYPES].map((c, i) => ({ id: uid(2000 + i), created_at: day(-60), ...c }));
  const app_settings = [{ id: true, fee_pct: 10, monthly_points: 20, bid_cost: 3, auto_release_hours: 12, sos_sla_minutes: 2, topup_bank: "Providus Bank", topup_account_name: "ModelClic Escrow", topup_account_no: "9900112233", support_email: "support@modelclic.com", updated_at: day(-10) }];
  const private_details = profiles.map((p) => ({
    id: p.id, phone: "0803 000 0000", email: `${p.first_name.toLowerCase()}@example.com`, dob: "2002-04-01", nin: null, cac: null, registered_name: null,
    address: null, ec_name: p.id === T ? "Ngozi Okafor" : null, ec_relationship: p.id === T ? "Sister" : null, ec_phone: null,
    bank_name: p.id === T ? "GTBank" : null, account_number: p.id === T ? "0123456789" : null, account_verified: p.id === T,
    notify_prefs: { jobs: { push: true, email: true, sms: false }, bids: { push: true, email: true, sms: true }, payments: { push: true, email: true, sms: true }, messages: { push: true, email: false, sms: false } },
    privacy_prefs: { show_photos: true, share_location_on_shift: true },
  }));
  const saved_events = [{ user_id: T, event_id: uid(105), created_at: day(-1) }];
  const favorites = [{ host_id: H, talent_id: uid(11), created_at: day(-3) }, { host_id: H, talent_id: uid(14), created_at: day(-6) }];

  return {
    profiles, private_details, events, event_secrets: secrets, bids, wallet_tx, notifications, conversations, messages, verifications,
    ratings, sos_alerts, disputes, tickets, catalog_items, app_settings, saved_events, favorites,
  } as Record<string, Record<string, unknown>[]>;
}
