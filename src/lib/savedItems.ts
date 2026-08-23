"use client";

import { useCallback, useEffect, useState } from "react";

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
 * Saved journeys, kept in the visitor's own browser via localStorage since
 * there is no account/auth system yet. Private to this device — not synced
 * anywhere, not visible to us.
 */
export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>([]);

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

  const isSaved = useCallback(
    (type: SavedItemType, slug: string) =>
      items.some((i) => itemKey(i.type, i.slug) === itemKey(type, slug)),
    [items],
  );

  const toggle = useCallback((item: Omit<SavedItem, "savedAt">) => {
    const current = readStorage();
    const key = itemKey(item.type, item.slug);
    const exists = current.some((i) => itemKey(i.type, i.slug) === key);
    const next = exists
      ? current.filter((i) => itemKey(i.type, i.slug) !== key)
      : [...current, { ...item, savedAt: new Date().toISOString() }];
    writeStorage(next);
    setItems(next);
  }, []);

  const remove = useCallback((type: SavedItemType, slug: string) => {
    const next = readStorage().filter((i) => itemKey(i.type, i.slug) !== itemKey(type, slug));
    writeStorage(next);
    setItems(next);
  }, []);

  return { items, isSaved, toggle, remove };
}
