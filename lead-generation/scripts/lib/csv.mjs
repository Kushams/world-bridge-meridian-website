// Minimal RFC 4180 CSV reader/writer (no dependencies).

/** Parse CSV text into an array of rows (arrays of strings). Handles quotes, CRLF and a UTF-8 BOM. */
export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (inQuotes) throw new Error("CSV parse error: unterminated quoted field");
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** Parse CSV text into { header, records } where records are plain objects keyed by header. */
export function parseCsvRecords(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return { header: [], records: [] };
  const [header, ...body] = rows;
  const records = body.map((r, idx) => {
    if (r.length > header.length) {
      throw new Error(`CSV row ${idx + 2} has ${r.length} fields but the header has ${header.length}`);
    }
    const rec = {};
    header.forEach((h, i) => {
      rec[h] = r[i] ?? "";
    });
    return rec;
  });
  return { header, records };
}

/**
 * Neutralise spreadsheet formula injection for Excel / Google Sheets exports.
 * Plain phone numbers such as "+1 212 555 0100" are left untouched.
 */
export function sanitizeForSpreadsheet(value) {
  if (!value) return value;
  if (/^[=@\t\r]/.test(value)) return `'${value}`;
  if (/^[+-]/.test(value) && !/^[+-][\d\s().-]+$/.test(value)) return `'${value}`;
  return value;
}

function escapeField(value) {
  const s = value == null ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialise records to CSV text with the given header, in header order. */
export function stringifyCsv(header, records, { sanitize = false, bom = false } = {}) {
  const lines = [header.map(escapeField).join(",")];
  for (const rec of records) {
    lines.push(
      header
        .map((h) => {
          const v = rec[h] ?? "";
          return escapeField(sanitize ? sanitizeForSpreadsheet(String(v)) : v);
        })
        .join(","),
    );
  }
  return (bom ? "﻿" : "") + lines.join("\n") + "\n";
}
