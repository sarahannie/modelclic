import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BackLink } from "@/components/ui/BackLink";
import { LEGAL_DOCS, type LegalKey } from "@/lib/legal";

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const d = LEGAL_DOCS[doc as LegalKey];
  return { title: d?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = LEGAL_DOCS[doc as LegalKey];
  if (!d) notFound();
  return (
    <>
      <SiteNav />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="md:sticky md:top-28 md:self-start">
          <BackLink href="/">Back to home</BackLink>
          <nav className="mt-6 flex gap-1 md:flex-col" aria-label="Legal documents">
            {(Object.keys(LEGAL_DOCS) as LegalKey[]).map((k) => (
              <Link key={k} href={`/legal/${k}`} aria-current={k === doc ? "page" : undefined}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${k === doc ? "bg-ink text-white" : "text-ink-600 hover:bg-ice-50"}`}>
                {LEGAL_DOCS[k].title}
              </Link>
            ))}
          </nav>
        </aside>
        <article className="max-w-2xl">
          <p className="eyebrow">Legal</p>
          <h1 className="t-h1 mt-2">{d.title}</h1>
          <p className="mt-1 text-sm text-ink-400">Last updated {d.updated} · Draft for review by counsel before launch</p>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-700">{d.intro}</p>
          {d.sections.map((s) => (
            <section key={s.heading} className="mt-9">
              <h2 className="t-h2">{s.heading}</h2>
              <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-700">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-vermilion" />{p}</li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
