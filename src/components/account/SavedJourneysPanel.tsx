"use client";

import Image from "next/image";
import Link from "next/link";
import { useSavedItems } from "@/lib/savedItems";
import { Button } from "@/components/ui/Button";

export function SavedJourneysPanel() {
  const { items, remove } = useSavedItems();

  if (items.length === 0) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Saved Journeys</p>
        <h3 className="font-display text-xl text-ivory">Nothing saved yet</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          Look for the &quot;Save Journey&quot; button on any destination, package, cruise or
          journey story — it&apos;s stored right here in your browser, not on our servers, since
          accounts aren&apos;t connected yet.
        </p>
        <div className="mt-6">
          <Button href="/explore" variant="outline">
            Start Exploring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="eyebrow">
          Saved Journeys ({items.length}) — stored in this browser only
        </p>
        {items.length >= 2 ? (
          <Link
            href="/compare"
            className="text-xs font-semibold uppercase tracking-wide text-gold hover:text-ivory transition-colors"
          >
            Compare Saved Journeys →
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={`${item.type}:${item.slug}`} className="group">
            <Link href={item.href} className="block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                  className="img-zoom object-cover"
                />
              </div>
            </Link>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow !text-[0.6rem] mb-1">
                  {item.type.replace("-", " ")}
                </p>
                <Link
                  href={item.href}
                  className="font-display text-base text-ivory hover:text-gold transition-colors"
                >
                  {item.title}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => remove(item.type, item.slug)}
                aria-label={`Remove ${item.title} from saved journeys`}
                className="shrink-0 text-xs text-stone-dim hover:text-ivory transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
