import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type Section = { title: string; body: ReactNode };

// Skeleton for legal pages. The owner fills each section with their lawyer; the notice
// at the top stays until then so nobody mistakes the outline for the final policy.
export function LegalPage({ title, sections }: { title: string; sections: Section[] }) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12 outline-none">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-4 rounded-xl border border-line bg-warn-bg p-4 text-warn">
          Энэ хуудас бүтцийн загвар. Эцсийн агуулгыг NAYAD-ын эзэмшигч хуулийн зөвлөхтэйгээ хамт бичнэ.
        </p>
        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={s.title} aria-labelledby={`s-${i}`}>
              <h2 id={`s-${i}`} className="text-xl font-bold">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-2 leading-relaxed text-muted">{s.body}</div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
