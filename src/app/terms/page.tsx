import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Terms & Booking Conditions",
  description: `Terms of use and booking conditions for ${company.name}.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Booking Conditions" size="sm" />
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-10 text-sm text-stone leading-relaxed">
            <p className="text-stone-dim">Last updated: {new Date().getFullYear()}</p>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">About World Bridge Meridian</h2>
              <p>
                {company.name} is {company.legalPositioning.toLowerCase()}, founded in{" "}
                {company.foundedYear}. We design and coordinate travel journeys, working with
                external airlines, hotels, cruise operators, and other suppliers as needed.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Use of This Website</h2>
              <p>
                Content on this website — including destination information, sample itineraries,
                and pricing — is provided for planning purposes. It does not constitute a binding
                offer or guarantee of availability.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Pricing</h2>
              <p>{company.pricingDisclaimer}</p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Sample & Indicative Content</h2>
              <p>
                Cruise sailings, current journeys, and similar listings marked as
                &ldquo;Sample Journey,&rdquo; &ldquo;Indicative Journey,&rdquo; or
                &ldquo;Enquiry-Based Journey&rdquo; are illustrative and do not represent live,
                guaranteed availability. Availability, final itinerary and
                pricing are confirmed directly with you before booking.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Bookings & Payment</h2>
              <p>
                Bookings are confirmed only once agreed directly between you and World Bridge
                Meridian, including agreed pricing, deposit and payment terms, and any supplier
                conditions that apply. We do not take payments through this website: you pay as agreed with your consultant, by the options on our Payments page.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Your Account</h2>
              <p>
                You need an account (Google or email) to buy gift cards or Travel Credits, to join the
                Invite Program, and to see your requests and documents in My World Bridge. Give us
                accurate details, keep your sign-in secure, and tell us at once if you think someone else
                has used your account. You are responsible for what happens under it. You can delete your
                account at any time from My World Bridge; any Credits held are lost when you do.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Cryptocurrency Payments</h2>
              <p>
                Where you pay in cryptocurrency, send the exact asset on the exact network shown, to the
                address shown, and share the transaction ID. Blockchain transfers cannot be reversed: a
                payment sent to the wrong address, network or asset may be lost and is not our
                responsibility. We confirm payments by hand, which can take time, and amounts are
                converted to US dollars at the value when we confirm. Any bank, network or exchange fees
                are yours to bear.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Gift Cards, Travel Credits &amp; Invite Rewards</h2>
              <p>
                Gift cards, Travel Credits, Promo Credits and Invite Program rewards follow the rules in
                our <Link href="/gift-card-terms" className="text-gold hover:text-ivory">gift card terms</Link>,{" "}
                <Link href="/travel-credit-terms" className="text-gold hover:text-ivory">Travel Credit terms</Link> and{" "}
                <Link href="/invite-terms" className="text-gold hover:text-ivory">Invite Program terms</Link>.
                In short: credits are US dollars usable only toward our journeys, are not cash or
                transferable, and Promo Credits expire. If those terms and these ever differ on one of
                those products, the specific terms apply to it.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Your Documents &amp; Personal Data</h2>
              <p>
                Passports and other documents you upload are kept privately and are visible only to you and
                our team, for the purpose of arranging your travel. See our{" "}
                <Link href="/privacy" className="text-gold hover:text-ivory">Privacy Policy</Link> for how we use
                and protect personal data.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Acceptable Use</h2>
              <p>
                Do not misuse the website or your account: no fraud or money laundering, no attempt to
                break or overload our systems, no false identities or duplicate accounts to claim rewards,
                and no use that breaks the law. We may suspend an account and void related credits or
                rewards where we reasonably suspect misuse.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Third-Party Suppliers</h2>
              <p>
                Many elements of a journey — flights, hotels, cruises, tours and activities — are
                provided by third-party suppliers and are subject to that supplier&apos;s own
                terms and conditions, in addition to ours.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Changes & Cancellations</h2>
              <p>
                Change and cancellation terms depend on the specific suppliers and services
                booked, and will be communicated to you at the time of booking.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Travel Insurance</h2>
              <p>
                We strongly recommend arranging comprehensive travel insurance for every journey,
                covering at minimum trip cancellation and interruption, emergency medical care and
                evacuation, and baggage loss. Insurance is arranged by you, directly with an
                insurance provider, and is not included in any journey investment quoted by World
                Bridge Meridian unless explicitly stated.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Registration &amp; Licensing</h2>
              <p>
                Applicable travel-industry registration or licensing information for World Bridge
                Meridian&apos;s operating jurisdiction will be published here once confirmed.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Complaints Procedure</h2>
              <p>
                If any part of your journey does not meet expectations, contact us at{" "}
                <a href={`mailto:${company.email}`} className="text-gold hover:text-ivory">
                  {company.email}
                </a>{" "}
                as soon as possible — while traveling if the issue needs resolving in real time, or
                afterward for a formal complaint. Include your name, travel dates and a description
                of the issue. We will acknowledge a formal complaint and respond with next steps or
                an outcome within a reasonable timeframe.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Limitation of Liability</h2>
              <p>
                While we take care in selecting partners and organizing journeys, World Bridge
                Meridian is not liable for the acts, errors, omissions, or delays of independent
                third-party suppliers.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. The version published here applies from the
                date shown. Continuing to use the website or your account after a change means you accept
                it; changes do not alter a booking already confirmed in writing.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Governing Law</h2>
              <p>
                These terms are governed by the laws of the European Union member state in which{" "}
                {company.name} is established, and disputes go to the courts of that state. If you
                are a consumer, you also keep the mandatory consumer protections of the country where
                you live, and the right to bring a claim in its courts where the law gives you that
                right.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl text-ivory">Contact</h2>
              <p>
                Questions about these terms can be directed to{" "}
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
