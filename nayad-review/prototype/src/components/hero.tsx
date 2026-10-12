import Link from "next/link";
import { SITE } from "@/lib/site";
import { AppMockup } from "./app-mockup";
import { ArrowRightIcon, InstallIcon, LanguageIcon, ShieldIcon } from "./icons";

const POINTS = [
  { icon: LanguageIcon, text: "Монгол хэл дээр, монгол бизнест" },
  { icon: InstallIcon, text: "Утсандаа апп шиг суулгана" },
  { icon: ShieldIcon, text: "Google эсвэл Face ID-гаар нэвтэрнэ" },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-12 pt-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-12 md:pb-20 md:pt-16">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold text-accent">
            Жижиг бизнесийн тооцооны апп
          </p>
          <h1
            id="hero-title"
            className="mt-4 text-[2.1rem] font-extrabold leading-[1.12] tracking-tight text-balance sm:text-5xl"
          >
            Өглөг, падаан, төлөлтөө <span className="marker whitespace-nowrap">нэг дор</span> хөтлөөрэй
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Хэн танд хэдэн төгрөг өртэй, хэзээ төлөх ёстойг утаснаасаа шууд хараарай. Цаасан дэвтэр, тооны машин
            хэрэггүй.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={SITE.signupUrl}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-lg font-bold text-on-brand shadow-sm hover:bg-brand-strong"
            >
              Бүртгүүлэх
              <ArrowRightIcon size={20} />
            </Link>
            <Link
              href="#how"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-6 text-lg font-semibold hover:bg-surface-2"
            >
              Хэрхэн ажилладаг вэ?
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            Утас, компьютер аль алинд хөтчөөр ажиллана. Дэлгүүрээс татах шаардлагагүй.
          </p>
        </div>

        <AppMockup />
      </div>

      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-3 sm:gap-4">
        {POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
              <Icon size={20} />
            </span>
            <span className="font-medium">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
