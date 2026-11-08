// Screenshots an HTML email (full page, 700 px wide) so it can be looked at.  node screenshot-html-email.mjs <path-to.html> [out.png]
// Playwright is read from /opt/node-tools; set CHROMIUM_PATH if Playwright cannot find its browser.
import { createRequire } from "node:module";
const require = createRequire("/opt/node-tools/node_modules/");
const { chromium } = require("playwright");
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ viewport: { width: 700, height: 900 } });
await p.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.abort());
await p.goto("file://" + (process.argv[2] ?? "/tmp/wbm-qa/out/Plan_Your_Trip_Email.html"));
await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[3] ?? "/tmp/wbm-qa/email.png", fullPage: true });
await b.close();
