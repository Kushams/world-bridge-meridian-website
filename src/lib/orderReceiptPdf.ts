import { FONT_FILES, type PdfFonts } from "./invoicePdf";
import { drawPaidStamp } from "./pdfStamp";

type RGB = [number, number, number];

export interface OrderReceipt {
  reference: string;
  kind: "gift-card" | "travel-credits";
  /** Total paid, US dollars. */
  total: number;
  paidAt: string | null;
  createdAt: string;
  paidVia: string | null;
  /** Gift cards: how many, the value of each, and the card design. */
  quantity: number;
  each: number;
  design: "classic" | "seasonal";
  recipientName: string;
  recipientEmail: string;
  message: string;
}

const FOREST: RGB = [27, 42, 32];
const INK: RGB = [33, 31, 26];
const SOFT: RGB = [110, 101, 82];
const GOLD: RGB = [166, 118, 59];
const GOLD_LIGHT: RGB = [217, 171, 99];
const CREAM: RGB = [250, 246, 236];
const SAND: RGB = [241, 234, 217];
const LINE: RGB = [225, 215, 192];
const WHITE: RGB = [255, 255, 255];

// Same colours as the gift card on the website.
const THEMES: Record<string, { from: RGB; to: RGB; accent: RGB }> = {
  classic: { from: [27, 35, 56], to: [74, 35, 38], accent: [217, 171, 99] },
  seasonal: { from: [17, 51, 42], to: [90, 36, 40], accent: [230, 194, 122] },
  credits: { from: [27, 42, 32], to: [104, 74, 40], accent: [217, 171, 99] },
};

const usd = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const METHOD: Record<string, string> = { card: "Card", "bank transfer": "Bank transfer", crypto: "Cryptocurrency" };

