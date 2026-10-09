import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";
import { AccountArea } from "@/components/account/AccountArea";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const metadata: Metadata = {
  title: "My World Bridge",
  description: "Your World Bridge Meridian account — saved journeys, destinations, cruises and enquiries.",
  robots: { index: false, follow: true },
};

export default function MyWorldBridgePage() {
  return (
    <>
      <PageHero
        eyebrow="My World Bridge"
        title="Your World Bridge Meridian account"
        description={
          isSupabaseConfigured
            ? "Sign in to save journeys across every device, or keep browsing without an account — saved journeys work either way."
            : "Account sign-in isn't connected yet, but saved journeys work right now — stored in this browser, no account required."
        }
        image={themeImage("business", 3)}
        imageAlt="A desk with a notebook"
        size="sm"
      />

      <section className="py-16 md:py-24">
        <Container>
          {isSupabaseConfigured ? (
            <AccountArea />
          ) : (
            <div className="mx-auto max-w-xl">
              <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
                <p className="eyebrow mb-4">Coming Soon</p>
                <h2 className="font-display text-2xl md:text-3xl text-ivory">
                  Account sign-in isn&apos;t connected yet
                </h2>
                <p className="mt-4 text-stone leading-relaxed">
                  We&apos;re building customer accounts so you can track enquiries and revisit past
                  itineraries across devices. In the meantime, every journey request is tracked
                  directly by our team — reach out any time to check on yours.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button href="/plan-your-journey">Plan Your Journey</Button>
                  <Button href="/contact" variant="outline">
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
