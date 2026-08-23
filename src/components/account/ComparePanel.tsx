"use client";

import Image from "next/image";
import Link from "next/link";
import { useSavedItems } from "@/lib/savedItems";
import { getCompareRow } from "@/lib/compareFields";
import { Button } from "@/components/ui/Button";

type CompareRowField = Exclude<keyof ReturnType<typeof getCompareRow>, "item">;

const fieldRows: { key: CompareRowField; label: string }[] = [
  { key: "typeLabel", label: "Type" },
  { key: "duration", label: "Duration" },
  { key: "travelStyles", label: "Travel Style" },
  { key: "travelerType", label: "Ideal Travelers" },
  { key: "season", label: "Season / Travel Period" },
  { key: "cruiseAvailable", label: "Cruise Available" },
  { key: "investment", label: "Journey Investment" },
];

export function ComparePanel() {
  const { items, remove } = useSavedItems();

  if (items.length < 2) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Compare Journeys</p>
        <h3 className="font-display text-xl text-ivory">Save at least two journeys to compare</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          Use the &quot;Save Journey&quot; button on any destination, package, cruise or journey
          story page, then come back here to compare them side by side.
        </p>
        <div className="mt-6">
          <Button href="/explore" variant="outline">
            Start Exploring
          </Button>
        </div>
      </div>
    );
  }

  const rows = items.map(getCompareRow);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-40 border-b hairline pb-4 text-left align-bottom text-xs uppercase tracking-wide text-stone">
              &nbsp;
            </th>
            {rows.map((row) => (
              <th key={`${row.item.type}:${row.item.slug}`} className="border-b hairline pb-4 pl-6 text-left align-bottom">
                <div className="relative mb-3 aspect-[4/3] w-44 overflow-hidden rounded-card">
                  <Image src={row.item.image} alt={row.item.title} fill sizes="180px" className="object-cover" />
                </div>
                <Link
                  href={row.item.href}
                  className="font-display text-base text-ivory hover:text-gold transition-colors"
                >
                  {row.item.title}
                </Link>
                <button
                  type="button"
                  onClick={() => remove(row.item.type, row.item.slug)}
                  className="mt-1 block text-xs text-stone-dim hover:text-ivory transition-colors"
                >
                  Remove
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fieldRows.map((field) => (
            <tr key={field.key}>
              <th className="border-b hairline py-4 pr-4 text-left text-xs uppercase tracking-wide text-stone">
                {field.label}
              </th>
              {rows.map((row) => (
                <td
                  key={`${row.item.type}:${row.item.slug}:${field.key}`}
                  className="border-b hairline py-4 pl-6 align-top text-ivory-dim"
                >
                  {row[field.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
