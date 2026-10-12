"use client";

import { useEffect, useMemo, useState } from "react";
import { FORM_LABEL, STATUSES, fmtDate, loadRequests, setStatus, type Request, type Status } from "@/lib/staff";

export const inputClass =
  "rounded-control border border-line bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";

const SKIP_KEYS = new Set(["token", "website", "acceptedTerms"]);

function Details({ r }: { r: Request }) {
  const rows = Object.entries(r.payload ?? {}).filter(([k, v]) => !SKIP_KEYS.has(k) && v !== null && v !== "" && v !== undefined);
  return (
    <div className="mt-4 space-y-3 border-t hairline pt-4 text-sm">
      {r.message ? <p className="whitespace-pre-wrap text-stone">{r.message}</p> : null}
      {rows.length ? (
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[180px_1fr]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-xs uppercase tracking-wide text-stone-dim">{k.replace(/[_-]+/g, " ")}</dt>
              <dd className="break-words text-ivory">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

export function Row({ r, onSaved, onOpenClient }: { r: Request; onSaved: (s: Status) => void; onOpenClient?: (email: string) => void }) {
  const [draft, setDraft] = useState<Status>(r.status);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setBusy(true);
    setMsg("");
    const err = await setStatus(r.id, draft);
    setBusy(false);
    if (err) return setMsg(`Not saved: ${err}`);
    onSaved(draft);
    setMsg("Saved. The client has been emailed.");
  }

  return (
    <article className="rounded-[24px] border hairline bg-charcoal/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gold">{FORM_LABEL[r.form_type] ?? r.form_type}</p>
          <h3 className="mt-1 font-display text-lg text-ivory">{r.name || "No name"}</h3>
          <p className="text-xs text-stone-dim">
            {r.email} · sent {fmtDate(r.submitted_at)}
            {r.subject ? ` · ${r.subject}` : ""}
          </p>
        </div>
      </div>
      <div role="radiogroup" aria-label="Stage" className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((st) => (
          <button
            key={st.key}
            type="button"
            role="radio"
            aria-checked={draft === st.key}
            onClick={() => setDraft(st.key)}
            className={`min-h-11 rounded-full border px-4 text-xs font-semibold uppercase tracking-wide transition active:scale-95 ${
              draft === st.key
                ? "border-gold bg-gold text-white"
                : st.key === r.status
                  ? "border-gold/60 text-gold"
                  : "border-line text-stone hover:border-gold/60 hover:text-ivory"
            }`}
          >
            {st.label}
            {st.key === r.status ? " ·" : ""}
          </button>
        ))}
      </div>
      {draft !== r.status ? (
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="mt-3 h-12 w-full rounded-full bg-ivory text-sm font-semibold uppercase tracking-wide text-ink active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? "Saving…" : `Move to ${STATUSES.find((x) => x.key === draft)?.label} and email client`}
        </button>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 font-semibold uppercase tracking-wide text-stone active:scale-95 hover:border-gold hover:text-ivory">
          {open ? "Hide details" : "Show details"}
        </button>
        {r.email && onOpenClient ? (
          <button type="button" onClick={() => onOpenClient(r.email!.toLowerCase())} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 font-semibold uppercase tracking-wide text-stone active:scale-95 hover:border-gold hover:text-ivory">
            Open client page
          </button>
        ) : null}
        {r.email ? (
          <a href={`mailto:${r.email}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 font-semibold uppercase tracking-wide text-stone active:scale-95 hover:border-gold hover:text-ivory">
            Email client
          </a>
        ) : null}
      </div>
      {msg ? <p className={`mt-3 text-sm ${msg.startsWith("Not") ? "text-red-400" : "text-gold"}`}>{msg}</p> : null}
      {open ? <Details r={r} /> : null}
    </article>
  );
}

/** Every request from the website forms; change a stage and the client is emailed automatically. */
export function RequestsPanel({ onOpenClient }: { onOpenClient: (email: string) => void }) {
  const [list, setList] = useState<Request[] | null | undefined>(undefined);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Status | "open" | "all">("open");

  useEffect(() => {
    let alive = true;
    loadRequests().then((r) => alive && setList(r));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (list ?? []).filter(
      (r) =>
        (stage === "all" || (stage === "open" ? r.status !== "closed" : r.status === stage)) &&
        (!needle || [r.name, r.email, r.subject, r.message].some((v) => v?.toLowerCase().includes(needle))),
    );
  }, [list, q, stage]);

  if (list === undefined) return <p className="text-sm text-stone-dim">Loading requests…</p>;
  if (list === null) return <p className="text-sm text-red-400">Couldn&apos;t load requests. Refresh the page to try again.</p>;

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email or message"
        className={`${inputClass} mb-3 h-12 w-full rounded-full px-5`}
      />
      <div role="radiogroup" aria-label="Filter by stage" className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
        {([{ key: "open", label: "Open" }, { key: "all", label: "Everything" }, ...STATUSES] as { key: Status | "open" | "all"; label: string }[]).map((f) => (
          <button
            key={f.key}
            type="button"
            role="radio"
            aria-checked={stage === f.key}
            onClick={() => setStage(f.key)}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-semibold uppercase tracking-wide active:scale-95 ${
              stage === f.key ? "border-ivory bg-ivory text-ink" : "border-line text-stone hover:text-ivory"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-xs text-stone-dim">
        {shown.length} of {list.length} requests. Newsletter sign-ups are not listed.
      </p>
      <div className="space-y-4">
        {shown.map((r) => (
          <Row
            key={r.id}
            r={r}
            onOpenClient={onOpenClient}
            onSaved={(s) => setList((l) => l?.map((x) => (x.id === r.id ? { ...x, status: s } : x)))}
          />
        ))}
      </div>
    </div>
  );
}
