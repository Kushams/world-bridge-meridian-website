import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildInvoicePdf, loadEmblem, loadPdfFonts, type LineItem, type PdfFonts } from "../_shared/invoicePdf.ts";

// Makes the branded invoice PDF for ANY invoice, however it was created, and files it where the
// client's invoice page looks for it: client-documents/<client email>/invoices/<reference>.pdf.
// Fired by the database trigger in supabase/invoice-pdf-trigger.sql on invoice insert and on
// changes to status, line items, amounts or due date; can also be called directly to backfill.
// Auth: the shared notify secret (as the trigger sends) or the service-role key. Nothing here is
// ever exposed to clients — the client only reads the finished PDF from storage.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// The database trigger authenticates with the shared notify secret; only its SHA-256 is
// kept here, never the secret itself. Manual calls use the service-role key instead.
const EXPECTED_HASH = "d1e54c9a3906638366e313d9fa586a1bc92394eb6c2aec077b4bbde3dae97151";
const BUCKET = "client-documents";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Fonts and emblem are the same for every invoice; load once per isolate.
let assetsPromise: Promise<{ fonts: PdfFonts | null; emblem: string | null }> | null = null;
const assets = () =>
  (assetsPromise ??= Promise.all([loadPdfFonts(), loadEmblem()]).then(([fonts, emblem]) => ({ fonts, emblem })));

Deno.serve(async (req) => {
  const presented = req.headers.get("x-wbm-notify-secret");
  // The gateway has already verified this JWT (verify_jwt); here we only read its claims.
  // (The service key the platform injects as an env var is not the same string as the legacy
  // service_role JWT, so a string compare against the env var does not work.)
  let authorized = false;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const parts = token.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      authorized = payload.role === "service_role" && payload.ref === "rkevnmqofvqdmjujlrvd";
    } catch {
      authorized = false;
    }
  }
  if (!authorized && presented) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(presented));
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    authorized = hex === EXPECTED_HASH;
  }
  if (!authorized) return json({ error: "unauthorized" }, 401);

  const body = (await req.json().catch(() => ({}))) as { invoice_id?: string; record?: { id?: string } };
  const invoiceId = body.invoice_id ?? body.record?.id;
  if (!invoiceId) return json({ error: "invoice_id required" }, 400);

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: inv, error: invErr } = await db.from("invoices").select("*").eq("id", invoiceId).single();
  if (invErr || !inv) return json({ error: "invoice not found" }, 404);
  if (inv.status === "void") return json({ ok: true, skipped: "void invoice" });

  const { data: userRes } = await db.auth.admin.getUserById(inv.user_id as string);
  const email = userRes?.user?.email?.toLowerCase();
  if (!email) return json({ error: "client email not found" }, 422);
  const { data: profile } = await db
    .from("profiles")
    .select("full_name, phone")
    .eq("id", inv.user_id as string)
    .maybeSingle();

  const stored = Array.isArray(inv.line_items) ? (inv.line_items as LineItem[]) : [];
  const fallbackTotal = Number(inv.amount ?? inv.amount_usd ?? 0);
  const lines: LineItem[] = stored.length
    ? stored
    : [
        {
          title: (inv.description as string) || "World Bridge Meridian services",
          details: "",
          qty: 1,
          unit_price: fallbackTotal,
          amount: fallbackTotal,
        },
      ];
  const taxPercent = Number(inv.tax_percent ?? 0);
  const lineSum = lines.reduce((sum, l) => sum + Number(l.amount ?? l.qty * l.unit_price), 0);
  const subtotal = inv.subtotal != null ? Number(inv.subtotal) : lineSum;
  const total = inv.amount != null ? Number(inv.amount) : Math.round(subtotal * (1 + taxPercent / 100) * 100) / 100;

  const { fonts, emblem } = await assets();
  const bytes = await buildInvoicePdf(
    {
      reference: inv.reference as string,
      createdAt: inv.created_at as string,
      dueDate: (inv.due_date as string | null) ?? null,
      status: inv.status as "unpaid" | "paid" | "needs_review" | "void",
      paidAt: (inv.paid_at as string | null) ?? null,
      currency: (inv.currency as string) ?? "USD",
      lines,
      subtotal,
      taxPercent,
      total,
      amountUsd: Number(inv.amount_usd ?? total),
      fxRate: Number(inv.fx_rate ?? 1),
    },
    { name: profile?.full_name ?? null, email, phone: profile?.phone ?? null },
    emblem,
    fonts,
  );

  const path = `${email}/invoices/${inv.reference}.pdf`;
  const { error: upErr } = await db.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });
  if (upErr) return json({ error: `storage upload failed: ${upErr.message}` }, 502);

  return json({ ok: true, path, bytes: bytes.length });
});
