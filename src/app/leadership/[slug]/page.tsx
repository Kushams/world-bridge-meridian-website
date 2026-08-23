import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TeamAvatar } from "@/components/team/TeamAvatar";
import { team, getTeamMember, directReports } from "@/data/team";
import { themeImage } from "@/data/images";

export function generateStaticParams() {
  return team.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamMember(slug);
  if (!member) return {};
  return {
    title: `${member.name ?? member.title} — ${member.title}`,
    description: member.bio?.[0] ?? member.title,
  };
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getTeamMember(slug);
  if (!member) notFound();

  const manager = member.reportsToSlug ? getTeamMember(member.reportsToSlug) : undefined;
  const reports = directReports(slug);

  return (
    <>
      <PageHero
        eyebrow={member.department}
        title={member.name ?? member.title}
        description={member.title}
        image={themeImage("business", 1)}
        imageAlt="A workspace"
      />
      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "About", href: "/about" },
            { label: "Leadership & Team", href: "/leadership" },
            { label: member.name ?? member.title },
          ]}
        />
      </Container>

      <section className="pb-20 md:pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              {member.photo ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-charcoal border hairline">
                  <Image
                    src={member.photo}
                    alt={member.name ?? member.title}
                    fill
                    sizes="480px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <TeamAvatar name={member.name ?? member.title} className="aspect-[4/5] w-full" />
              )}

              {manager || reports.length > 0 ? (
                <div className="mt-8 space-y-6 rounded-card border hairline p-6">
                  {manager ? (
                    <div>
                      <p className="eyebrow mb-2">Reports To</p>
                      <Link
                        href={`/leadership/${manager.slug}`}
                        className="font-display text-lg text-ivory hover:text-gold transition-colors"
                      >
                        {manager.name} — {manager.title}
                      </Link>
                    </div>
                  ) : null}
                  {reports.length > 0 ? (
                    <div>
                      <p className="eyebrow mb-2">
                        {reports.length === 1 ? "Direct Report" : `Direct Reports (${reports.length})`}
                      </p>
                      <ul className="space-y-1.5">
                        {reports.map((r) => (
                          <li key={r.slug}>
                            <Link
                              href={`/leadership/${r.slug}`}
                              className="text-sm text-ivory-dim hover:text-gold transition-colors"
                            >
                              {r.name} — {r.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <p className="eyebrow mb-2">{member.department}</p>
              <h2 className="font-display text-3xl text-ivory md:text-4xl">{member.title}</h2>

              {member.bio ? (
                <div className="mt-6 space-y-4 text-base text-stone leading-relaxed">
                  {member.bio.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-stone-dim leading-relaxed">
                  This profile will be added once details are confirmed.
                </p>
              )}

              {member.focusAreas && member.focusAreas.length > 0 ? (
                <div className="mt-10">
                  <p className="eyebrow mb-4">What {(member.name ?? "this role").split(" ")[0]} Handles</p>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {member.focusAreas.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
