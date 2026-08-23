import { Hero } from "@/components/home/Hero";
import { Philosophy } from "@/components/home/Philosophy";
import { CorePaths } from "@/components/home/CorePaths";
import { StatsBand } from "@/components/home/StatsBand";
import { Concierge } from "@/components/home/Concierge";
import { Standard } from "@/components/home/Standard";
import { JourneyPanel } from "@/components/home/JourneyPanel";
import { CardSection } from "@/components/home/CardSection";
import { TravelStyles } from "@/components/home/TravelStyles";
import { FeatureBanner } from "@/components/home/FeatureBanner";
import { FamilyCouplesGroup } from "@/components/home/FamilyCouplesGroup";
import { WhyWorldBridge } from "@/components/home/WhyWorldBridge";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { FinalCta } from "@/components/home/FinalCta";
import { PackageCard } from "@/components/cards/PackageCard";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { CruiseCard } from "@/components/cards/CruiseCard";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { JournalCard } from "@/components/cards/JournalCard";
import { JourneyStoryCard } from "@/components/cards/JourneyStoryCard";
import { getFeaturedPackages, packages } from "@/data/packages";
import { getFeaturedDestinations, destinations } from "@/data/destinations";
import { cruises } from "@/data/cruises";
import { reviews } from "@/data/reviews";
import { journal } from "@/data/journal";
import { journeyStories } from "@/data/journey-stories";
import { themeImage } from "@/data/images";

export default function Home() {
  const featuredPackages = (getFeaturedPackages().length ? getFeaturedPackages() : packages).slice(0, 3);
  const featuredDestinations = (getFeaturedDestinations().length ? getFeaturedDestinations() : destinations).slice(0, 8);
  const featuredCruises = cruises.slice(0, 3);
  const featuredReviews = reviews.slice(0, 3);
  const latestJournal = journal.slice(0, 3);
  const featuredJourneyStories = journeyStories.slice(0, 3);

  return (
    <>
      <Hero />
      <Philosophy />
      <StatsBand />
      <CorePaths />

      <CardSection
        eyebrow="Featured Journeys"
        title="A few journeys we've recently shaped."
        description="Each of these began as a conversation, not a catalog listing."
        viewAllHref="/travel-packages"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPackages.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </CardSection>

      <CardSection
        eyebrow="Explore Destinations"
        title="Where the journey might begin."
        description="A starting set of the destinations we organize journeys to most often."
        viewAllHref="/destinations"
        tone="charcoal"
      >
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {featuredDestinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>
      </CardSection>

      <TravelStyles />

      <CardSection
        eyebrow="Journey Stories"
        title="Journeys, told properly."
        description="Not a catalog listing — the reasoning behind a route, and what the journey actually feels like."
        viewAllHref="/journey-stories"
        tone="charcoal"
      >
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featuredJourneyStories.map((story) => (
            <JourneyStoryCard key={story.slug} story={story} />
          ))}
        </div>
      </CardSection>

      <CardSection
        eyebrow="Cruise Collection"
        title="Ocean and river journeys, organized end to end."
        description="Sample sailings across our cruise categories — confirmed availability at enquiry."
        viewAllHref="/cruises"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCruises.map((cruise) => (
            <CruiseCard key={cruise.slug} cruise={cruise} />
          ))}
        </div>
      </CardSection>

      <FeatureBanner
        eyebrow="Arts & Culture"
        title="Travel through culture."
        description="Museums, opera, galleries and heritage sites — journeys built for clients who travel to go deeper into a place, not just to see it."
        cta="Plan a Cultural Journey"
        href="/arts-culture"
        image={themeImage("culturalHeritage", 8)}
        imageAlt="A white-walled museum gallery interior"
      />

      <FeatureBanner
        eyebrow="Bespoke Journeys"
        title="Your journey. Your way."
        description="When nothing off the shelf fits, we build the itinerary entirely from what you tell us — destinations, pace, style and every detail in between."
        cta="Design My Journey"
        href="/bespoke"
        image={themeImage("mountainNature", 7)}
        imageAlt="A remote, dramatic mountain landscape"
        reverse
      />

      <FeatureBanner
        eyebrow="Private Journeys"
        title="Entirely yours, from the first night to the last."
        description="No shared itinerary, no group pace — a private journey designed around one traveler, couple, family or group."
        cta="Enquire Privately"
        href="/private-journeys"
        image={themeImage("luxuryResort", 1)}
        imageAlt="A private villa terrace overlooking the coast"
      />

      <Concierge />
      <JourneyPanel />

      <FamilyCouplesGroup />
      <WhyWorldBridge />
      <Standard />
      <PartnersStrip />

      <CardSection
        eyebrow="Reviews"
        title="What traveling with us has been like."
        viewAllHref="/reviews"
        viewAllLabel="Read All Reviews"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </CardSection>

      <CardSection
        eyebrow="Travel Journal"
        title="Notes on planning a better journey."
        viewAllHref="/journal"
        viewAllLabel="Read the Journal"
        tone="charcoal"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {latestJournal.map((article) => (
            <JournalCard key={article.slug} article={article} />
          ))}
        </div>
      </CardSection>

      <FinalCta />
    </>
  );
}
