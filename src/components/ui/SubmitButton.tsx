"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  className = "btn btn-primary w-full",
  pendingLabel,
  name,
  value,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} className={className} disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden /> {pendingLabel ?? "Please wait…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
