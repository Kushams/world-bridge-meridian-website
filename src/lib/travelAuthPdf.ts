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

/** The World Bridge Meridian Travel Authorisation Form: two A4 pages with room to write and sign. `emblem` is a PNG data URL. */
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

  // ---- Page furniture -------------------------------------------------------------------------
  const TOTAL_PAGES = 2;
  const furniture = (page: number) => {
    if (emblem) faint(0.035, () => doc.addImage(emblem, "PNG", 76, 118, 118, 105.8));
    fill(FOREST);
    doc.rect(0, H - 12, W, 12, "F");
    fill(GOLD);
    doc.rect(0, H - 12, W, 0.7, "F");
    text("World Bridge Meridian  ·  Bespoke Travel Group", L, H - 5, { size: 7, color: CREAM, spacing: 0.3 });
    text(`Page ${page} of ${TOTAL_PAGES}`, 103, H - 5, { size: 7, color: CREAM, align: "center" });
    text(`${EMAIL}   ·   ${SITE}`, R, H - 5, { size: 7, color: GOLD_LIGHT, align: "right" });
  };

  // First page header
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
  furniture(1);

  // ---- Building blocks ------------------------------------------------------------------------
  let y = 50;
  const section = (n: string, title: string) => {
    text(n, L, y, { size: 8.5, bold: true, color: GOLD });
    text(title.toUpperCase(), L + 8, y, { size: 8.5, bold: true, spacing: 1.2 });
    stroke(GOLD, 0.35);
    doc.line(L, y + 2.4, R, y + 2.4);
    y += 9;
  };
  /** A labelled value, or a blank line to write on. */
  const field = (label: string, value: string | undefined, x: number, width: number, at = y, lineAt = 10.2) => {
    text(label.toUpperCase(), x, at + 2.6, { size: 6, bold: true, color: GOLD, spacing: 0.7 });
    stroke(LINE, 0.25);
    doc.line(x, at + lineAt, x + width, at + lineAt);
    if (value && value.trim()) text(fit(value.trim(), width - 1, 9), x, at + lineAt - 1.8, { size: 9 });
  };
  const ROW = 14.5;
  const pair = (a: [string, string | undefined], b?: [string, string | undefined]) => {
    field(a[0], a[1], L, b ? COL : R - L);
    if (b) field(b[0], b[1], L + COL + 8, COL);
    y += ROW;
  };
  const checkbox = (label: string, x: number, at: number) => {
    stroke(SOFT, 0.3);
    doc.rect(x, at - 3, 3.6, 3.6);
    text(label, x + 5.5, at, { size: 8.4 });
  };
  const para = (s: string, size = 8.6, gap = 4.8) => {
    setF("normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(s, R - L) as string[];
    lines.forEach((ln, i) => text(ln, L, y + i * gap, { size }));
    y += lines.length * gap;
  };
  const gap = (mm = 9) => {
    y += mm;
  };

  // 01 Traveller
  section("01", "Traveller");
  pair(["Full name (as on passport)", d.name], ["Date of birth", d.dateOfBirth]);
  pair(["Nationality", d.nationality], ["Contact phone", d.phone]);
  pair(["Passport number", d.passportNumber], ["Passport expiry", d.passportExpiry]);
  pair(["Country of issue", d.passportCountry], ["Accompanying travellers (names)", d.companions]);
  gap(5);

  // 02 Trip
  section("02", "The trip");
  pair(["Travel destination", d.destination], ["Departing from", d.departingFrom]);
  pair(["Travel dates: from", d.travelFrom], ["to", d.travelTo]);
  pair(["Purpose of travel", d.purpose]);
  gap(5);

  // 03 Arrangements and costs
  section("03", "Authorised arrangements and costs");
  for (const [k, v] of [
    ["Flights", "to be booked by World Bridge Meridian on the traveller's behalf."],
    ["Accommodation", "to be booked by World Bridge Meridian on the traveller's behalf."],
    ["Ground transport and other services", "to be arranged by World Bridge Meridian, where needed."],
  ] as const) {
    fill(GOLD);
    doc.circle(L + 1.1, y - 1.1, 0.75, "F");
    setF("bold");
    doc.setFontSize(8.6);
    text(k + ":", L + 5, y, { size: 8.6, bold: true });
    text(v, L + 5 + doc.getTextWidth(k + ":") + 1.8, y, { size: 8.6 });
    y += 6.2;
  }
  gap(2.5);
  para("All approved travel costs are arranged by World Bridge Meridian on behalf of the traveller, and are reimbursed to the traveller by:");
  gap(3);
  field("Costs covered by", d.coveredBy, L, R - L);
  y += ROW;
  text("Continued on the next page", R, H - 18, { size: 7.5, italic: true, color: SOFT, align: "right" });

  // ---- Page 2 -----------------------------------------------------------------------------------
  doc.addPage();
  fill(FOREST);
  doc.rect(0, 0, W, 16, "F");
  fill(GOLD);
  doc.rect(0, 16, W, 0.8, "F");
  if (emblem) doc.addImage(emblem, "PNG", L, 3.2, 10.5, 9.4);
  text("WORLD BRIDGE MERIDIAN", emblem ? L + 14 : L, 10.2, { size: 9, color: CREAM, spacing: 0.9 });
  text("Travel Authorisation Form", R, 10.2, { size: 9, color: GOLD_LIGHT, align: "right" });
  furniture(2);
  y = 32;

  // 04 Entry status
  let n = 4;
  if (d.entryPermit) {
    section("04", `Entry status (${d.entryPermit})`);
    text("CURRENT STATUS", L, y, { size: 6, bold: true, color: GOLD, spacing: 0.7 });
    y += 7;
    checkbox("Not yet applied", L, y);
    checkbox("Applied, awaiting a decision", L + 46, y);
    checkbox("Approved", L + 108, y);
    y += 11;
    field("Any previous visa or entry refusals? Please give details", "", L, R - L);
    y += ROW;
    gap(5);
    n = 5;
  }

  // Emergency contact
  section(String(n).padStart(2, "0"), "Emergency contact");
  pair(["Full name", d.emergencyName], ["Relationship", d.emergencyRelationship]);
  pair(["Contact phone", d.emergencyPhone], ["Contact email", d.emergencyEmail]);
  gap(5);

  // Authorisation
  section(String(n + 1).padStart(2, "0"), "Authorisation and declaration");
  para(
    "I confirm that the information on this form is accurate and complete. By signing below, I authorise World Bridge Meridian to arrange travel and related services on my behalf, and to use these details, including my passport details, only to make and manage my travel arrangements.",
    8.8,
    5.2,
  );
  gap(8);
  field("Traveller signature", "", L, COL, y, 20);
  field("Date signed", "", L + COL + 8, COL, y, 20);
  y += 28;
  field("Signed for World Bridge Meridian (name)", d.authorisedBy, L, COL, y, 14);
  field("Title", d.authorisedTitle, L + COL + 8, COL, y, 14);
  y += 22;

  fill(SAND);
  doc.roundedRect(L, y, R - L, 10, 1.5, 1.5, "F");
  text("Please return the signed form to your World Bridge Meridian coordinator, or upload it in My World Bridge.", W / 2, y + 6.2, { size: 7.4, italic: true, color: SOFT, align: "center" });
  y += 10;
  if (y > H - 14) throw new Error(`Travel authorisation form overflowed the page (${y.toFixed(1)}mm)`);

  return doc.output("blob");
}
