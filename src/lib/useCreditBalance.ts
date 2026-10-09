"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";

/** The signed-in customer's usable Travel Credits + unexpired Promo Credits, in cents (0 if none). */
export function useCreditBalance(): number {
  const { user } = useAuth();
  const [owned, setOwned] = useState<{ userId: string; cents: number } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    let live = true;
    supabase
      .from("travel_credit_buckets")
      .select("balance_cents, expires_at")
      .then(({ data }) => {
        if (!live) return;
        const now = Date.now();
        const rows = Array.isArray(data) ? data : [];
        const cents = rows
          .filter((b) => !b.expires_at || new Date(b.expires_at as string).getTime() > now)
          .reduce((sum, b) => sum + (b.balance_cents as number), 0);
        setOwned({ userId: user.id, cents });
      });
    return () => {
      live = false;
    };
  }, [user]);

  return user && owned?.userId === user.id ? owned.cents : 0;
}
