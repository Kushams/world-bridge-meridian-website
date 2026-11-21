import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ePayVista callback fan-out.
//
// The merchant account allows ONE registered callback URL, and the provider
// requires it to sit on the account's registered store host — this Supabase
// project. The same demo account also serves the Cardone Capital investor
// portal, so the account's callback URL points here, and this function
// forwards every callback, untouched (same body, same signature header), to
// both sites' receivers.
//
// Each receiver verifies the HMAC signature itself and answers 200
// "unknown" for references it never opened, so the other site's payments
// are ignored silently. Receivers answer 5xx only when they own the
// reference and want the provider to retry — any 5xx is therefore
// propagated, so the provider retries the whole delivery (safe: both
// receivers are idempotent).
//
// Deploy with JWT verification OFF (the provider cannot send a Supabase
// JWT); the forwarded signature is what proves a message is genuine.

const TARGETS = [
  "https://investors.cardonecapitalportal.us/api/payments/epayvista",
  "https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/epv-webhook",
];

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });
  const body = await req.arrayBuffer();
  const headers = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
    "X-EPV-Signature": req.headers.get("x-epv-signature") ?? "",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  };
  const results = await Promise.all(TARGETS.map(async (target) => {
    try {
      const r = await fetch(target, { method: "POST", headers, body });
      const j = await r.json().catch(() => ({})) as Record<string, unknown>;
      return { status: r.status, j };
    } catch {
      return { status: 0, j: {} as Record<string, unknown> };
    }
  }));
  if (results.some((r) => r.status >= 500)) {
    return Response.json({ ok: false, error: "a receiver asked for a retry" }, { status: 502 });
  }
  const handled = results.some((r) => r.status >= 200 && r.status < 300 && !r.j.unknown && !r.j.ignored);
  return Response.json(handled ? { ok: true } : { ok: true, unknown: true });
});
