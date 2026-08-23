import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cruises, getCruise } from "@/data/cruises";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryStrip } from "@/components/detail/GalleryStrip";
import { ItineraryTimeline } from "@/components/detail/ItineraryTimeline";
import { PricingBlock } from "@/components/detail/PricingBlock";

export function generateStaticParams() {
  return cruises.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cruise = getCruise(slug);
  if (!cruise) return {};
  return {
    title: cruise.title,
    description: cruise.description[0],
    openGraph: { images: [cruise.heroImage] },
  };
}

export default async function CruisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cruise = getCruise(slug);
  if (!cruise) notFound();

  return (
    <>
      <PageHero
        eyebrow={`${cruise.category} · ${cruise.duration}`}
        title={cruise.title}
        description={`Departs ${cruise.departurePort}`}
        image={cruise.heroImage}
        imageAlt={cruise.title}
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            { label: "Cruises", href: "/cruises" },
            { label: cruise.title },
          ]}
        />
        <span className="mt-4 inline-block rounded-full bg-charcoal border hairline px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ivory-dim">
          {cruise.status}
        </span>
      </Container>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <SectionHeading eyebrow="Overview" title="About this cruise" />
              <div className="mt-6 space-y-4">
                {cruise.description.map((p, i) => (
                  <p key={i} className="text-base text-stone leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <p className="eyebrow mb-2 !text-[0.65rem]">Operator</p>
                  <p className="text-sm text-ivory-dim">{cruise.operator}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2 !text-[0.65rem]">Ship</p>
                  <p className="text-sm text-ivory-dim">{cruise.ship}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2 !text-[0.65rem]">Duration</p>
                  <p className="text-sm text-ivory-dim">{cruise.duration}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2 !text-[0.65rem]">Travel Period</p>
                  <p className="text-sm text-ivory-dim">{cruise.travelPeriod}</p>
                </div>
              </div>

              <div className="mt-10">
                <p className="eyebrow mb-3">Ports of Call</p>
                <p className="text-sm text-stone">{cruise.ports.join(" · ")}</p>
              </div>

              <div className="mt-6">
                <p className="eyebrow mb-3">Cabin Categories</p>
                <div className="flex flex-wrap gap-2">
                  {cruise.cabinCategories.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-wide text-ivory-dim"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-12">
                <p className="eyebrow mb-6">Sample Itinerary</p>
                <ItineraryTimeline days={cruise.sampleItinerary} />
              </div>

              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-3">What&apos;s Included</p>
                  <ul className="space-y-2 text-sm text-stone">
                    {cruise.includes.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gold">+</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow mb-3">What&apos;s Not Included</p>
                  <ul className="space-y-2 text-sm text-stone-dim">
                    {cruise.excludes.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span>−</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-16">
                <p className="eyebrow mb-4">Gallery</p>
                <GalleryStrip images={cruise.gallery} alt={cruise.title} />
              </div>
            </div>

            <div className="lg:sticky lg:top-28 space-y-6">
              <PricingBlock
                tiers={cruise.indicativePricing}
                ctaLabel="Request This Cruise"
                saveItem={{
                  type: "cruise",
                  slug: cruise.slug,
                  title: cruise.title,
                  image: cruise.heroImage,
                  href: `/cruises/${cruise.slug}`,
                }}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
