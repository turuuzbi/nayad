import { FAQ } from "@/lib/faq";
import { SITE } from "@/lib/site";

export function HomeJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#org`,
        name: SITE.name,
        url: SITE.url,
        logo: `${SITE.url}/icon-512.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: "mn",
        publisher: { "@id": `${SITE.url}/#org` },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        inLanguage: "mn",
        publisher: { "@id": `${SITE.url}/#org` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // Escape "<" so the JSON can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
