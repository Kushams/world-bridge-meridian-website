import type { LineItem } from "./money";

export interface PdfInvoice {
  reference: string;
  createdAt: string;
  dueDate: string | null;
  status: "unpaid" | "paid" | "needs_review" | "void";
  paidAt: string | null;
  currency: "USD" | "EUR" | "GBP";
  lines: LineItem[];
  subtotal: number;
  taxPercent: number;
  total: number;
  amountUsd: number;
  fxRate: number;
}

export interface PdfClient {
  name: string | null;
  email: string;
  phone: string | null;
}

type RGB = [number, number, number];

/** Base64 TTF files for the PDF's typefaces (Montserrat like the site, Playfair Display for titles and amounts). */
export type PdfFonts = Record<"mont" | "montBold" | "play" | "playBold" | "playItalic", string>;
const FONT_FILES: Record<keyof PdfFonts, string> = {
  mont: "Montserrat-Regular",
  montBold: "Montserrat-SemiBold",
  play: "PlayfairDisplay-Medium",
  playBold: "PlayfairDisplay-Bold",
  playItalic: "PlayfairDisplay-MediumItalic",
};

/** Fetches the PDF fonts from /fonts/pdf. Returns null if any is missing (the PDF then falls back to built-in fonts). */
export async function loadPdfFonts(): Promise<PdfFonts | null> {
  try {
    const entries = await Promise.all(
      (Object.keys(FONT_FILES) as (keyof PdfFonts)[]).map(async (k) => {
        const res = await fetch(`/fonts/pdf/${FONT_FILES[k]}.ttf`);
        if (!res.ok) throw new Error(k);
        const bytes = new Uint8Array(await res.arrayBuffer());
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return [k, btoa(bin)] as const;
      }),
    );
    return Object.fromEntries(entries) as PdfFonts;
  } catch {
    return null;
  }
}

