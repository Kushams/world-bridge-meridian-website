import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experiences, getExperience } from "@/data/experiences";
import { getDestination } from "@/data/destinations";
import { travelStyleLabel } from "@/data/travel-styles";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) return {};
  return {
    title: experience.title,
    description: experience.shortDescription,
    openGraph: { images: [experience.heroImage] },
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) notFound();

  const destination = experience.destinationSlug ? getDestination(experience.destinationSlug) : undefined;

  return (
    <>
      <PageHero
        eyebrow={experience.category}
        title={experience.title}
        description={experience.shortDescription}
        image={experience.heroImage}
        imageAlt={experience.title}
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            { label: "Experiences", href: "/experiences" },
            { label: experience.title },
          ]}
        />
      </Container>

      <section className="pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              {experience.description.map((p, i) => (
                <p key={i} className="text-base text-stone leading-relaxed">
                  {p}
                </p>
              ))}
              <div className="mt-6 flex flex-wrap gap-2">
                {experience.travelStyles.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-wide text-ivory-dim"
                  >
                    {travelStyleLabel(style)}
                  </span>
                ))}
              </div>
              {destination ? (
                <p className="pt-4 text-sm text-stone">
                  Available as part of a journey to{" "}
                  <a
                    href={`/destinations/${destination.slug}`}
                    className="text-gold hover:text-ivory transition-colors"
                  >
                    {destination.name}
                  </a>
                  .
                </p>
              ) : null}
            </div>

            <div className="rounded-card border hairline bg-charcoal p-6 md:p-8">
              <p className="font-display text-lg text-ivory">Add This to Your Journey</p>
              <p className="mt-3 text-sm text-stone leading-relaxed">
                Experiences like this are arranged as part of a full itinerary — tell us where
                and when you&apos;re traveling and we&apos;ll build it in.
              </p>
              <div className="mt-6">
                <Button href="/plan-your-journey" className="w-full justify-center">
                  Plan a Journey Around This
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
