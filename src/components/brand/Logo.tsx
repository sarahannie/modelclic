import Link from "next/link";

/** The ModelClic mark: an ink tile with "MC" and a vermilion dot, plus wordmark and tagline. */
export function LogoMark({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-[28%] font-extrabold tracking-[-0.04em] ${
        onDark ? "bg-white text-ink" : "bg-ink text-white"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      MC
      <span
        className={`absolute rounded-full bg-vermilion ${onDark ? "ring-ink" : "ring-white"}`}
        style={{ width: size * 0.3, height: size * 0.3, right: -size * 0.06, bottom: -size * 0.06, boxShadow: `0 0 0 ${Math.max(2, size * 0.06)}px ${onDark ? "var(--color-ink)" : "white"}` }}
      />
    </span>
  );
}

export function Logo({
  onDark = false,
  href = "/",
  compact = false,
  size = 40,
}: {
  onDark?: boolean;
  href?: string | null;
  compact?: boolean;
  size?: number;
}) {
  const body = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} onDark={onDark} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`text-[19px] font-extrabold tracking-[-0.035em] ${onDark ? "text-white" : "text-ink"}`}>
            ModelClic
          </span>
          <span className={`mt-1 text-[11px] font-semibold tracking-[0.02em] ${onDark ? "text-white/60" : "text-ink-500"}`}>
            Safe. Verified. Paid.
          </span>
        </span>
      )}
    </span>
  );
  if (!href) return body;
  return (
    <Link href={href} aria-label="ModelClic home" className="inline-flex rounded-xl">
      {body}
    </Link>
  );
}
