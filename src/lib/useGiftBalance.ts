"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";

/** Total of the signed-in customer's active gift card balances, in cents (0 if none). */
export function useGiftBalance(): number {
  const { user } = useAuth();
  const [owned, setOwned] = useState<{ userId: string; cents: number } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    let live = true;
    supabase
      .from("gift_cards")
      .select("balance_cents")
      .eq("status", "active")
      .then(({ data }) => {
        if (!live) return;
        const cents = (data ?? []).reduce((sum, c) => sum + (c.balance_cents as number), 0);
        setOwned({ userId: user.id, cents });
      });
    return () => {
      live = false;
    };
  }, [user]);

  return user && owned?.userId === user.id ? owned.cents : 0;
}
