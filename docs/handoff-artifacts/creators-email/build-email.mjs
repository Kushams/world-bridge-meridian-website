// Builds the standalone "Plan your trip" email sent to Pace Gallery creators for
// "Kylie Manning: The Mudlarkers" (Pace Gallery London). It is NOT part of the site: the HTML file is
// attached to a normal email by hand. It uses the site's automatic-email template (layout/FONT from
// supabase/functions/_shared/email.ts) so it looks like every other WBM email.
//
// NOTE (2026-11-08): the original builder lived in a scratch folder that was lost. This file was
// reconstructed from the email text that had been delivered and approved, and matches its wording, links
// and structure; pixel-level details of the inner blocks may differ slightly from the original.
//
// Owner's rules for this email: never name Ravi in the text (his personal link `?from=ravi` appears ONLY
// inside the two buttons, so people who click are attributed to him); no Pace website links; do not tell
// creators to choose dates or mention departure/return dates; "Client Services" signature; WhatsApp line is
// the general Client Services number (+1 302 627 3325), not Ravi's.
//
// Run:  node docs/handoff-artifacts/creators-email/build-email.mjs   (Node 22+, reads .ts directly)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { layout, FONT } from "../../../supabase/functions/_shared/email.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const L = "https://worldbridgemeridian.com/exhibitions/kylie-manning-the-mudlarkers-pace-london?from=ravi";
const WHATSAPP =
  "https://wa.me/13026273325?text=" +
  encodeURIComponent("Hello World Bridge Meridian, my name is [your name]. I am travelling for The Mudlarkers at Pace Gallery London and need help with [your question].");

const H3 = `style="margin:28px 0 8px;font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a8813f"`;
const button = (text) =>
  `<p style="margin:18px 0 6px"><a href="${L}" style="background:#1c1c1c;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:${FONT};font-size:13px;letter-spacing:.05em;text-transform:uppercase">${text}</a></p>`;
const card = (title, body) =>
  `<div style="margin:22px 0;padding:14px 18px;border-left:3px solid #b8964e;background:#f7f4ee"><p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#1c1c1c">${title}</p>${body}</div>`;
const step = (n, title, body) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 4px"><tr>
<td valign="top" width="44" style="padding:14px 0 0"><div style="width:30px;height:30px;line-height:28px;text-align:center;border:1px solid #a8813f;border-radius:50%;color:#a8813f;font-size:13px;font-weight:500;font-family:${FONT}">${n}</div></td>
<td valign="top" style="padding:14px 0 14px;border-top:1px solid #e8e1d3"><p style="margin:0 0 4px;font-size:16px;font-weight:500;color:#1c1c1c">${title}</p>${body}</td></tr></table>`;
const p = (t, extra = "") => `<p style="margin:0 0 8px;font-size:14px;color:#333;${extra}">${t}</p>`;
const note = (t) => `<p style="margin:8px 0 0;font-size:12.5px;color:#6e6552">${t}</p>`;
const list = (items, tag = "ul") =>
  `<${tag} style="margin:0 0 8px;padding-left:18px;font-size:14px;line-height:1.7;color:#333">${items.map((i) => `<li>${i}</li>`).join("\n")}</${tag}>`;

const inner = `
<p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a8813f">Pace Gallery London &nbsp;&middot;&nbsp; Planning your trip</p>
<p style="margin:0;font-size:26px;font-weight:300;line-height:1.25;color:#1c1c1c">Kylie Manning</p>
<p style="margin:2px 0 6px;font-size:17px;font-style:italic;font-weight:300;color:#55504a">The Mudlarkers</p>
<p style="margin:0 0 22px;font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:#6e6552">13 October &ndash; 14 November 2026</p>

<p>Welcome, and thank you for joining <strong>The Mudlarkers</strong>.</p>
<p>Pace Gallery has asked <strong>World Bridge Meridian</strong>, its official travel partner, to arrange your journey to London: flights, ground transport, accommodation and every detail around them, for you and up to two companions. Everything is arranged in one place on our website, in a few short steps. This email walks you through them.</p>

