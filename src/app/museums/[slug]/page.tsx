import type { Metadata } from "next";
import { ArtListingRoute, artMetadata, artStaticParams } from "@/lib/artRoutes";

export const dynamicParams = false;

export function generateStaticParams() {
  return artStaticParams("museum");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return artMetadata("museum", params);
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ArtListingRoute category="museum" params={params} />;
}
