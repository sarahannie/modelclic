export const NG_STATES = [
  "Abia", "Abuja (FCT)", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

export const GENDERS = ["Female", "Male", "Prefer not to say"] as const;
export const SKIN_TONES = ["Fair", "Light", "Medium", "Brown", "Dark"] as const;
export const BODY_TYPES = ["Slim", "Athletic", "Average", "Curvy", "Plus size"] as const;
export const DAYS = ["Weekdays", "Weekends", "Any day", "Evenings only"] as const;
export const BANKS = [
  "Access Bank", "Fidelity Bank", "First Bank", "FCMB", "GTBank", "Kuda", "Moniepoint", "Opay", "Palmpay",
  "Polaris Bank", "Stanbic IBTC", "Sterling Bank", "UBA", "Union Bank", "Wema Bank", "Zenith Bank",
] as const;
export const BID_BUNDLES = [
  { points: 9, price: 900, label: "3 bids" },
  { points: 30, price: 3000, label: "10 bids" },
  { points: 60, price: 6000, label: "20 bids" },
] as const;

export const RATING_HOST = ["Professionalism", "Communication", "Safety", "Payment reliability", "Event organisation"] as const;
export const RATING_STAFF = ["Punctuality", "Politeness", "Professionalism", "Communication", "Performance"] as const;

export const SUPPORT_EMAIL = "support@modelclic.com";

export const FAQ = [
  { q: "Is ModelClic free for talent?", a: "Yes. Talent never pay a fee on their earnings. You get 20 bid points free every month and can buy more if you need them." },
  { q: "How do I know I’ll get paid?", a: "Hosts fund staff pay into escrow when your booking is confirmed. It’s released to your wallet when the host confirms the job, or automatically 12 hours after the event." },
  { q: "Why do you need my NIN?", a: "To confirm everyone is who they say they are. Your NIN, phone, email and bank details are never shown to hosts." },
  { q: "What happens if I feel unsafe at an event?", a: "Slide SOS on your shift pass. Our safety team is alerted with your location and aims to respond within 2 minutes." },
  { q: "Can I work and hire with one account?", a: "Yes. Add a hiring profile from Settings and switch between working and hiring any time." },
] as const;
