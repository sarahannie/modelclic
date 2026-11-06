"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, ImagePlus, ScanFace, X } from "lucide-react";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { submitVerification } from "@/app/actions/profile";

export function PhotoInput({ name, label, hint, shape = "square", required, capture }: { name: string; label: string; hint: string; shape?: "square" | "wide" | "circle"; required?: boolean; capture?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const size = shape === "wide" ? "h-36 w-full" : shape === "circle" ? "size-28 rounded-full" : "size-36";
  return (
    <div>
      <p className="label">{label}</p>
      <label className={`relative grid cursor-pointer place-items-center overflow-hidden border-2 border-dashed border-line bg-ice-25 text-center transition hover:border-ink-300 ${size} ${shape === "circle" ? "" : "rounded-2xl"}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1.5 px-3 text-xs font-semibold text-ink-500">
            <ImagePlus className="size-5" /> {hint}
          </span>
        )}
        <input
          type="file"
          name={name}
          accept="image/*"
          {...(capture ? { capture: "user" as const } : {})}
          required={required}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; setUrl(f ? URL.createObjectURL(f) : null); }}
        />
      </label>
    </div>
  );
}

function Liveness({ onDone }: { onDone: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const prompts = ["Look straight at the camera", "Slowly turn your head left", "Now turn right", "Smile!"];
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user" } })
      .then((s) => { stream = s; if (video.current) video.current.srcObject = s; })
      .catch(() => setErr("We couldn’t open your camera. Allow camera access and try again."));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);
  useEffect(() => {
    if (err) return;
    if (step >= prompts.length) { onDone(); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 2200);
    return () => clearTimeout(t);
  }, [step, err]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="rounded-2xl bg-ink p-4 text-white">
      {err ? (
        <p className="text-sm">{err}</p>
      ) : (
        <>
          <div className="relative mx-auto aspect-[3/4] w-48 overflow-hidden rounded-[45%] ring-4 ring-vermilion">
            <video ref={video} autoPlay playsInline muted className="size-full scale-x-[-1] object-cover" />
          </div>
          <p className="mt-4 text-center font-bold" aria-live="polite">{prompts[Math.min(step, prompts.length - 1)]}</p>
          <div className="mt-3 flex justify-center gap-1.5">{prompts.map((_, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i < step ? "bg-vermilion" : "bg-white/20"}`} />)}</div>
        </>
      )}
    </div>
  );
}

export function VerifyForm({ side }: { side: "talent" | "host" }) {
  const [live, setLive] = useState<"idle" | "running" | "done">("idle");
  return (
    <ActionForm action={submitVerification} className="space-y-5">
      <input type="hidden" name="liveness" value={live === "done" ? "1" : ""} />
      <div>
        <label className="label" htmlFor="nin">National Identification Number (NIN)</label>
        <input id="nin" name="nin" inputMode="numeric" maxLength={11} pattern="\d{11}" required placeholder="11-digit NIN" className="field" />
      </div>
      {side === "host" && (
        <div>
          <label className="label" htmlFor="cac">CAC number <span className="font-normal text-ink-400">(registered businesses)</span></label>
          <input id="cac" name="cac" placeholder="RC 1234567" className="field" />
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        <PhotoInput name="selfie" label="Selfie" hint="Take a clear selfie" capture required />
        <div className="min-w-[220px] flex-1">
          <PhotoInput name="id_doc" label={side === "host" ? "ID or CAC certificate" : "Government ID (NIN slip or ID card)"} hint="Drop a clear photo of your ID" shape="wide" required={side === "talent"} />
        </div>
      </div>
      <p className="text-xs text-ink-400">Your NIN and photos are encrypted, only seen by our verification team, and never shown to other members.</p>
      <p className="rounded-xl border border-vermilion-100 bg-vermilion-50 px-4 py-3 text-xs text-vermilion-700">
        ID + liveness match only. Criminal background checks are not part of verification — avoid events that feel unsafe and use SOS if needed.
      </p>
      <label className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm text-ink-600">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-[#0e1a2b]" />
        <span>I agree that ModelClic and its verification partner may process my NIN, selfie and face scan to confirm my identity. Images are deleted 90 days after verification. <span className="text-ink-400">Required by the Nigeria Data Protection Act for biometric data.</span></span>
      </label>

      {side === "talent" && (
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-bold"><ScanFace className="size-4" /> Liveness check</p>
              <p className="text-xs text-ink-500">{live === "done" ? "Passed ✓" : live === "running" ? "Follow the prompts…" : "Not started · takes about 10 seconds"}</p>
            </div>
            {live === "done" ? (
              <span className="grid size-9 place-items-center rounded-full bg-ink text-white"><Check className="size-4" /></span>
            ) : live === "running" ? (
              <button type="button" onClick={() => setLive("idle")} className="btn btn-xs btn-ghost"><X className="size-3.5" /> Cancel</button>
            ) : (
              <button type="button" onClick={() => setLive("running")} className="btn btn-sm btn-secondary"><Camera className="size-4" /> Start check</button>
            )}
          </div>
          {live === "running" && <div className="mt-4"><Liveness onDone={() => setLive("done")} /></div>}
        </div>
      )}

      <SubmitButton className="btn btn-ink btn-lg w-full" pendingLabel="Uploading securely…">Submit for review</SubmitButton>
    </ActionForm>
  );
}
