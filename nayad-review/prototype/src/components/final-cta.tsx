import Link from "next/link";
import { SITE } from "@/lib/site";
import { ArrowRightIcon } from "./icons";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-brand text-on-brand">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="cta-title" className="text-3xl font-extrabold tracking-tight">
            Дэвтрээ утсаараа солих цаг боллоо
          </h2>
          <p className="mt-2 text-lg">Бүртгүүлээд эхний харилцагчаа өнөөдөр нэмээрэй.</p>
        </div>
        <Link
          href={SITE.signupUrl}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1a1a1a] px-6 text-lg font-bold text-white hover:bg-black"
        >
          Бүртгүүлэх
          <ArrowRightIcon size={20} />
        </Link>
      </div>
    </section>
  );
}
