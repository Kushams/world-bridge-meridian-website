"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { consumeReturnPath } from "./AccountGate";
import { AccountDashboard } from "./AccountDashboard";
import { AuthPanel } from "./AuthPanel";
import { SavedJourneysPanel } from "./SavedJourneysPanel";

/** Signed in → the profile dashboard; otherwise sign-in / create account. */
export function AccountArea() {
  const { user, loading, recovering } = useAuth();
  useEffect(() => {
    if (loading || !user || recovering) return;
    const back = consumeReturnPath();
    if (back && !back.startsWith(window.location.pathname)) window.location.replace(back);
  }, [loading, user, recovering]);
  if (!loading && user && !recovering) return <AccountDashboard />;
  return (
    <>
      <div className="mx-auto max-w-xl">
        <AuthPanel />
      </div>
      <div className="mt-20">
        <SavedJourneysPanel />
      </div>
    </>
  );
}
