import Link from "next/link";
import { SITE } from "@/lib/site";
import { LogoMark } from "./icons";

const NAV = [
  { href: "/#features", label: "Боломжууд" },
  { href: "/#how", label: "Хэрхэн ажилладаг" },
  { href: "/#install", label: "Суулгах" },
  { href: "/#pricing", label: "Үнэ" },
  { href: "/#faq", label: "Асуулт" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-2 px-4 py-2.5">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 text-lg font-extrabold tracking-tight"
          aria-label="NAYAD нүүр хуудас"
        >
          <LogoMark size={30} />
          <span className="max-[359px]:sr-only">NAYAD</span>
        </Link>

        <nav aria-label="Үндсэн цэс" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-muted hover:bg-surface-2 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <Link
            href={SITE.loginUrl}
            className="inline-flex min-h-11 items-center rounded-xl px-3 font-semibold hover:bg-surface-2"
          >
            Нэвтрэх
          </Link>
          <Link
            href={SITE.signupUrl}
            className="inline-flex min-h-11 items-center rounded-xl bg-brand px-3 font-semibold text-on-brand hover:bg-brand-strong min-[360px]:px-4"
          >
            Бүртгүүлэх
          </Link>
        </div>
      </div>
    </header>
  );
}
