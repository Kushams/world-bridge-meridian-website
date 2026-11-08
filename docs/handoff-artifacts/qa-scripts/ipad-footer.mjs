import { createRequire } from "node:module";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const require = createRequire("/opt/node-tools/node_modules/");
const { chromium } = require("playwright");
const OUT = "/home/user/world-bridge-meridian-website/out";
const SH = "/tmp/wbm-qa/ipad/"; fs.mkdirSync(SH, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp" };
const server = http.createServer((req, res) => { let p = decodeURIComponent(new URL(req.url, "http://x").pathname); let f = path.join(OUT, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + ".html") ? f + ".html" : path.join(f, "index.html"); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" }); fs.createReadStream(f).pipe(res); });
await new Promise((r) => server.listen(4174, r));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [name, w, h] of [["ipad-mini-768", 768, 1024], ["ipad-air-820", 820, 1180], ["ipad-pro11-834", 834, 1194], ["ipad-pro11-land-1194", 1194, 834], ["ipad-pro13-1024", 1024, 1366], ["ipad-pro13-land-1366", 1366, 1024]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => localStorage.setItem("wbm-cookie-consent", "essential"));
  const page = await ctx.newPage();
  await page.route(/challenges\.cloudflare\.com|googletagmanager|google-analytics|mock\.supabase/, (r) => r.abort());
  await page.goto("http://localhost:4174/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const over = document.documentElement.scrollWidth - window.innerWidth;
    const f = document.querySelector("footer");
    const brand = f?.querySelector("a[href='/']");
    const cols = [...(f?.querySelectorAll("h3,h2,h4") ?? [])].map((e) => ({ t: e.textContent?.trim(), l: Math.round(e.getBoundingClientRect().left) }));
    return { over, brand: brand ? JSON.stringify(brand.getBoundingClientRect()) : null, cols: cols.slice(0, 6) };
  });
  console.log(name, JSON.stringify(r));
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.locator("footer").screenshot({ path: `${SH}${name}-footer.png` });
  await ctx.close();
}
await browser.close(); server.close();
