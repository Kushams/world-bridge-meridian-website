import type { Metadata } from "next";
import { ArtListingRoute, artMetadata, artStaticParams } from "@/lib/artRoutes";

export const dynamicParams = false;

export function generateStaticParams() {
  return artStaticParams("fair");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return artMetadata("fair", params);
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ArtListingRoute category="fair" params={params} />;
}
