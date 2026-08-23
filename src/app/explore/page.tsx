import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CardSection } from "@/components/home/CardSection";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { PackageCard } from "@/components/cards/PackageCard";
import { CruiseCard } from "@/components/cards/CruiseCard";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedDestinations, destinations } from "@/data/destinations";
import { getFeaturedPackages, packages } from "@/data/packages";
import { cruises } from "@/data/cruises";
import { experiences } from "@/data/experiences";
import { currentJourneys } from "@/data/current-journeys";
import { travelStyles } from "@/data/travel-styles";
import { themeImage } from "@/data/images";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Discover curated destinations, travel packages, cruises, experiences and current journeys from World Bridge Meridian.",
};

export default function ExplorePage() {
  const featuredDestinations = (getFeaturedDestinations().length ? getFeaturedDestinations() : destinations).slice(0, 8);
  const featuredPackages = (getFeaturedPackages().length ? getFeaturedPackages() : packages).slice(0, 3);
  const featuredCruises = cruises.slice(0, 3);
  const featuredExperiences = experiences.slice(0, 8);
  const seasonalJourneys = currentJourneys.slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Where would you like to begin?"
        description="Browse curated destinations, travel packages, cruises and experiences — or tell us what you're imagining and we'll build the journey around you."
        image={themeImage("cityscape", 8)}
        imageAlt="A world city skyline"
      />

      <CardSection
        eyebrow="Featured Journeys"
        title="Travel packages worth a closer look."
        viewAllHref="/travel-packages"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPackages.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </CardSection>

      <CardSection
        eyebrow="Destinations"
        title="Places we organize journeys to."
        viewAllHref="/destinations"
        tone="charcoal"
      >
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {featuredDestinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>
      </CardSection>

      <CardSection eyebrow="Cruises" title="Ocean and river journeys." viewAllHref="/cruises">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCruises.map((cruise) => (
            <CruiseCard key={cruise.slug} cruise={cruise} />
          ))}
        </div>
      </CardSection>

      <CardSection
        eyebrow="Experiences"
        title="Moments worth building a journey around."
        viewAllHref="/experiences"
        tone="charcoal"
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {featuredExperiences.map((experience) => (
            <ExperienceCard key={experience.slug} experience={experience} />
          ))}
        </div>
      </CardSection>

      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Popular Travel Styles"
            title="Or start from how you want to travel."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            {travelStyles.map((style) => (
              <Link
                key={style.slug}
                href="/bespoke"
                className="rounded-full border border-line px-5 py-2.5 text-sm text-ivory-dim hover:border-gold hover:text-gold transition-colors"
              >
                {style.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <CardSection
        eyebrow="Seasonal Escapes"
        title="Current journeys worth knowing about."
        viewAllHref="/current-journeys"
        tone="charcoal"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {seasonalJourneys.map((journey) => (
            <Link key={journey.slug} href="/current-journeys" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-card">
                <Image
                  src={journey.heroImage}
                  alt={journey.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="img-zoom object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-ink/70 backdrop-blur px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-ivory">
                  {journey.status}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-lg text-ivory">{journey.title}</h3>
                  <p className="mt-1 text-xs text-stone">{journey.travelPeriod}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardSection>
    </>
  );
}
