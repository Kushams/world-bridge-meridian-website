// Pretend-client walkthrough of the Travel Authorisation Form (staff sends, client fills in and signs, staff sees it signed).
// All Supabase traffic is mocked at https://mock.supabase.co. Needs the static export built with the mock env, from the repo root:
//   STATIC_EXPORT=true NEXT_PUBLIC_SUPABASE_URL=https://mock.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon npm run build
// then: node docs/handoff-artifacts/qa-scripts/travel-auth-flow.mjs   (Playwright from /opt/node-tools; screenshots + signed.pdf go to the SHOTS folder).
// Recovered on 2026-11-08 from the session transcript and updated to the current "one company signature" behaviour.
// NOT re-run after recovery. Paths below (OUT, SHOTS, the Chromium executable) are from the old scratch environment: adjust them.
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("/opt/node-tools/node_modules/");
const { chromium } = require("playwright");

const OUT = "/home/user/world-bridge-meridian-website/out";
const SHOTS = "/tmp/wbm-qa/ta";
fs.mkdirSync(SHOTS, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain", ".webp": "image/webp", ".ico": "image/x-icon", ".ttf": "font/ttf" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(OUT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + ".html") ? f + ".html" : path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end("nf"); }
  res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(4173, r));

const now = Date.now();
const iso = (d) => new Date(now - d * 86400000).toISOString();
const EVENT = "Kylie Manning: The Mudlarkers — Pace Gallery, London, London";
// Shared pretend database
const DB = {
  sig: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // stand-in for the company signature (the real one lives only in the database)
  reqs: [],
  rpcs: [],
  uploads: [],
  profile: { full_name: "Claire Dubois", phone: "+33 6 12 34 56 78", nationality: null, home_city: "Lyon" },
  fns: [],
};
const clientRow = { id: "u1", email: "claire.dubois@example.fr", full_name: "Claire Dubois", phone: "+33 6 12 34 56 78", avatar_url: null, created_at: iso(12), confirmed: true, assigned_to: "earla668@gmail.com" };
// Claire has only part of her details in the old travel request (so some lines are blank)
const travelReq = { id: "r1", form_type: "travel-details", name: "Claire Dubois", email: clientRow.email, subject: "Kylie", message: null, payload: { full_name: "Claire Dubois", date_of_birth: "1988-04-09", nationality: "French", passport_number: "19AB12345", passport_expiry: "2029-08-14", departure_city: "Paris (CDG)", departure_date: "2026-10-20", return_date: "2026-10-23", exhibition_or_event: EVENT, emergency_name: "Luc Dubois", emergency_relationship: "Brother" }, submitted_at: iso(3), status: "in_review", status_updated_at: iso(1) };
const fakeJwt = (p) => ["eyJhbGciOiJIUzI1NiJ9", Buffer.from(JSON.stringify(p)).toString("base64url"), "sig"].join(".");

