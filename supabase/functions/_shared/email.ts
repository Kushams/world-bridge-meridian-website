// Shared look for every email we send: the emblem and wordmark at the top,
// the site's Montserrat (Helvetica/Arial where web fonts don't load, e.g.
// Gmail), and a signature block. Tables + inline styles only, so Gmail,
// Outlook and Apple Mail all render it the same.
export const FONT = "Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif";
const SITE = "https://worldbridgemeridian.com";
const EMBLEM = `${SITE}/images/brand/emblem.png`;
const GOLD = "#a8813f";

export interface Signature {
  name: string;
  title: string;
  email: string;
}

export const TEAM_SIGNATURE: Signature = {
  name: "Client Services",
  title: "World Bridge Meridian",
  email: "info@worldbridgemeridian.group",
};

const TITLES: Record<string, string> = {
  "earla668@gmail.com": "Founder & Chief Executive Officer",
  "info@worldbridgemeridian.group": "Client Services",
};

/** Signature for a staff member, from their staff_members row. */
export function staffSignature(row: { email: string; name: string | null; role: string } | undefined): Signature {
  if (!row) return TEAM_SIGNATURE;
  return {
    name: row.name || TEAM_SIGNATURE.name,
    title: TITLES[row.email] ?? (row.role === "admin" ? "Client Services" : "Travel Coordinating Officer"),
    email: row.email,
  };
}

const escape = (v: string) =>
  v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** Logo lockup as on the site: emblem, wordmark, gold diamond rule, BESPOKE TRAVEL GROUP. */
function lockup(scale: 1 | 0.7) {
  const px = (n: number) => `${Math.round(n * scale)}px`;
  const line = `<td width="${px(56)}" valign="middle"><div style="height:1px;line-height:1px;font-size:1px;background:${GOLD}">&nbsp;</div></td>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
<td valign="middle" style="padding:0 ${px(16)} 0 0"><img src="${EMBLEM}" width="${px(64)}" alt="World Bridge Meridian" style="display:block;border:0;width:${px(64)};height:auto"></td>
<td valign="middle" style="font-family:${FONT};color:#1c1c1c">
<div style="font-size:${px(20)};font-weight:500;letter-spacing:1px;line-height:1.2;text-transform:uppercase">World Bridge Meridian</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:${px(10)} 0"><tr>${line}
<td style="padding:0 ${px(8)};font-size:${px(9)};line-height:1;color:${GOLD}">&#9670;</td>${line}</tr></table>
<div style="font-size:${px(12)};font-weight:600;letter-spacing:${px(3)};line-height:1.2;text-transform:uppercase;color:${GOLD}">Bespoke Travel Group</div>
</td></tr></table>`;
}

function signatureBlock(s: Signature) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #e8e1d3;width:100%"><tr>
<td style="padding:20px 0 0;font-family:${FONT};color:#1c1c1c">
<div style="font-size:15px;font-weight:600;line-height:1.4">${escape(s.name)}</div>
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${GOLD};line-height:1.6;margin:2px 0 16px">${escape(s.title)}</div>
${lockup(0.7)}
<div style="font-size:12px;line-height:1.7;color:#55504a;margin-top:14px"><a href="mailto:${escape(s.email)}" style="color:#55504a;text-decoration:none">${escape(s.email)}</a> &nbsp;·&nbsp; <a href="${SITE}" style="color:${GOLD};text-decoration:none">worldbridgemeridian.com</a></div>
</td></tr></table>`;
}

export function layout(inner: string, signature: Signature = TEAM_SIGNATURE): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#f4f1ea">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea"><tr><td align="center" style="padding:24px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e8e1d3">
<tr><td align="center" style="padding:26px 16px;background:#f1e9d8">${lockup(1)}</td></tr>
<tr><td style="padding:28px 28px;font-family:${FONT};font-size:15px;line-height:1.7;color:#2a2a2a">${inner}${signatureBlock(signature)}</td></tr>
<tr><td style="padding:16px 24px 22px;background:#1c1c1c;text-align:center;font-family:${FONT};font-size:11px;letter-spacing:1px;line-height:1.7;color:#cfc8ba">
BESPOKE TRAVEL GROUP &nbsp;·&nbsp; <a href="${SITE}" style="color:#d9bd7c;text-decoration:none">WORLDBRIDGEMERIDIAN.COM</a></td></tr>
</table></td></tr></table></body></html>`;
}
