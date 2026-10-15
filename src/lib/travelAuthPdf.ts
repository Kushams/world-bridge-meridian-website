import { FONT_FILES, type PdfFonts } from "./invoicePdf";

type RGB = [number, number, number];

const FOREST: RGB = [27, 42, 32];
const INK: RGB = [33, 31, 26];
const SOFT: RGB = [110, 101, 82];
const GOLD: RGB = [166, 118, 59];
const GOLD_LIGHT: RGB = [217, 171, 99];
const CREAM: RGB = [250, 246, 236];
const SAND: RGB = [241, 234, 217];
const LINE: RGB = [200, 188, 160];

const SITE = "worldbridgemeridian.com";
const EMAIL = "info@worldbridgemeridian.group";

/** Everything is optional: whatever we know is printed on the form, and the rest is left as a line to write on. */
export interface TravelAuthData {
  name?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;
  phone?: string;
  destination?: string;
  departingFrom?: string;
  travelFrom?: string;
  travelTo?: string;
  purpose?: string;
  companions?: string;
  /** Who covers the approved travel costs, e.g. "Pace Gallery". */
  coveredBy?: string;
  /** Name of the entry permit that applies to the destination, e.g. "UK ETA". Leave out to skip the entry-status block. */
  entryPermit?: string;
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
  /** Who signs for World Bridge Meridian. */
  authorisedBy?: string;
  authorisedTitle?: string;
}

