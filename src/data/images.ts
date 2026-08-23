/**
 * Placeholder image bank.
 *
 * These are Unsplash photographs standing in for official World Bridge
 * Meridian photography, organized by broad visual theme so
 * destinations/packages/cruises can be assigned imagery that matches their
 * category. Every ID below was fetched and visually reviewed (not chosen
 * from an unverified guess) to confirm it actually matches its bucket.
 * Swap `IMAGE_BANK` entries (or individual `heroImage`/`gallery` fields in
 * the content files) for real company photography before launch — nothing
 * else in the data layer needs to change.
 */

function unsplash(id: string, w = 1600, q = 80) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}

/**
 * Stock professional headshots standing in for staff photos below Earl and
 * Justin (our real founder and COO). Each ID was fetched and visually
 * reviewed. Replace with real staff photography as real hires join —
 * see src/data/team.ts.
 */
export function stockPortrait(id: string, w = 800) {
  return `${unsplash(id, w, 80)}&crop=faces`;
}

export const IMAGE_BANK = {
  cityscape: [
    "1502602898657-3e91760cbb34", // Eiffel Tower at sunset
    "1499856871958-5b9627545d1a", // Paris bridge, night
    "1533929736458-ca588d08c8be", // Tower Bridge, London
    "1519501025264-65ba15a82390", // rain-lit city street, night (generic Western downtown)
    "1512453979798-5ea266f8880c", // Dubai skyline, sunset
    "1546412414-8035e1776c9a", // Dubai, contemporary architecture
    "1496442226666-8d4d0e62e6e9", // Times Square, night
    "1519501025264-65ba15a82390", // rain-lit city street, night
    "1583422409516-2895a77efded", // dense old-city rooftops, aerial
    "1449034446853-66c86144b0ad", // Golden Gate Bridge
    "1522093007474-d86e9bf7ba6f", // European café street, morning
    "1523906834658-6e24ef2386f9", // canal city, aerial (Venice-like)
    "1467269204594-9661b134dd2b", // European old-town street
    "1519677100203-a0e668c92439", // pastel city skyline, dusk
  ],
  culturalHeritage: [
    "1552832230-c0197dd311b5", // Colosseum, Rome
    "1537996194471-e657df975ab4", // temple reflected in water
    "1541849546-216549ae216d", // colorful European old-town square
    "1523531294919-4bcd7c65e216", // Gaudí-style architecture
    "1524820197278-540916411e20", // opera house at dusk
    "1528181304800-259b08848526", // golden Southeast Asian temple
    "1526392060635-9d6019884377", // Machu Picchu, misty mountains
    "1544967082-d9d25d867d66", // abstract gallery artwork
    "1518998053901-5348d3961a04", // white museum/gallery interior
    "1523482580672-f109ba8cb9be", // opera house, night
    "1548013146-72479768bada", // Taj Mahal archway
    "1519452575417-564c1401ecc0", // empty theater auditorium
    "1544644181-1484b3fdfc62", // temple on water with flowers
  ],
  coastal: [
    "1533105079780-92b9be482077", // whitewashed clifftop village
    "1483729558449-99ef09a8c325", // coastal city, aerial
    "1470770903676-69b98201ea1c", // wooden boats, misty coastal mountains
    "1499678329028-101435549a4e", // cliffside coastal town
    "1500375592092-40eb2168fd21", // ocean wave, close-up
    "1528127269322-539801943592", // limestone karst bay, aerial
    "1552465011-b4e21bf6e79a", // longtail boats, limestone cliffs
    "1540206395-68808572332f", // ocean wave, aerial
    "1590050752117-238cb0fb12b1", // dock over water, sunset
  ],
  tropicalBeach: [
    "1548574505-5e239809ee19", // overwater villas, aerial
    "1519046904884-53103b34b206", // beach, palm trees and hammock
    "1509233725247-49e657c54213", // beach, palm trees, clear water
    "1571003123894-1f0594d2b5d9", // overwater villas, dusk
    "1590523277543-a94d2e4eb00b", // overwater villas, aerial
  ],
  mountainNature: [
    "1476514525535-07fb3b4ae5f1", // boat on lake, mountains
    "1493246507139-91e8fad9978e", // mountain lake at sunset
    "1469474968028-56623f02e42e", // desert canyon, golden light
    "1508672019048-805c876b67e2", // person on dock, mountain lake
    "1517760444937-f6397edcbbcd", // waterfall
    "1470071459604-3b5ec3a7fe05", // green hills at sunset
    "1544735716-392fe2489ffa", // snow-capped mountain range
    "1490750967868-88aa4486c946", // wildflower field
  ],
  safari: [
    "1516426122078-c23e76319801", // safari jeep, sunset
    "1547471080-7cc2caa01a7e", // acacia tree silhouette, savanna sunset
  ],
  cruiseAndSea: [
    "1512100356356-de1b84283e18", // seaplane, tropical aerial
    "1571003123894-1f0594d2b5d9", // overwater villas, dusk
    "1540206395-68808572332f", // ocean wave, aerial
    "1590050752117-238cb0fb12b1", // dock over water, sunset
  ],
  foodAndWine: [
    "1414235077428-338989a2e8c0", // fine dining plate
    "1533777857889-4be7c70b33f7", // dining by candlelight
    "1476900164809-ff19b8ae5968", // floating candles, evening
    "1560493676-04071c5f467b", // vineyard rows
    "1512621776951-a57141f2eefd", // fresh produce spread
  ],
  peopleTravel: [
    "1494774157365-9e04c6720e47", // couple silhouette, sunset
    "1476234251651-f353703a034d", // parent carrying child, sunset
    "1484712401471-05c7215830eb", // friends celebrating outdoors
    "1502086223501-7ea6ecd79368", // children playing in a forest
    "1543269865-cbf427effbad", // friends talking at a café
    "1522673607200-164d1b6ce486", // wedding chairs on a lawn
  ],
  luxuryResort: [
    "1548574505-5e239809ee19", // overwater villas, aerial
    "1540541338287-41700207dee6", // resort pool, aerial
    "1571896349842-33c89424de2d", // infinity pool at dusk
    "1602002418082-a4443e081dd1", // curved infinity pool over ocean
    "1602343168117-bb8ffe3e2e9f", // modern villa with pool
    "1445019980597-93fa8acb246c", // resort deck at sunset
  ],
  wellness: [
    "1544367567-0f2fcb009e0b", // yoga silhouette, sunset
    "1512621776951-a57141f2eefd", // fresh, healthful spread
  ],
  desertArchitecture: [
    "1518684079-3c830dcef090", // waterfront tower, aerial
  ],
  adventure: [
    "1500835556837-99ac94a94552", // airplane wing, sunset clouds
    "1526772662000-3f88f10405ff", // hiker at a mountain summit
    "1544551763-46a013bb70d5", // scuba diver among reef fish
    "1483721310020-03333e577078", // lacing up running shoes, city street
  ],
  business: [
    "1560250097-0b93528c311a", // portrait, business attire
    "1522199755839-a2bacb67c546", // working on a laptop
    "1521737604893-d14cc237f11d", // small group working together
    "1531256379416-9f000e90aacc", // desk, notebook and glasses
  ],
  stays: [
    "1512918728675-ed5a9ecdebfd", // minimalist bedroom, natural light
    "1522708323590-d24dbb6b0267", // contemporary living room
    "1494526585095-c41746248156", // modern villa exterior, dusk
  ],
} as const;

export type ImageTheme = keyof typeof IMAGE_BANK;

/** Deterministically pick an image from a theme bucket without repeats bunching together. */
export function themeImage(theme: ImageTheme, index = 0, size?: number) {
  const bucket = IMAGE_BANK[theme];
  const id = bucket[index % bucket.length];
  return unsplash(id, size);
}

export function themeGallery(theme: ImageTheme, count = 4, offset = 0) {
  const bucket = IMAGE_BANK[theme];
  return Array.from({ length: count }, (_, i) =>
    unsplash(bucket[(offset + i) % bucket.length]),
  );
}
