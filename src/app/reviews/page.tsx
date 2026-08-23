import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ReviewsExplorer } from "@/components/reviews/ReviewsExplorer";
import { reviews, averageRating } from "@/data/reviews";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What clients have said about traveling with World Bridge Meridian.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Reviews"
        description={`An average of ${averageRating()} out of 5 across ${reviews.length} sample reviews. Every review below is marked as a sample testimonial pending verified client reviews.`}
        image={themeImage("peopleTravel", 2)}
        imageAlt="Friends traveling together"
      />
      <section className="py-16 md:py-24">
        <Container>
          <ReviewsExplorer reviews={reviews} />
        </Container>
      </section>
    </>
  );
}
