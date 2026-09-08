"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";
import { flightProvider } from "@/lib/providers";
import type { CabinClass, TripType } from "@/lib/providers/types";
import { track } from "@/lib/analytics";

const cabinOptions: { value: CabinClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

export function FlightSearchPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [tripType, setTripType] = useState<TripType>("round_trip");
  const [searched, setSearched] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    track("travel_search_attempted", { searchType: "flight", origin, destination });

    const result = await flightProvider.search({
      origin,
      destination,
      departureDate,
      returnDate: tripType === "round_trip" ? returnDate : undefined,
      passengers,
      cabinClass,
      tripType,
    });

    setSearched(true);
    if (!result.available) {
      setUnavailableReason(result.reason);
    }
  }

  function planThisTrip() {
    track("plan_this_trip_clicked", { searchType: "flight", origin, destination });
    const dates =
      tripType === "round_trip" && departureDate && returnDate
        ? `${departureDate} – ${returnDate}`
        : departureDate;
    const notes = `Flight search: ${origin || "?"} → ${destination || "?"}, ${
      passengers
    } passenger(s), ${cabinOptions.find((c) => c.value === cabinClass)?.label ?? cabinClass}.`;
    const params = new URLSearchParams({
      originCity: origin,
      destination,
      dates,
      notes,
    });
    router.push(`/plan-your-journey?${params.toString()}`);
  }

  return (
    <>
      <PageHero
        eyebrow="Flight Search"
        title="Search flights, then let us design the journey around them."
        description="See real airline options for your route and dates. World Bridge Meridian doesn't sell tickets directly — once you've found a flight worth building a trip around, we take it from there."
        image={themeImage("mountainNature", 1)}
        imageAlt="An aircraft wing above clouds"
        size="sm"
      />

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <form onSubmit={handleSubmit} className="rounded-card border hairline bg-charcoal p-6 md:p-8">
            <div className="flex gap-4 text-xs font-semibold uppercase tracking-wide text-stone">
              <button
                type="button"
                onClick={() => setTripType("round_trip")}
                className={tripType === "round_trip" ? "text-gold" : "hover:text-ivory"}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => setTripType("one_way")}
                className={tripType === "one_way" ? "text-gold" : "hover:text-ivory"}
              >
                One Way
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fs-origin" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  From
                </label>
                <input
                  id="fs-origin"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. New York (JFK)"
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="fs-destination" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  To
                </label>
                <input
                  id="fs-destination"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris (CDG)"
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="fs-depart" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Departure
                </label>
                <input
                  id="fs-depart"
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="fs-return" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Return
                </label>
                <input
                  id="fs-return"
                  type="date"
                  disabled={tripType === "one_way"}
                  required={tripType === "round_trip"}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold disabled:opacity-40"
                />
              </div>
              <div>
                <label htmlFor="fs-pax" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Passengers
                </label>
                <input
                  id="fs-pax"
                  type="number"
                  min={1}
                  max={12}
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="fs-cabin" className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Cabin
                </label>
                <select
                  id="fs-cabin"
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                >
                  {cabinOptions.map((c) => (
                    <option key={c.value} value={c.value} className="bg-ink">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full">
              Search Flights
            </Button>
          </form>

          {searched && unavailableReason ? (
            <div className="mt-8 rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
              <p className="eyebrow mb-3">Search Unavailable</p>
              <h2 className="font-display text-2xl text-ivory md:text-3xl">{unavailableReason}</h2>
              <p className="mx-auto mt-4 max-w-md text-stone leading-relaxed">
                We&apos;re not yet connected to a live flight data provider. Tell us your route and
                dates and our team will find and confirm options directly.
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
