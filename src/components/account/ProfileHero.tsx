"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { avatarUrl, displayName, useAuth } from "@/lib/supabase/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useCreditBalance } from "@/lib/useCreditBalance";
import { fmtUsd } from "@/lib/credits";
import { Avatar } from "./Avatar";
import { profileCompleteness } from "./ProfileForm";

/** Crop to a centred square and shrink to 512px, so uploads are small whatever the camera produced. */
async function squareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(512, side);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.86));
}

const memberSince = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "");

/** The top of the profile page: cover, photo (with upload), name, details, wallet balance. */
export function ProfileHero() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const name = displayName(user, profile);
  const photo = avatarUrl(user, profile);
  const done = profileCompleteness(profile);
  const balanceCents = useCreditBalance();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const supabase = getSupabaseClient();
    if (!file || !supabase || !user) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) return setMessage({ ok: false, text: "Please choose a photo (JPG, PNG or WebP)." });
    if (file.size > 15 * 1024 * 1024) return setMessage({ ok: false, text: "That photo is too large. Please choose one under 15 MB." });
    setBusy(true);
    setMessage(null);
    try {
      const blob = await squareJpeg(file);
      const path = `${user.id}/avatar.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const result = await updateProfile({ avatar_url: `${data.publicUrl}?v=${Date.now()}` });
      setMessage(result.ok ? { ok: true, text: "Photo updated." } : { ok: false, text: result.error ?? "We couldn't save your photo." });
    } catch {
      setMessage({ ok: false, text: "We couldn't upload that photo. Please try another." });
    }
    setBusy(false);
  }

  async function onRemove() {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setBusy(true);
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpg`]);
    const result = await updateProfile({ avatar_url: null });
    setMessage(result.ok ? { ok: true, text: "Photo removed." } : { ok: false, text: result.error ?? "We couldn't remove your photo." });
    setBusy(false);
  }

  const hasUploaded = Boolean(profile?.avatar_url);

  return (
    <div className="overflow-hidden rounded-3xl border hairline bg-charcoal">
      <div className="h-28 sm:h-36" style={{ background: "linear-gradient(120deg,#0f1c33 0%,#1d3a5c 50%,#8a5a22 100%)" }} aria-hidden />
      <div className="px-6 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-14">
          <div className="relative">
            <Avatar url={photo} name={name} className="h-24 w-24 border-4 !border-ink bg-ink text-3xl sm:h-28 sm:w-28" />
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              aria-label={photo ? "Change profile photo" : "Add a profile photo"}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-ivory text-ink shadow transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" onChange={onPick} aria-label="Upload profile photo" />
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-full border hairline px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:bg-ivory hover:text-ink"
          >
            Sign out
          </button>
        </div>

        <h2 className="mt-4 truncate font-display text-2xl text-ivory md:text-3xl">{name}</h2>
        <p className="truncate text-sm text-stone-dim">{user?.email}</p>
        <p className="mt-2 text-xs text-stone">
          {profile?.home_city ? `${profile.home_city} · ` : ""}
          {user?.created_at ? `Member since ${memberSince(user.created_at)}` : ""}
        </p>
        {message ? <p role="status" className={`mt-2 text-xs ${message.ok ? "text-gold" : "text-red-500"}`}>{busy ? "Working…" : message.text}</p> : busy ? <p className="mt-2 text-xs text-stone">Uploading…</p> : null}
        {hasUploaded ? (
          <button type="button" onClick={onRemove} disabled={busy} className="mt-1 text-xs text-stone-dim underline hover:text-ivory">Remove photo</button>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a href="#travel-credits" className="group rounded-2xl border hairline bg-ink p-4 transition-colors hover:border-gold">
            <p className="text-[0.65rem] uppercase tracking-wide text-stone-dim">Wallet balance</p>
            <p className="mt-1 font-display text-2xl text-ivory">{fmtUsd(balanceCents / 100)}</p>
            <p className="mt-0.5 text-xs text-gold">Open my wallet →</p>
          </a>
          <div className="rounded-2xl border hairline bg-ink p-4">
            <p className="text-[0.65rem] uppercase tracking-wide text-stone-dim">Profile {done}% complete</p>
            <div className="mt-3 h-1.5 rounded-full bg-line">
              <div className="h-1.5 rounded-full bg-gold transition-all" style={{ width: `${done}%` }} />
            </div>
            <Link href="#profile-form" className="mt-2 inline-block text-xs text-gold">{done < 100 ? "Finish my profile →" : "Edit my details →"}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
