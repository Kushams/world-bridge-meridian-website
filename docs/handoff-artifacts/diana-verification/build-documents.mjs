import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Builds the two PDFs sent to Diana from the HTML below, using Playwright's Chromium.
// Run from anywhere:  node docs/handoff-artifacts/diana-verification/build-documents.mjs
// Env: PLAYWRIGHT_MODULES = folder holding node_modules/playwright (default /opt/node-tools/node_modules/),
//      CHROMIUM_PATH = chrome executable (optional; Playwright's own is used if unset).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(HERE, "../../../public");
const require = createRequire(process.env.PLAYWRIGHT_MODULES ?? "/opt/node-tools/node_modules/");
const { chromium } = require("playwright");
const emblem = "data:image/png;base64," + fs.readFileSync(`${PUB}/images/brand/emblem.png`).toString("base64");
const font = (n, w, s = "normal") => `@font-face{font-family:Montserrat;font-weight:${w};font-style:${s};src:url("file://${PUB}/fonts/pdf/${n}.ttf")}`;
const ph = (t) => `<span class="ph">[${t}]</span>`;

const css = `${font("Montserrat-Regular", 400)}${font("Montserrat-SemiBold", 600)}${font("Montserrat-Italic", 400, "italic")}
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:Montserrat,Helvetica,Arial,sans-serif;color:#211f1a;font-size:9.4pt;line-height:1.5}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always}
.page:last-child{page-break-after:auto}
.head{background:#1b2a20;height:30mm;padding:0 16mm;color:#faf6ec;position:relative;border-bottom:1.1mm solid #a6763b}
.head img{height:12.5mm;position:absolute;left:16mm;top:5mm}
.brand{position:absolute;left:34mm;top:6.2mm;font-size:12.5pt;letter-spacing:1px}
.brand small{display:block;font-size:6.5pt;letter-spacing:2px;color:#d9ab63;margin-top:1.2mm}
.title{position:absolute;left:16mm;bottom:3.4mm;font-weight:600;font-size:11pt;letter-spacing:1.2px;text-transform:uppercase}
.conf{position:absolute;right:16mm;bottom:3.6mm;font-style:italic;font-size:7.5pt;color:#d9ab63}
.body{padding:7mm 16mm 0}
h2{font-size:8pt;letter-spacing:1.1px;text-transform:uppercase;margin:5.2mm 0 1.6mm;padding-bottom:1.2mm;border-bottom:.35mm solid #a6763b}
h2 span{color:#a6763b;margin-right:2mm}
p{margin:0 0 2mm}
table{width:100%;border-collapse:collapse;margin:1mm 0 2mm;font-size:8.6pt}
th{font-size:6.4pt;letter-spacing:.8px;text-transform:uppercase;color:#a6763b;text-align:left;padding:1.2mm 2mm 1.2mm 0;border-bottom:.25mm solid #c8bca0}
td{vertical-align:top;padding:1.4mm 2mm 1.4mm 0;border-bottom:.2mm solid #e6dec8}
ul{margin:0 0 2mm;padding-left:4.5mm}li{margin:0 0 1mm}
.ph{background:#fff0a8;padding:0 1mm;border-radius:.6mm}
.foot{position:absolute;left:0;right:0;bottom:0;height:12mm;background:#1b2a20;border-top:.7mm solid #a6763b;color:#faf6ec;font-size:7pt;letter-spacing:.3px;padding:4.2mm 16mm 0;display:flex;justify-content:space-between;gap:6mm;font-size:6.6pt;white-space:nowrap}
.foot b{font-weight:400;color:#d9ab63}
.note{font-size:7.6pt;color:#6e6552;font-style:italic}
.box{border:.3mm dashed #a6763b;padding:4mm 5mm;margin:0 0 5mm;color:#6e6552;font-size:8.4pt}
`;
const head = (t, c = "Strictly confidential") => `<div class="head"><img src="${emblem}"><div class="brand">WORLD BRIDGE MERIDIAN<small>BESPOKE TRAVEL GROUP</small></div><div class="title">${t}</div><div class="conf">${c}</div></div>`;
const foot = `<div class="foot"><span>World Bridge Meridian &nbsp;·&nbsp; a branch of World Bridge Global Consulting LLC</span><b>info@worldbridgemeridian.group &nbsp;·&nbsp; worldbridgemeridian.com</b></div>`;