const SYMBOL = { USD: "US$", EUR: "€", GBP: "£" } as const;
const fmt = (n: number, c: keyof typeof SYMBOL) => `${SYMBOL[c]}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// Brand palette (matches the website)
const FOREST: RGB = [27, 42, 32];
const INK: RGB = [33, 31, 26];
const SOFT: RGB = [110, 101, 82];
const GOLD: RGB = [166, 118, 59];
const GOLD_LIGHT: RGB = [217, 171, 99];
const CREAM: RGB = [250, 246, 236];
const SAND: RGB = [241, 234, 217];
const LINE: RGB = [225, 215, 192];
const WHITE: RGB = [255, 255, 255];
const GREEN: RGB = [30, 140, 90];

const SITE = "worldbridgemeridian.com";
const EMAIL = "info@worldbridgemeridian.group";
const PHONE = "+1 (302) 627-3325";

/** A World Bridge Meridian branded invoice as a vector PDF (A4). `emblem` is a PNG data URL; omit to leave the logo out. */
export async function buildInvoicePdf(inv: PdfInvoice, client: PdfClient, emblem?: string | null, fonts?: PdfFonts | null): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: `${inv.status === "paid" ? "Receipt" : "Invoice"} ${inv.reference}`, subject: inv.status === "paid" ? "Receipt" : "Invoice", author: "World Bridge Meridian", creator: "World Bridge Meridian" });
  if (fonts) {
    const add = (key: keyof PdfFonts, family: string, style: string) => {
      doc.addFileToVFS(`${FONT_FILES[key]}.ttf`, fonts[key]);
      doc.addFont(`${FONT_FILES[key]}.ttf`, family, style);
    };
    add("mont", "Montserrat", "normal");
    add("montBold", "Montserrat", "bold");
    add("play", "Playfair", "normal");
    add("playBold", "Playfair", "bold");
    add("playItalic", "Playfair", "italic");
    add("playItalic", "Playfair", "bolditalic");
  }
  // Sans = Montserrat, serif = Playfair Display; the built-in Helvetica / Times when the fonts could not be loaded.
  const setF = (font: "helvetica" | "times", style: "normal" | "bold" | "italic" | "bolditalic") => {
    if (fonts) doc.setFont(font === "times" ? "Playfair" : "Montserrat", font === "times" ? style : style === "bold" || style === "bolditalic" ? "bold" : "normal");
    else doc.setFont(font, style);
  };
  const W = 210;
  const H = 297;
  const L = 16;
  const R = W - 16;
  const cur = inv.currency;

  type TextOpts = { size?: number; bold?: boolean; italic?: boolean; font?: "helvetica" | "times"; color?: RGB; align?: "left" | "right" | "center"; spacing?: number };
  const text = (s: string, x: number, y: number, o: TextOpts = {}) => {
    setF(o.font ?? "helvetica", o.bold && o.italic ? "bolditalic" : o.bold ? "bold" : o.italic ? "italic" : "normal");
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
    const g = new (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState({ opacity });
    (doc as unknown as { setGState: (g: unknown) => void }).setGState(g);
    draw();
    (doc as unknown as { setGState: (g: unknown) => void }).setGState(new (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState({ opacity: 1 }));
  };

  /** A round, rubber-stamp style "PAID" seal with the company name set around its edge. Tilted slightly, like a real stamp. */
  const officialStamp = (cx: number, cy: number, r: number, when: Date) => {
    const INKC: RGB = [24, 112, 74];
    const tilt = 10; // degrees, counter-clockwise
    const rad = (d: number) => (d * Math.PI) / 180;
    const rot = (dx: number, dy: number): [number, number] => {
      const a = rad(tilt);
      return [cx + dx * Math.cos(a) + dy * Math.sin(a), cy - dx * Math.sin(a) + dy * Math.cos(a)];
    };
    // Text along an arc. Top text reads clockwise over the top; bottom text reads left to right along the bottom.
    const arc = (s: string, radius: number, top: boolean, size: number, track: number) => {
      setF("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(...INKC);
      const ws = [...s].map((ch) => doc.getTextWidth(ch));
      const total = ws.reduce((a, w) => a + w + track, -track) / radius; // radians
      let t = top ? Math.PI / 2 + total / 2 : (3 * Math.PI) / 2 - total / 2;
      [...s].forEach((ch, i) => {
        const half = ws[i] / radius / 2;
        const th = top ? t - half : t + half;
        const thDeg = (th * 180) / Math.PI + tilt;
        const angle = top ? thDeg - 90 : thDeg - 270;
        const px = cx + radius * Math.cos(rad(thDeg));
        const py = cy - radius * Math.sin(rad(thDeg));
        const a = rad(angle);
        if (ch !== " ") doc.text(ch, px - (ws[i] / 2) * Math.cos(a), py + (ws[i] / 2) * Math.sin(a), { angle });
        const step = (ws[i] + track) / radius;
        t = top ? t - step : t + step;
      });
    };
    faint(0.88, () => {
      doc.setDrawColor(...INKC);
      doc.setLineWidth(1.1);
      doc.circle(cx, cy, r, "S");
      doc.setLineWidth(0.3);
      doc.circle(cx, cy, r - 1.7, "S");
      doc.circle(cx, cy, r - 9.2, "S");
      arc("WORLD BRIDGE MERIDIAN", r - 6.9, true, 6.1, 0.55);
      arc("BESPOKE TRAVEL GROUP", r - 4.5, false, 5.6, 0.5);
      // separator dots at 9 and 3 o'clock
      fill(INKC);
      for (const sign of [-1, 1]) {
        const [dx, dy] = rot(sign * (r - 5.6), 0);
        doc.circle(dx, dy, 0.55, "F");
      }
      const inner = (s: string, dx: number, dy: number, size: number, spacing: number) => {
        const [px, py] = rot(dx, dy);
        setF("helvetica", "bold");
        doc.setFontSize(size);
        doc.setTextColor(...INKC);
        doc.text(s, px, py, { align: "center", angle: tilt, charSpace: spacing });
      };
      inner(when.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(), 0, -6.4, 4.8, 0.4);
      inner("PAID", 0, 3.6, 17, 1);
      inner("PAYMENT RECEIVED", 0, 8.1, 3.4, 0.2);
      doc.setLineWidth(0.3);
      const [ax, ay] = rot(-7, -4.3);
      const [bx, by] = rot(7, -4.3);
      doc.line(ax, ay, bx, by);
    });
  };

  // ---- Page furniture ------------------------------------------------------------------------
  const watermark = () => {
    if (emblem) faint(0.035, () => doc.addImage(emblem, "PNG", 86, 150, 118, 105.8));
  };
  const footer = () => {
    fill(FOREST);
    doc.rect(0, H - 14, W, 14, "F");
    fill(GOLD);
    doc.rect(0, H - 14, W, 0.8, "F");
    text(`World Bridge Meridian  ·  Bespoke Travel Group`, L, H - 6, { size: 7.5, color: CREAM, spacing: 0.3 });
    text(`${EMAIL}   ·   ${SITE}`, R, H - 6, { size: 7.5, color: GOLD_LIGHT, align: "right" });
  };
  const slimHeader = () => {
    fill(FOREST);
    doc.rect(0, 0, W, 16, "F");
    fill(GOLD);
    doc.rect(0, 16, W, 0.8, "F");
    if (emblem) doc.addImage(emblem, "PNG", L, 3.2, 10.5, 9.4);
    text("WORLD BRIDGE MERIDIAN", emblem ? L + 14 : L, 10.2, { size: 9, color: CREAM, spacing: 0.9 });
    text(`${inv.status === "paid" ? "Receipt" : "Invoice"} ${inv.reference}`, R, 10.2, { size: 9, color: GOLD_LIGHT, align: "right" });
  };

  // ---- First page header ---------------------------------------------------------------------
  fill(FOREST);
  doc.rect(0, 0, W, 54, "F");
  // soft decorative arc in the corner
  faint(0.06, () => {
    fill(GOLD_LIGHT);
    doc.circle(W + 4, -14, 44, "F");
  });
  fill(GOLD);
  doc.rect(0, 54, W, 1.2, "F");

  if (emblem) doc.addImage(emblem, "PNG", L, 12, 22, 19.7);
  const tx = emblem ? L + 27 : L;
  text("WORLD BRIDGE MERIDIAN", tx, 21.5, { size: 14.5, color: CREAM, spacing: 1.1 });
  text("BESPOKE TRAVEL GROUP", tx, 28, { size: 7, color: GOLD_LIGHT, spacing: 2.2 });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(tx, 31, tx + 62, 31);

  text(inv.status === "paid" ? "Receipt" : "Invoice", R, 24, { size: 30, font: "times", italic: true, color: CREAM, align: "right" });
  text(`No. ${inv.reference}`, R, 32, { size: 9.5, color: GOLD_LIGHT, align: "right" });
  text(`Issued ${day(inv.createdAt)}`, R, 39, { size: 8.5, color: CREAM, align: "right" });
  text(inv.dueDate && inv.status !== "paid" ? `Due ${day(inv.dueDate)}` : inv.status === "paid" ? (inv.paidAt ? `Paid ${day(inv.paidAt)}` : "Paid") : "Due on receipt", R, 44.5, { size: 8.5, color: CREAM, align: "right" });

  watermark();

  // ---- Fit on one page ---------------------------------------------------------------------------
  // Pick the roomiest of three spacing levels whose content still fits on page 1 (long itineraries get tighter rows).
  const LEVELS = [
    { billedY: 67, cardY: 91, cardH: 21, tableY: 121, base: 10, lh: 4.1, df: 8.5, ts: 10 },
    { billedY: 65, cardY: 86, cardH: 19, tableY: 112, base: 9, lh: 3.7, df: 8, ts: 10 },
    { billedY: 64, cardY: 83, cardH: 17, tableY: 106, base: 8, lh: 3.4, df: 7.6, ts: 9.5 },
  ];
  const wrapDetail = (d: string, df: number): string[] => {
    if (!d) return [];
    setF("helvetica", "normal");
    doc.setFontSize(df);
    return doc.splitTextToSize(fonts ? d.replaceAll("->", "\u2192") : d, 96) as string[];
  };
  const totalsH = 25 + (inv.taxPercent > 0 ? 6 : 0) + (cur !== "USD" && inv.status !== "paid" ? 6 : 0);
  const needs = (lv: (typeof LEVELS)[number]) =>
    lv.tableY + 10 + inv.lines.reduce((sum, l) => sum + lv.base + wrapDetail((l.details ?? "").trim(), lv.df).length * lv.lh, 0) + Math.max(totalsH, inv.status === "paid" ? 46 : 0) + 22;
  const LV = LEVELS.find((lv) => needs(lv) <= H - 20) ?? LEVELS[2];

  // ---- Bill to / From / Amount ----------------------------------------------------------------
  let y = LV.billedY;
  text("BILLED TO", L, y, { size: 7, bold: true, color: GOLD, spacing: 1.4 });
  text(client.name || client.email, L, y + 7, { size: 13, font: "times", bold: true });
  let by = y + 12.5;
  if (client.name) {
    text(client.email, L, by, { color: SOFT });
    by += 5;
  }
  if (client.phone) text(client.phone, L, by, { color: SOFT });

  text("FROM", 100, y, { size: 7, bold: true, color: GOLD, spacing: 1.4 });
  text("World Bridge Meridian", 100, y + 7, { size: 13, font: "times", bold: true });
  text(EMAIL, 100, y + 12.5, { color: SOFT });
  text(`${PHONE}  ·  ${SITE}`, 100, y + 17.5, { color: SOFT });

  // Amount card
  y = LV.cardY;
  const ch = LV.cardH;
  fill(SAND);
  doc.roundedRect(L, y, R - L, ch, 3, 3, "F");
  fill(GOLD);
  doc.roundedRect(L, y, 2.2, ch, 1.1, 1.1, "F");
  text(inv.status === "paid" ? "AMOUNT PAID" : "AMOUNT DUE", L + 9, y + ch * 0.36, { size: 7, bold: true, color: GOLD, spacing: 1.4 });
  text(fmt(inv.total, cur), L + 9, y + ch * 0.8, { size: 18, bold: true });
  if (inv.status === "paid") {
    const chipW = 22;
    fill(GREEN);
    doc.roundedRect(R - chipW - 7, y + (ch - 9) / 2, chipW, 9, 4.5, 4.5, "F");
    text("PAID", R - 7 - chipW / 2, y + (ch - 9) / 2 + 5.9, { size: 7.5, bold: true, color: WHITE, align: "center" });
  } else {
    if (inv.dueDate) text(`·  due ${day(inv.dueDate)}`, L + 9 + 40, y + ch * 0.36, { size: 7.5, color: SOFT });
    const bx = R - 54;
    const by0 = y + (ch - 12) / 2;
    fill(FOREST);
    doc.roundedRect(bx, by0, 47, 12, 6, 6, "F");
    text("Pay invoice", bx + 23.5, by0 + 7.6, { size: 9, bold: true, color: CREAM, align: "center", spacing: 0.4 });
    doc.link(bx, by0, 47, 12, { url: `https://${SITE}/my-world-bridge#invoices` });
  }

  // ---- Line items ------------------------------------------------------------------------------
  y = LV.tableY;
  const colQty = 128;
  const colPrice = 163;
  const colAmount = R - 5;
  const tableHead = (at: number) => {
    fill(FOREST);
    doc.roundedRect(L, at, R - L, 10, 2, 2, "F");
    text("DESCRIPTION", L + 5, at + 6.4, { size: 7, bold: true, color: CREAM, spacing: 1 });
    text("QTY", colQty, at + 6.4, { size: 7, bold: true, color: CREAM, align: "center" });
    text(`PRICE`, colPrice, at + 6.4, { size: 7, bold: true, color: CREAM, align: "right" });
    text(`AMOUNT`, colAmount, at + 6.4, { size: 7, bold: true, color: CREAM, align: "right" });
  };
  tableHead(y);
  y += 10;

  inv.lines.forEach((l, idx) => {
    const detail = (l.details ?? "").trim();
    const detailLines = wrapDetail(detail, LV.df);
    const h = LV.base + detailLines.length * LV.lh;
    if (y + h > H - 24) {
      footer();
      doc.addPage();
      slimHeader();
      watermark();
      y = 28;
      tableHead(y);
      y += 10;
    }
    if (idx % 2 === 1) {
      fill(CREAM);
      doc.rect(L, y, R - L, h, "F");
    }
    text(l.title, L + 5, y + LV.base * 0.7, { size: LV.ts, bold: true });
    detailLines.forEach((ln, i) => text(ln, L + 5, y + LV.base * 0.7 + 4.4 + i * LV.lh, { size: LV.df, color: SOFT }));
    text(String(l.qty), colQty, y + LV.base * 0.7, { align: "center" });
    text(fmt(l.unit_price, cur), colPrice, y + LV.base * 0.7, { align: "right", color: SOFT });
    text(fmt(l.amount ?? l.qty * l.unit_price, cur), colAmount, y + LV.base * 0.7, { align: "right", bold: true });
    y += h;
    stroke(LINE, 0.2);
    doc.line(L, y, R, y);
  });

  // ---- Totals ----------------------------------------------------------------------------------
  if (y > H - 62) {
    footer();
    doc.addPage();
    slimHeader();
    watermark();
    y = 28;
  }
  const tableEnd = y;
  y += 7;
  const tl = 124;
  text("Subtotal", tl, y, { color: SOFT });
  text(fmt(inv.subtotal, cur), colAmount, y, { align: "right" });
  if (inv.taxPercent > 0) {
    y += 6;
    text(`Tax (${inv.taxPercent}%)`, tl, y, { color: SOFT });
    text(fmt(inv.total - inv.subtotal, cur), colAmount, y, { align: "right" });
  }
  y += 5;
  fill(FOREST);
  doc.roundedRect(tl - 5, y, R - tl + 5, 13, 2.5, 2.5, "F");
  text("TOTAL", tl, y + 8.4, { size: 8, bold: true, color: GOLD_LIGHT, spacing: 1.4 });
  text(fmt(inv.total, cur), colAmount, y + 8.9, { size: 12.5, bold: true, color: CREAM, align: "right" });
  y += 13;
  if (cur !== "USD" && inv.status !== "paid") {
    text(`Card and crypto payments are converted to US dollars at the live rate when you pay (about ${fmt(inv.amountUsd, "USD")} today).`, colAmount, y + 6, { size: 7.5, color: SOFT, align: "right" });
    y += 6;
  }

  if (inv.status === "paid") {
    // The seal sits to the left of the totals, so the whole receipt stays on one page.
    let top = tableEnd;
    if (top + 46 > H - 24) {
      footer();
      doc.addPage();
      slimHeader();
      watermark();
      top = 30;
      y = 30;
    }
    officialStamp(52, top + 24, 22, inv.paidAt ? new Date(inv.paidAt) : new Date());
    y = Math.max(y, top + 46);
  }

  // ---- Closing lines -----------------------------------------------------------------------------
  y += 8;
  if (y > H - 30) {
    footer();
    doc.addPage();
    slimHeader();
    watermark();
    y = 32;
  }
  if (inv.status !== "paid") {
    text("Pay securely online with a card or crypto: sign in at " + SITE + ", open My account, then Invoices.", W / 2, y, { size: 8.5, color: SOFT, align: "center" });
    y += 8;
  } else {
    text("Thank you. This invoice has been paid in full; this is your official receipt.", W / 2, y, { size: 11, font: "times", italic: true, color: GREEN, align: "center" });
    y += 8;
  }
  if (y < H - 20) text("Thank you for travelling with us.", W / 2, y, { size: 12, font: "times", italic: true, color: GOLD, align: "center" });

  // ---- Footer and page numbers --------------------------------------------------------------
  footer();
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    text(`${inv.reference}  ·  Page ${p} of ${pages}`, R, H - 18, { size: 7.5, color: SOFT, align: "right" });
  }

  return doc.output("blob");
}

/** Loads the site emblem as a PNG data URL for the PDF header. Returns null if it can't be fetched. */
export async function loadEmblem(): Promise<string | null> {
  try {
    const res = await fetch("/images/brand/emblem.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(typeof r.result === "string" ? r.result : null);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
