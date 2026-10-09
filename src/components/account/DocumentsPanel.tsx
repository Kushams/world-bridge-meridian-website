"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";

const BUCKET = "client-documents";

interface Doc {
  name: string;
  title: string;
  added: string | null;
  size: number | null;
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

const fmtSize = (bytes: number | null) =>
  bytes == null ? "" : bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;

/** "Paris_itinerary-v2.pdf" -> "Paris itinerary v2" */
const titleFor = (file: string) =>
  file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

/**
 * Files staff upload for this client. They live in the private
 * `client-documents` Storage bucket, in a folder named after the client's
 * (lower-case) email; a storage policy lets a signed-in user read only the
 * folder matching their verified email (see supabase/client-documents.sql).
 */
export function DocumentsPanel() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const folder = user?.email?.toLowerCase() ?? null;

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !folder) return;
    let cancelled = false;
    supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setFailed(true);
          return;
        }
        setDocs(
          (data ?? [])
            .filter((f) => f.name && !f.name.startsWith("."))
            .map((f) => ({
              name: f.name,
              title: titleFor(f.name),
              added: f.created_at ?? null,
              size: (f.metadata as { size?: number } | null)?.size ?? null,
            })),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [folder]);

  async function open(doc: Doc) {
    const supabase = getSupabaseClient();
    if (!supabase || !folder) return;
    setOpening(doc.name);
    // The document itself never expires. Each tap makes a fresh private link, valid for an
    // hour so a PDF can reload or be downloaded; a copied link stops working after that.
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(`${folder}/${doc.name}`, 3600);
    setOpening(null);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    else setFailed(true);
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
          Once your journey is confirmed, your itinerary, tickets and other travel documents will appear
          here — private to you, ready to download.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-card border hairline">
      {docs.map((d) => (
        <li key={d.name} className="flex items-center justify-between gap-4 p-4 md:p-5">
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-ivory">{d.title}</p>
            <p className="text-xs text-stone-dim">
              {[fmtDate(d.added) && `Added ${fmtDate(d.added)}`, fmtSize(d.size)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            disabled={opening === d.name}
            onClick={() => open(d)}
            className="shrink-0 rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
          >
            {opening === d.name ? "Opening…" : "View"}
          </button>
        </li>
      ))}
    </ul>
  );
}
