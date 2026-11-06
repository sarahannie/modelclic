import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(DEMO_COOKIE);
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
