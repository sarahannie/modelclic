"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import type { ActionResult } from "./rpc";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => (str(fd, k) ? Number(str(fd, k)) : null);
const fail = (error: string): ActionResult => ({ ok: false, error });
const MAX = 6 * 1024 * 1024;

async function me() {
  const s = await getSession();
  if (!s.user || !s.profile) throw new Error("Please log in again.");
  return { ...s, user: s.user, profile: s.profile };
}

async function upload(bucket: "photos" | "kyc", file: FormDataEntryValue | null, path: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX) throw new Error("Each photo must be under 6 MB.");
  if (!/^image\//.test(file.type)) throw new Error("Please upload an image (JPG or PNG).");
  const { supabase } = await me();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const full = `${path}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(full, file, { upsert: true, contentType: file.type });
  if (error) throw new Error("Upload failed — please try again.");
  if (bucket === "kyc") return full;
  return supabase.storage.from(bucket).getPublicUrl(full).data.publicUrl;
}

/** Complete-profile wizard: saves one step, then moves to the next. */
export async function saveProfileStep(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user, profile } = await me();
  const step = Number(str(fd, "step"));
  try {
    if (step === 0) {
      const avatar = await upload("photos", fd.get("avatar"), `${user.id}/main`);
      const extra = (await Promise.all([1, 2, 3].map((i) => upload("photos", fd.get(`photo${i}`), `${user.id}/photo${i}`)))).filter(Boolean) as string[];
      const bio = str(fd, "bio");
      if (!avatar && !profile.avatar_url) return fail("Add a clear main photo — hosts book faces they can see.");
      if (bio.length < 20) return fail("Write a short bio (at least 20 characters).");
      const { error } = await supabase.from("profiles").update({
        avatar_url: avatar ?? profile.avatar_url,
        photos: extra.length ? [...extra, ...profile.photos].slice(0, 3) : profile.photos,
        bio, skin_tone: str(fd, "skin_tone") || null, body_type: str(fd, "body_type") || null,
        height_cm: num(fd, "height_cm"), weight_kg: num(fd, "weight_kg"),
      }).eq("id", user.id);
      if (error) return fail(error.message);
    } else if (step === 1) {
      const skills = fd.getAll("skills").map(String);
      if (!skills.length) return fail("Pick at least one skill.");
      const { error } = await supabase.from("profiles").update({
        state: str(fd, "state") || null, city: str(fd, "city") || null, skills, job_prefs: fd.getAll("job_prefs").map(String),
        availability: { days: str(fd, "days"), start: str(fd, "start"), end: str(fd, "end") },
      }).eq("id", user.id);
      if (error) return fail(error.message);
    } else {
      const ec_name = str(fd, "ec_name"), ec_phone = str(fd, "ec_phone");
      if (!ec_name || ec_phone.replace(/\D/g, "").length < 10) return fail("Add an emergency contact name and phone number.");
      await supabase.from("private_details").update({ ec_name, ec_relationship: str(fd, "ec_relationship") || null, ec_phone }).eq("id", user.id);
      await supabase.from("profiles").update({ profile_done: true }).eq("id", user.id);
      revalidatePath("/", "layout");
      redirect("/talent?welcome=1");
    }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // let redirect() through
    return fail(e instanceof Error ? e.message : "Something went wrong.");
  }
  revalidatePath("/talent/profile");
  redirect(`/talent/profile?step=${step + 1}`);
}

/** Identity check (talent or host). Documents go to the private "kyc" bucket. */
export async function submitVerification(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user, profile } = await me();
  const side = profile.role === "host" ? "host" : "talent";
  const nin = str(fd, "nin").replace(/\D/g, "");
  if (nin.length !== 11) return fail("Your NIN is 11 digits.");
  if (fd.get("consent") !== "on") return fail("Please tick the consent box so we can run the check.");
  if (side === "talent" && fd.get("liveness") !== "1") return fail("Complete the liveness check first.");
  try {
    const selfie = await upload("kyc", fd.get("selfie"), `${user.id}/selfie`);
    const idDoc = await upload("kyc", fd.get("id_doc"), `${user.id}/id`);
    if (!selfie) return fail("Add a clear selfie.");
    if (side === "talent" && !idDoc) return fail("Add a photo of your NIN slip or ID card.");
    const { error } = await supabase.from("verifications").insert({
      user_id: user.id, side, nin, cac: str(fd, "cac") || null, selfie_path: selfie, id_doc_path: idDoc, liveness: true, consent: true,
    });
    if (error) return fail("Couldn’t submit your check. Please try again.");
    await supabase.from("private_details").update({ nin }).eq("id", user.id);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload failed.");
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Submitted — most checks finish in under 15 minutes." };
}

export async function withdrawBid(bidId: string): Promise<ActionResult> {
  const { supabase, user } = await me();
  const { error } = await supabase.from("bids").update({ status: "withdrawn" }).eq("id", bidId).eq("talent_id", user.id).eq("status", "bid");
  if (error) return fail(error.message);
  revalidatePath("/talent", "layout");
  return { ok: true, message: "Bid withdrawn." };
}

export async function updateHostProfile(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const { supabase, user, profile } = await me();
  try {
    const avatar = await upload("photos", fd.get("avatar"), `${user.id}/logo`);
    const { error } = await supabase.from("profiles").update({
      company_name: str(fd, "company_name") || null, bio: str(fd, "bio") || null, avatar_url: avatar ?? profile.avatar_url,
      state: str(fd, "state") || null, city: str(fd, "city") || null,
    }).eq("id", user.id);
    if (error) return fail(error.message);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload failed.");
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile updated." };
}
