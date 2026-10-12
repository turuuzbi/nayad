import Link from "next/link";
import { PLACEHOLDER } from "@/lib/site";
import { LogoMark, MailIcon, PhoneIcon } from "./icons";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <LogoMark size={28} />
            NAYAD
          </p>
          <p className="mt-3 max-w-sm text-muted">Жижиг бизнесийн өглөг, падаан, төлөлт, зээлийн бүртгэл.</p>
          <p className="mt-3 text-sm text-muted">Хөгжүүлэгч: {PLACEHOLDER.company}</p>
        </div>

        <div>
          <h2 className="font-bold">Холбоо барих</h2>
          <ul className="mt-2">
            <li>
              <a
                href={PLACEHOLDER.phoneHref}
                className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-ink"
              >
                <PhoneIcon size={18} />
                {PLACEHOLDER.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${PLACEHOLDER.email}`}
                className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-ink"
              >
                <MailIcon size={18} />
                {PLACEHOLDER.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold">Мэдээлэл</h2>
          <ul className="mt-2">
            <li>
              <Link href="/privacy" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
                Нууцлалын бодлого
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
                Үйлчилгээний нөхцөл
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
                Түгээмэл асуулт
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-5 text-center text-sm text-muted">© {year} NAYAD</p>
    </footer>
  );
}
