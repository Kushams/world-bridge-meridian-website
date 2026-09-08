"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";

export type SavedItemType = "destination" | "package" | "cruise" | "journey-story";

export interface SavedItem {
  type: SavedItemType;
  slug: string;
  title: string;
  image: string;
  href: string;
  savedAt: string;
}

const STORAGE_KEY = "wbm_saved_journeys";

function readStorage(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: SavedItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("wbm-saved-items-changed"));
  } catch {
    // localStorage unavailable (private browsing, storage full) — saving
    // silently no-ops rather than breaking the page.
  }
}

function itemKey(type: SavedItemType, slug: string) {
  return `${type}:${slug}`;
}

/**
 * Saved journeys — kept in localStorage as the fast, always-available
 * cache. When Supabase is configured and the visitor is signed in, that
 * same data also syncs to their account so it follows them across
 * devices; signed out (or accounts not configured at all) it stays
 * exactly as before: private to this browser only.
 */
export function useSavedItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const syncedForUser = useRef<string | null>(null);

  useEffect(() => {
    const onChange = () => setItems(readStorage());
    const raf = requestAnimationFrame(onChange);
    window.addEventListener("wbm-saved-items-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wbm-saved-items-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // On sign-in: push up anything saved locally before the account existed,
  // then pull down the account's full list as the source of truth.
  useEffect(() => {
    if (!user || syncedForUser.current === user.id) return;
    syncedForUser.current = user.id;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    (async () => {
      const local = readStorage();
      if (local.length > 0) {
        await supabase.from("saved_journeys").upsert(
          local.map((i) => ({
            user_id: user.id,
            type: i.type,
            slug: i.slug,
            title: i.title,
            image: i.image,
            href: i.href,
            saved_at: i.savedAt,
          })),
          { onConflict: "user_id,type,slug", ignoreDuplicates: true },
        );
      }

      const { data } = await supabase
        .from("saved_journeys")
        .select("type, slug, title, image, href, saved_at")
        .eq("user_id", user.id);

      if (data) {
        const merged: SavedItem[] = data.map((row) => ({
          type: row.type as SavedItemType,
          slug: row.slug,
          title: row.title,
          image: row.image,
          href: row.href,
          savedAt: row.saved_at,
        }));
        writeStorage(merged);
        setItems(merged);
      }
    })();
  }, [user]);

  const isSaved = useCallback(
    (type: SavedItemType, slug: string) =>
      items.some((i) => itemKey(i.type, i.slug) === itemKey(type, slug)),
    [items],
  );

  const toggle = useCallback(
    (item: Omit<SavedItem, "savedAt">) => {
      const current = readStorage();
      const key = itemKey(item.type, item.slug);
      const exists = current.some((i) => itemKey(i.type, i.slug) === key);
      const savedAt = new Date().toISOString();
      const next = exists
        ? current.filter((i) => itemKey(i.type, i.slug) !== key)
        : [...current, { ...item, savedAt }];
      writeStorage(next);
      setItems(next);

      const supabase = user ? getSupabaseClient() : null;
      if (supabase && user) {
        if (exists) {
          void supabase
            .from("saved_journeys")
            .delete()
            .match({ user_id: user.id, type: item.type, slug: item.slug });
        } else {
          void supabase.from("saved_journeys").upsert(
            {
              user_id: user.id,
              type: item.type,
              slug: item.slug,
              title: item.title,
              image: item.image,
              href: item.href,
              saved_at: savedAt,
            },
            { onConflict: "user_id,type,slug" },
          );
        }
      }
    },
    [user],
  );

  const remove = useCallback(
    (type: SavedItemType, slug: string) => {
      const next = readStorage().filter((i) => itemKey(i.type, i.slug) !== itemKey(type, slug));
      writeStorage(next);
      setItems(next);

      const supabase = user ? getSupabaseClient() : null;
      if (supabase && user) {
        void supabase.from("saved_journeys").delete().match({ user_id: user.id, type, slug });
      }
    },
    [user],
  );

  return { items, isSaved, toggle, remove };
}
