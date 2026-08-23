import Image from "next/image";
import { ArtListing, LAST_VERIFIED } from "@/data/exhibitions";
import { Button } from "@/components/ui/Button";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function daysBetween(a: string, b: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / msPerDay,
  );
}

function statusFor(listing: ArtListing): { label: string; tone: "open" | "soon" | "upcoming" } {
  if (listing.startDate > LAST_VERIFIED) {
    return { label: `Opens ${formatDate(listing.startDate)}`, tone: "upcoming" };
  }
  if (daysBetween(LAST_VERIFIED, listing.endDate) <= 14) {
    return { label: `Closing soon — through ${formatDate(listing.endDate)}`, tone: "soon" };
  }
  return { label: `On view through ${formatDate(listing.endDate)}`, tone: "open" };
}

export function ArtListingCard({ listing }: { listing: ArtListing }) {
  const status = statusFor(listing);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border hairline bg-charcoal">
      <div className="relative h-48 w-full shrink-0">
        <Image
          src={listing.heroImage}
          alt="Gallery interior"
          fill
          sizes="(min-width: 768px) 400px, 90vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            status.tone === "soon"
              ? "bg-gold text-ink"
              : "bg-ink/80 text-ivory backdrop-blur"
          }`}
        >
          {status.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="eyebrow mb-2">
          {listing.venue} · {listing.city}, {listing.country}
        </p>
        <h3 className="font-display text-xl text-ivory leading-snug">{listing.title}</h3>
        <p className="mt-2 text-sm text-stone-dim">
          {formatDate(listing.startDate)} – {formatDate(listing.endDate)}
        </p>
        <p className="mt-4 flex-1 text-sm text-stone leading-relaxed">{listing.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t hairline pt-5">
          <a
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wide text-stone-dim hover:text-gold transition-colors"
          >
            Verify on {listing.sourceLabel} ↗
          </a>
          <div className="ml-auto">
            <Button href="/plan-your-journey" variant="outline" size="md">
              Plan This Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
