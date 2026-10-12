import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Апп",
  robots: { index: false, follow: false },
};

// Stub target for "Бүртгүүлэх" / "Нэвтрэх" in the prototype. On the real site these links go to the app.
export default function AppStub() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="mx-auto max-w-xl px-4 py-16 outline-none">
        <h1 className="text-3xl font-extrabold tracking-tight">Апп руу шилжих хэсэг</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Энэ бол нүүр хуудасны загвар. Бодит сайтад энэ товч NAYAD апп-ын бүртгүүлэх, нэвтрэх хуудас руу
          шилжүүлнэ.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-brand px-6 font-bold text-on-brand hover:bg-brand-strong"
        >
          Нүүр хуудас руу буцах
        </Link>
      </main>
    </>
  );
}
