"use client";

import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";

const REF_KEY = "wbm_ref";
const REF_PATTERN = /^[A-Za-z0-9]{6,12}$/;

/**
 * Remembers an invite code from `?ref=CODE` on any page, and once the visitor
 * has an account, applies it (the database decides whether it is allowed:
 * new accounts only, not your own code, once). Renders nothing.
 */
export function InviteClaimer() {
  const { user } = useAuth();

  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && REF_PATTERN.test(ref)) localStorage.setItem(REF_KEY, ref.toUpperCase());
    } catch {
      /* storage blocked: the invite simply can't be remembered */
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    let code: string | null = null;
    try {
      code = localStorage.getItem(REF_KEY);
    } catch {
      return;
    }
    if (!code) return;
    // Whatever the answer, try once: a code that is refused will not become valid later.
    try {
      localStorage.removeItem(REF_KEY);
    } catch {
      /* ignore */
    }
    // The query builder only sends when awaited, so attach a handler.
    supabase.rpc("claim_invite", { p_code: code }).then(() => {}, () => {});
  }, [user]);

  return null;
}
