import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NAYAD — өглөг, падаан, төлөлтийн бүртгэл" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/og.png"],
  },
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

// Zoom stays enabled: no maximum-scale, no user-scalable=no (WCAG 1.4.4 Resize text).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn">
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-3 focus:font-semibold focus:text-on-brand"
        >
          Үндсэн агуулга руу шилжих
        </a>
        {children}
      </body>
    </html>
  );
}
