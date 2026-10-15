// The Travel Authorisation Form: what it is filled with, and that it stays one page. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTravelAuthPdf, readPdf, realFonts, emblem } from "./helpers/pdf.mjs";
import { travelAuthFromRequest, ddmmyyyy, longDate, staffTitle } from "../src/lib/travelAuthData.ts";

const payload = {
  full_name: "Sample Traveller", date_of_birth: "1990-01-31", nationality: "Swedish", passport_number: "00000000", passport_expiry: "2030-02-01",
  phone: "+00 000", departure_city: "Berlin (BER)", departure_date: "2026-06-15", return_date: "2026-06-17",
  exhibition_or_event: "Kylie Manning: The Mudlarkers — Pace Gallery, London", emergency_name: "Sample Contact", emergency_relationship: "Parent", emergency_phone: "+00 111",
};
const signer = { name: "A Coordinator", title: "Travel Coordinating Officer" };

test("dates are shown the way the form needs them", () => {
  assert.equal(ddmmyyyy("1990-01-31"), "31/01/1990");
  assert.equal(longDate("2026-06-15"), "15 June 2026");
  assert.equal(ddmmyyyy(""), "");
  assert.equal(longDate(undefined), "");
});

test("the form is filled from the client's travel request", () => {
  const d = travelAuthFromRequest({ clientName: "Profile Name", clientPhone: "+99", payload, destination: "uk", destinationText: "London, United Kingdom", coveredBy: "Pace Gallery", signer });
  assert.equal(d.name, "Sample Traveller");
  assert.equal(d.dateOfBirth, "31/01/1990");
  assert.equal(d.passportExpiry, "01/02/2030");
  assert.equal(d.travelFrom, "15 June 2026");
  assert.equal(d.travelTo, "17 June 2026");
  assert.equal(d.departingFrom, "Berlin (BER)");
  assert.equal(d.purpose, "Exhibition travel: Kylie Manning: The Mudlarkers — Pace Gallery, London");
  assert.equal(d.coveredBy, "Pace Gallery");
  assert.equal(d.emergencyName, "Sample Contact");
  assert.equal(d.authorisedBy, "A Coordinator");
});

test("without a travel request, the profile fills what it can and the rest stays blank", () => {
  const d = travelAuthFromRequest({ clientName: "Profile Name", clientPhone: "+99", payload: null, destination: "uk", destinationText: "London, United Kingdom", coveredBy: "", signer });
  assert.equal(d.name, "Profile Name");
  assert.equal(d.phone, "+99");
  assert.equal(d.passportNumber, "");
  assert.equal(d.travelFrom, "");
  assert.equal(d.purpose, "");
});

test("the entry-status block (UK ETA) appears for the UK and not for other destinations", () => {
  const base = { clientName: "X", clientPhone: null, payload: null, destinationText: "Paris, France", coveredBy: "", signer };
  assert.equal(travelAuthFromRequest({ ...base, destination: "uk" }).entryPermit, "UK ETA");
  assert.equal(travelAuthFromRequest({ ...base, destination: "other" }).entryPermit, undefined);
});

test("the signer's title follows the same rule as our emails", () => {
  assert.equal(staffTitle({ email: "earla668@gmail.com", role: "admin" }), "Founder & Chief Executive Officer");
  assert.equal(staffTitle({ email: "info@worldbridgemeridian.group", role: "admin" }), "Client Services");
  assert.equal(staffTitle({ email: "someone@example.com", role: "staff" }), "Travel Coordinating Officer");
});

const make = async (d, fonts = null) => readPdf(await buildTravelAuthPdf(d, emblem, fonts));
const full = travelAuthFromRequest({ clientName: "X", clientPhone: null, payload, destination: "uk", destinationText: "London, United Kingdom", coveredBy: "Pace Gallery", signer });

test("the form is exactly one page, filled in or blank, UK or not", async () => {
  for (const d of [full, { ...full, entryPermit: undefined }, { entryPermit: "UK ETA" }, {}]) {
    for (const fonts of [null, realFonts()]) assert.equal((await make(d, fonts)).pages, 1);
  }
});

test("the form shows the client's details, the arrangements, the declaration and the signature lines", async () => {
  const { text } = await make(full);
  for (const s of ["TRAVEL AUTHORISATION FORM", "Sample Traveller", "31/01/1990", "00000000", "London, United Kingdom", "15 June 2026", "Pace Gallery", "ENTRY STATUS (UK ETA)", "Traveller signature".toUpperCase(), "A Coordinator", "Travel Coordinating Officer"]) {
    assert.ok(text.toUpperCase().includes(s.toUpperCase()), `missing: ${s}`);
  }
});

test("the entry-status section is left out for other destinations", async () => {
  const { text } = await make({ ...full, entryPermit: undefined, destination: "Paris, France" });
  assert.doesNotMatch(text, /ENTRY STATUS/i);
  assert.match(text, /EMERGENCY CONTACT/i);
});

test("very long values are shortened to fit their line, never spilling over", async () => {
  const long = "A".repeat(300);
  assert.equal((await make({ ...full, name: long, purpose: long, departingFrom: long })).pages, 1);
});
