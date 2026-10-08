"use client";

import { useAuth } from "@/lib/supabase/AuthProvider";
import { AccountDashboard } from "./AccountDashboard";
import { AuthPanel } from "./AuthPanel";
import { SavedJourneysPanel } from "./SavedJourneysPanel";

/** Signed in → the profile dashboard; otherwise sign-in / create account. */
export function AccountArea() {
  const { user, loading, recovering } = useAuth();
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
