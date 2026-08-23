import { PriceTier } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { company } from "@/data/company";
import { Button } from "@/components/ui/Button";
import { SaveButton } from "@/components/ui/SaveButton";
import type { SavedItemType } from "@/lib/savedItems";

export function PricingBlock({
  tiers,
  ctaLabel = "Request This Journey",
  ctaHref = "/plan-your-journey",
  saveItem,
}: {
  tiers: PriceTier[];
  ctaLabel?: string;
  ctaHref?: string;
  saveItem?: { type: SavedItemType; slug: string; title: string; image: string; href: string };
}) {
  return (
    <div className="rounded-card border hairline bg-charcoal p-6 md:p-8">
      <p className="eyebrow mb-4">Journey Investment</p>
      <ul className="space-y-2">
        {tiers.map((tier, i) => (
          <li key={i} className="font-display text-2xl text-ivory">
            {formatPrice(tier)}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-stone-dim leading-relaxed">{company.pricingDisclaimer}</p>
      <div className="mt-6 space-y-3">
        <Button href={ctaHref} className="w-full justify-center">
          {ctaLabel}
        </Button>
        {saveItem ? (
          <SaveButton
            type={saveItem.type}
            slug={saveItem.slug}
            title={saveItem.title}
            image={saveItem.image}
            href={saveItem.href}
            className="w-full justify-center"
          />
        ) : null}
      </div>
    </div>
  );
}
