import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire("/opt/node-tools/node_modules/");
const { chromium } = require("playwright");
const OUT = "/home/user/world-bridge-meridian-website/out";
const SH = "/tmp/wbm-qa/hero/" + (process.argv[2] ?? "before") + "-"; fs.mkdirSync(path.dirname(SH), { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp" };
const server = http.createServer((req, res) => { let p = decodeURIComponent(new URL(req.url, "http://x").pathname); let f = path.join(OUT, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + ".html") ? f + ".html" : path.join(f, "index.html"); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" }); fs.createReadStream(f).pipe(res); });
await new Promise((r) => server.listen(4176, r));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [name, w, h, mobile] of [["phone", 390, 844, true], ["phone-small", 360, 740, true], ["ipad", 820, 1180, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  await ctx.addInitScript(() => localStorage.setItem("wbm-cookie-consent", "essential"));
  const page = await ctx.newPage();
  await page.route(/challenges\.cloudflare\.com|googletagmanager|google-analytics|mock\.supabase/, (r) => r.abort());
  await page.goto("http://localhost:4176" + (process.argv[3] ?? "/exhibitions/kylie-manning-the-mudlarkers-pace-london"), { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SH}${name}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h, 620) } });
  const eyebrow = await page.locator("section p.eyebrow").first().innerText();
  console.log(name, "| eyebrow:", eyebrow);
  await ctx.close();
}
await browser.close(); server.close();
