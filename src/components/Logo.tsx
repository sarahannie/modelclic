import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="ModelClic home">
      <span
        className={`flex size-9 items-center justify-center rounded-xl font-display text-[15px] leading-none font-semibold whitespace-nowrap ${
          dark ? "bg-white text-ink" : "bg-ink text-white"
        }`}
      >
        <span>M</span>
        <span className="text-vermilion italic">c</span>
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
        ModelClic
      </span>
    </Link>
  );
}
