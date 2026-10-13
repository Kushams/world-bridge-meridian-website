"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SwipeRow } from "@/components/ui/SwipeRow";
import { ArtListingCard, formatDate, statusFor } from "@/components/cards/ArtListingCard";
import {
  LAST_VERIFIED,
  artCategoryBase,
  artCategoryLabel,
  planTripHref,
  relatedArtListings,
  type ArtListing,
} from "@/data/exhibitions";

const todayIso = () => new Date().toISOString().slice(0, 10);

/** What we arrange around any show, whoever the traveller is. */
const WE_ARRANGE: [string, string][] = [
  ["Flights", "Routed around the show's dates, from the airport you prefer."],
  ["Accommodation", "Hotels chosen for location and quiet, close to the venue."],
  ["Ground transport", "Airport transfers and private drivers for the days you visit."],
  ["Access", "Help with tickets, timed entry and private views where the venue offers them."],
  ["Companions", "Rooms, seats and plans for anyone travelling with you."],
  ["Everything else", "Dining, other shows and time in the city, built into one itinerary."],
];

export function ArtListingDetail({ listing }: { listing: ArtListing }) {
  // Same trick as the listing pages: render against the last-checked date first so the HTML matches, then use the visitor's own clock.
  const [today, setToday] = useState(LAST_VERIFIED);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setToday(todayIso()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const status = statusFor(listing, today);
  const isPast = status.tone === "past";
  const base = artCategoryBase(listing.category);
  const related = relatedArtListings(listing, today);
  const planHref = planTripHref(listing);
  const place = [listing.address, listing.city, listing.country].filter(Boolean).join(", ");
  const mapHref = `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: `${listing.venue}, ${listing.address ?? listing.city}` }).toString()}`;
  const paragraphs = listing.about?.length ? listing.about : [listing.description];

  return (
    <>
      <PageHero
        eyebrow={`${listing.venue} · ${listing.city}, ${listing.country}`}
        title={listing.title}
        description={`${formatDate(listing.startDate)} – ${formatDate(listing.endDate)}. ${status.label}.`}
        image={listing.heroImage}
        imageAlt={listing.title}
        action={
          isPast ? null : (
            <Button href={planHref} variant="photo" size="lg">
              Plan This Trip
            </Button>
          )
        }
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Arts & Culture", href: "/arts-culture" },
            { label: artCategoryLabel(listing.category), href: base },
            { label: listing.title },
          ]}
        />
      </Container>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
            <div>
              <figure className="relative mb-12 aspect-[4/3] w-full overflow-hidden rounded-card border hairline bg-charcoal">
                <Image
                  src={listing.heroImage}
                  alt={listing.title}
                  fill
                  sizes="(min-width: 1024px) 760px, 100vw"
                  className="object-contain"
                />
              </figure>
              <SectionHeading eyebrow="About the exhibition" title={listing.title} />
              <div className="mt-6 space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-base text-stone leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              <p className="mt-6 text-sm text-stone-dim leading-relaxed">
                Dates and details come from the {listing.sourceLabel} listing. Please confirm opening hours and any tickets on the{" "}
                <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-gold/60 underline-offset-4 hover:text-gold">
                  official page
                </a>{" "}
                before you travel. We are not affiliated with the venue unless we say so; we help you plan the journey around the show.
              </p>

              <div className="mt-14">
                <p className="eyebrow mb-4">What we arrange for your trip</p>
                <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {WE_ARRANGE.map(([title, text]) => (
                    <li key={title} className="border-t hairline pt-4">
                      <p className="font-display text-lg text-ivory">{title}</p>
                      <p className="mt-1 text-sm text-stone leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-14">
                <p className="eyebrow mb-4">How planning works</p>
                <ol className="space-y-4 text-sm text-stone leading-relaxed">
                  <li className="flex gap-4">
                    <span className="font-display text-xl text-gold">1</span>
                    <span>Tap <strong className="text-ivory">Plan This Trip</strong> and sign in or create a free account.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-display text-xl text-gold">2</span>
                    <span>Complete the short travel form. This exhibition and its dates are already filled in.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-display text-xl text-gold">3</span>
                    <span>Your travel coordinator replies in your account with a proposed itinerary, and arranges everything once you approve it.</span>
                  </li>
                </ol>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-card border hairline bg-charcoal p-6 lg:sticky lg:top-28">
                <p className="eyebrow mb-4">At a glance</p>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-stone-dim">Dates</dt>
                    <dd className="mt-0.5 text-ivory">
                      {formatDate(listing.startDate)} – {formatDate(listing.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-dim">Status</dt>
                    <dd className="mt-0.5 text-ivory">{status.label}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-dim">Venue</dt>
                    <dd className="mt-0.5 text-ivory">{listing.venue}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-dim">Location</dt>
                    <dd className="mt-0.5 text-ivory">{place}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-col gap-3">
                  {isPast ? (
                    <p className="text-sm text-stone-dim">This exhibition has closed. Tell us what you would like to see next and we will plan it.</p>
                  ) : (
                    <Button href={planHref} size="lg" className="w-full">
                      Plan This Trip
                    </Button>
                  )}
                  <a
                    href={listing.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-shrink inline-flex items-center justify-center rounded-full border border-line-strong px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ivory transition-colors hover:bg-ivory hover:text-ink"
                  >
                    Official page ↗
                  </a>
                  <a href={mapHref} target="_blank" rel="noopener noreferrer" className="text-center text-xs uppercase tracking-wide text-stone-dim transition-colors hover:text-gold">
                    View on map ↗
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {related.length > 0 ? (
            <div className="mt-20">
              <SectionHeading eyebrow="Also on" title={`More in ${listing.city}`} />
              <SwipeRow className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <ArtListingCard key={r.slug} listing={r} today={today} />
                ))}
              </SwipeRow>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
