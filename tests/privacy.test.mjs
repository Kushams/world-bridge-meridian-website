// Passport numbers never appear in full in an email to the team. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { mask, hidePassport } from "../supabase/functions/_shared/privacy.ts";

test("a passport number shows only its last three characters", () => {
  assert.equal(mask("AB1234567"), "••••••567");
  assert.equal(mask("123456789012345678"), "••••••••678"); // never longer than 8 dots
  assert.ok(!mask("AB1234567").includes("1234"));
});

test("very short or empty values reveal nothing", () => {
  assert.equal(mask("123"), "•••");
  assert.equal(mask(""), "•••");
  assert.equal(mask(undefined), "•••");
});

test("a companion's passport number is hidden inside their one-line summary, everything else stays", () => {
  const line = "Full name: Sam Traveller | Date of birth: 01/02/1990 | Passport number: X9876543 | Passport expiry: 01/02/2031 | Nationality: Swedish";
  const out = hidePassport(line);
  assert.ok(!out.includes("X9876543") && !out.includes("9876"));
  assert.ok(out.includes("Passport number: •••••543 |"));
  assert.ok(out.includes("Full name: Sam Traveller") && out.includes("Passport expiry: 01/02/2031") && out.includes("Nationality: Swedish"));
});

test("a companion line that ends with the passport number is also hidden", () => {
  assert.equal(hidePassport("Full name: Sam | Passport number: X9876543"), "Full name: Sam | Passport number: •••••543");
  assert.equal(hidePassport("Full name: Sam | Dietary: none"), "Full name: Sam | Dietary: none");
});

test("the team's notification emails use the mask and never attach uploaded files", () => {
  const forms = fs.readFileSync(new URL("../supabase/functions/notify-form-submission/index.ts", import.meta.url), "utf8");
  assert.ok(forms.includes('k === "passport_number" ? mask(v)'), "passport number must be masked in the team email");
  assert.ok(forms.includes("hidePassport(payload[k])"), "companions' passport numbers must be masked");
  const activity = fs.readFileSync(new URL("../supabase/functions/notify-client-activity/index.ts", import.meta.url), "utf8");
  assert.ok(!/attachments/.test(activity.replace(/\/\/.*$/gm, "")), "uploaded files must not be attached to email");
  assert.ok(!/base64/i.test(activity.replace(/\/\/.*$/gm, "")), "no file encoding left in the upload notice");
});
