// Loads the receipt builders for tests. The site's source imports files without ".ts", which plain Node can't resolve,
// so copy them to a temp folder with the extensions added (the code itself is unchanged).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wbm-pdf-"));
for (const f of ["invoicePdf", "orderReceiptPdf", "pdfStamp", "money"]) {
  const src = fs.readFileSync(path.join(root, "src/lib", f + ".ts"), "utf8").replace(/from "(\.\/[A-Za-z]+)"/g, 'from "$1.ts"');
  fs.writeFileSync(path.join(dir, f + ".ts"), src);
}
// jspdf must resolve from the copies too
fs.symlinkSync(path.join(root, "node_modules"), path.join(dir, "node_modules"), "dir");

export const { buildInvoicePdf } = await import(pathToFileURL(path.join(dir, "invoicePdf.ts")).href);
export const { buildOrderReceiptPdf } = await import(pathToFileURL(path.join(dir, "orderReceiptPdf.ts")).href);

const F = path.join(root, "public/fonts/pdf");
const b64 = (n) => fs.readFileSync(path.join(F, n + ".ttf")).toString("base64");
/** The real Montserrat files the site uses, or null to make the PDF use built-in fonts (whose text can be read back). */
export const realFonts = () => ({ mont: b64("Montserrat-Regular"), montBold: b64("Montserrat-SemiBold"), montItalic: b64("Montserrat-Italic") });
export const emblem = "data:image/png;base64," + fs.readFileSync(path.join(root, "public/images/brand/emblem.png")).toString("base64");

/** Reads a finished PDF: how many pages it has, and its text (only readable for PDFs made with the built-in fonts). */
export async function readPdf(blob) {
  const buf = Buffer.from(await blob.arrayBuffer());
  const raw = buf.toString("latin1");
  const pages = (raw.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
  let text = raw;
  for (const m of raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    try {
      text += "\n" + zlib.inflateSync(Buffer.from(m[1], "latin1")).toString("latin1");
    } catch {
      // not a compressed stream
    }
  }
  const shown = [...text.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)].map((m) => m[1].replace(/\\(.)/g, "$1"));
  return { pages, text: shown.join(" ").replace(/\x80/g, "€"), size: buf.length };
}
