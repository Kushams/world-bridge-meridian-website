import Link from "next/link";
import type { NavGroup } from "@/data/nav";

/**
 * Phone/tablet footer: every link group is always visible, but set as short
 * wrapped lines instead of tall lists so the footer stays compact. Desktop
 * (lg+) uses the wider always-expanded columns in Footer.tsx; this is hidden
 * there.
 */
export function FooterAccordion({ columns }: { columns: NavGroup[] }) {
  return (
    <div className="space-y-5 lg:hidden">
      {columns.map((col) => (
        <div key={col.heading}>
          <p className="eyebrow mb-2">{col.heading}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-0.5">
            {col.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-1.5 text-[13px] text-ivory-dim hover:text-gold transition-colors"
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
