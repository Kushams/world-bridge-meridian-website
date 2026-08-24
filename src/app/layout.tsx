import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL, company } from "@/data/company";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { TouchRipple } from "@/components/motion/TouchRipple";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import { PageTransition } from "@/components/motion/PageTransition";

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
        <ScrollProgressBar />
        <CustomCursor />
        <TouchRipple />
        <Header />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
