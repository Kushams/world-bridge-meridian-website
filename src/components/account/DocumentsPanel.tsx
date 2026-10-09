"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { displayName, useAuth } from "@/lib/supabase/AuthProvider";
import { docKind, docTitle, notifyTeam, safeName, type DocKind } from "@/lib/clientDocs";
import { SignDocumentDialog } from "./SignDocumentDialog";

const BUCKET = "client-documents";
const UPLOADS = "client-uploads";

interface Doc {
  name: string;
  title: string;
  kind: DocKind;
  added: string | null;
  size: number | null;
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

const fmtSize = (bytes: number | null) =>
  bytes == null ? "" : bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;

/** Stem used to match a returned file to the document it answers. */
const stemOf = (name: string) => safeName(name.replace(/^(SIGN|RETURN) - /, "").replace(/\.[^.]+$/, ""));

/**
 * Files staff put in this client's folder. Plain files can be viewed. Files
 * named "SIGN - …" are signed on screen; "RETURN - …" are downloaded, signed
 * and uploaded back. The client's own folder in the private `client-documents`
 * bucket is the only thing a storage policy lets them read (see
 * supabase/client-documents.sql and client-uploads-signing.sql).
 */
export function DocumentsPanel() {
  const { user, profile } = useAuth();
  const folder = user?.email?.toLowerCase() ?? null;
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [returned, setReturned] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [signing, setSigning] = useState<Doc | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !folder) return;
    const [list, sigs, ret] = await Promise.all([
      supabase.storage.from(BUCKET).list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
      supabase.from("document_signatures").select("document_path, signed_at"),
      supabase.storage.from(UPLOADS).list(`${folder}/returned`, { limit: 100 }),
    ]);
    if (list.error) return setFailed(true);
    setDocs(
      (list.data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => ({
          name: f.name,
          title: docTitle(f.name),
          kind: docKind(f.name),
          added: f.created_at ?? null,
          size: (f.metadata as { size?: number } | null)?.size ?? null,
        })),
    );
    setSigned(Object.fromEntries((sigs.data ?? []).map((s) => [s.document_path as string, s.signed_at as string])));
    setReturned(
      Object.fromEntries(
        (ret.data ?? []).map((f) => [f.name.split("__returned")[0], f.created_at ?? new Date().toISOString()]),
      ),
    );
  }, [folder]);

  useEffect(() => {
    // Fetch from Supabase; state is set after the awaits, not synchronously.
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function view(doc: Doc) {
    const supabase = getSupabaseClient();
    if (!supabase || !folder) return;
    setBusy(doc.name);
    // The document itself never expires. Each tap makes a fresh private link, valid for an
    // hour so a PDF can reload or be downloaded; a copied link stops working after that.
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(`${folder}/${doc.name}`, 3600);
    setBusy(null);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    else setFailed(true);
  }

  async function sendBack(doc: Doc, file: File | undefined) {
    const supabase = getSupabaseClient();
    if (!file || !supabase || !folder) return;
    setNotice("");
    if (file.size > 10 * 1024 * 1024) return setNotice("That file is over 10 MB. Please send a smaller one.");
    setBusy(doc.name);
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const { error } = await supabase.storage
      .from(UPLOADS)
      .upload(`${folder}/returned/${stemOf(doc.name)}__returned${safeName(ext)}`, file, {
        contentType: file.type || undefined,
        upsert: false,
      });
    setBusy(null);
    if (error) return setNotice("We couldn't upload that file. Please use a PDF, JPG or PNG and try again.");
    notifyTeam("returned", doc.title);
    setNotice("Received. Thank you — our team has been told.");
    load();
  }

  if (failed) {
    return (
      <p className="text-sm text-stone-dim">
        We couldn&apos;t load your documents just now. Please try again in a moment.
      </p>
    );
  }
  if (docs === null) return <p className="text-sm text-stone-dim">Loading your documents…</p>;

  if (docs.length === 0) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center">
        <h3 className="font-display text-xl text-ivory">No documents yet</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          Once your journey is confirmed, your itinerary, tickets and any forms to sign will appear here —
          private to you, ready to view.
        </p>
      </div>
    );
  }

  const btn =
    "shrink-0 rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:border-gold hover:text-gold disabled:opacity-50";

  return (
    <>
      {notice ? <p className="mb-3 text-xs text-gold">{notice}</p> : null}
      <ul className="divide-y divide-line rounded-card border hairline">
        {docs.map((d) => {
          const path = `${folder}/${d.name}`;
          const signedAt = signed[path];
          const returnedAt = returned[stemOf(d.name)];
          const done = d.kind === "sign" ? signedAt : d.kind === "return" ? returnedAt : null;
          return (
            <li key={d.name} className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5">
              <div className="min-w-0">
                <p className="truncate font-display text-lg text-ivory">{d.title}</p>
                <p className="text-xs text-stone-dim">
                  {d.kind === "sign" ? (
                    done ? <span className="text-gold">Signed {fmtDate(done)} ✓</span> : <span className="text-gold">Needs your signature</span>
                  ) : d.kind === "return" ? (
                    done ? <span className="text-gold">Signed copy received {fmtDate(done)} ✓</span> : <span className="text-gold">Download, sign and send back</span>
                  ) : (
                    [fmtDate(d.added) && `Added ${fmtDate(d.added)}`, fmtSize(d.size)].filter(Boolean).join(" · ")
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" disabled={busy === d.name} onClick={() => view(d)} className={btn}>
                  {busy === d.name ? "Opening…" : "View"}
                </button>
                {d.kind === "sign" && !done ? (
                  <button type="button" onClick={() => setSigning(d)} className="rounded-full bg-ivory px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90">
                    Review &amp; sign
                  </button>
                ) : null}
                {d.kind === "return" && !done ? (
                  <label className="cursor-pointer rounded-full bg-ivory px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90">
                    Upload signed copy
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
                      className="sr-only"
                      onChange={(e) => {
                        sendBack(d, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {signing && folder ? (
        <SignDocumentDialog
          title={signing.title}
          path={`${folder}/${signing.name}`}
          email={folder}
          defaultName={displayName(user, profile) === user?.email ? "" : displayName(user, profile)}
          onClose={() => setSigning(null)}
          onSigned={() => {
            setSigning(null);
            setNotice("Signed. Thank you — a copy is on file and our team has been told.");
            load();
          }}
        />
      ) : null}
    </>
  );
}
