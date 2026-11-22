// world-bridge-meridian-relay — relay for worldbridgemeridiangroup.com
// The real site (Worker world-bridge-meridian-website) lives in the user's
// own Kushams Cloudflare account at the workers.dev origin below. This tiny
// relay lives in the Burnsdan080 account, which holds the domain's zone, and
// is bound to the apex + www custom domains. It forwards every request to
// the origin and rewrites redirects/cookies so the site behaves exactly as
// if it were served directly on the domain (same pattern as the Cardone
// portal relay, cardone-domain-proxy v3).
// Rollback: re-attach the two custom domains to the Burnsdan app Worker
// world-bridge-meridian-website (kept deployed, untouched) and delete this
// relay's domain bindings.

const ORIGIN = "https://world-bridge-meridian-website.kushams-og.workers.dev";

// Payment callback for the site's own ePayVista account (merchant 1127,
// connected 2026-11-22). The old shared account's callbacks used an address
// on the Supabase host, which ePayVista still has registered to that old
// account — so the new account takes its callback on the site's own domain
// instead, a host the old account never used. This route forwards the call
// untouched (exact body + signature header) to the real receiver.
const WEBHOOK_TARGET = "https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/epv-webhook";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/epv-webhook") {
      const headers = new Headers(request.headers);
      headers.delete("host");
      const init = { method: request.method, headers, redirect: "manual" };
      if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = await request.arrayBuffer();
      }
      const resp = await fetch(WEBHOOK_TARGET, init);
      const out = new Headers(resp.headers);
      out.set("x-relay", "wbm-v2");
      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: out,
      });
    }

    const target = ORIGIN + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set("x-forwarded-host", url.host);
    headers.set("x-forwarded-proto", "https");
    headers.delete("host");

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }

    const resp = await fetch(target, init);

    const out = new Headers(resp.headers);
    const loc = out.get("location");
    if (loc) {
      out.set("location", loc.replace(ORIGIN, "https://" + url.host));
    }
    // Re-emit cookies one by one, without any Domain attribute
    const cookies = typeof resp.headers.getSetCookie === "function"
      ? resp.headers.getSetCookie()
      : [];
    if (cookies.length) {
      out.delete("set-cookie");
      for (const c of cookies) {
        out.append("set-cookie", c.replace(/;\s*domain=[^;]*/gi, ""));
      }
    }
    out.set("x-relay", "wbm-v2");

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: out,
    });
  },
};
