"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signUp: (input: SignUpInput) => Promise<{ ok: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Email + password accounts, with full name and phone captured at sign-up
 * (stored in user_metadata, then mirrored into a public.profiles row by a
 * database trigger — see supabase/schema.sql). Site-wide so any page can
 * read the signed-in user via useAuth() without re-fetching the session.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signUp({
    fullName,
    email,
    phone,
    password,
  }: SignUpInput): Promise<{ ok: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: "Accounts aren't connected yet." };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/my-world-bridge` : undefined,
      },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async function signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: "Accounts aren't connected yet." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isSupabaseConfigured,
        signUp,
        signInWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
