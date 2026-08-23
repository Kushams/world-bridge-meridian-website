import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { team } from "@/data/team";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Leadership",
  description: `Meet the leadership of ${company.name}.`,
};

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Leadership"
        description="The people responsible for how every World Bridge Meridian journey is organized."
        image={themeImage("business", 0)}
        imageAlt="A portrait in business attire"
      />
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {team.map((member) => (
              <div key={member.slug}>
                <div className="aspect-[4/5] w-full max-w-xs rounded-card bg-charcoal border hairline flex items-center justify-center">
                  <span className="text-xs uppercase tracking-wide text-stone-dim">
                    {member.placeholder ? "Portrait to be provided" : "Portrait"}
                  </span>
                </div>
                <p className="eyebrow mt-6 mb-2">{member.title}</p>
                <h2 className="font-display text-2xl text-ivory">
                  {member.name ?? "[COO NAME TO BE PROVIDED]"}
                </h2>
                {member.bio ? (
                  <div className="mt-4 max-w-xl space-y-4 text-stone leading-relaxed">
                    {member.bio.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 max-w-xl text-sm text-stone-dim leading-relaxed">
                    This leadership profile will be added once details are confirmed.
                  </p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
