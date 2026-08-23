import { PriceTier } from "@/data/types";

const currencyFormatters: Record<string, Intl.NumberFormat> = {};

export function formatPrice(tier: PriceTier): string {
  if (!currencyFormatters[tier.currency]) {
    currencyFormatters[tier.currency] = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: tier.currency,
      maximumFractionDigits: 0,
    });
  }
  return `${tier.label} ${currencyFormatters[tier.currency].format(tier.amount)} ${tier.unit}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
