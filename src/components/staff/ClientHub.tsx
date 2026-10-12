"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Thread } from "@/components/messages/Thread";
import { postAsStaff, postVoice } from "@/lib/messages";
import {
  clientAction,
  fmtDate,
  listFiles,
  loadClientFlags,
  loadClientInvoices,
  loadClientRequests,
  loadProfile,
  loadSignatures,
  markInvoicePaid,
  notifyClient,
  openFile,
  removeFile,
  setInvoiceBankDetails,
  setInvoiceDueDate,
  uploadFile,
  usd,
  voidInvoice,
  type Client,
  type ClientAction,
  type ClientFlags,
  type Request,
  type Signature,
  type StaffInvoice,
  type StoredFile,
} from "@/lib/staff";
import { stemOf } from "@/lib/clientDocs";
import { parseBankLines, serializeBankLines } from "@/lib/invoices";
import { money, totals } from "@/lib/money";
import { buildInvoicePdf, loadEmblem } from "@/lib/invoicePdf";
import { InvoiceBuilder } from "./InvoiceBuilder";
import { inputClass, Row } from "./RequestsPanel";

const DOCS = "client-documents";
const UPLOADS = "client-uploads";
const RECEIVED = [
  { key: "passport", label: "Passport" },
  { key: "visa", label: "Visa or permit" },
  { key: "other", label: "Other" },
  { key: "returned", label: "Signed copies sent back" },
] as const;

const SEND_TYPES = [
  { key: "view", prefix: "", label: "To view", hint: "Itineraries, tickets, vouchers" },
  { key: "sign", prefix: "SIGN - ", label: "Sign on screen", hint: "Booking terms, confirmations, consent" },
  { key: "return", prefix: "RETURN - ", label: "Sign & send back", hint: "Visa or airline forms needing a real signature" },
] as const;

const PROFILE_FIELDS: [string, string][] = [
  ["full_name", "Name"],
  ["phone", "Phone"],
  ["home_city", "Home city / airport"],
  ["nationality", "Nationality"],
  ["preferred_contact", "Preferred contact"],
  ["travel_styles", "Travel styles"],
  ["interests", "Interests"],
  ["travel_pace", "Pace"],
  ["bed_preference", "Bed"],
  ["dietary_requirements", "Dietary"],
  ["allergies", "Allergies"],
];

const btn = "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-40";
const fileLabel = (name: string) => name.replace(/^\d{10,}-/, "");

