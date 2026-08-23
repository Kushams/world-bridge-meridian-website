/**
 * Placeholder image bank.
 *
 * These are licensed-for-use Unsplash photographs standing in for official
 * World Bridge Meridian photography, organized by broad visual theme so
 * destinations/packages/cruises can be assigned imagery that matches their
 * category. Swap `IMAGE_BANK` entries (or individual `heroImage`/`gallery`
 * fields in the content files) for real company photography before launch —
 * nothing else in the data layer needs to change.
 */

function unsplash(id: string, w = 1600, q = 80) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}

export const IMAGE_BANK = {
  cityscape: [
    "1493246507139-91e8fad9978e",
    "1552832230-c0197dd311b5",
    "1540541338287-41700207dee6",
    "1508672019048-805c876b67e2",
    "1512453979798-5ea266f8880c",
    "1546412414-8035e1776c9a",
    "1496442226666-8d4d0e62e6e9",
    "1519501025264-65ba15a82390",
    "1517760444937-f6397edcbbcd",
    "1583422409516-2895a77efded",
    "1541849546-216549ae216d",
    "1470770903676-69b98201ea1c",
    "1502920917128-1aa500764cbd",
    "1522093007474-d86e9bf7ba6f",
    "1541480601022-2308c0f02487",
  ],
  culturalHeritage: [
    "1533105079780-92b9be482077",
    "1523531294919-4bcd7c65e216",
    "1528181304800-259b08848526",
    "1571896349842-33c89424de2d",
    "1544967082-d9d25d867d66",
    "1518998053901-5348d3961a04",
    "1499678329028-101435549a4e",
    "1528127269322-539801943592",
    "1571003123894-1f0594d2b5d9",
  ],
  coastal: [
    "1520250497591-112f2f40a3f4",
    "1533929736458-ca588d08c8be",
    "1449034446853-66c86144b0ad",
    "1500375592092-40eb2168fd21",
    "1512918728675-ed5a9ecdebfd",
    "1552465011-b4e21bf6e79a",
  ],
  tropicalBeach: [
    "1508009603885-50cf7c579365",
    "1519046904884-53103b34b206",
    "1544644181-1484b3fdfc62",
  ],
  mountainNature: [
    "1502602898657-3e91760cbb34",
    "1499856871958-5b9627545d1a",
    "1476514525535-07fb3b4ae5f1",
    "1469474968028-56623f02e42e",
    "1537996194471-e657df975ab4",
    "1524820197278-540916411e20",
    "1483729558449-99ef09a8c325",
    "1445019980597-93fa8acb246c",
    "1470071459604-3b5ec3a7fe05",
    "1500835556837-99ac94a94552",
  ],
  safari: ["1526392060635-9d6019884377", "1516426122078-c23e76319801"],
  cruiseAndSea: ["1547471080-7cc2caa01a7e", "1548574505-5e239809ee19"],
  foodAndWine: [
    "1519677100203-a0e668c92439",
    "1414235077428-338989a2e8c0",
    "1523906834658-6e24ef2386f9",
    "1560493676-04071c5f467b",
  ],
  peopleTravel: [
    "1533777857889-4be7c70b33f7",
    "1476900164809-ff19b8ae5968",
    "1602002418082-a4443e081dd1",
    "1602343168117-bb8ffe3e2e9f",
  ],
  luxuryResort: [
    "1504198266287-1659872e6590",
    "1523482580672-f109ba8cb9be",
  ],
  wellness: ["1509233725247-49e657c54213", "1548013146-72479768bada"],
  desertArchitecture: ["1518684079-3c830dcef090"],
  adventure: ["1522199755839-a2bacb67c546", "1544735716-392fe2489ffa"],
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
