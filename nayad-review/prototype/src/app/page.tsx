import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { InstallGuide } from "@/components/install-guide";
import { HomeJsonLd } from "@/components/json-ld";
import { Pricing } from "@/components/pricing";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: SITE.name,
    url: "/",
    title: SITE.title,
    description: SITE.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NAYAD — өглөг, падаан, төлөлтийн бүртгэл" }],
  },
};

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Features />
        <HowItWorks />
        <InstallGuide />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
