import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { packages, getPackage } from "@/data/packages";
import { destinations } from "@/data/destinations";
import { travelStyleLabel } from "@/data/travel-styles";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryStrip } from "@/components/detail/GalleryStrip";
import { ItineraryTimeline } from "@/components/detail/ItineraryTimeline";
import { PricingBlock } from "@/components/detail/PricingBlock";
import { DestinationCard } from "@/components/cards/DestinationCard";
import Link from "next/link";

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) return {};
  return {
    title: pkg.title,
    description: pkg.shortDescription,
    openGraph: { images: [pkg.heroImage] },
  };
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) notFound();

  const relatedDestinations = destinations.filter((d) => pkg.destinationSlugs.includes(d.slug));
  const relatedPackages = packages
    .filter((p) => p.slug !== pkg.slug && p.travelStyles.some((s) => pkg.travelStyles.includes(s)))
    .slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`${pkg.duration} · ${pkg.travelerType}`}
        title={pkg.title}
        description={pkg.shortDescription}
        image={pkg.heroImage}
        imageAlt={pkg.title}
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            { label: "Travel Packages", href: "/travel-packages" },
            { label: pkg.title },
          ]}
        />
      </Container>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <SectionHeading eyebrow="Overview" title="What this journey is" />
              <div className="mt-6 space-y-4">
                {pkg.overview.map((p, i) => (
                  <p key={i} className="text-base text-stone leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {pkg.travelStyles.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-wide text-ivory-dim"
                  >
                    {travelStyleLabel(style)}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-2">Who It&apos;s For</p>
                  <p className="text-sm text-stone leading-relaxed">{pkg.whoItsFor}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2">Accommodation</p>
                  <p className="text-sm text-stone leading-relaxed">{pkg.accommodation}</p>
                </div>
              </div>

              <div className="mt-12">
                <p className="eyebrow mb-6">Suggested Itinerary</p>
                <ItineraryTimeline days={pkg.itinerary} />
              </div>

              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-3">What&apos;s Included</p>
                  <ul className="space-y-2 text-sm text-stone">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gold">+</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow mb-3">What&apos;s Not Included</p>
                  <ul className="space-y-2 text-sm text-stone-dim">
                    {pkg.excludes.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span>−</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-16">
                <p className="eyebrow mb-4">Gallery</p>
                <GalleryStrip images={pkg.gallery} alt={pkg.title} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="lg:sticky lg:top-28 space-y-6">
                <PricingBlock tiers={pkg.indicativePricing} ctaLabel="Request This Journey" />
              </div>
            </div>
          </div>

          {relatedDestinations.length > 0 ? (
            <div className="mt-20">
              <SectionHeading eyebrow="Related Destinations" title="Where this journey takes you" />
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {relatedDestinations.map((d) => (
                  <DestinationCard key={d.slug} destination={d} />
                ))}
              </div>
            </div>
          ) : null}

          {relatedPackages.length > 0 ? (
            <div className="mt-20">
              <SectionHeading eyebrow="Related Journeys" title="You might also like" />
              <div className="mt-8 flex flex-wrap gap-4">
                {relatedPackages.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/travel-packages/${p.slug}`}
                    className="rounded-full border border-line px-5 py-2.5 text-sm text-ivory-dim hover:border-gold hover:text-gold transition-colors"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
