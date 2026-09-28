import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Both secrets are set on the function (Edge Functions -> Secrets), never
// in this file: anyone with repo or dashboard-source access would otherwise
// be able to send mail as the domain. The Resend key is scoped to
// "sending_access" on worldbridgemeridian.group.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Shared with the database trigger, which sends it as x-wbm-notify-secret.
// The anon key alone proves nothing — it ships in the site's JS bundle.
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const FROM_EMAIL = "World Bridge Meridian <payments@worldbridgemeridian.group>";
const INTERNAL_EMAIL = "info@worldbridgemeridian.group";

interface CryptoPaymentRecord {
  asset: string;
  network: string;
  wallet_address: string;
  transaction_hash: string;
  payer_name: string | null;
  payer_email: string | null;
  submitted_at: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) {
    console.error("Resend send failed", res.status, await res.text());
  }
}

Deno.serve(async (req: Request) => {
  if (!NOTIFY_SHARED_SECRET || req.headers.get("x-wbm-notify-secret") !== NOTIFY_SHARED_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const record: CryptoPaymentRecord = payload.record ?? payload;

    const detailsHtml = `
      <p><strong>Asset:</strong> ${record.asset} (${record.network})</p>
      <p><strong>Wallet address paid to:</strong> ${record.wallet_address}</p>
      <p><strong>Transaction hash:</strong> ${record.transaction_hash}</p>
      <p><strong>Submitted:</strong> ${record.submitted_at}</p>
    `;

    // Internal notification so a real person actually follows up — this IS
    // the "routed to our team" step, since there is no separate ticketing
    // system yet.
    await sendEmail(
      INTERNAL_EMAIL,
      "New crypto payment reference submitted — needs verification",
      `
        <h2>New crypto payment submitted</h2>
        ${detailsHtml}
        <p><strong>From:</strong> ${record.payer_name || "(not provided)"} — ${record.payer_email || "(not provided)"}</p>
        <p>Verify this transaction on-chain, then update its status in Supabase (Table Editor -> crypto_payment_submissions).</p>
      `,
    );

    // Confirmation to the customer — explicitly NOT a receipt, since nothing
    // has been verified yet. Only sent if they gave an email.
    if (record.payer_email) {
      await sendEmail(
        record.payer_email,
        "We've received your payment reference — World Bridge Meridian",
        `
          <p>Hi ${record.payer_name || "there"},</p>
          <p>Thank you — we've received your ${record.asset} payment reference and it is now with our team for verification.</p>
          ${detailsHtml}
          <p>This confirms we received your submission, not that the payment itself has been verified yet. Once our team has checked the transaction on the blockchain, one of our consultants will follow up with you directly to confirm your booking.</p>
          <p>If anything above doesn't look right, please contact us immediately.</p>
          <p>— World Bridge Meridian</p>
        `,
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
