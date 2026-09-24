import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL, company } from "@/data/company";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TouchRipple } from "@/components/motion/TouchRipple";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { AttributionCapture } from "@/components/AttributionCapture";
import { TawkChat } from "@/components/TawkChat";
import { AuthProvider } from "@/lib/supabase/AuthProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${company.name} — ${company.legalPositioning}`,
    template: `%s — ${company.name}`,
  },
  description: company.tagline,
  // Relative canonical — Next resolves it per route against metadataBase,
  // so every page gets its own self-referencing canonical URL.
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    siteName: company.name,
    title: `${company.name} — ${company.legalPositioning}`,
    description: company.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name} — ${company.legalPositioning}`,
    description: company.tagline,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: company.name,
  description: company.tagline,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  image: `${SITE_URL}/opengraph-image`,
  email: company.email,
  telephone: company.phone ?? undefined,
  foundingDate: String(company.foundedYear),
  founder: {
    "@type": "Person",
    name: company.founderName,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-ivory">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AuthProvider>
          <ScrollProgressBar />
          <TouchRipple />
          <AttributionCapture />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-ivory focus:px-5 focus:py-3 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-wide focus:text-ink"
          >
            Skip to content
          </a>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </AuthProvider>
        <TawkChat />
      </body>
    </html>
  );
}
