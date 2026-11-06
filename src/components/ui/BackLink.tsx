import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, children, onDark = false }: { href: string; children: React.ReactNode; onDark?: boolean }) {
  return (
    <Link
      href={href}
      className={`back-link ${onDark ? "text-white/80 hover:bg-white/10 hover:text-white" : ""}`}
    >
      <span className={`back-link-icon ${onDark ? "border-white/25 bg-white/10 text-white" : ""}`}>
        <ArrowLeft className="size-3.5" aria-hidden />
      </span>
      {children}
    </Link>
  );
}
