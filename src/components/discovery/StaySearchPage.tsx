"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";
import { stayProvider } from "@/lib/providers";
import { track } from "@/lib/analytics";

export function StaySearchPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [searched, setSearched] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    track("travel_search_attempted", { searchType: "stay", destination });

    const result = await stayProvider.search({ destination, checkIn, checkOut, guests, rooms });

    setSearched(true);
    if (!result.available) {
      setUnavailableReason(result.reason);
    }
  }

  function planThisTrip() {
    track("plan_this_trip_clicked", { searchType: "stay", destination });
    const dates = checkIn && checkOut ? `${checkIn} – ${checkOut}` : checkIn;
    const notes = `Stay search: ${destination || "?"}, ${guests} guest(s), ${rooms} room(s).`;
    const params = new URLSearchParams({ destination, dates, notes });
    router.push(`/plan-your-journey?${params.toString()}`);
  }

  return (
    <>
      <PageHero
        eyebrow="Stay Search"
        title="Search stays, then let us design the journey around them."
        description="See real accommodation options for your destination and dates. World Bridge Meridian doesn't book rooms directly — once you've found something worth building a trip around, we take it from there."
        image={themeImage("coastal", 2)}
        imageAlt="A hotel terrace overlooking the coast"
        size="sm"
      />

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <form onSubmit={handleSubmit} className="rounded-card border hairline bg-charcoal p-6 md:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="ss-destination" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Destination
                </label>
                <input
                  id="ss-destination"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Florence, Italy"
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="ss-checkin" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Check In
                </label>
                <input
                  id="ss-checkin"
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="ss-checkout" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Check Out
                </label>
                <input
                  id="ss-checkout"
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="ss-guests" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Guests
                </label>
                <input
                  id="ss-guests"
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="ss-rooms" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Rooms
                </label>
                <input
                  id="ss-rooms"
                  type="number"
                  min={1}
                  max={10}
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full">
              Search Stays
            </Button>
          </form>

          {searched && unavailableReason ? (
            <div className="mt-8 rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
              <p className="eyebrow mb-3">Search Unavailable</p>
              <h2 className="font-display text-2xl text-ivory md:text-3xl">{unavailableReason}</h2>
              <p className="mx-auto mt-4 max-w-md text-stone leading-relaxed">
                We&apos;re not yet connected to a live stay availability provider. Tell us your
                destination and dates and our team will find and confirm options directly.
              </p>
              <div className="mt-8">
                <Button onClick={planThisTrip} size="lg">
                  Plan This Trip
                </Button>
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
