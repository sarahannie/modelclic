import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, SUPABASE_ANON_KEY, SUPABASE_URL, demoMode, supabaseConfigured } from "./env";

const PROTECTED = ["/talent", "/host", "/admin", "/messages", "/notifications", "/settings"];
const AUTH_PAGES = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  const redirect = (to: string, keepNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = keepNext ? `?next=${encodeURIComponent(path)}` : "";
    return NextResponse.redirect(url);
  };

  if (demoMode) {
    const signedIn = Boolean(request.cookies.get(DEMO_COOKIE)?.value);
    if (!signedIn && isProtected) return redirect(path.startsWith("/admin") ? "/staff" : "/login", true);
    return response;
  }
  if (!supabaseConfigured) return response;

  // No Supabase auth cookie → logged-out visitor: skip the network check entirely.
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  if (!hasAuthCookie) return isProtected ? redirect(path.startsWith("/admin") ? "/staff" : "/login", true) : response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) return redirect(path.startsWith("/admin") ? "/staff" : "/login", true);
  if (user && AUTH_PAGES.some((p) => path.startsWith(p))) return redirect("/app");
  return response;
}