/** The World Bridge Meridian Travel Authorisation Form: one A4 page. `emblem` is a PNG data URL. */
export async function buildTravelAuthPdf(d: TravelAuthData, emblem?: string | null, fonts?: PdfFonts | null): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: "Travel Authorisation Form", subject: "Travel Authorisation Form", author: "World Bridge Meridian", creator: "World Bridge Meridian" });
  if (fonts) {
    const add = (key: keyof PdfFonts, style: string) => {
      doc.addFileToVFS(`${FONT_FILES[key]}.ttf`, fonts[key]);
      doc.addFont(`${FONT_FILES[key]}.ttf`, "Montserrat", style);
    };
    add("mont", "normal");
    add("montBold", "bold");
    add("montItalic", "italic");
    add("montItalic", "bolditalic");
  }
  const setF = (style: "normal" | "bold" | "italic") => (fonts ? doc.setFont("Montserrat", style) : doc.setFont("helvetica", style));

  const W = 210;
  const H = 297;
  const L = 16;
  const R = W - 16;
  const COL = (R - L - 8) / 2;

  type Opts = { size?: number; bold?: boolean; italic?: boolean; color?: RGB; align?: "left" | "right" | "center"; spacing?: number };
  const text = (s: string, x: number, y: number, o: Opts = {}) => {
    setF(o.bold ? "bold" : o.italic ? "italic" : "normal");
    doc.setFontSize(o.size ?? 9);
    doc.setTextColor(...(o.color ?? INK));
    doc.text(s, x, y, { align: o.align ?? "left", charSpace: o.spacing ?? 0 });
  };
  const fill = (c: RGB) => doc.setFillColor(...c);
  const stroke = (c: RGB, w = 0.2) => {
    doc.setDrawColor(...c);
    doc.setLineWidth(w);
  };
  const faint = (opacity: number, draw: () => void) => {
    type G = { GState: new (o: { opacity: number }) => unknown; setGState: (g: unknown) => void };
    const g = doc as unknown as G;
    g.setGState(new g.GState({ opacity }));
    draw();
    g.setGState(new g.GState({ opacity: 1 }));
  };
  const fit = (s: string, width: number, size: number) => {
    setF("normal");
    doc.setFontSize(size);
    return (doc.splitTextToSize(s, width) as string[])[0] ?? "";
  };

  // ---- Header and footer ----------------------------------------------------------------------
  fill(FOREST);
  doc.rect(0, 0, W, 36, "F");
  faint(0.06, () => {
    fill(GOLD_LIGHT);
    doc.circle(W + 4, -14, 40, "F");
  });
  fill(GOLD);
  doc.rect(0, 36, W, 1.1, "F");
  if (emblem) doc.addImage(emblem, "PNG", L, 6, 16, 14.3);
  const tx = emblem ? L + 20 : L;
  text("WORLD BRIDGE MERIDIAN", tx, 13.5, { size: 12.5, color: CREAM, spacing: 1 });
  text("BESPOKE TRAVEL GROUP", tx, 18.5, { size: 6.5, color: GOLD_LIGHT, spacing: 2 });
  stroke(GOLD, 0.3);
  doc.line(tx, 21, tx + 56, 21);
  text("TRAVEL AUTHORISATION FORM", L, 31, { size: 11, bold: true, color: CREAM, spacing: 1.2 });
  text("Strictly confidential", R, 31, { size: 7.5, italic: true, color: GOLD_LIGHT, align: "right" });

  if (emblem) faint(0.035, () => doc.addImage(emblem, "PNG", 76, 118, 118, 105.8));

  fill(FOREST);
  doc.rect(0, H - 12, W, 12, "F");
  fill(GOLD);
  doc.rect(0, H - 12, W, 0.7, "F");
  text("World Bridge Meridian  ·  Bespoke Travel Group", L, H - 5, { size: 7, color: CREAM, spacing: 0.3 });
  text(`${EMAIL}   ·   ${SITE}`, R, H - 5, { size: 7, color: GOLD_LIGHT, align: "right" });

  // ---- Building blocks ------------------------------------------------------------------------
  let y = 44;
  let firstSection = true;
  const section = (n: string, title: string) => {
    if (!firstSection) y += 3;
    firstSection = false;
    text(n, L, y, { size: 8, bold: true, color: GOLD });
    text(title.toUpperCase(), L + 7, y, { size: 8, bold: true, spacing: 1.1 });
    stroke(GOLD, 0.35);
    doc.line(L, y + 1.8, R, y + 1.8);
    y += 5.2;
  };
  /** A labelled value, or a blank line to write on. */
  const field = (label: string, value: string | undefined, x: number, width: number, at = y) => {
    text(label.toUpperCase(), x, at + 2.6, { size: 6, bold: true, color: GOLD, spacing: 0.7 });
    stroke(LINE, 0.25);
    doc.line(x, at + 8, x + width, at + 8);
    if (value && value.trim()) text(fit(value.trim(), width - 1, 9), x, at + 6.8, { size: 9 });
  };
  const pair = (a: [string, string | undefined], b?: [string, string | undefined]) => {
    field(a[0], a[1], L, b ? COL : R - L);
    if (b) field(b[0], b[1], L + COL + 8, COL);
    y += 9.8;
  };
  const checkbox = (label: string, x: number, at: number) => {
    stroke(SOFT, 0.3);
    doc.rect(x, at - 2.8, 3.2, 3.2);
    text(label, x + 5, at, { size: 8 });
  };
  const para = (s: string, size = 8.2, color: RGB = INK, gap = 4) => {
    setF("normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(s, R - L) as string[];
    lines.forEach((ln, i) => text(ln, L, y + i * gap, { size, color }));
    y += lines.length * gap;
  };

  // 01 Traveller
  section("01", "Traveller");
  pair(["Full name (as on passport)", d.name], ["Date of birth", d.dateOfBirth]);
  pair(["Nationality", d.nationality], ["Contact phone", d.phone]);
  pair(["Passport number", d.passportNumber], ["Passport expiry", d.passportExpiry]);
  pair(["Country of issue", d.passportCountry], ["Accompanying travellers (names)", d.companions]);
  y += 0.2;

  // 02 Trip
  section("02", "The trip");
  pair(["Travel destination", d.destination], ["Departing from", d.departingFrom]);
  pair(["Travel dates: from", d.travelFrom], ["to", d.travelTo]);
  pair(["Purpose of travel", d.purpose]);
  y += 0.2;

  // 03 Arrangements and costs
  section("03", "Authorised arrangements and costs");
  for (const [k, v] of [
    ["Flights", "to be booked by World Bridge Meridian on the traveller's behalf."],
    ["Accommodation", "to be booked by World Bridge Meridian on the traveller's behalf."],
    ["Ground transport and other services", "to be arranged by World Bridge Meridian, where needed."],
  ] as const) {
    fill(GOLD);
    doc.circle(L + 1, y - 1, 0.7, "F");
    text(k + ":", L + 4, y, { size: 8.2, bold: true });
    setF("bold");
    doc.setFontSize(8.2);
    text(v, L + 4 + doc.getTextWidth(k + ":") + 1.5, y, { size: 8.2 });
    y += 4.8;
  }
  y += 1.2;
  para("All approved travel costs are arranged by World Bridge Meridian on behalf of the traveller, and are reimbursed to the traveller by:", 8.2, INK, 4);
  y += 1.8;
  field("Costs covered by", d.coveredBy, L, R - L, y - 3);
  y += 8;
  y += 0.2;

  // 04 Entry status
  if (d.entryPermit) {
    section("04", `Entry status (${d.entryPermit})`);
    text("Current status", L, y, { size: 7, bold: true, color: GOLD, spacing: 0.7 });
    checkbox("Not yet applied", L + 32, y);
    checkbox("Applied, awaiting a decision", L + 66, y);
    checkbox("Approved", L + 118, y);
    y += 6.5;
    field("Any previous visa or entry refusals? Please give details", "", L, R - L);
    y += 9.8;
    y += 0.5;
  }

  // 05 Emergency contact
  section(d.entryPermit ? "05" : "04", "Emergency contact");
  pair(["Full name", d.emergencyName], ["Relationship", d.emergencyRelationship]);
  pair(["Contact phone", d.emergencyPhone], ["Contact email", d.emergencyEmail]);
  y += 0.2;

  // 06 Authorisation
  section(d.entryPermit ? "06" : "05", "Authorisation and declaration");
  para(
    "I confirm that the information on this form is accurate and complete. By signing below, I authorise World Bridge Meridian to arrange travel and related services on my behalf, and to use these details, including my passport details, only to make and manage my travel arrangements.",
    8.2,
    INK,
    4,
  );
  y += 3.5;
  const sigY = y;
  field("Traveller signature", "", L, COL, sigY);
  field("Date signed", "", L + COL + 8, COL, sigY);
  y += 13;
  field("Signed for World Bridge Meridian (name)", d.authorisedBy, L, COL, y);
  field("Title", d.authorisedTitle, L + COL + 8, COL, y);
  y += 11;

  // Reassurance strip, then a final overflow guard (the form is built to fit one page).
  fill(SAND);
  doc.roundedRect(L, y + 1, R - L, 8, 1.5, 1.5, "F");
  text("Please return the signed form to your World Bridge Meridian coordinator, or upload it in My World Bridge.", W / 2, y + 6.1, { size: 7.2, italic: true, color: SOFT, align: "center" });
  y += 10;
  if (y > H - 14) throw new Error(`Travel authorisation form overflowed the page (${y.toFixed(1)}mm)`);

  return doc.output("blob");
}
