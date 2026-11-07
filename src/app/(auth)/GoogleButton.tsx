"use client";

import { useEffect, useRef, useState } from "react";
import { googleSignIn } from "./actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleId = {
  initialize: (o: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Old redirect flow — used in demo mode or if Google's script can't load. */
function FallbackButton({ role, next, label, consent, disabled }: Props) {
  return (
    <form action={googleSignIn}>
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="next" value={next} />
      {consent && <input type="hidden" name="consent" value="1" />}
      <SubmitButton className="btn btn-secondary btn-lg w-full" pendingLabel="Opening Google…" disabled={disabled}>
        <GoogleG /> {label}
      </SubmitButton>
    </form>
  );
}

let scriptPromise: Promise<void> | null = null;
function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("gis"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Props = { role: "talent" | "host"; next?: string; label: string; consent?: boolean; disabled?: boolean };

/**
 * Sign in / sign up with Google using Google's own button, so the Google screen says
 * "Sign in to modelclic.com". The role and consent travel with the request.
 */
export function GoogleButton({ role, next = "/app", label, consent = false, disabled = false }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const latest = useRef({ role, next, consent });
  latest.current = { role, next, consent };
  const [mode, setMode] = useState<"loading" | "google" | "fallback">(CLIENT_ID ? "loading" : "fallback");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    (async () => {
      try {
        await loadGis();
        const raw = crypto.randomUUID() + crypto.randomUUID();
        const hashed = await sha256Hex(raw);
        if (cancelled || !box.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          nonce: hashed,
          ux_mode: "popup",
          context: "signin",
          callback: async ({ credential }: { credential: string }) => {
            setBusy(true);
            setError(null);
            try {
              const res = await fetch("/auth/google", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ credential, nonce: raw, ...latest.current, consent: latest.current.consent ? "1" : "" }),
              });
              const out = await res.json();
              if (!res.ok || !out.redirect) throw new Error(out.error || "failed");
              window.location.assign(out.redirect);
            } catch (e) {
              setBusy(false);
              setError(e instanceof Error && e.message !== "failed" ? e.message : "Google sign-in didn't complete. Please try again.");
            }
          },
        });
        const width = Math.min(400, Math.max(200, Math.round(box.current.getBoundingClientRect().width)));
        window.google.accounts.id.renderButton(box.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width,
        });
        setMode("google");
      } catch {
        if (!cancelled) setMode("fallback");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === "fallback") return <FallbackButton role={role} next={next} label={label} consent={consent} disabled={disabled} />;

  return (
    <div>
      <div className={`relative flex min-h-[44px] justify-center ${disabled || busy ? "opacity-50" : ""}`}>
        <div ref={box} className="flex w-full justify-center" />
        {mode === "loading" && (
          <div className="btn btn-secondary btn-lg pointer-events-none absolute inset-0 w-full">
            <GoogleG /> {label}
          </div>
        )}
        {(disabled || busy) && <div className="absolute inset-0 cursor-not-allowed" aria-hidden />}
      </div>
      {busy && <p className="mt-2 text-center text-xs text-ink-500">Signing you in…</p>}
      {error && <p role="alert" className="mt-2 text-center text-xs font-medium text-vermilion-700">{error}</p>}
    </div>
  );
}
