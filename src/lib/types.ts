export type Role = "admin" | "host" | "talent";
export type GigStatus = "pending" | "open" | "closed" | "rejected";
export type ApplicationStatus = "applied" | "accepted" | "declined" | "withdrawn";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  city: string | null;
  verified: boolean;
  created_at: string;
};

export type Gig = {
  id: string;
  host_id: string;
  title: string;
  category: string;
  city: string;
  venue: string;
  event_date: string;
  pay_ngn: number;
  slots: number;
  description: string | null;
  status: GigStatus;
  created_at: string;
};

export type Application = {
  id: string;
  gig_id: string;
  talent_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
};

export const CATEGORIES = [
  "Ushering",
  "Hostess",
  "Modelling",
  "Brand promoter",
  "Hospitality",
  "Event assistant",
] as const;

export const CITIES = ["Lagos", "Abuja", "Port Harcourt"] as const;