const data = `<html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="page">${head("Data Protection &amp; Passport Handling Statement", "Version 15 October 2026")}
<div class="body">
<p>This statement explains how World Bridge Meridian handles the personal data travellers give us, passports in particular. It is written for travellers, and for the organisations that appoint us.</p>

<h2><span>01</span>Who is responsible (data controller)</h2>
<p>World Bridge Meridian is a branch of <b>World Bridge Global Consulting LLC</b>, an Illinois limited liability company (Illinois file number 65372891). It is the controller of the personal data you give us. Registered office: 55 Mid-Continental Plaza Bldg, 17 E Monroe St, Chicago, IL 60603, United States. Legal representative: Earl Anderson, Founder &amp; Chief Executive Officer. <b>Privacy contact:</b> info@worldbridgemeridian.group (please write &ldquo;Privacy&rdquo; in the subject line).</p>

<h2><span>02</span>What we ask for, and why</h2>
<table><tr><th style="width:44%">What</th><th>Why we need it</th></tr>
<tr><td>Full name, date of birth, nationality, passport number and expiry date; a photo of the passport page (optional to upload)</td><td>To book flights and accommodation in the name on your passport and, where needed, to support an entry permit such as the UK ETA.</td></tr>
<tr><td>Phone, email, emergency contact</td><td>To reach you, and to look after you if something goes wrong while you travel.</td></tr>
<tr><td>Dietary needs, allergies, room preferences</td><td>To arrange your stay and meals properly.</td></tr>
<tr><td>Details of people travelling with you</td><td>The same purposes, for each companion, with their knowledge.</td></tr></table>
<p>Our travel form does not ask for your card or bank details. Card payments for invoices are made on the payment provider&rsquo;s own secure page; we never see or store card numbers.</p>

<h2><span>03</span>Where it is stored</h2>
<ul><li>Our platform and its data are hosted in the <b>European Union (Ireland)</b>.</li>
<li>Passport photos are kept in <b>private file storage</b>. They are never public, and they open only through short-lived private links (valid for one hour).</li>
<li>Passport numbers are stored with your travel form and your signed travel authorisation. They are never copied into your account profile.</li></ul>

<h2><span>04</span>Who can see it</h2>
<ul><li>You can see your own information. Inside World Bridge Meridian, only the travel coordinator looking after your trip and our management team can see your passport details. This is enforced by the database itself (row-level access rules), not only by the screens staff use.</li>
<li>Airlines, hotels and other suppliers receive only what they need to make your booking.</li>
<li>We never send passport copies by email. When you upload a file, our team is told by notification, but the file stays in private storage and staff open it only after signing in to our secure staff site. Passport numbers are partly hidden in our internal notifications.</li>
<li>We do not sell personal data, and we do not use it for unrelated marketing.</li></ul>
</div>${foot}</div>

<div class="page">${head("Data Protection &amp; Passport Handling Statement", "Page 2")}
<div class="body">
<h2><span>05</span>How long we keep it</h2>
<table><tr><th style="width:44%">What</th><th>How long</th></tr>
<tr><td>Passport photo and passport number</td><td>Permanently deleted 14 days after your trip has been confirmed, or sooner if you ask.</td></tr>
<tr><td>Other travel details (emergency contact, preferences, companions)</td><td>Deleted ${ph("12 months")} after your last trip ends, or sooner if you ask.</td></tr>
<tr><td>Invoices, receipts and payment records</td><td>Kept only for the period tax and accounting law require.</td></tr></table>

<h2><span>06</span>Your rights</h2>
<p>You may ask us for a copy of your data, to correct it, to delete it, to restrict or object to how we use it, or to receive it in a portable form. Email info@worldbridgemeridian.group and we will reply within 30 days. To delete everything, ask us to erase your travel forms and uploaded files as well as your account, and we will confirm when it is done. You also have the right to complain to your local data protection authority.</p>

<h2><span>07</span>Transfers outside the EU</h2>
<p>Your data is stored in the EU, but our team works from the United States and may access it from there. We limit that access to named staff and protect the data as described in section 08.</p>

<h2><span>08</span>Security</h2>
<ul><li>Access is limited to named staff and checked by the database on every request.</li>
<li>Files are private, and links to them expire.</li>
<li>Signed forms are stored with a fingerprint (SHA-256) of the exact document, so any later change can be detected.</li>
<li>We tell affected travellers without delay if a breach puts their data at risk.</li></ul>

<h2><span>09</span>Changes</h2>
<p>If this statement changes, we update the version date above and tell travellers who have an open trip with us.</p>
</div>${foot}</div></body></html>`;

const letter = `<html><head><meta charset="utf-8"><style>${css}.l p{margin:0 0 4mm;font-size:10pt;line-height:1.6}.sig{margin-top:14mm;display:flex;gap:16mm}.sig div{flex:1;border-top:.3mm solid #8a8168;padding-top:1.6mm;font-size:8pt;color:#6e6552}</style></head><body>
<div class="page"><div class="body l" style="padding-top:12mm">
<div class="box">TEMPLATE for Pace Gallery to complete and send on its own letterhead. It is a confirmation Pace issues, so only a Pace employee who is authorised to appoint us should sign it. Remove this box before sending.</div>
<p style="color:#6e6552">${ph("Pace Gallery letterhead")}</p>
<p>${ph("date")}</p>
<p>${ph("Diana's full name and organisation")}<br>Sent by email, with a copy to World Bridge Meridian</p>
<p style="font-weight:600;font-size:11pt;letter-spacing:.5px;margin-top:8mm">Confirmation of travel partner appointment</p>
<p>To whom it may concern,</p>
<p>Pace Gallery confirms that <b>World Bridge Meridian</b>, a branch of World Bridge Global Consulting LLC, an Illinois limited liability company, has been appointed by Pace Gallery as its travel partner for participants in <i>Kylie Manning: The Mudlarkers</i> at Pace Gallery London (13 October &ndash; 14 November 2026).</p>
<p>World Bridge Meridian has been asked to arrange, on behalf of participants, their flights, accommodation, ground transport and related travel services, and to collect the travel and identity details needed to do so.</p>
<p>This appointment was authorised by ${ph("name and job title")} at Pace Gallery on ${ph("date")}. Participants may confirm this letter with the undersigned at ${ph("name@pacegallery.com")}.</p>
<p>Yours faithfully,</p>
<div class="sig"><div>Signature</div><div>Name and job title</div><div>Date</div></div>
</div>${foot}</div></body></html>`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [name, html] of [["WBM_Data_Protection_and_Passport_Handling_Statement", data], ["Pace_Appointment_Confirmation_Letter_TEMPLATE", letter]]) {
  fs.writeFileSync(path.join(HERE, `${name}.html`), html);
  const page = await browser.newPage();
  await page.goto("file://" + path.join(HERE, `${name}.html`), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.pdf({ path: path.join(HERE, `${name}.pdf`), format: "A4", printBackground: true, preferCSSPageSize: true });
  await page.close();
}
await browser.close();