/** A branded receipt for a Travel Credits or gift card purchase, with the card itself pictured at the top. One A4 page. */
export async function buildOrderReceiptPdf(o: OrderReceipt, client: { name: string | null; email: string }, emblem?: string | null, fonts?: PdfFonts | null): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const isGift = o.kind === "gift-card";
  doc.setProperties({ title: `Receipt ${o.reference}`, subject: isGift ? "Gift card receipt" : "Travel Credits receipt", author: "World Bridge Meridian", creator: "World Bridge Meridian" });
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
  const setF = (font: "helvetica" | "times", style: "normal" | "bold" | "italic" | "bolditalic") => {
    if (fonts) doc.setFont("Montserrat", style);
    else doc.setFont(font, style);
  };
  const W = 210;
  const H = 297;
  const L = 16;
  const R = W - 16;

  type T = { size?: number; bold?: boolean; italic?: boolean; color?: RGB; align?: "left" | "right" | "center"; spacing?: number };
  const text = (s: string, x: number, y: number, o: T = {}) => {
    setF("helvetica", o.bold && o.italic ? "bolditalic" : o.bold ? "bold" : o.italic ? "italic" : "normal");
    doc.setFontSize(o.size ?? 9);
    doc.setTextColor(...(o.color ?? INK));
    doc.text(s, x, y, { align: o.align ?? "left", charSpace: o.spacing ?? 0 });
  };
  const fill = (c: RGB) => doc.setFillColor(...c);
  const faint = (opacity: number, draw: () => void) => {
    const G = (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState;
    const set = (doc as unknown as { setGState: (g: unknown) => void }).setGState.bind(doc);
    set(new G({ opacity }));
    draw();
    set(new G({ opacity: 1 }));
  };

  // ---- Header ---------------------------------------------------------------------------------
  fill(FOREST);
  doc.rect(0, 0, W, 48, "F");
  fill(GOLD);
  doc.rect(0, 48, W, 1.2, "F");
  if (emblem) doc.addImage(emblem, "PNG", L, 10, 20, 17.9);
  const tx = emblem ? L + 25 : L;
  text("WORLD BRIDGE MERIDIAN", tx, 19, { size: 14, color: CREAM, spacing: 1.1 });
  text("BESPOKE TRAVEL GROUP", tx, 25.5, { size: 7, color: GOLD_LIGHT, spacing: 2.2 });
  text("Receipt", R, 22, { size: 26, bold: true, color: CREAM, align: "right" });
  text(`No. ${o.reference}`, R, 30, { size: 9.5, color: GOLD_LIGHT, align: "right" });
  text(o.paidAt ? `Paid ${day(o.paidAt)}` : `Ordered ${day(o.createdAt)}`, R, 37, { size: 8.5, color: CREAM, align: "right" });

  // ---- The card itself --------------------------------------------------------------------------
  const theme = THEMES[isGift ? o.design : "credits"] ?? THEMES.classic;
  const cw = 134;
  const ch = 83.75; // the website's 1.6 : 1 ratio
  const cx = (W - cw) / 2;
  const cy = 64;
  doc.saveGraphicsState();
  doc.roundedRect(cx, cy, cw, ch, 5, 5, null);
  doc.clip();
  (doc as unknown as { discardPath?: () => void }).discardPath?.();
  const steps = 70;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    doc.setFillColor(...(theme.from.map((v, k) => Math.round(v + (theme.to[k] - v) * t)) as RGB));
    doc.rect(cx + (cw / steps) * i, cy, cw / steps + 0.4, ch, "F");
  }
  if (emblem) faint(0.1, () => doc.addImage(emblem, "PNG", cx + cw - 70, cy + ch - 62, 78, 69.8));
  faint(0.06, () => {
    fill(WHITE);
    doc.circle(cx + cw - 6, cy - 6, 38, "F");
  });
  doc.restoreGraphicsState();
  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(0.35);
  doc.roundedRect(cx + 2.2, cy + 2.2, cw - 4.4, ch - 4.4, 3.2, 3.2, "S");
  text(isGift ? "GIFT CARD" : "TRAVEL CREDITS", cx + 10, cy + 17, { size: 8.5, bold: true, color: theme.accent, spacing: 2.4 });
  text(usd(isGift ? o.each : o.total), cx + 10, cy + 40, { size: 30, bold: true, color: WHITE });
  text(isGift ? "NO EXPIRATION" : "ADDED TO YOUR WALLET", cx + 10, cy + 49, { size: 6.5, color: [214, 208, 196], spacing: 1.8 });
  text("World Bridge Meridian", cx + 10, cy + ch - 12, { size: 12, bold: true, color: WHITE });
  text("BESPOKE TRAVEL GROUP", cx + 10, cy + ch - 7.2, { size: 5.8, color: theme.accent, spacing: 2 });
  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(0.5);
  doc.circle(cx + cw - 17, cy + 17, 6.5, "S");
  doc.circle(cx + cw - 17, cy + 17, 4.6, "S");
  if (isGift && o.quantity > 1) {
    fill(theme.accent);
    doc.roundedRect(cx + cw - 36, cy + ch - 17, 26, 8.5, 4.2, 4.2, "F");
    text(`× ${o.quantity} CARDS`, cx + cw - 23, cy + ch - 11.4, { size: 6.8, bold: true, color: theme.from, align: "center", spacing: 0.6 });
  }

  // ---- Details -----------------------------------------------------------------------------------
  let y = cy + ch + 16;
  text("BILLED TO", L, y, { size: 7, bold: true, color: GOLD, spacing: 1.4 });
  text(client.name || client.email, L, y + 7, { size: 12, bold: true });
  if (client.name) text(client.email, L, y + 12.5, { color: SOFT });
  text("FROM", 110, y, { size: 7, bold: true, color: GOLD, spacing: 1.4 });
  text("World Bridge Meridian", 110, y + 7, { size: 12, bold: true });
  text("info@worldbridgemeridian.group", 110, y + 12.5, { color: SOFT });

  y += 22;
  const rows: [string, string][] = [
    [isGift ? (o.quantity > 1 ? "Gift cards" : "Gift card") : "Travel Credits", isGift ? `${o.quantity} × ${usd(o.each)}` : usd(o.total)],
    ["Order number", o.reference],
    ["Payment", METHOD[o.paidVia ?? ""] ?? o.paidVia ?? "Paid"],
  ];
  if (isGift && o.recipientName) rows.push(["Sent to", `${o.recipientName}${o.recipientEmail ? ` (${o.recipientEmail})` : ""}`]);
  rows.forEach(([k, v], i) => {
    if (i % 2 === 0) {
      fill(CREAM);
      doc.rect(L, y - 5.2, R - L, 9, "F");
    }
    text(k, L + 4, y, { color: SOFT });
    text(v, R - 4, y, { align: "right", bold: true });
    y += 9;
  });
  if (isGift && o.message) {
    const lines = doc.splitTextToSize(`"${o.message}"`, R - L - 8) as string[];
    text("Message", L + 4, y + 1, { color: SOFT });
    lines.slice(0, 4).forEach((ln, i) => text(ln, R - 4, y + 1 + i * 4.6, { align: "right", italic: true, color: SOFT }));
    y += Math.min(lines.length, 4) * 4.6 + 4;
  }
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(L, y - 3, R, y - 3);

  y += 4;
  fill(FOREST);
  doc.roundedRect(110, y, R - 110, 13, 2.5, 2.5, "F");
  text("TOTAL PAID", 116, y + 8.4, { size: 8, bold: true, color: GOLD_LIGHT, spacing: 1.4 });
  text(usd(o.total), R - 5, y + 8.9, { size: 12.5, bold: true, color: CREAM, align: "right" });
  drawPaidStamp({ doc, setF, faint, fill }, 52, y + 14, 20, o.paidAt ? new Date(o.paidAt) : new Date());

  y += 32;
  const note = isGift
    ? "Your gift card code" + (o.quantity > 1 ? "s were" : " was") + " emailed when you paid and can also be found in My World Bridge, under Wallet."
    : "Your Travel Credits have been added to your account. See your balance in My World Bridge, under Wallet.";
  text(note, W / 2, y, { size: 8.5, color: SOFT, align: "center" });
  text("Thank you for travelling with us.", W / 2, y + 9, { size: 11, italic: true, color: GOLD, align: "center" });

  // ---- Footer ---------------------------------------------------------------------------------------
  fill(FOREST);
  doc.rect(0, H - 14, W, 14, "F");
  fill(GOLD);
  doc.rect(0, H - 14, W, 0.8, "F");
  text("World Bridge Meridian  ·  Bespoke Travel Group", L, H - 6, { size: 7.5, color: CREAM, spacing: 0.3 });
  text("info@worldbridgemeridian.group   ·   worldbridgemeridian.com", R, H - 6, { size: 7.5, color: GOLD_LIGHT, align: "right" });
  void SAND;
  return doc.output("blob");
}
