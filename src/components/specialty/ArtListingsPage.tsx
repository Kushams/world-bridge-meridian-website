import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArtListingCard } from "@/components/cards/ArtListingCard";
import { listingsByCategory, LAST_VERIFIED, type ArtListing } from "@/data/exhibitions";

function formatVerifiedDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ArtListingsPage({
  eyebrow,
  title,
  intro,
  heroImage,
  heroImageAlt,
  category,
  ctaLabel,
  emptyNote,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  heroImage: string;
  heroImageAlt: string;
  category: ArtListing["category"];
  ctaLabel: string;
  emptyNote: string;
}) {
  const listings = listingsByCategory(category);

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={intro} image={heroImage} imageAlt={heroImageAlt} />

      <section className="py-10">
        <Container>
          <div className="rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            Sourced and checked against each institution&apos;s own website as of{" "}
            <span className="text-ivory">{formatVerifiedDate(LAST_VERIFIED)}</span>. Dates can shift —
            every listing links directly to the official page so you can confirm before you travel. We
            are not affiliated with any gallery, museum or fair listed here; we simply help clients plan
            journeys around what&apos;s on.
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ArtListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-dim">{emptyNote}</p>
          )}
        </Container>
      </section>

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us which show, city or dates you have in mind and we&apos;ll build the travel around it —
            flights, stays and time for everything else the destination offers.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              {ctaLabel}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
