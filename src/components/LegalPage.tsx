import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 text-5xl font-medium">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">Draft — to be reviewed by a lawyer before launch.</p>
        <div className="mt-10 space-y-6 leading-relaxed text-ink-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ink">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
