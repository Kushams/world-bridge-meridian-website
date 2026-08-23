import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamAvatar } from "@/components/team/TeamAvatar";
import { team } from "@/data/team";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Leadership & Team",
  description: `Meet the leadership and team structure behind ${company.name}.`,
};

const executives = team.filter((t) => t.department === "Executive");
const directors = team.filter((t) => t.reportsToSlug && executives.some((e) => e.slug === t.reportsToSlug));
const managers = team.filter((t) => t.reportsToSlug && directors.some((d) => d.slug === t.reportsToSlug));
const officers = team.filter((t) => t.reportsToSlug && managers.some((m) => m.slug === t.reportsToSlug));

function TierSection({
  eyebrow,
  title,
  description,
  members,
  size = "lg",
}: {
  eyebrow: string;
  title: string;
  description: string;
  members: typeof team;
  size?: "lg" | "md";
}) {
  if (members.length === 0) return null;
  const imgClass = size === "lg" ? "aspect-[4/5] w-full max-w-xs" : "aspect-square w-full";
  return (
    <div className="mt-20 first:mt-0">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <p className="mt-4 max-w-2xl text-sm text-stone leading-relaxed">{description}</p>
      <div
        className={`mt-10 grid grid-cols-1 gap-x-8 gap-y-14 ${
          size === "lg" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {members.map((member) => (
          <Link key={member.slug} href={`/leadership/${member.slug}`} className="group block tap-shrink">
            {member.photo ? (
              <div className={`relative ${imgClass} overflow-hidden rounded-card bg-charcoal border hairline`}>
                <Image
                  src={member.photo}
                  alt={member.name ?? member.title}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <TeamAvatar name={member.name ?? member.title} className={imgClass} />
            )}
            <p className="eyebrow mt-5 mb-1">{member.title}</p>
            <h3 className="font-display text-xl text-ivory group-hover:text-gold transition-colors">
              {member.name ?? "[NAME TO BE PROVIDED]"}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Leadership & Team"
        description="The people and structure behind how every World Bridge Meridian journey is designed, coordinated and supported."
        image={themeImage("business", 0)}
        imageAlt="A portrait in business attire"
      />
      <section className="py-16 md:py-24">
        <Container>
          <p className="max-w-2xl text-sm text-stone-dim leading-relaxed">
            World Bridge Meridian is organized around the journey, not around departments working in
            isolation — travel design, operations, client experience, finance and marketing all report
            into the same standard. Below is how the team is structured today; names and roles below
            our founder and COO are illustrative of the structure while we grow into it with real hires.
          </p>

          <TierSection
            eyebrow="Executive"
            title="Founder & Executive"
            description="Set the company's direction, standards and growth."
            members={executives}
          />
          <TierSection
            eyebrow="Directors"
            title="Directors"
            description="Own each function end to end — travel design, operations, client experience, finance and marketing — reporting directly to the COO or CEO."
            members={directors}
          />
          <TierSection
            eyebrow="Managers"
            title="Managers"
            description="Run the day-to-day teams beneath each director — coordination, cruise & group travel, air planning, corporate travel and client experience."
            members={managers}
            size="md"
          />
          <TierSection
            eyebrow="Coordinating Officers & Specialists"
            title="Coordinating Officers & Specialists"
            description="The team clients hear from most directly — coordinating travel packages and flight itineraries, cruise and group bookings, documentation, billing and in-trip support."
            members={officers}
            size="md"
          />
        </Container>
      </section>
    </>
  );
}
