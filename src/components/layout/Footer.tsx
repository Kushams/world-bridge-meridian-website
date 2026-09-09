import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "./NewsletterForm";
import { FooterAccordion } from "./FooterAccordion";
import { company } from "@/data/company";
import { footerColumns, legalLinks } from "@/data/nav";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t hairline bg-charcoal">
      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <Image
              src="/images/brand/logo-mark.png"
              alt="World Bridge Meridian"
              width={657}
              height={455}
              className="h-20 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm text-stone leading-relaxed">
              {company.footerTagline}
            </p>
            <div className="mt-6">
              <p className="eyebrow mb-3">Journal Updates</p>
              <NewsletterForm />
            </div>
          </div>

          {/* Desktop/tablet (lg+): always-expanded columns, matching the
              header's own lg breakpoint for switching off the hamburger
              menu. Below lg: collapsed accordion instead (see below). */}
          {footerColumns.map((col) => (
            <div key={col.heading} className="hidden lg:block">
              <p className="eyebrow mb-4">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block -my-1.5 py-1.5 text-sm text-ivory-dim hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <FooterAccordion columns={footerColumns} />
        </div>

        <div className="mt-14 border-t hairline pt-10">
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2.5 text-sm text-ivory-dim">
            <li>
              <Link href="/contact" className="inline-block -my-1.5 py-1.5 hover:text-gold transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/plan-your-journey" className="inline-block -my-1.5 py-1.5 hover:text-gold transition-colors">
                Plan Your Journey
              </Link>
            </li>
            <li>
              <Link href="/payments" className="inline-block -my-1.5 py-1.5 hover:text-gold transition-colors">
                Payment Options
              </Link>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="inline-block -my-1.5 py-1.5 hover:text-gold transition-colors">
                {company.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${company.phone?.replace(/[^+\d]/g, "")}`}
                className="inline-block -my-1.5 py-1.5 hover:text-gold transition-colors"
              >
                {company.phone ?? "[PHONE NUMBER TO BE PROVIDED]"}
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start gap-4 border-t hairline pt-8 text-xs text-stone-dim md:flex-row md:items-center md:justify-between">
          <p>{company.copyrightLine(year)}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-block -my-1.5 py-1.5 hover:text-ivory transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
