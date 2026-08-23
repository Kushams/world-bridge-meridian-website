import { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CardSection({
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = "View All",
  children,
  tone = "ink",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  viewAllHref: string;
  viewAllLabel?: string;
  children: ReactNode;
  tone?: "ink" | "charcoal";
}) {
  return (
    <section className={`py-20 md:py-28 ${tone === "charcoal" ? "bg-charcoal" : ""}`}>
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          </Reveal>
          <Reveal delay={100}>
            <Button href={viewAllHref} variant="outline">
              {viewAllLabel}
            </Button>
          </Reveal>
        </div>
        <Reveal delay={150} className="mt-12">
          {children}
        </Reveal>
      </Container>
    </section>
  );
}
