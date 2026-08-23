import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/contact/ContactForm";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${company.name} — plan a journey or get in touch with our team.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact World Bridge Meridian"
        description="Have a question before you plan a full journey? Reach out directly — we read every message."
        image={themeImage("cityscape", 12)}
        imageAlt="A city street at morning"
      />
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.3fr_1fr]">
            <ContactForm />

            <div className="space-y-10">
              <div>
                <p className="eyebrow mb-3">Email</p>
                <a
                  href={`mailto:${company.email}`}
                  className="font-display text-xl text-ivory hover:text-gold transition-colors"
                >
                  {company.email}
                </a>
              </div>
              <div>
                <p className="eyebrow mb-3">Phone</p>
                <p className="text-stone-dim">{company.phone ?? "[PHONE NUMBER TO BE PROVIDED]"}</p>
              </div>
              <div>
                <p className="eyebrow mb-3">WhatsApp</p>
                <p className="text-stone-dim">{company.whatsapp ?? "[WHATSAPP NUMBER TO BE PROVIDED]"}</p>
              </div>
              <div>
                <p className="eyebrow mb-3">Address</p>
                <p className="text-stone-dim">{company.address ?? "[ADDRESS TO BE PROVIDED]"}</p>
              </div>
              <div>
                <p className="eyebrow mb-3">Business Hours</p>
                <p className="text-stone-dim">[BUSINESS HOURS TO BE PROVIDED]</p>
              </div>
              <div className="rounded-card border hairline bg-charcoal p-6">
                <p className="font-display text-lg text-ivory">Ready to start planning?</p>
                <p className="mt-2 text-sm text-stone">
                  Skip the general enquiry and go straight to a full journey request.
                </p>
                <div className="mt-5">
                  <Button href="/plan-your-journey" className="w-full justify-center">
                    Plan Your Journey
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
