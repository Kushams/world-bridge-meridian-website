/**
 * Provider registry.
 *
 * No live travel-data provider is connected yet (see the Live Travel API
 * Research section of the Phase 3.5 report for candidates — Duffel is the
 * leading flights candidate). Every provider below is a "null provider":
 * it always resolves to `{ available: false }` with an honest reason,
 * never fabricated results. When a real provider is connected, replace the
 * relevant export here — nothing that imports from this file needs to
 * change.
 */

import type {
  ActivityProvider,
  CarProvider,
  CruiseProvider,
  FlightProvider,
  StayProvider,
  TransferProvider,
} from "./types";

const NOT_CONNECTED = "Travel search is currently unavailable. Let us design this journey for you.";

export const flightProvider: FlightProvider = {
  name: "Not connected",
  async search() {
    return { available: false, reason: NOT_CONNECTED };
  },
};

export const stayProvider: StayProvider = {
  name: "Not connected",
  async search() {
    return { available: false, reason: NOT_CONNECTED };
  },
};

export const activityProvider: ActivityProvider = {
  name: "Not connected",
  async search() {
    return { available: false, reason: NOT_CONNECTED };
  },
};

export const carProvider: CarProvider = {
  name: "Not connected",
  async search() {
    return { available: false, reason: NOT_CONNECTED };
  },
};

export const cruiseProvider: CruiseProvider = {
  name: "Not connected",
  async search() {
    return { available: false, reason: NOT_CONNECTED };
  },
};

export const transferProvider: TransferProvider = {
  name: "Not connected",
  async search() {
    return { available: false, reason: NOT_CONNECTED };
  },
};
