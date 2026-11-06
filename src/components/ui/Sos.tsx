"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { runRpc } from "@/app/actions/rpc";
import { useToast } from "./Toast";

function locate(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((res) => {
    if (!navigator.geolocation) return res({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => res({ lat: null, lng: null }),
      { timeout: 5000, enableHighAccuracy: true },
    );
  });
}

function useSos(eventId?: string | null) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const send = () =>
    start(async () => {
      const { lat, lng } = await locate();
      const r = await runRpc("raise_sos", { p_event: eventId ?? null, p_lat: lat, p_lng: lng });
      if (r.ok) toast("SOS sent. Our safety team is calling you now. In immediate danger, call 112.");
      else toast(r.error ?? "Couldn’t send SOS — call 112 now.", "error");
      router.refresh();
    });
  return { send, pending };
}

/** Slide-to-send SOS (shift pass). */
export function SosSlider({ eventId }: { eventId?: string | null }) {
  const { send, pending } = useSos(eventId);
  const [x, setX] = useState(0);
  const [sent, setSent] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const max = () => (track.current ? track.current.clientWidth - 52 : 200);
  const move = (clientX: number) => {
    if (!drag.current || !track.current) return;
    const r = track.current.getBoundingClientRect();
    setX(Math.max(0, Math.min(max(), clientX - r.left - 26)));
  };
  const end = () => {
    if (!drag.current) return;
    drag.current = false;
    if (x > max() * 0.85) { setX(max()); setSent(true); send(); }
    else setX(0);
  };
  return (
    <div>
      <div
        ref={track}
        className={`relative flex h-14 items-center overflow-hidden rounded-full p-1 select-none ${sent ? "bg-vermilion" : "bg-vermilion-50 ring-1 ring-vermilion-100"}`}
        onPointerMove={(e) => move(e.clientX)}
        onPointerUp={end}
        onPointerLeave={end}
      >
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${sent ? "text-white" : "text-vermilion-700"}`}>
          {sent ? (pending ? "Sending SOS…" : "SOS sent — help is on the way") : "Slide to send SOS →"}
        </span>
        <button
          type="button"
          aria-label="Slide to send SOS, or press Enter"
          onPointerDown={(e) => { drag.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !sent) { setSent(true); setX(max()); send(); } }}
          className="relative z-10 grid size-12 cursor-grab place-items-center rounded-full bg-vermilion text-white shadow-lg active:cursor-grabbing"
          style={{ transform: `translateX(${x}px)`, transition: drag.current ? "none" : "transform .25s" }}
        >
          <ShieldAlert className="size-5" />
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-500">Our safety team calls you back within 2 minutes and your emergency contact is told. In immediate danger, call 112.</p>
    </div>
  );
}

/** Tap twice to send (My Gigs). */
export function SosButton({ eventId }: { eventId?: string | null }) {
  const { send, pending } = useSos(eventId);
  const [armed, setArmed] = useState(false);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (armed) { setArmed(false); send(); }
          else { setArmed(true); setTimeout(() => setArmed(false), 3000); }
        }}
        className={`btn ${armed ? "bg-vermilion text-white" : "btn-danger"}`}
      >
        <ShieldAlert className="size-4" /> {armed ? "Tap again to send SOS" : "SOS — get help now"}
      </button>
      <p className="mt-2 max-w-sm text-xs text-ink-500">Tap twice to send. We share the event and your location with our safety team and your emergency contact.</p>
    </div>
  );
}
