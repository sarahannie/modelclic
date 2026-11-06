export type Role = "admin" | "host" | "talent";
export type Kyc = "unverified" | "pending" | "verified" | "rejected";
export type EventStatus = "draft" | "pending" | "active" | "filled" | "completed" | "rejected" | "cancelled";
export type BidStatus = "bid" | "offered" | "booked" | "declined" | "not_selected" | "withdrawn" | "completed" | "no_show";
export type TxType = "deposit" | "escrow_hold" | "escrow_release" | "earning" | "withdrawal" | "fee" | "refund" | "bid_purchase";
export type TxStatus = "pending" | "held" | "completed" | "failed" | "cancelled";
export type CaseStatus = "open" | "in_progress" | "resolved";

export type Profile = {
  id: string;
  role: Role;
  sides: Role[];
  first_name: string;
  last_name: string;
  full_name: string;
  company_name: string | null;
  staff_title: string | null;
  avatar_url: string | null;
  photos: string[];
  bio: string | null;
  gender: string | null;
  skin_tone: string | null;
  body_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  state: string | null;
  city: string | null;
  skills: string[];
  job_prefs: string[];
  availability: { days?: string; start?: string; end?: string };
  available_for_work: boolean;
  profile_done: boolean;
  kyc: Kyc;
  host_kyc: Kyc;
  bid_points: number;
  rating_avg: number | null;
  rating_count: number;
  gigs_completed: number;
  no_shows: number;
  created_at: string;
};

export type PrivateDetails = {
  id: string;
  phone: string | null;
  email: string | null;
  dob: string | null;
  nin: string | null;
  cac: string | null;
  registered_name: string | null;
  address: string | null;
  ec_name: string | null;
  ec_relationship: string | null;
  ec_phone: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_verified: boolean;
  notify_prefs: Record<string, { push: boolean; email: boolean; sms: boolean }>;
  privacy_prefs: { show_photos: boolean; share_location_on_shift: boolean };
};

export type MCEvent = {
  id: string;
  host_id: string;
  name: string;
  type: string;
  description: string | null;
  staff_needed: number;
  state: string;
  city: string;
  venue: string | null;
  starts_at: string;
  ends_at: string;
  pay_ngn: number;
  dress_code: string | null;
  gender_req: string | null;
  checkin_location: string | null;
  instructions: string | null;
  status: EventStatus;
  review_note: string | null;
  created_at: string;
};

export type Bid = {
  id: string;
  event_id: string;
  talent_id: string;
  status: BidStatus;
  invited: boolean;
  points_spent: number;
  note: string | null;
  checked_in_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WalletTx = {
  id: string;
  user_id: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  description: string;
  event_id: string | null;
  bid_id: string | null;
  reference: string | null;
  created_at: string;
  settled_at: string | null;
};

export type WalletSummary = {
  available: number;
  escrow: number;
  pending_in: number;
  total_earned: number;
  total_withdrawn: number;
  total_deposits: number;
  fees: number;
};

export type Notification = { id: string; user_id: string; text: string; link: string | null; read: boolean; created_at: string };
export type Conversation = { id: string; kind: "booking" | "support"; event_id: string | null; a_id: string; b_id: string | null; last_at: string; created_at: string };
export type Message = { id: string; conversation_id: string; sender_id: string; body: string; read_at: string | null; created_at: string };
export type Rating = { id: string; event_id: string; rater_id: string; ratee_id: string; scores: Record<string, number>; overall: number; comment: string | null; created_at: string };
export type Verification = { id: string; user_id: string; side: "talent" | "host"; nin: string; cac: string | null; selfie_path: string | null; id_doc_path: string | null; liveness: boolean; consent: boolean; status: Kyc; reviewer_id: string | null; notes: string | null; created_at: string; reviewed_at: string | null };
export type SosAlert = { id: string; user_id: string; event_id: string | null; lat: number | null; lng: number | null; status: CaseStatus; handled_by: string | null; created_at: string; resolved_at: string | null };
export type Dispute = { id: string; event_id: string | null; raised_by: string; against_id: string | null; kind: string; details: string; status: CaseStatus; resolution: string | null; created_at: string };
export type Ticket = { id: string; user_id: string; subject: string; body: string; status: CaseStatus; reply: string | null; created_at: string; updated_at: string };
export type CatalogItem = { id: string; kind: "skill" | "job_type"; label: string; grp: string; typical_pay: number | null };
export type AppSettings = { fee_pct: number; monthly_points: number; bid_cost: number; auto_release_hours: number; sos_sla_minutes: number };
export type TalentCard = {
  id: string; full_name: string; avatar_url: string | null; gender: string | null; age: number | null; city: string | null; state: string | null;
  skills: string[]; rating_avg: number | null; rating_count: number; gigs_completed: number; verified: boolean; bio: string | null;
};
