"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { displayName, useAuth } from "@/lib/supabase/AuthProvider";
import { docKind, docTitle, notifyTeam, safeName, stemOf, type DocKind } from "@/lib/clientDocs";
import { SignDocumentDialog } from "./SignDocumentDialog";

const BUCKET = "client-documents";
const UPLOADS = "client-uploads";

interface Pending {
  name: string;
  title: string;
  kind: DocKind;
}

/**
 * The Inbox's "Waiting on you" card: documents we sent that still need a signature on screen, or a signed copy sent back.
 * Same actions as Itineraries & Documents, one tap away from the conversation.
 */
export function DocumentsToDo() {
  const { user, profile } = useAuth();
  const folder = user?.email?.toLowerCase() ?? null;
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [signing, setSigning] = useState<Pending | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !folder) return;
    const [list, sigs, ret] = await Promise.all([
      supabase.storage.from(BUCKET).list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
      supabase.from("document_signatures").select("document_path, signed_at"),
      supabase.storage.from(UPLOADS).list(`${folder}/returned`, { limit: 100 }),
    ]);
    if (list.error) return;
    const signed = new Set((sigs.data ?? []).map((s) => s.document_path as string));
    const returned = new Set((ret.data ?? []).map((f) => f.name.split("__returned")[0]));
    setPending(
      (list.data ?? [])
        .filter((f) => f.id && f.name && !f.name.startsWith("."))
        .map((f) => ({ name: f.name, title: docTitle(f.name), kind: docKind(f.name) }))
        .filter((d) => (d.kind === "sign" && !signed.has(`${folder}/${d.name}`)) || (d.kind === "return" && !returned.has(stemOf(d.name)))),
    );
  }, [folder]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function sendBack(doc: Pending, file: File | undefined) {
    const supabase = getSupabaseClient();
    if (!file || !supabase || !folder) return;
    setNotice("");
    if (file.size > 10 * 1024 * 1024) return setNotice("That file is over 10 MB. Please send a smaller one.");
    setBusy(doc.name);
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const path = `${folder}/returned/${stemOf(doc.name)}__returned${safeName(ext)}`;
    const { error } = await supabase.storage.from(UPLOADS).upload(path, file, { contentType: file.type || undefined, upsert: false });
    setBusy(null);
    if (error) return setNotice("We couldn't upload that file. Please use a PDF, JPG or PNG and try again.");
    notifyTeam("returned", doc.title, undefined, path);
    setNotice("Received. Thank you: our team has been told.");
    load();
  }

  if (!pending.length && !notice) return null;
  return (
    <div className="rounded-card border border-gold/50 bg-gold/5 p-5">
      <p className="eyebrow">Waiting on you</p>
      {pending.length ? (
        <ul className="mt-3 divide-y divide-line">
          {pending.map((d) => (
            <li key={d.name} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm text-ivory">{d.title}</p>
                <p className="text-xs text-stone-dim">{d.kind === "sign" ? "Needs your signature" : "Download, sign, then send the signed copy back"}</p>
              </div>
              {d.kind === "sign" ? (
                <button type="button" onClick={() => setSigning(d)} className="min-h-11 rounded-full bg-ivory px-5 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90">
                  Review &amp; sign
                </button>
              ) : (
                <label className={`flex min-h-11 cursor-pointer items-center rounded-full bg-ivory px-5 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 ${busy === d.name ? "opacity-50" : ""}`}>
                  {busy === d.name ? "Sending…" : "Send signed copy"}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      sendBack(d, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {notice ? <p className="mt-3 text-xs text-gold">{notice}</p> : null}

      {signing && folder ? (
        <SignDocumentDialog
          title={signing.title}
          path={`${folder}/${signing.name}`}
          email={folder}
          defaultName={displayName(user, profile) === user?.email ? "" : displayName(user, profile)}
          onClose={() => setSigning(null)}
          onSigned={() => {
            setSigning(null);
            setNotice("Signed. Thank you: a copy is on file and our team has been told.");
            load();
          }}
        />
      ) : null}
    </div>
  );
}
