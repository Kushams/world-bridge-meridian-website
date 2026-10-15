// The WhatsApp links: right number, message ready to send, nothing breaks the link. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { whatsappHref, WHATSAPP_GENERAL, whatsappForExhibition } from "../src/lib/whatsapp.ts";

test("the link uses only the digits of the number", () => {
  assert.equal(whatsappHref("+1 (302) 627-3325", "Hi").split("?")[0], "https://wa.me/13026273325");
});

test("the message is carried in the link and reads back exactly", () => {
  const href = whatsappHref("+1 (302) 627-3325", WHATSAPP_GENERAL);
  assert.equal(new URL(href).searchParams.get("text"), WHATSAPP_GENERAL);
  assert.ok(WHATSAPP_GENERAL.includes("[your name]"));
});

test("an exhibition message names the show and survives quotes, ampersands and accents", () => {
  const msg = whatsappForExhibition('Rothko & "Friends": Café', "Pace Gallery, New York");
  assert.equal(new URL(whatsappHref("+13026273325", msg)).searchParams.get("text"), msg);
  assert.ok(msg.includes("Pace Gallery, New York") && msg.includes("[your name]"));
});