function Block({ title, children, note, id }: { title: string; children: ReactNode; note?: string; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[24px] border hairline bg-charcoal/40 p-5 shadow-sm md:p-6">
      <h3 className="font-display text-xl text-ivory">{title}</h3>
      {note ? <p className="mt-1 text-xs text-stone-dim">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FileRow({ f, bucket, extra, onRemove }: { f: StoredFile; bucket: string; extra?: ReactNode; onRemove?: () => void }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm text-ivory">{fileLabel(f.name)}</p>
        <p className="text-xs text-stone-dim">
          {fmtDate(f.added)}
          {extra}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => openFile(bucket, f.path)} className={`${btn} border border-line text-ivory hover:border-gold`}>
          Open
        </button>
        {onRemove ? (
          <button type="button" onClick={onRemove} className={`${btn} text-stone hover:text-red-400`}>
            Remove
          </button>
        ) : null}
      </div>
    </li>
  );
}

/** Everything for one client: profile, requests, documents sent, invoices and what they've sent us. */
function AccountControls({ email, admin, onDeleted }: { email: string; admin: boolean; onDeleted: () => void }) {
  const [flags, setFlags] = useState<ClientFlags | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    loadClientFlags(email).then((f) => alive && setFlags(f));
    return () => {
      alive = false;
    };
  }, [email]);

  async function run(action: ClientAction, confirmText: string, done: string, next?: Partial<ClientFlags>) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    const err = await clientAction(email, action);
    setBusy(false);
    setMsg(err ? `Not done: ${err}` : done);
    if (err) return;
    if (action === "delete") return onDeleted();
    if (next) setFlags((f) => (f ? { ...f, ...next } : f));
  }

  if (!flags) return null;
  return (
    <Block
      id="hub-account"
      title="Account"
      note="Reminders go out automatically 3 and 7 days after our last message if the client hasn't replied. Blocking pauses the account: they can't sign in and get no reminders until you unblock them."
    >
      <p className="mb-4 text-sm">
        <span className={flags.blocked ? "text-red-400" : "text-gold"}>{flags.blocked ? "Blocked" : "Active"}</span>
        <span className="text-stone-dim"> · Reminders {flags.blocked || flags.reminders_off ? "off" : "on"}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || flags.blocked} className={`${btn} border hairline text-ivory hover:border-gold`}
          onClick={() => run("remind", "Email this client a reminder now?", "Reminder sent.")}>
          Send reminder
        </button>
        {flags.reminders_off ? (
          <button type="button" disabled={busy} className={`${btn} border hairline text-ivory hover:border-gold`}
            onClick={() => run("resume_reminders", "", "Automatic reminders are back on.", { reminders_off: false })}>
            Turn reminders back on
          </button>
        ) : (
          <button type="button" disabled={busy} className={`${btn} border hairline text-ivory hover:border-gold`}
            onClick={() => run("stop_reminders", "Stop automatic reminders for this client?", "Automatic reminders stopped.", { reminders_off: true })}>
            Stop reminders
          </button>
        )}
        {flags.blocked ? (
          <button type="button" disabled={busy} className={`${btn} border hairline text-ivory hover:border-gold`}
            onClick={() => run("unblock", "Unblock this account? They'll be able to sign in again.", "Account unblocked.", { blocked: false })}>
            Unblock account
          </button>
        ) : (
          <button type="button" disabled={busy} className={`${btn} border border-red-400/60 text-red-300 hover:border-red-400`}
            onClick={() => run("block", "Block this account? They won't be able to sign in until you unblock them.", "Account blocked.", { blocked: true })}>
            Block account
          </button>
        )}
        {admin ? (
          <button type="button" disabled={busy} className={`${btn} bg-red-500/80 text-white hover:bg-red-500`}
            onClick={() =>
              run(
                "delete",
                `Permanently delete ${email}? Their account, messages, requests, invoices and files are removed. This can't be undone.`,
                "Account deleted.",
              )
            }>
            Delete account
          </button>
        ) : null}
      </div>
      {msg ? <p role="status" className={`mt-3 text-xs ${msg.startsWith("Not") ? "text-red-400" : "text-gold"}`}>{msg}</p> : null}
    </Block>
  );
}

