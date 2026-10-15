import { FONT_FILES, type PdfFonts } from "./invoicePdf";

type RGB = [number, number, number];

const FOREST: RGB = [27, 42, 32];
const INK: RGB = [33, 31, 26];
const SOFT: RGB = [110, 101, 82];
const GOLD: RGB = [166, 118, 59];
const GOLD_LIGHT: RGB = [217, 171, 99];
const CREAM: RGB = [250, 246, 236];
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
  /** Which "current status" box to tick in the entry-status section. */
  entryStatus?: "not_applied" | "applied" | "approved";
  /** Details of any previous visa or entry refusals. */
  refusals?: string;
  /** Who signs for World Bridge Meridian. */
  authorisedBy?: string;
  authorisedTitle?: string;
  /** PNG data URL of the World Bridge Meridian signature, placed above the signer's name. */
  authorisedSignature?: string;
  /** Traveller's signature: a drawn PNG data URL, or else their typed name is printed as the signature. */
  travellerSignature?: string;
  travellerTypedName?: string;
  /** Date signed, already formatted (e.g. "15/10/2026"). */
  signedOn?: string;
  /** Printed small at the foot of the form, e.g. "Signed electronically by … on … · Ref …". */
  signedNote?: string;
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

  /** Places a signature image inside a box without stretching it, left- or right-aligned. */
  const signature = (img: string, x: number, y: number, boxW: number, boxH: number, align: "left" | "right" = "left") => {
    const { width, height } = doc.getImageProperties(img);
    const scale = Math.min(boxW / width, boxH / height);
    const w = width * scale;
    const h = height * scale;
    doc.addImage(img, "PNG", align === "left" ? x : x + boxW - w, y + (boxH - h), w, h);
  };

  // ---- Header and footer ----------------------------------------------------------------------
  fill(FOREST);
  doc.rect(0, 0, W, 30, "F");
  faint(0.06, () => {
    fill(GOLD_LIGHT);
    doc.circle(W + 4, -14, 40, "F");
  });
  fill(GOLD);
  doc.rect(0, 30, W, 1.1, "F");
  if (emblem) doc.addImage(emblem, "PNG", L, 5, 14, 12.5);
  const tx = emblem ? L + 18 : L;
  text("WORLD BRIDGE MERIDIAN", tx, 11.5, { size: 12.5, color: CREAM, spacing: 1 });
  text("BESPOKE TRAVEL GROUP", tx, 16, { size: 6.5, color: GOLD_LIGHT, spacing: 2 });
  stroke(GOLD, 0.3);
  doc.line(tx, 18.2, tx + 56, 18.2);
  text("TRAVEL AUTHORISATION FORM", L, 26, { size: 11, bold: true, color: CREAM, spacing: 1.2 });
  text("Strictly confidential", R, 26, { size: 7.5, italic: true, color: GOLD_LIGHT, align: "right" });

  if (emblem) faint(0.035, () => doc.addImage(emblem, "PNG", 76, 118, 118, 105.8));

  fill(FOREST);
  doc.rect(0, H - 12, W, 12, "F");
  fill(GOLD);
  doc.rect(0, H - 12, W, 0.7, "F");
  text("World Bridge Meridian  ·  Bespoke Travel Group", L, H - 5, { size: 7, color: CREAM, spacing: 0.3 });
  text(`${EMAIL}   ·   ${SITE}`, R, H - 5, { size: 7, color: GOLD_LIGHT, align: "right" });

  // ---- Building blocks ------------------------------------------------------------------------
  let y = 38;
  let firstSection = true;
  const section = (n: string, title: string) => {
    if (!firstSection) y += 4;
    firstSection = false;
    text(n, L, y, { size: 8, bold: true, color: GOLD });
    text(title.toUpperCase(), L + 7, y, { size: 8, bold: true, spacing: 1.1 });
    stroke(GOLD, 0.35);
    doc.line(L, y + 2.2, R, y + 2.2);
    y += 5.6;
  };
  /** A labelled value, or a blank line to write on. */
  const field = (label: string, value: string | undefined, x: number, width: number, at = y, lineAt = 8.8) => {
    text(label.toUpperCase(), x, at + 2.5, { size: 6, bold: true, color: GOLD, spacing: 0.7 });
    stroke(LINE, 0.25);
    doc.line(x, at + lineAt, x + width, at + lineAt);
    if (value && value.trim()) text(fit(value.trim(), width - 1, 9), x, at + lineAt - 1.4, { size: 9 });
  };
  const ROW = 11.8;
  const GAP = 6;
  const UNIT = (R - L - 2 * GAP) / 3;
  /** One row of fields; each cell spans 1, 2 or 3 thirds of the page width. */
  const row = (...cells: [string, string | undefined, number][]) => {
    let x = L;
    for (const [label, value, span] of cells) {
      const width = UNIT * span + GAP * (span - 1);
      field(label, value, x, width);
      x += width + GAP;
    }
    y += ROW;
  };
  const checkbox = (label: string, x: number, at: number, ticked = false) => {
    stroke(SOFT, 0.3);
    doc.rect(x, at - 2.9, 3.3, 3.3);
    if (ticked) {
      stroke(FOREST, 0.5);
      doc.line(x + 0.6, at - 1.2, x + 1.4, at - 0.2);
      doc.line(x + 1.4, at - 0.2, x + 2.8, at - 2.5);
    }
    text(label, x + 5, at, { size: 8.2 });
  };
  const para = (s: string, size = 8.3, gap = 4.3) => {
    setF("normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(s, R - L) as string[];
    // Start a little below the rule, the same distance the field labels sit from it.
    lines.forEach((ln, i) => text(ln, L, y + 3.6 + i * gap, { size }));
    y += 3.6 + lines.length * gap;
  };

  // 01 Traveller
  section("01", "Traveller");
  row(["Full name (as on passport)", d.name, 2], ["Date of birth", d.dateOfBirth, 1]);
  row(["Nationality", d.nationality, 1], ["Passport number", d.passportNumber, 1], ["Passport expiry", d.passportExpiry, 1]);
  row(["Contact phone", d.phone, 3]);

  // 02 Trip
  section("02", "The trip");
  row(["Travel destination", d.destination, 1], ["Departing from", d.departingFrom, 2]);
  row(["Travel dates: from", d.travelFrom, 1], ["to", d.travelTo, 1], ["Accompanied by (names)", d.companions, 1]);
  row(["Purpose of travel", d.purpose, 3]);

  // 03 Arrangements and costs
  section("03", "Authorised arrangements and costs");
  para("World Bridge Meridian will book the traveller's flights, accommodation, ground transport and any other services, on the traveller's behalf. All approved travel costs are arranged by World Bridge Meridian and are reimbursed to the traveller by:");
  y += 2.5;
  row(["Costs covered by", d.coveredBy, 3]);

  // 04 Entry status
  let n = 4;
  if (d.entryPermit) {
    section("04", `Entry status (${d.entryPermit})`);
    text("CURRENT STATUS", L, y + 1.5, { size: 6, bold: true, color: GOLD, spacing: 0.7 });
    checkbox("Not yet applied", L + 36, y + 1.9, d.entryStatus === "not_applied");
    checkbox("Applied, awaiting a decision", L + 72, y + 1.9, d.entryStatus === "applied");
    checkbox("Approved", L + 126, y + 1.9, d.entryStatus === "approved");
    y += 6;
    row(["Any previous visa or entry refusals? Please give details", d.refusals, 3]);
    n = 5;
  }

  // Emergency contact
  section(String(n).padStart(2, "0"), "Emergency contact");
  row(["Full name", d.emergencyName, 2], ["Relationship", d.emergencyRelationship, 1]);
  row(["Contact phone", d.emergencyPhone, 1], ["Contact email", d.emergencyEmail, 2]);

  // Authorisation
  section(String(n + 1).padStart(2, "0"), "Authorisation and declaration");
  para(
    "I confirm that the information on this form is accurate and complete. By signing below, I authorise World Bridge Meridian to arrange travel and related services on my behalf, and to use these details, including my passport details, only to make and manage my travel arrangements.",
    8.3,
    4.3,
  );
  y += 3.5;
  const SIGN = 2 * UNIT + GAP;
  field("Traveller signature", "", L, SIGN, y, 13);
  if (d.travellerSignature) signature(d.travellerSignature, L + 1, y + 2.6, 40, 10);
  else if (d.travellerTypedName) text(fit(d.travellerTypedName, SIGN - 2, 15), L + 1, y + 11.4, { size: 15, italic: true });
  field("Date signed", d.signedOn, L + SIGN + GAP, UNIT, y, 13);
  y += 16;
  field("Signed for World Bridge Meridian (name)", d.authorisedBy, L, SIGN, y, d.authorisedSignature ? 13 : 8.8);
  if (d.authorisedSignature) signature(d.authorisedSignature, L + SIGN - 46, y + 2.6, 44, 10, "right");
  field("Title", d.authorisedTitle, L + SIGN + GAP, UNIT, y, d.authorisedSignature ? 13 : 8.8);
  y += d.authorisedSignature ? 14 : ROW;
  if (d.signedNote) text(fit(d.signedNote, R - L, 6.5), L, y + 1.5, { size: 6.5, italic: true, color: SOFT });
  if (y > H - 14) throw new Error(`Travel authorisation form overflowed the page (${y.toFixed(1)}mm)`);

  return doc.output("blob");
}
