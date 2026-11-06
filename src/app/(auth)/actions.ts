"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type FormState = { error?: string } | undefined;

const NOT_READY = "Sign-in isn't switched on yet. Please try again soon.";

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  if (!supabaseConfigured) return { error: NOT_READY };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "That email and password don't match." };

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  if (!supabaseConfigured) return { error: NOT_READY };
  const role = formData.get("role") === "host" ? "host" : "talent";
  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (full_name.length < 2) return { error: "Please enter your full name." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${(await headers()).get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // role is read by a database trigger that only accepts "host" or "talent"
      data: { full_name, role, phone, city },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  if (data.session) redirect("/dashboard");
  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}
