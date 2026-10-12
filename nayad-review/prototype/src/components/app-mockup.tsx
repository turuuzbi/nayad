import { DEMO_DEBTS, dueLabel, dueStatus, summarize, type DueStatus } from "@/lib/demo-ledger";
import { formatMNT } from "@/lib/money";

const STATUS_CLASS: Record<DueStatus, string> = {
  overdue: "text-danger font-semibold",
  today: "text-warn font-semibold",
  soon: "text-muted",
  later: "text-muted",
};

// A static picture of the product built from markup, so it is sharp at any zoom level,
// costs no image bytes, and its totals are computed from the rows it shows.
export function AppMockup() {
  const s = summarize(DEMO_DEBTS);
  return (
    <figure className="mx-auto w-full min-w-0 max-w-[22rem] [overflow-wrap:anywhere]" aria-labelledby="mockup-caption">
      <div className="rounded-[2.25rem] border border-line bg-surface p-2.5 shadow-xl shadow-black/5">
        <div className="rounded-[1.8rem] bg-bg px-4 pb-4 pt-5">
          <div className="flex items-baseline justify-between">
            <p className="text-base font-bold">Өглөг</p>
            <p className="text-xs text-muted">{s.customers} харилцагч</p>
          </div>

          <div className="mt-3 rounded-2xl bg-brand p-4 text-on-brand">
            <p className="text-sm font-medium">Нийт үлдэгдэл</p>
            <p className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums">{formatMNT(s.total)}</p>
            <dl className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-2 text-xs">
              <div className="rounded-xl bg-white/65 px-2.5 py-2">
                <dt>Хугацаа хэтэрсэн</dt>
                <dd className="font-bold tabular-nums">{formatMNT(s.overdue)}</dd>
              </div>
              <div className="rounded-xl bg-white/65 px-2.5 py-2">
                <dt>Ойрын 7 хоногт</dt>
                <dd className="font-bold tabular-nums">{formatMNT(s.dueThisWeek)}</dd>
              </div>
            </dl>
          </div>

          <ul className="mt-3 divide-y divide-line">
            {DEMO_DEBTS.map((d) => (
              <li key={d.customer} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.customer}</p>
                  <p className={`text-xs ${STATUS_CLASS[dueStatus(d.dueInDays)]}`}>{dueLabel(d.dueInDays)}</p>
                </div>
                <p className="text-sm font-bold tabular-nums">{formatMNT(d.amount)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-sm font-semibold" aria-hidden="true">
            <span className="rounded-xl border border-line bg-surface py-2">+ Падаан</span>
            <span className="rounded-xl border border-line bg-surface py-2">+ Төлөлт</span>
          </div>
        </div>
      </div>
      <figcaption id="mockup-caption" className="mt-3 text-center text-xs text-muted">
        Жишээ дэлгэц. Харилцагчийн нэр, дүн зохиомол.
      </figcaption>
    </figure>
  );
}
