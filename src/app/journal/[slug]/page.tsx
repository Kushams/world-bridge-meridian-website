import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { journal, getArticle } from "@/data/journal";
import { destinations } from "@/data/destinations";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return journal.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { images: [article.heroImage] },
  };
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = destinations.filter((d) => article.relatedDestinationSlugs?.includes(d.slug));

  return (
    <>
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={article.excerpt}
        image={article.heroImage}
        imageAlt={article.title}
        size="sm"
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Journal", href: "/journal" },
            { label: article.title },
          ]}
        />
        <p className="mt-4 text-xs text-stone-dim">
          {formatDate(article.date)} · {article.author} · {article.readingTime}
        </p>
      </Container>

      <section className="pb-20">
        <Container>
          <div className="mx-auto max-w-2xl space-y-6 text-base text-stone leading-relaxed">
            {article.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {related.length > 0 ? (
            <div className="mt-20">
              <p className="eyebrow mb-6">Related Destinations</p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((d) => (
                  <DestinationCard key={d.slug} destination={d} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mx-auto mt-20 max-w-2xl rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
            <h2 className="font-display text-2xl text-ivory">Ready to start planning?</h2>
            <p className="mt-3 text-stone">
              Tell us what you&apos;re imagining and we&apos;ll help shape the journey.
            </p>
            <div className="mt-6">
              <Button href="/plan-your-journey">Plan Your Journey</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
