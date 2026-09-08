/**
 * Provider abstraction layer.
 *
 * World Bridge Meridian has no live travel-data provider connected yet.
 * These interfaces exist so the frontend is never coupled to one vendor —
 * a real provider (e.g. Duffel for flights) can be dropped in behind any
 * of these without touching the UI. Every provider returns a discriminated
 * `available: false` result when unconfigured or unreachable so the UI can
 * show a graceful message instead of an error or fabricated data — see
 * `src/lib/providers/index.ts` for the currently-registered (null) providers.
 *
 * Never call a real provider's API directly from a client component —
 * secrets stay server-side once a real provider is wired in.
 */

export interface ProviderUnavailable {
  available: false;
  /** Human-readable, safe to show to a visitor. */
  reason: string;
}

export interface ProviderAvailable<T> {
  available: true;
  results: T[];
  /** Name of the connected provider, e.g. "Duffel". Shown as attribution. */
  provider: string;
  /** When these results were fetched — providers are never assumed fresh. */
  fetchedAt: string;
}

export type ProviderResult<T> = ProviderUnavailable | ProviderAvailable<T>;

// ---------------------------------------------------------------------------
// Flights

export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export type TripType = "one_way" | "round_trip";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: CabinClass;
  tripType: TripType;
}

export interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: { amount: number; currency: string };
}

export interface FlightProvider {
  name: string;
  search(params: FlightSearchParams): Promise<ProviderResult<FlightResult>>;
}

// ---------------------------------------------------------------------------
// Stays

export interface StaySearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface StayResult {
  id: string;
  name: string;
  location: string;
  starRating: number | null;
  pricePerNight: { amount: number; currency: string };
}

export interface StayProvider {
  name: string;
  search(params: StaySearchParams): Promise<ProviderResult<StayResult>>;
}

// ---------------------------------------------------------------------------
// Activities

export interface ActivitySearchParams {
  destination: string;
  date?: string;
  category?: string;
}

export interface ActivityResult {
  id: string;
  title: string;
  location: string;
  duration: string;
  price: { amount: number; currency: string } | null;
}

export interface ActivityProvider {
  name: string;
  search(params: ActivitySearchParams): Promise<ProviderResult<ActivityResult>>;
}

// ---------------------------------------------------------------------------
// Cars

export interface CarSearchParams {
  location: string;
  pickUpDate: string;
  dropOffDate: string;
}

export interface CarResult {
  id: string;
  vendor: string;
  category: string;
  pricePerDay: { amount: number; currency: string };
}

export interface CarProvider {
  name: string;
  search(params: CarSearchParams): Promise<ProviderResult<CarResult>>;
}

// ---------------------------------------------------------------------------
// Cruises

export interface CruiseSearchParams {
  region: string;
  departureMonth?: string;
  nights?: number;
}

export interface CruiseResult {
  id: string;
  line: string;
  ship: string;
  itinerary: string;
  pricePerPerson: { amount: number; currency: string };
}

export interface CruiseProvider {
  name: string;
  search(params: CruiseSearchParams): Promise<ProviderResult<CruiseResult>>;
}

// ---------------------------------------------------------------------------
// Transfers

export interface TransferSearchParams {
  location: string;
  date: string;
  passengers: number;
}

export interface TransferResult {
  id: string;
  vendor: string;
  vehicleType: string;
  price: { amount: number; currency: string };
}

export interface TransferProvider {
  name: string;
  search(params: TransferSearchParams): Promise<ProviderResult<TransferResult>>;
}

// ---------------------------------------------------------------------------
// Payments (see src/lib/payments for the concrete crypto implementation)

export type PaymentMethodKind = "crypto" | "card" | "bank_transfer";

export interface PaymentProvider {
  name: string;
  kind: PaymentMethodKind;
  isConfigured(): boolean;
}

// ---------------------------------------------------------------------------
// CRM

export interface CRMProvider {
  name: string;
  isConfigured(): boolean;
  submitLead(lead: unknown): Promise<{ ok: boolean; error?: string }>;
}
