// Renders the Travel Authorisation Form PDF with a signature placed on the "signed for World Bridge Meridian" line, to check size and proportions.
// Needs a transparent PNG at /tmp/wbm-qa/sigx/earl-signature.png: the real signature is deliberately NOT in git, so supply any stand-in image.
// Imports use absolute repo paths from the old environment (/home/user/world-bridge-meridian-website): adjust if the repo lives elsewhere. Output: /tmp/wbm-qa/sigx/with-earl.pdf
import fs from "node:fs";
import { buildTravelAuthPdf, realFonts, emblem } from "/home/user/world-bridge-meridian-website/tests/helpers/pdf.mjs";
import { travelAuthPrefill, travelAuthPdfData } from "/home/user/world-bridge-meridian-website/src/lib/travelAuthData.ts";
const S = "/tmp/wbm-qa/sigx/";
const sig = "data:image/png;base64," + fs.readFileSync(S + "earl-signature.png").toString("base64");
const v = travelAuthPrefill({ profile: null, payload: { full_name: "Sample Traveller", date_of_birth: "1990-01-31", nationality: "Swedish", passport_number: "00000000", passport_expiry: "2030-02-01", phone: "+00 000", departure_city: "Berlin (BER)", departure_date: "2026-10-20", return_date: "2026-10-23", emergency_name: "Sample Contact", emergency_phone: "+00 111" } });
const blob = await buildTravelAuthPdf(travelAuthPdfData({ ...v, entryStatus: "approved" }, { destination: "London, United Kingdom", coveredBy: "Pace Gallery", purpose: "Exhibition travel: Kylie Manning: The Mudlarkers, Pace Gallery, London", entryPermit: "UK ETA", authorisedBy: "Earl", authorisedTitle: "Founder & Chief Executive Officer", authorisedSignature: sig }), emblem, realFonts());
fs.writeFileSync(S + "with-earl.pdf", Buffer.from(await blob.arrayBuffer()));
