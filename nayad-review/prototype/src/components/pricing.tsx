import Link from "next/link";
import { SITE } from "@/lib/site";
import { ArrowRightIcon, CheckIcon } from "./icons";
import { WaitlistForm } from "./waitlist-form";

// Replaces a "coming soon" dead end with two ways forward: leave a contact, or start now.
export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="border-y border-line bg-surface py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-start">
        <div>
          <h2 id="pricing-title" className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Үнэ
          </h2>
          <p className="mt-2 inline-flex rounded-full bg-warn-bg px-3 py-1 text-sm font-semibold text-warn">
            Удахгүй зарлагдана
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Үнийн төлөвлөгөөг бэлтгэж байна. Утас эсвэл имэйлээ үлдээвэл зарлагдмагц танд хамгийн түрүүнд
            мэдэгдье.
          </p>
          <ul className="mt-6 space-y-2">
            {["Нэг удаа л мэдэгдэнэ", "Сурталчилгаа илгээхгүй", "Хүссэн үедээ татгалзана"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckIcon size={18} className="text-ok" />
                {t}
              </li>
            ))}
          </ul>
          <Link
            href={SITE.signupUrl}
            className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-2 underline-offset-4 hover:decoration-brand"
          >
            Хүлээх хэрэггүй, одоо бүртгүүлэх
            <ArrowRightIcon size={18} />
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-bg p-5 md:p-6">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
