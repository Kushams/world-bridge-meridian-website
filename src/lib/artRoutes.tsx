import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtListingDetail } from "@/components/specialty/ArtListingDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/data/company";
import { artCategoryBase, artListingHref, artListings, getArtListing, type ArtListing } from "@/data/exhibitions";

/** Shared by /exhibitions/[slug], /museums/[slug] and /art-fairs/[slug]. */
export function artStaticParams(category: ArtListing["category"]) {
  return artListings.filter((l) => l.category === category).map((l) => ({ slug: l.slug }));
}

export async function artMetadata(category: ArtListing["category"], params: Promise<{ slug: string }>): Promise<Metadata> {
  const { slug } = await params;
  const listing = getArtListing(category, slug);
  if (!listing) return {};
  return {
    title: `${listing.title} — ${listing.venue}`,
    description: `${listing.description} ${listing.venue}, ${listing.city}. Plan your trip with World Bridge Meridian.`,
    alternates: { canonical: `${SITE_URL}${artListingHref(listing)}` },
    openGraph: { images: [listing.heroImage] },
  };
}

export async function ArtListingRoute({ category, params }: { category: ArtListing["category"]; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getArtListing(category, slug);
  if (!listing) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ExhibitionEvent",
          name: listing.title,
          description: (listing.about ?? [listing.description]).join(" "),
          url: `${SITE_URL}${artCategoryBase(category)}/${listing.slug}`,
          startDate: listing.startDate,
          endDate: listing.endDate,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          image: listing.heroImage,
          location: {
            "@type": "Place",
            name: listing.venue,
            address: {
              "@type": "PostalAddress",
              ...(listing.address ? { streetAddress: listing.address } : {}),
              addressLocality: listing.city,
              addressCountry: listing.country,
            },
          },
        }}
      />
      <ArtListingDetail listing={listing} />
    </>
  );
}
