import Link from "next/link";
import type { NavGroup } from "@/data/nav";

/**
 * Phone/tablet footer: every link column is always visible, laid out two or
 * three across, so none of it hides behind a tap. Desktop (lg+) uses the
 * wider always-expanded columns in Footer.tsx; this is hidden there.
 */
export function FooterAccordion({ columns }: { columns: NavGroup[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:hidden">
      {columns.map((col) => (
        <div key={col.heading} className="min-w-0">
          <p className="eyebrow mb-3">{col.heading}</p>
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
    </div>
  );
}
