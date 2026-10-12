import { FAQ } from "@/lib/faq";
import { ChevronDownIcon } from "./icons";

// Native <details>/<summary>: keyboard and screen-reader support built in, zero JavaScript.
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 id="faq-title" className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Түгээмэл асуулт
        </h2>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold">
                <span>{item.q}</span>
                <ChevronDownIcon size={20} className="shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-5 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
