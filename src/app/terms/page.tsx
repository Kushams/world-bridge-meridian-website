import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
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
                conditions that apply. We do not process payments through this website.
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
              <h2 className="mb-3 font-display text-xl text-ivory">Limitation of Liability</h2>
              <p>
                While we take care in selecting partners and organizing journeys, World Bridge
                Meridian is not liable for the acts, errors, omissions, or delays of independent
                third-party suppliers.
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