export function ClientHub({ client, admin, onDeleted }: { client: Client; admin: boolean; onDeleted: () => void }) {
  const email = client.email;
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [docs, setDocs] = useState<StoredFile[]>([]);
  const [sigs, setSigs] = useState<Signature[]>([]);
  const [invoices, setInvoices] = useState<StaffInvoice[]>([]);
  const [pdfs, setPdfs] = useState<StoredFile[]>([]);
  const [received, setReceived] = useState<Record<string, StoredFile[]>>({});
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const [p, r, d, s, inv, pdf, ...rec] = await Promise.all([
      loadProfile(client.id),
      loadClientRequests(email),
      listFiles(DOCS, email),
      loadSignatures(email),
      loadClientInvoices(client.id),
      listFiles(DOCS, `${email}/invoices`),
      ...RECEIVED.map((c) => listFiles(UPLOADS, `${email}/${c.key}`)),
    ]);
    setProfile(p);
    setRequests(r);
    setDocs(d);
    setSigs(s);
    setInvoices(inv ?? []);
    setPdfs(pdf);
    setReceived(Object.fromEntries(RECEIVED.map((c, i) => [c.key, rec[i]])));
  }, [client.id, email]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  function flash(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 6000);
  }

  async function remove(bucket: string, f: StoredFile) {
    if (!window.confirm(`Remove "${fileLabel(f.name)}"? The client will no longer see it.`)) return;
    const err = await removeFile(bucket, f.path);
    flash(err ? `Not removed: ${err}` : "Removed.");
    load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border hairline text-lg text-gold">
          {client.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={client.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (client.full_name || email).slice(0, 2).toUpperCase()
          )}
        </span>
        <div>
          <h2 className="font-display text-3xl text-ivory">{client.full_name || email}</h2>
          <p className="text-sm text-stone">
            <a href={`mailto:${email}`} className="underline hover:text-ivory">{email}</a>
            {client.phone ? ` · ${client.phone}` : ""} · {client.confirmed ? `joined ${fmtDate(client.created_at)}` : "email not confirmed yet"}
          </p>
        </div>
      </header>

      <nav aria-label="Jump to" className="sticky top-16 z-30 -mx-1 flex gap-2 overflow-x-auto bg-ink/90 px-1 py-2 backdrop-blur">
        {[
          ["hub-messages", "Message"],
          ["hub-requests", "Stage"],
          ["hub-send", "Send file"],
          ["hub-invoices", "Invoice"],
          ["hub-received", "Received"],
          ["hub-account", "Account"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-ink px-5 text-xs font-semibold uppercase tracking-wide text-ivory active:scale-95 hover:border-gold"
          >
            {label}
          </a>
        ))}
      </nav>

      {notice ? (
        <p role="status" className={`text-sm ${notice.startsWith("Not") ? "text-red-400" : "text-gold"}`}>
          {notice}
        </p>
      ) : null}

      <Block id="hub-messages" title="Messages" note="The client's conversation with us. Documents, invoices, uploads and stage changes appear here automatically; each message you send is also emailed to the client.">
        <Thread clientEmail={email} viewer="staff" onSend={(body) => postAsStaff(email, body)}
          onVoice={(audio, seconds) => postVoice(email, "staff", audio, seconds)}
          placeholder="Reply to the client…"
        />
      </Block>

      <Block title="Profile">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[200px_1fr]">
          {PROFILE_FIELDS.map(([k, label]) => {
            const v = profile?.[k];
            const text = Array.isArray(v) ? v.join(", ") : v ? String(v) : "";
            return (
              <div key={k} className="contents">
                <dt className="text-xs uppercase tracking-wide text-stone-dim">{label}</dt>
                <dd className="text-ivory">{text || <span className="text-stone-dim">—</span>}</dd>
              </div>
            );
          })}
        </dl>
      </Block>

      <Block id="hub-requests" title="Requests" note="Change the stage and the client is emailed automatically.">
        {requests.length ? (
          <div className="space-y-4">
            {requests.map((r) => (
              <Row key={r.id} r={r} onSaved={(s) => setRequests((l) => l.map((x) => (x.id === r.id ? { ...x, status: s } : x)))} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-dim">No requests from this email yet.</p>
        )}
      </Block>

      <SendDocuments email={email} onDone={(m) => (flash(m), load())} />

      <Block title="Documents sent to this client" note="What they see under Itineraries & Documents.">
        {docs.length ? (
          <ul className="divide-y divide-line">
            {docs.map((f) => {
              const signed = sigs.find((s) => s.document_path === f.path);
              const returned = (received.returned ?? []).some((r) => r.name.startsWith(`${stemOf(f.name)}__returned`));
              const extra = f.name.startsWith("SIGN - ")
                ? signed
                  ? ` · Signed by ${signed.signer_name} on ${fmtDate(signed.signed_at)} ✓`
                  : " · Waiting for signature"
                : f.name.startsWith("RETURN - ")
                  ? returned
                    ? " · Signed copy received ✓"
                    : " · Waiting for signed copy"
                  : "";
              return <FileRow key={f.path} f={f} bucket={DOCS} extra={extra} onRemove={() => remove(DOCS, f)} />;
            })}
          </ul>
        ) : (
          <p className="text-sm text-stone-dim">Nothing sent yet.</p>
        )}
      </Block>

      <InvoicesBlock client={client} admin={admin} email={email} invoices={invoices} pdfs={pdfs} onChange={(m) => (flash(m), load())} onRemovePdf={(f) => remove(DOCS, f)} />

      <Block id="hub-received" title="Sent to us by this client" note="Passports, visas and other files they uploaded, plus signed copies.">
        {RECEIVED.some((c) => (received[c.key] ?? []).length) ? (
          <div className="space-y-4">
            {RECEIVED.map((c) =>
              (received[c.key] ?? []).length ? (
                <div key={c.key}>
                  <p className="text-xs uppercase tracking-wide text-gold">{c.label}</p>
                  <ul className="divide-y divide-line">
                    {(received[c.key] ?? []).map((f) => (
                      <FileRow key={f.path} f={f} bucket={UPLOADS} />
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        ) : (
          <p className="text-sm text-stone-dim">Nothing received yet.</p>
        )}
        {sigs.length ? (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-gold">On-screen signatures</p>
            <ul className="mt-1 space-y-1 text-sm text-ivory">
              {sigs.map((s) => (
                <li key={s.document_path + s.signed_at}>
                  {s.document_title || fileLabel(s.document_path.split("/").pop() ?? "")} — signed by {s.signer_name}, {fmtDate(s.signed_at)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Block>

      <AccountControls email={email} admin={admin} onDeleted={onDeleted} />
    </div>
  );
}

function SendDocuments({ email, onDone }: { email: string; onDone: (msg: string) => void }) {
  const [type, setType] = useState<(typeof SEND_TYPES)[number]["key"]>("view");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  async function send() {
    if (!file) return;
    const t = SEND_TYPES.find((s) => s.key === type)!;
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const base = (title.trim() || file.name.replace(/\.[^.]+$/, "")).replace(/[\\/]+/g, "-");
    setBusy(true);
    const err = await uploadFile(DOCS, `${email}/${t.prefix}${base}${ext.toLowerCase()}`, file);
    setBusy(false);
    if (err) return onDone(`Not sent: ${err.includes("exists") ? "a file with that name is already there. Use a different name." : err}`);
    setFile(null);
    setTitle("");
    setInputKey((k) => k + 1);
    const emailed = await notifyClient(email, t.key === "view" ? "document" : t.key, base);
    onDone(`Sent. ${email} can now see "${base}" in their account${emailed ? " and has been emailed." : ", but the email to them didn't send."}`);
  }

  return (
    <Block id="hub-send" title="Send a document" note="PDF, JPG, PNG or WEBP, up to 25 MB. The client sees it straight away.">
      <div className="grid gap-3 sm:grid-cols-3">
        {SEND_TYPES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setType(s.key)}
            aria-pressed={type === s.key}
            className={`rounded-card border p-4 text-left transition-colors ${type === s.key ? "border-gold bg-gold/10" : "border-line hover:border-gold/60"}`}
          >
            <span className="block text-sm font-semibold text-ivory">{s.label}</span>
            <span className="mt-1 block text-xs text-stone">{s.hint}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name the client sees, e.g. Rome itinerary" className={inputClass} />
        <input
          key={inputKey}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-stone file:mr-3 file:rounded-full file:border-0 file:bg-ivory file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-ink"
        />
        <button type="button" disabled={!file || busy} onClick={send} className={`${btn} bg-ivory text-ink`}>
          {busy ? "Sending…" : "Send to client"}
        </button>
      </div>
    </Block>
  );
}

function InvoicesBlock({
  client,
  admin,
  email,
  invoices,
  pdfs,
  onChange,
  onRemovePdf,
}: {
  client: Client;
  admin: boolean;
  email: string;
  invoices: StaffInvoice[];
  pdfs: StoredFile[];
  onChange: (msg: string) => void;
  onRemovePdf: (f: StoredFile) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  /** (Re)make the branded PDF from the invoice as it stands now (paid stamp, bank details included). */
  async function generatePdf(inv: StaffInvoice) {
    setBusy(inv.id);
    try {
      const currency = inv.currency ?? "USD";
      const lines = inv.line_items?.length
        ? inv.line_items
        : [{ title: inv.description, details: "", qty: 1, unit_price: inv.amount ?? inv.amount_usd, amount: inv.amount ?? inv.amount_usd }];
      const t = totals(lines, inv.tax_percent ?? 0);
      const blob = await buildInvoicePdf(
        {
          reference: inv.reference,
          createdAt: inv.created_at,
          dueDate: inv.due_date,
          status: inv.status,
          paidAt: inv.paid_at,
          currency,
          lines,
          subtotal: inv.subtotal ?? t.subtotal,
          taxPercent: inv.tax_percent ?? 0,
          total: inv.amount ?? t.total,
          amountUsd: inv.amount_usd,
          fxRate: inv.fx_rate ?? 1,
        },
        { name: client.full_name, email, phone: client.phone },
        await loadEmblem(),
      );
      const path = `${email}/invoices/${inv.reference}.pdf`;
      const old = pdfs.find((p) => p.name.toLowerCase().startsWith(inv.reference.toLowerCase()));
      if (old) await removeFile(DOCS, old.path);
      const err = await uploadFile(DOCS, path, new File([blob], `${inv.reference}.pdf`, { type: "application/pdf" }));
      setBusy(null);
      onChange(err ? `Not made: ${err}` : `Branded PDF saved for ${inv.reference}. The client sees it now.`);
    } catch {
      setBusy(null);
      onChange("Not made: the PDF could not be generated.");
    }
  }

  async function attach(inv: StaffInvoice, file: File | undefined) {
    if (!file) return;
    setBusy(inv.id);
    const err = await uploadFile(DOCS, `${email}/invoices/${inv.reference}.pdf`, file);
    if (err) {
      setBusy(null);
      return onChange(`Not attached: ${err.includes("exists") ? "remove the old PDF first." : err}`);
    }
    const emailed = await notifyClient(email, "invoice_pdf", inv.reference);
    setBusy(null);
    onChange(`PDF attached to ${inv.reference}${emailed ? " and the client has been emailed." : "."}`);
  }

  async function saveBank(inv: StaffInvoice, text: string) {
    setBusy(inv.id);
    const err = await setInvoiceBankDetails(inv.id, text);
    if (err) {
      setBusy(null);
      return onChange(`Not saved: ${err}`);
    }
    const added = text.trim().length > 0;
    const emailed = added && !inv.bank_details ? await notifyClient(email, "message", `Our bank transfer details are now on invoice ${inv.reference}. Open Invoices in your account to copy them.`) : false;
    setBusy(null);
    onChange(added ? `Bank details saved on ${inv.reference}. The client sees them now${emailed ? " and has been told." : "."}` : `Bank details removed from ${inv.reference}.`);
  }

  async function markPaid(inv: StaffInvoice) {
    if (!window.confirm(`Mark ${inv.reference} (${usd(inv.amount_usd)}) as paid by bank transfer?`)) return;
    setBusy(inv.id);
    const err = await markInvoicePaid(inv.id);
    setBusy(null);
    onChange(err ? `Not marked: ${err}` : `${inv.reference} marked paid.`);
  }

  async function cancel(inv: StaffInvoice) {
    if (!window.confirm(`Cancel ${inv.reference}? The client won't be able to pay it.`)) return;
    const err = await voidInvoice(inv.id);
    onChange(err ? `Not cancelled: ${err}` : `${inv.reference} cancelled.`);
  }

  return (
    <Block id="hub-invoices" title="Invoices" note="Create an invoice, attach the PDF, and add bank details if the client wants to pay by transfer.">
      <InvoiceBuilder client={client} admin={admin} onDone={onChange} />
      {invoices.length ? (
        <ul className="mt-8 divide-y divide-line">
          {invoices.map((inv) => {
            const pdf = pdfs.find((p) => p.name.toLowerCase().startsWith(inv.reference.toLowerCase()));
            return (
              <li key={inv.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-ivory">
                    {inv.description} · <span className="font-semibold">{money(inv.amount ?? inv.amount_usd, inv.currency ?? "USD")}</span>{inv.currency && inv.currency !== "USD" ? <span className="text-xs text-stone-dim"> (US${inv.amount_usd.toFixed(2)} by card)</span> : null}
                  </p>
                  <p className="text-xs text-stone-dim">
                    {inv.reference} · {fmtDate(inv.created_at)} ·{" "}
                    <span className={inv.status === "paid" ? "text-emerald-600" : inv.status === "unpaid" ? "text-gold" : ""}>
                      {inv.status === "paid" ? `Paid ${fmtDate(inv.paid_at)}` : inv.status === "unpaid" ? "Unpaid" : inv.status === "void" ? "Cancelled" : "Needs review"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {pdf ? (
                    <>
                      <button type="button" onClick={() => openFile(DOCS, pdf.path)} className={`${btn} border border-line text-ivory hover:border-gold`}>
                        View PDF
                      </button>
                      <button type="button" disabled={busy === inv.id} onClick={() => generatePdf(inv)} className={`${btn} border border-line text-ivory hover:border-gold`}>
                        {busy === inv.id ? "Working…" : "Regenerate PDF"}
                      </button>
                      <button type="button" onClick={() => onRemovePdf(pdf)} className={`${btn} text-stone hover:text-red-400`}>
                        Remove PDF
                      </button>
                    </>
                  ) : (
                    <>
                    <button type="button" disabled={busy === inv.id} onClick={() => generatePdf(inv)} className={`${btn} bg-ivory text-ink`}>
                      {busy === inv.id ? "Working…" : "Generate PDF"}
                    </button>
                    <label className={`${btn} cursor-pointer border border-line text-ivory hover:border-gold`}>
                      Attach own PDF
                      <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => attach(inv, e.target.files?.[0])} />
                    </label>
                    </>
                  )}
                  {inv.status === "unpaid" ? (
                    <button type="button" onClick={() => cancel(inv)} className={`${btn} text-stone hover:text-red-400`}>
                      Cancel
                    </button>
                  ) : null}
                  {inv.status === "unpaid" || inv.status === "needs_review" ? (
                    <button type="button" disabled={busy === inv.id} onClick={() => markPaid(inv)} className={`${btn} bg-emerald-600 text-white disabled:opacity-40`}>
                      Mark paid
                    </button>
                  ) : null}
                </div>
                </div>
                {inv.status === "unpaid" || inv.status === "needs_review" ? (
                  <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-dim">
                    Due date
                    <input
                      type="date"
                      defaultValue={inv.due_date ?? ""}
                      key={`${inv.id}:${inv.due_date ?? ""}`}
                      onBlur={async (e) => {
                        const next = e.target.value || null;
                        if (next === (inv.due_date ?? null)) return;
                        const err = await setInvoiceDueDate(inv.id, next);
                        onChange(err ? `Not saved: ${err}` : next ? `Due date for ${inv.reference} set to ${fmtDate(next)}. Regenerate the PDF to show it there.` : `Due date removed from ${inv.reference}.`);
                      }}
                      className={`${inputClass} min-h-11`}
                    />
                  </label>
                ) : null}
                {inv.status === "unpaid" || inv.status === "needs_review" ? (
                  <BankEditor key={`${inv.id}:${inv.bank_details ?? ""}`} inv={inv} busy={busy === inv.id} onSave={(text) => saveBank(inv, text)} />
                ) : inv.status === "paid" && inv.paid_via ? (
                  <p className="mt-2 text-xs text-stone-dim">Paid via {inv.paid_via}.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-stone-dim">No invoices yet.</p>
      )}
    </Block>
  );
}

const BANK_PRESETS: { key: string; label: string; lines: string[] }[] = [
  { key: "eu", label: "Europe (IBAN)", lines: ["Account name", "IBAN", "BIC / SWIFT", "Bank name"] },
  { key: "us", label: "US wire / ACH", lines: ["Beneficiary", "Account number", "Routing number (ACH)", "Routing number (wire)", "SWIFT", "Bank name", "Bank address"] },
  { key: "blank", label: "Blank", lines: ["", ""] },
];

let rowSeq = 0;
type Row = { id: number; label: string; value: string };
const toRows = (lines: { label: string; value: string }[]): Row[] => lines.map((l) => ({ id: ++rowSeq, ...l }));

/** Fill in bank account details for one invoice, one field per row. Labels are editable and rows can be added or removed. */
function BankEditor({ inv, busy, onSave }: { inv: StaffInvoice; busy: boolean; onSave: (text: string) => void }) {
  const saved = (inv.bank_details ?? "").trim();
  const [open, setOpen] = useState(Boolean(saved));
  const [rows, setRows] = useState<Row[]>(() => toRows(parseBankLines(saved)));
  const text = serializeBankLines(rows);
  const dirty = text !== saved;

  const patch = (id: number, change: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...change } : r)));
  const start = (labels: string[]) => {
    setRows(toRows(labels.map((label) => ({ label, value: "" }))));
    setOpen(true);
  };

  if (!open) {
    return (
      <div className="mt-3">
        <p className="text-xs text-stone-dim">Client wants to pay by bank transfer? Start from:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {BANK_PRESETS.map((pr) => (
            <button key={pr.key} type="button" onClick={() => start(pr.lines)} className={`${btn} border border-line text-ivory hover:border-gold`}>
              + {pr.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const field = `${inputClass} min-h-11 w-full`;
  return (
    <div className="mt-3 rounded-2xl border border-line p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold">
        Bank transfer details {saved ? "· visible to the client" : "· not shown to the client yet"}
      </p>
      <p className="mt-1 text-xs text-stone-dim">
        Edit any label (for example IBAN → Routing number) and paste each value. The client gets a separate Copy button for every row.
      </p>
      <ul className="mt-3 space-y-3">
        {rows.map((r, i) => (
          <li key={r.id} className="grid grid-cols-[1fr_auto] items-end gap-2 sm:grid-cols-[200px_1fr_auto]">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor={`bl-${inv.id}-${r.id}`} className="sr-only">Label {i + 1}</label>
              <input
                id={`bl-${inv.id}-${r.id}`}
                value={r.label}
                maxLength={40}
                onChange={(e) => patch(r.id, { label: e.target.value })}
                placeholder="Label, e.g. IBAN"
                className={`${field} font-semibold`}
              />
            </div>
            <div>
              <label htmlFor={`bv-${inv.id}-${r.id}`} className="sr-only">Value {i + 1}</label>
              <input
                id={`bv-${inv.id}-${r.id}`}
                value={r.value}
                maxLength={200}
                onChange={(e) => patch(r.id, { value: e.target.value })}
                placeholder="Paste the value"
                className={field}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove row ${i + 1}`}
              onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-stone hover:border-red-400 hover:text-red-400"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setRows((rs) => [...rs, ...toRows([{ label: "", value: "" }])])} className={`${btn} border border-line text-ivory hover:border-gold`}>
          + Add a line
        </button>
        {BANK_PRESETS.filter((pr) => pr.key !== "blank").map((pr) => (
          <button
            key={pr.key}
            type="button"
            onClick={() => {
              if (!rows.some((r) => r.value.trim()) || window.confirm(`Replace the rows below with the ${pr.label} layout? Values you've typed will be cleared.`)) start(pr.lines);
            }}
            className={`${btn} text-stone hover:text-ivory`}
          >
            Use {pr.label} layout
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={busy || !dirty || text.length < 5} onClick={() => onSave(text)} className={`${btn} bg-ivory text-ink`}>
          {busy ? "Saving…" : saved ? "Update details" : "Save and show to client"}
        </button>
        {saved ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setRows([]);
              setOpen(false);
              onSave("");
            }}
            className={`${btn} text-stone hover:text-red-400`}
          >
            Remove from invoice
          </button>
        ) : null}
      </div>
    </div>
  );
}
