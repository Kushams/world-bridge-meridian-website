import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.name} collects, uses and protects your information.`,
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" size="sm" />
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-10 text-sm text-stone leading-relaxed">
            <p className="text-stone-dim">Last updated: {new Date().getFullYear()}</p>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Overview</h2>
              <p>
                This policy explains how {company.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo;{" "}
                &ldquo;our&rdquo;) handles information
                collected through this website. We collect only what is needed to respond to
                enquiries and organize journeys, and we do not sell personal information.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Information We Collect</h2>
              <p>
                When you use the contact form or journey-planning form, we collect the
                information you choose to provide — such as your name, email address, phone
                number, and details about the travel you&apos;re interested in. We do not
                currently operate customer accounts or store payment information on this
                website.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">How We Use Information</h2>
              <p>
                Information submitted through this website is used solely to respond to your
                enquiry and, where relevant, to organize the travel journey you&apos;ve
                requested. We do not use it for unrelated marketing without your consent.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Third Parties</h2>
              <p>
                Organizing a journey may require sharing relevant details with third-party
                suppliers — hotels, airlines, cruise operators, or ground transportation
                providers — solely as needed to arrange your travel.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Data Security</h2>
              <p>
                We take reasonable steps to protect information submitted through this website.
                No online transmission is entirely secure, and we cannot guarantee absolute
                security.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Your Choices</h2>
              <p>
                You may request access to, correction of, or deletion of your personal
                information by contacting us at{" "}
                <a href={`mailto:${company.email}`} className="text-gold hover:text-ivory">
                  {company.email}
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Material changes will be reflected
                by an updated date at the top of this page.
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
