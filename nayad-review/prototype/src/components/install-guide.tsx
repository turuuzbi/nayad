import type { ReactNode } from "react";
import { DotsIcon, ShareIcon } from "./icons";

// Phone and browser menus are often not in Mongolian, so each step names the button in
// Mongolian and in English, plus the icon the person will actually see.
const PLATFORMS: { name: string; browser: string; steps: ReactNode[] }[] = [
  {
    name: "iPhone",
    browser: "Safari",
    steps: [
      <>
        Safari хөтчөөр <strong>nayad.store</strong> хаягийг нээнэ.
      </>,
      <>
        Доод хэсгийн <Key icon={<ShareIcon size={16} />}>Хуваалцах</Key> <Hint>Share</Hint> товчийг дарна.
      </>,
      <>
        <Key>Нүүр дэлгэцэнд нэмэх</Key> <Hint>Add to Home Screen</Hint> гэснийг сонгоод <Key>Нэмэх</Key>{" "}
        <Hint>Add</Hint> товчийг дарна.
      </>,
    ],
  },
  {
    name: "Android",
    browser: "Chrome",
    steps: [
      <>
        Chrome хөтчөөр <strong>nayad.store</strong> хаягийг нээнэ.
      </>,
      <>
        Баруун дээд булангийн <Key icon={<DotsIcon size={16} />}>цэс</Key> дээр дарна.
      </>,
      <>
        <Key>Апп суулгах</Key> <Hint>Install app</Hint> эсвэл <Key>Нүүр дэлгэцэнд нэмэх</Key>{" "}
        <Hint>Add to Home screen</Hint> гэснийг сонгоно.
      </>,
    ],
  },
];

function Key({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-bg px-1.5 py-0.5 font-semibold">
      {icon}
      {children}
    </span>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted" lang="en">
      ({children})
    </span>
  );
}

export function InstallGuide() {
  return (
    <section id="install" aria-labelledby="install-title" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="install-title" className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Утсандаа суулгах
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          NAYAD хөтөч дээр ажилладаг. Нүүр дэлгэцэндээ нэмбэл энгийн апп шиг нэг товшилтоор нээгдэнэ.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {PLATFORMS.map((p) => (
            <article key={p.name} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="text-lg font-bold">
                {p.name} <span className="font-medium text-muted">· {p.browser}</span>
              </h3>
              <ol className="mt-4 space-y-3">
                {p.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed">
                    <span
                      className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold text-accent"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">{step}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
