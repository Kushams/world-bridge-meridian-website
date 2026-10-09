"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { notifyTeam, safeName } from "@/lib/clientDocs";

const BUCKET = "client-uploads";
const CATEGORIES = [
  { key: "passport", label: "Passport" },
  { key: "visa", label: "Visa or permit" },
  { key: "other", label: "Other" },
] as const;
type Category = (typeof CATEGORIES)[number]["key"];

interface Upload {
  category: Category;
  name: string;
  path: string;
  added: string | null;
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

/** "1760000000000-my_passport.jpg" -> "my passport.jpg" */
const shown = (name: string) => name.replace(/^\d+-/, "").replace(/_/g, " ");

/** Passport scans and other files the client sends us. Private to them and our team. */
export function UploadsPanel() {
  const { user } = useAuth();
  const folder = user?.email?.toLowerCase() ?? null;
  const [items, setItems] = useState<Upload[] | null>(null);
  const [category, setCategory] = useState<Category>("passport");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !folder) return;
    const lists = await Promise.all(
      CATEGORIES.map(async (c) => {
        const { data } = await supabase.storage.from(BUCKET).list(`${folder}/${c.key}`, { limit: 50 });
        return (data ?? [])
          .filter((f) => f.name && !f.name.startsWith("."))
          .map((f) => ({ category: c.key, name: f.name, path: `${folder}/${c.key}/${f.name}`, added: f.created_at ?? null }));
      }),
    );
    setItems(lists.flat());
  }, [folder]);

  useEffect(() => {
    // Initial fetch from Supabase; the state update happens after the await.
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function onPick(file: File | undefined) {
    const supabase = getSupabaseClient();
    if (!file || !supabase || !folder) return;
    setError("");
    setNotice("");
    if (file.size > 10 * 1024 * 1024) return setError("That file is over 10 MB. Please send a smaller photo or PDF.");
    setBusy(true);
    const path = `${folder}/${category}/${Date.now()}-${safeName(file.name)}`;
    const { error: err } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
    setBusy(false);
    if (err) return setError("We couldn't upload that file. Please use a PDF, JPG or PNG and try again.");
    setNotice("Received. Thank you — our team has been told.");
    notifyTeam("upload", file.name, category);
    load();
  }

  async function remove(u: Upload) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    if (!window.confirm("Delete this file? You can upload it again any time.")) return;
    await supabase.storage.from(BUCKET).remove([u.path]);
    load();
  }

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-stone leading-relaxed">
        Send us your passport page or visa so we can book your journey. Files are private: only you and your
        World Bridge Meridian consultant can open them, and we delete passport copies after your trip.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Type of document" className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="radio"
              aria-checked={category === c.key}
              onClick={() => setCategory(c.key)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                category === c.key ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className={`cursor-pointer rounded-full bg-ivory px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? "Uploading…" : "Choose file"}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              onPick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error ? <p role="alert" className="text-xs text-red-500">{error}</p> : null}
      {notice ? <p className="text-xs text-gold">{notice}</p> : null}

      {items && items.length > 0 ? (
        <ul className="divide-y divide-line rounded-card border hairline">
          {items.map((u) => (
            <li key={u.path} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm text-ivory">{shown(u.name)}</p>
                <p className="text-xs text-stone-dim">
                  {CATEGORIES.find((c) => c.key === u.category)?.label} · Received {fmt(u.added)}
                </p>
              </div>
              <button type="button" onClick={() => remove(u)} className="shrink-0 text-xs text-stone-dim underline hover:text-ivory">
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
