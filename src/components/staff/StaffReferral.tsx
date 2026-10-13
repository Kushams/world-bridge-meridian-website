"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { referralCodeFromSearch } from "@/lib/referral";

const KEY = "wbm_staff_ref";

/**
 * Remembers a staff member's personal link (?from=<code>, or ?ref=<code>) and, once the visitor
 * is signed in with a confirmed email, assigns them to that staff member
 * (supabase/staff.sql: claim_staff_referral). Existing assignments are kept.
 */
export function StaffReferral() {
  const { user } = useAuth();

  useEffect(() => {
    const code = referralCodeFromSearch(window.location.search);
    if (code) {
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
