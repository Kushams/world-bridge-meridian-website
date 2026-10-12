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
  /** One entry per bank detail row, already labelled. Empty = bank transfer isn't offered on this invoice. */
  bankLines: { label: string; value: string }[];
}

export interface PdfClient {
  name: string | null;
  email: string;
  phone: string | null;
}

const SYMBOL = { USD: "US$", EUR: "€", GBP: "£" } as const;
const fmt = (n: number, c: keyof typeof SYMBOL) => `${SYMBOL[c]}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const INK: [number, number, number] = [33, 31, 26];
const SOFT: [number, number, number] = [110, 101, 82];
const GOLD: [number, number, number] = [166, 118, 59];
const CREAM: [number, number, number] = [245, 239, 226];
const LINE: [number, number, number] = [221, 212, 192];

const SITE = "worldbridgemeridian.com";
const EMAIL = "info@worldbridgemeridian.group";
const PHONE = "+1 (302) 627-3325";

/** A World Bridge Meridian branded invoice as a PDF (A4). `emblem` is a PNG data URL for the logo; omit to leave it out. */
export async function buildInvoicePdf(inv: PdfInvoice, client: PdfClient, emblem?: string | null): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const L = 15;
  const R = W - 15;
  const cur = inv.currency;

  const text = (s: string, x: number, y: number, o: { size?: number; bold?: boolean; color?: [number, number, number]; align?: "left" | "right" | "center"; spacing?: number } = {}) => {
    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setFontSize(o.size ?? 9);
    doc.setTextColor(...(o.color ?? INK));
    doc.text(s, x, y, { align: o.align ?? "left", charSpace: o.spacing ?? 0 });
  };

  const header = () => {
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, W, 3, "F");
    if (emblem) doc.addImage(emblem, "PNG", L, 11, 14, 12.6);
    text("WORLD BRIDGE MERIDIAN", emblem ? L + 18 : L, 17.5, { size: 13, color: INK, spacing: 0.4 });
    text("BESPOKE TRAVEL GROUP", emblem ? L + 18 : L, 22.5, { size: 6.5, color: GOLD, spacing: 1.4 });
  };
  header();

  text("INVOICE", R, 18, { size: 20, bold: true, align: "right" });
  text(`#${inv.reference}`, R, 24, { size: 9, color: SOFT, align: "right" });
  text(inv.dueDate ? `Due ${day(inv.dueDate)}` : "Due upon receipt", R, 28.5, { size: 9, color: SOFT, align: "right" });
  text(`Issued ${day(inv.createdAt)}`, R, 33, { size: 9, color: SOFT, align: "right" });

  // From / Bill to
  let y = 48;
  text("FROM", L, y, { size: 7, bold: true, color: SOFT, spacing: 0.8 });
  text("World Bridge Meridian", L, y + 6, { size: 11, bold: true });
  text("Bespoke Travel Group", L, y + 11, { color: SOFT });
  text(EMAIL, L, y + 16, { color: SOFT });
  text(PHONE, L, y + 21, { color: SOFT });
  text(SITE, L, y + 26, { color: SOFT });

  text("BILL TO", 112, y, { size: 7, bold: true, color: SOFT, spacing: 0.8 });
  text(client.name || client.email, 112, y + 6, { size: 11, bold: true });
  let by = y + 11;
  if (client.name) {
    text(client.email, 112, by, { color: SOFT });
    by += 5;
  }
  if (client.phone) text(client.phone, 112, by, { color: SOFT });

  // Table
  y = 86;
  const colQty = 130;
  const colPrice = 166;
  const colAmount = R - 2;
  const tableHead = (at: number) => {
    doc.setFillColor(...CREAM);
    doc.rect(L, at, R - L, 9, "F");
    text("Description", L + 3, at + 6, { size: 8, bold: true });
    text("QTY", colQty, at + 6, { size: 8, bold: true, align: "center" });
    text(`Price, ${cur}`, colPrice, at + 6, { size: 8, bold: true, align: "right" });
    text(`Amount, ${cur}`, colAmount, at + 6, { size: 8, bold: true, align: "right" });
  };
  tableHead(y);
  y += 9;

  for (const l of inv.lines) {
    const detail = (l.details ?? "").trim();
    const detailLines = detail ? (doc.setFontSize(8.5), doc.splitTextToSize(detail, 100) as string[]) : [];
    const h = 8 + detailLines.length * 4;
    if (y + h > 250) {
      doc.addPage();
      header();
      y = 40;
      tableHead(y);
      y += 9;
    }
    text(l.title, L + 3, y + 6, { size: 9.5, bold: true });
    detailLines.forEach((ln, i) => text(ln, L + 3, y + 10.5 + i * 4, { size: 8.5, color: SOFT }));
    text(String(l.qty), colQty, y + 6, { align: "center" });
    text(fmt(l.unit_price, cur), colPrice, y + 6, { align: "right" });
    text(fmt(l.amount ?? l.qty * l.unit_price, cur), colAmount, y + 6, { align: "right" });
    y += h;
    doc.setDrawColor(...LINE);
    doc.line(L, y, R, y);
  }

  // Totals
  if (y > 235) {
    doc.addPage();
    header();
    y = 40;
  }
  y += 8;
  const tl = 140;
  text("Subtotal", tl, y, { color: SOFT });
  text(fmt(inv.subtotal, cur), colAmount, y, { align: "right" });
  if (inv.taxPercent > 0) {
    y += 6;
    text(`Tax ${inv.taxPercent}%`, tl, y, { color: SOFT });
    text(fmt(inv.total - inv.subtotal, cur), colAmount, y, { align: "right" });
  }
  y += 8;
  doc.setFillColor(...CREAM);
  doc.rect(tl - 4, y - 6, R - tl + 4, 10, "F");
  text("Total", tl, y + 0.5, { size: 11, bold: true });
  text(fmt(inv.total, cur), colAmount, y + 0.5, { size: 11, bold: true, align: "right" });
  if (cur !== "USD") {
    y += 8;
    text(`Pay by card or crypto: ${fmt(inv.amountUsd, "USD")} (1 ${cur} = ${inv.fxRate.toFixed(4)} USD)`, colAmount, y, { size: 7.5, color: SOFT, align: "right" });
  }

  if (inv.status === "paid") {
    doc.setTextColor(30, 140, 90);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(34);
    doc.text("PAID", 60, y - 4, { angle: 14 });
    if (inv.paidAt) text(day(inv.paidAt), 62, y + 4, { size: 9, color: [30, 140, 90] });
  }

  // How to pay
  y += 14;
  if (y > 225) {
    doc.addPage();
    header();
    y = 40;
  }
  text("HOW TO PAY", L, y, { size: 7, bold: true, color: SOFT, spacing: 0.8 });
  y += 6;
  text("Online, by card or crypto", L, y, { size: 9.5, bold: true });
  y += 5;
  text(`Sign in at ${SITE}, open My account > Invoices and choose “Pay by card or crypto”.`, L, y, { color: SOFT });
  if (inv.bankLines.length) {
    y += 9;
    text("By bank transfer", L, y, { size: 9.5, bold: true });
    y += 5;
    for (const b of inv.bankLines) {
      if (y > 262) {
        doc.addPage();
        header();
        y = 40;
      }
      text(b.label ? `${b.label}: ${b.value}` : b.value, L, y);
      y += 5;
    }
    text(`Please use ${inv.reference} as the payment reference.`, L, y + 1, { size: 8.5, color: SOFT });
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...GOLD);
    doc.line(L, 280, R, 280);
    text(`World Bridge Meridian  ·  Bespoke Travel Group  ·  ${EMAIL}  ·  ${SITE}`, L, 285, { size: 7.5, color: SOFT });
    text(`${inv.reference}   ${p} of ${pages}`, R, 285, { size: 7.5, color: SOFT, align: "right" });
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