${card("Please do not book anything yourself", p("Travel booked elsewhere is not reimbursed without Pace Gallery&rsquo;s prior written approval. Leave the bookings to us, and we will take care of them for you.", "margin:0"))}

${card(
  "Have these ready (about 10 minutes)",
  list([
    "<strong>Full names</strong> of everyone travelling, exactly as on their passports (you and up to two companions)",
    "<strong>Passport number and expiry date</strong>, and a photo of the passport page",
    "<strong>Departure city</strong> and your preferred airport",
    "<strong>Room preference</strong> for companions: shared or separate",
    "<strong>Dietary needs and allergies</strong>, and an <strong>emergency contact</strong>",
    "<strong>Extended stay</strong> (optional): if you would like to stay for the whole performance week, say so in the form. Any extension is subject to the Gallery&rsquo;s confirmation.",
  ]),
)}

<p ${H3}>Your steps, from sign-up to your itinerary</p>

${step(1, "Open the exhibition page", p("Tap the button below. It opens the page for <strong>Kylie Manning: The Mudlarkers</strong> on our website, with everything about the show in one place.") + button("Open the Mudlarkers page"))}
${step(
  2,
  "Create your free account",
  p("Tap <strong>Sign in</strong> at the top of the page, then choose how you would like to join:") +
    list(["<strong>Continue with Google</strong>: the quickest way, one tap, or", "<strong>Email and password</strong>: choose a password, then tap the confirmation link we email you, or", "<strong>Email me a sign-in link</strong>: no password needed."]) +
    note("Please use the same email address Pace Gallery has for you, so we can match you to the exhibition. Keep to the same phone or computer for steps 1 to 3."),
)}
${step(3, "Tap &ldquo;Plan This Trip&rdquo;", p("On the Mudlarkers page, tap <strong>Plan This Trip</strong>. Your travel form opens with the exhibition already filled in.") + button("Plan my trip"))}
${step(
  4,
  "Fill in your travel form",
  p("It has seven short parts. You can answer what you know now and add the rest later by replying to us.") +
    list(
      [
        "Your traveller details and passport (upload the passport photo page if you can)",
        "Exhibition and travel preferences",
        "Health and dietary needs",
        "Emergency contact",
        "Your companions, if any (up to two)",
        "Your itinerary overview (optional, you can leave this blank)",
        "Special requests and anything else we should know",
      ],
      "ol",
    ) +
    p("When you are done, tap <strong>Send</strong>. You will receive a confirmation email straight away.") +
    note("Your passport details are kept private and are visible only to our travel team."),
)}
${step(
  5,
  "We build your itinerary",
  p("Your travel coordinator reviews your form and sends your proposed itinerary to your account. The Gallery confirms your four performance dates in writing, and we build your travel around them.") +
    p("Check <strong>My World Bridge</strong> on our website for messages, itineraries, tickets and documents to sign. You will also get an email each time there is something new."),
)}
${step(6, "Travel to London", `<p style="margin:0;font-size:14px;color:#333">Once you arrive and the Gallery confirms your presence, your fee and approved costs are paid to you within 24 hours, as set out in your agreement with Pace Gallery.</p>`)}

<p style="margin:22px 0 0;font-style:italic;color:#55504a">Stuck at any step? Reply to this email, write to <a href="mailto:info@worldbridgemeridian.group" style="color:#a8813f">info@worldbridgemeridian.group</a>, or message Client Services on <a href="${WHATSAPP}" style="color:#a8813f">WhatsApp at +1 302 627 3325</a>, and we will help right away.</p>
`;

const html = layout(inner).replace("<head>", "<head><title>Plan your trip to London – Kylie Manning: The Mudlarkers</title>");
fs.writeFileSync(path.join(HERE, "Plan_Your_Trip_Email.html"), html);
console.log("wrote Plan_Your_Trip_Email.html");
