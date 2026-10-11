"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";

const KEY = "wbm_staff_ref";

/**
 * Remembers a staff member's personal link (?from=<code>) and, once the visitor
 * is signed in with a confirmed email, assigns them to that staff member
 * (supabase/staff.sql: claim_staff_referral). Existing assignments are kept.
 */
export function StaffReferral() {
  const { user } = useAuth();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("from")?.trim().toLowerCase();
    if (code && /^[a-z0-9-]{2,30}$/.test(code)) {
      try {
        localStorage.setItem(KEY, code);
      } catch {
        /* storage unavailable */
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.email_confirmed_at) return;
    let code: string | null = null;
    try {
      code = localStorage.getItem(KEY);
    } catch {
      return;
    }
    if (!code) return;
    getSupabaseClient()
      ?.rpc("claim_staff_referral", { p_code: code })
      .then(({ error }) => {
        if (!error) localStorage.removeItem(KEY);
      });
  }, [user]);

  return null;
}
