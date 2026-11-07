"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  className = "btn btn-primary w-full",
  pendingLabel,
  name,
  value,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} className={className} disabled={pending || disabled} aria-busy={pending}>
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