async function newPage(browser, { email, userId, staff, width, height }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: width < 600, hasTouch: width < 600 });
  const user = { id: userId, aud: "authenticated", role: "authenticated", email, email_confirmed_at: iso(30), app_metadata: {}, user_metadata: {}, created_at: iso(30) };
  const exp = Math.floor(now / 1000) + 86400;
  const session = { access_token: fakeJwt({ sub: userId, exp, email, role: "authenticated" }), refresh_token: "r", expires_in: 86400, expires_at: exp, token_type: "bearer", user };
  await ctx.addInitScript(([k, v]) => { localStorage.setItem(k, v); localStorage.setItem("wbm-cookie-consent", "essential"); }, ["sb-mock-auth-token", JSON.stringify(session)]);
  await ctx.route("https://mock.supabase.co/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const p = url.pathname;
    const wantsObject = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
    const json = (body, status = 200) => route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    const body = () => { try { return JSON.parse(req.postData() ?? "{}"); } catch { return {}; } };
    if (p.endsWith("/auth/v1/user")) return json(user);
    if (p.includes("/rpc/staff_me")) return json(staff ? [{ email, role: "admin", name: "Earl", link_code: null }] : []);
    if (p.includes("/rpc/staff_list_clients")) return json([clientRow]);
    if (p.includes("/rpc/company_signer")) return json(staff ? [{ name: "Earl Anderson", title: "Founder & Chief Executive Officer", signature: DB.sig }] : null);
    if (p.includes("/rpc/staff_create_travel_auth")) {
      const b = body();
      const row = { id: "11111111-2222-3333-4444-555555555555", client_email: b.p_email, created_by: email, created_at: new Date().toISOString(), exhibition: b.p_exhibition, destination_kind: b.p_kind, destination: b.p_destination, covered_by: b.p_covered_by, purpose: b.p_purpose, signer_name: "Earl Anderson", signer_title: "Founder & Chief Executive Officer", signer_signature: DB.sig, prefill: b.p_prefill, status: "pending", signed_values: null, signed_at: null, document_path: null };
      DB.reqs.push(row); DB.rpcs.push({ name: "staff_create_travel_auth", b });
      return json(row.id);
    }
    if (p.includes("/rpc/sign_travel_auth")) {
      const b = body(); DB.rpcs.push({ name: "sign_travel_auth", b });
      const r = DB.reqs.find((x) => x.id === b.p_id);
      if (!r || r.status !== "pending") return json({ message: "This form has already been signed or cancelled" }, 400);
      r.status = "signed"; r.signed_values = b.p_values; r.signed_at = new Date().toISOString(); r.document_path = b.p_document_path;
      for (const k of ["full_name", "phone", "nationality"]) { const m = { full_name: "name", phone: "phone", nationality: "nationality" }[k]; if ((b.p_values[m] ?? "").trim()) DB.profile[k] = b.p_values[m].trim(); }
      return json(null);
    }
    if (p.includes("/rpc/")) return json(null);
    if (p.includes("/rest/v1/staff_signatures")) {
      if (req.method() === "GET") return json(DB.sig ? { signature: DB.sig } : null);
      DB.sig = body().signature ?? (Array.isArray(body()) ? body()[0].signature : null); DB.rpcs.push({ name: "save_signature" }); return json(null, 201);
    }
    if (p.includes("/rest/v1/travel_auth_requests")) {
      const st = url.searchParams.get("status");
      return json(DB.reqs.filter((r) => !st || r.status === st.replace("eq.", "")));
    }
    if (p.includes("/rest/v1/form_submissions")) return json([travelReq]);
    if (p.includes("/rest/v1/profiles")) { if (req.method() === "GET") return json(wantsObject ? DB.profile : [DB.profile]); DB.rpcs.push({ name: "profile_write", b: body() }); return json(null, 201); }
    if (p.includes("/storage/v1/object/list")) return json([]);
    if (p.includes("/storage/v1/object/sign/")) return json({ signedURL: "/sign/x?token=t" });
    if (p.includes("/storage/v1/object/")) {
      if (req.method() === "POST") { DB.uploads.push({ url: decodeURIComponent(p.split("/object/")[1]), body: req.postDataBuffer() }); return json({ Key: "ok" }); }
      return json({});
    }
    if (p.includes("/functions/v1/")) { DB.fns.push({ fn: p.split("/functions/v1/")[1], b: body() }); return json({ ok: true }); }
    return json(wantsObject ? null : []);
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await page.route(/challenges\.cloudflare\.com|googletagmanager|google-analytics/, (r) => r.abort());
  return page;
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

// ------------------------------------------------------------- STAFF
const st = await newPage(browser, { email: "earla668@gmail.com", userId: "admin1", staff: true, width: 1100, height: 1000 });
await st.goto("http://localhost:4173/staff#clients", { waitUntil: "networkidle" });
await st.reload({ waitUntil: "networkidle" });
await st.locator("main").getByText("claire.dubois@example.fr").first().click();
await st.locator("#hub-send").waitFor();
await st.locator("#hub-send").scrollIntoViewIfNeeded();
await st.waitForTimeout(800);
const panel = st.getByText("Ready-made form: Travel authorisation").locator("xpath=ancestor::div[contains(@class,'rounded-card')][1]");
await panel.screenshot({ path: `${SHOTS}/1-staff-before-signature.png` });
await panel.screenshot({ path: `${SHOTS}/2-staff-ready.png` });
console.log("exhibition select value:", await panel.locator("select").inputValue(), "| destination:", await panel.locator("input").nth(0).inputValue());
await panel.getByRole("button", { name: "Send to client" }).click();
await st.waitForTimeout(1500);
await panel.screenshot({ path: `${SHOTS}/3-staff-sent.png` });
const created = DB.rpcs.find((r) => r.name === "staff_create_travel_auth");
console.log("CREATE:", JSON.stringify({ ...created.b, p_prefill: Object.fromEntries(Object.entries(created.b.p_prefill).filter(([, v]) => v)) }, null, 1));
console.log("emails to client:", DB.fns.map((f) => f.fn + ":" + JSON.stringify(f.b)));

// ------------------------------------------------------------- CLIENT
const cl = await newPage(browser, { email: clientRow.email, userId: "u1", staff: false, width: 430, height: 900 });
await cl.goto("http://localhost:4173/my-world-bridge#documents", { waitUntil: "networkidle" });
await cl.reload({ waitUntil: "networkidle" });
await cl.getByRole("button", { name: /Fill in & sign/ }).first().waitFor({ timeout: 15000 });
await cl.screenshot({ path: `${SHOTS}/4-client-waiting.png` });
await cl.getByRole("button", { name: /Fill in & sign/ }).first().click();
await cl.getByRole("dialog", { name: /Fill in and sign/ }).waitFor();
await cl.waitForTimeout(500);
const dlg = cl.getByRole("dialog", { name: /Fill in and sign/ }).locator("form");
await dlg.screenshot({ path: `${SHOTS}/5-client-dialog-full.png` });
// try signing with the phone number and passport... emergency phone blank on purpose
await cl.getByRole("button", { name: "Sign form" }).click();
console.log("validation:", await dlg.getByRole("alert").innerText());
// correct her name (spelling) and fill the blank emergency phone
await dlg.getByLabel("Full name (as on passport)").fill("Claire M. Dubois");
await dlg.locator("label", { hasText: "Contact phone" }).nth(1).locator("input").fill("+33 6 99 88 77 66");
await dlg.getByLabel("Applied, awaiting a decision").check();
await dlg.locator("input#ta-typed").fill("Claire M. Dubois");
const cv = dlg.locator("canvas");
await cv.scrollIntoViewIfNeeded(); await cl.waitForTimeout(300);
const b2 = await cv.boundingBox();
await cl.mouse.move(b2.x + 40, b2.y + 90); await cl.mouse.down();
for (let i = 0; i < 18; i++) await cl.mouse.move(b2.x + 40 + i * 10, b2.y + 90 + Math.cos(i / 2) * 30);
await cl.mouse.up();
await dlg.getByRole("checkbox").check();
await dlg.getByRole("button", { name: "Sign form" }).click();
await cl.waitForTimeout(3000);
await cl.screenshot({ path: `${SHOTS}/6-client-after.png` });
const sign = DB.rpcs.find((r) => r.name === "sign_travel_auth");
console.log("SIGN rpc:", JSON.stringify({ ...sign.b, p_drawn: sign.b.p_drawn ? "(png)" : null }, null, 1));
console.log("uploads:", DB.uploads.map((u) => u.url));
const up = DB.uploads.find((u) => u.url.includes("signed"));
if (up) { const i = up.body.indexOf("%PDF"); fs.writeFileSync(`${SHOTS}/signed.pdf`, up.body.subarray(i)); console.log("signed pdf bytes", up.body.length - i); }
console.log("team notice:", JSON.stringify(DB.fns.filter((f) => f.fn.includes("activity")).map((f) => f.b)));
console.log("profile now:", JSON.stringify(DB.profile));
// signing twice must fail
console.log("still shows button after signing?", await cl.getByRole("button", { name: /Fill in & sign/ }).count());

// staff sees it signed
await st.reload({ waitUntil: "networkidle" });
await st.locator("main").getByText("claire.dubois@example.fr").first().click();
await st.locator("#hub-send").scrollIntoViewIfNeeded();
await st.waitForTimeout(800);
await panel.screenshot({ path: `${SHOTS}/7-staff-sees-signed.png` });
await browser.close(); server.close();
