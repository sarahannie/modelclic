import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/talent/:path*", "/host/:path*", "/admin/:path*", "/messages/:path*", "/notifications", "/settings/:path*", "/login", "/register/:path*"],
};
