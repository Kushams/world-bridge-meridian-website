// Shared look for every email we send: the site's Montserrat (Helvetica/Arial
// where web fonts aren't loaded, e.g. Gmail), a wordmark header and a footer.
export const FONT = "Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif";

export function layout(inner: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#f4f1ea">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e8e1d3">
<tr><td style="padding:26px 32px 18px;text-align:center;font-family:${FONT};font-size:13px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#1c1c1c">World Bridge Meridian
<div style="width:44px;height:1px;background:#b8964e;margin:14px auto 0;font-size:0;line-height:0">&nbsp;</div></td></tr>
<tr><td style="padding:12px 32px 28px;font-family:${FONT};font-size:15px;line-height:1.7;color:#2a2a2a">${inner}</td></tr>
<tr><td style="padding:18px 32px 24px;border-top:1px solid #e8e1d3;text-align:center;font-family:${FONT};font-size:12px;line-height:1.6;color:#8a8478">
Bespoke luxury travel · <a href="https://worldbridgemeridian.com" style="color:#b8964e;text-decoration:none">worldbridgemeridian.com</a></td></tr>
</table></td></tr></table></body></html>`;
}
