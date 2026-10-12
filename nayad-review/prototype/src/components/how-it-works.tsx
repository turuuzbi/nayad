const STEPS = [
  { title: "Бүртгүүлэх", text: "Утасны дугаар, нууц үгээрээ бүртгэл үүсгэнэ. Google бүртгэлээрээ ч болно." },
  {
    title: "Харилцагч, падаанаа оруулах",
    text: "Хэнд юу өгснөө падаанаар бүртгэхэд тухайн харилцагчийн өглөг бодогдоно.",
  },
  { title: "Төлөлтөө тэмдэглэх", text: "Мөнгө орж ирэх бүрд төлөлт нэмэхэд үлдэгдэл шинэчлэгдэнэ." },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="border-y border-line bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="how-title" className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Гурван алхмаар эхэлнэ
        </h2>
        <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 md:flex-col">
              <span
                className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-xl font-extrabold text-on-brand"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold">
                  <span className="sr-only">{i + 1}-р алхам: </span>
                  {step.title}
                </h3>
                <p className="mt-1.5 leading-relaxed text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
