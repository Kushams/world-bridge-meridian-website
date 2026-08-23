import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${company.name} uses cookies on this website.`,
};

export default function CookiesPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Cookie Policy" size="sm" />
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-10 text-sm text-stone leading-relaxed">
            <p className="text-stone-dim">Last updated: {new Date().getFullYear()}</p>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">What Are Cookies</h2>
              <p>
                Cookies are small text files placed on your device to help a website function
                and, in some cases, to understand how it&apos;s used.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">How We Use Them</h2>
              <p>
                This website currently uses only essential, functional storage needed for basic
                site behavior. We do not currently run third-party advertising or tracking
                cookies. If that changes, this page will be updated and, where required, you will
                be asked for consent.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Managing Cookies</h2>
              <p>
                Most browsers let you block or delete cookies through their settings. Doing so
                may affect how parts of this website function.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Contact</h2>
              <p>
                Questions about this policy can be directed to{" "}
                <a href={`mailto:${company.email}`} className="text-gold hover:text-ivory">
                  {company.email}
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
