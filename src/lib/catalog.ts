/** Default catalog — the database is seeded with the same list (supabase/schema.sql). */
export const SKILL_GROUPS = ["Front of house", "Promo & modelling", "Stage & performance", "Creative & media", "Operations", "Languages"] as const;
export const JOB_GROUPS = ["Celebrations", "Faith", "Corporate", "Brand & retail", "Entertainment", "Hospitality", "Public & campus"] as const;

const S = (grp: string, labels: string[]) => labels.map((label) => ({ kind: "skill" as const, label, grp, typical_pay: null }));
const J = (grp: string, items: [string, number][]) => items.map(([label, typical_pay]) => ({ kind: "job_type" as const, label, grp, typical_pay }));

export const DEFAULT_SKILLS = [
  ...S("Front of house", ["Ushering", "Wedding ushering", "Hostess / host", "Protocol officer", "Guest relations", "VIP escort", "Registration desk", "Ticketing & access control", "Usher supervisor", "Customer service", "Hospitality", "Corporate events"]),
  ...S("Promo & modelling", ["Brand ambassador", "Brand activations", "Product sampling", "Promo modelling", "Runway modelling", "Car show model", "Merchandising", "Flyer distribution", "Exhibition booth staff", "Data capture & surveys"]),
  ...S("Stage & performance", ["MC / hype person", "Public speaking", "Dancing", "Kids’ activities & face painting", "Sign language"]),
  ...S("Creative & media", ["Photography assistant", "Videography assistant", "Social media live posting", "Makeup artistry", "Hair styling", "Decor assistant"]),
  ...S("Operations", ["Event setup & breakdown", "Runner / logistics", "Crowd control", "Cashier / POS", "Bartending", "Waiting tables", "Catering assistant", "Cleaning crew", "Driving", "First aid trained"]),
  ...S("Languages", ["English", "Yoruba", "Igbo", "Hausa", "Pidgin", "French"]),
];

export const DEFAULT_JOB_TYPES = [
  ...J("Celebrations", [["Weddings", 20000], ["Owambe parties", 18000], ["Birthdays", 15000], ["Kids’ parties", 12000], ["Naming ceremonies", 12000], ["Anniversaries", 15000], ["Burials & remembrance", 15000], ["Private dinners", 20000]]),
  ...J("Faith", [["Church Events", 12000], ["Mosque events", 12000], ["Crusades & conventions", 12000]]),
  ...J("Corporate", [["Corporate Events", 30000], ["Conferences", 30000], ["Product launches", 30000], ["AGMs & board meetings", 25000], ["Award nights", 30000], ["Trade fairs & exhibitions", 25000], ["Book launches", 18000], ["Real estate open houses", 18000]]),
  ...J("Brand & retail", [["Brand Activations", 18000], ["Promotions", 15000], ["Market storms", 12000], ["Road shows", 15000], ["Retail promotions", 15000], ["Supermarket sampling", 12000]]),
  ...J("Entertainment", [["Concerts", 22000], ["Festivals", 20000], ["Fashion shows", 40000], ["Pageants", 25000], ["Club & lounge events", 18000], ["Sports events", 15000], ["Film & TV extras", 15000], ["Photoshoots", 25000], ["Music video shoots", 20000]]),
  ...J("Hospitality", [["Hospitality", 15000], ["Hotel shifts", 12000], ["Restaurant shifts", 10000], ["Charity galas", 25000]]),
  ...J("Public & campus", [["Convocations", 10000], ["Campus events", 10000], ["Government & civic events", 20000]]),
];
