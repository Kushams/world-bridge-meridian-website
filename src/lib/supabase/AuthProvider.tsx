"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

type Result = { ok: boolean; error?: string };

/** The non-sensitive details stored per account (see supabase/profiles-enquiries.sql). */
export interface Profile {
  full_name: string | null;
  phone: string | null;
  home_city: string | null;
  nationality: string | null;
  preferred_contact: string | null;
  travel_styles: string[];
  interests: string[];
  travel_pace: string | null;
  bed_preference: string | null;
  dietary_requirements: string | null;
  allergies: string | null;
}

export type ProfilePatch = Partial<Profile>;

interface AuthContextValue {
  user: User | null;
  /** The saved profile, or null until it has loaded (or when signed out). */
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  /** True after following a password-reset link: show the "set a new password" form. */
  recovering: boolean;
  googleEnabled: boolean;
  signUp: (input: SignUpInput) => Promise<Result>;
  signInWithPassword: (email: string, password: string) => Promise<Result>;
  sendSignInLink: (email: string) => Promise<Result>;
  sendPasswordReset: (email: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
  signInWithGoogle: () => Promise<Result>;
  updateProfile: (patch: ProfilePatch) => Promise<Result>;
  deleteAccount: () => Promise<Result>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const accountUrl = () =>
  typeof window !== "undefined"
    ? `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/my-world-bridge`
    : undefined;

const NOT_CONNECTED: Result = { ok: false, error: "Accounts aren't connected yet." };

/**
 * Accounts: email + password, an emailed sign-in link, password reset, and
 * Google when NEXT_PUBLIC_GOOGLE_SIGNIN is "true" (it also has to be switched
 * on in the Supabase dashboard). Name and phone are captured at sign-up and
 * mirrored into public.profiles by a database trigger (supabase/schema.sql);
 * the rest of the profile is edited on /my-world-bridge. Site-wide so any
 * page can read the signed-in user and their profile via useAuth().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState<{ userId: string; profile: Profile } | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_OUT") setRecovering(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Load the profile whenever the signed-in user changes.
  const userId = user?.id ?? null;
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !userId) return;
    let cancelled = false;
    const emptyProfile: Profile = {
      full_name: null,
      phone: null,
      home_city: null,
      nationality: null,
      preferred_contact: null,
      travel_styles: [],
      interests: [],
      travel_pace: null,
      bed_preference: null,
      dietary_requirements: null,
      allergies: null,
    };
    const fullColumns =
      "full_name, phone, home_city, nationality, preferred_contact, travel_styles, interests, travel_pace, bed_preference, dietary_requirements, allergies";
    (async () => {
      const first = await supabase.from("profiles").select(fullColumns).eq("id", userId).maybeSingle();
      let data: unknown = first.data;
      if (first.error) {
        // The new profile columns aren't in the database yet (supabase/profiles-enquiries.sql
        // not run): fall back to the original two so sign-in and the dashboard still work.
        const basic = await supabase.from("profiles").select("full_name, phone").eq("id", userId).maybeSingle();
        data = basic.data;
      }
      if (cancelled) return;
      setLoaded({ userId, profile: { ...emptyProfile, ...((data as Partial<Profile> | null) ?? {}) } });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Only ever expose the profile that belongs to the current user.
  const profile = loaded && loaded.userId === userId ? loaded.profile : null;

  const signUp = useCallback(async ({ fullName, email, phone, password }: SignUpInput): Promise<Result> => {
    const supabase = getSupabaseClient();
    if (!supabase) return NOT_CONNECTED;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone }, emailRedirectTo: accountUrl() },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<Result> => {
    const supabase = getSupabaseClient();
    if (!supabase) return NOT_CONNECTED;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const sendSignInLink = useCallback(async (email: string): Promise<Result> => {
    const supabase = getSupabaseClient();
    if (!supabase) return NOT_CONNECTED;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: accountUrl(), shouldCreateUser: false },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const sendPasswordReset = useCallback(async (email: string): Promise<Result> => {
    const supabase = getSupabaseClient();
    if (!supabase) return NOT_CONNECTED;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: accountUrl() });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<Result> => {
    const supabase = getSupabaseClient();
    if (!supabase) return NOT_CONNECTED;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: error.message };
    setRecovering(false);
    return { ok: true };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<Result> => {
    const supabase = getSupabaseClient();
    if (!supabase) return NOT_CONNECTED;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: accountUrl() },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfilePatch): Promise<Result> => {
      const supabase = getSupabaseClient();
      if (!supabase || !userId) return NOT_CONNECTED;
      const { error } = await supabase.from("profiles").upsert({ id: userId, ...patch });
      if (error) return { ok: false, error: error.message };
      setLoaded((current) =>
        current && current.userId === userId
          ? { userId, profile: { ...current.profile, ...patch } }
          : current,
      );
      return { ok: true };
    },
    [userId],
  );

  const deleteAccount = useCallback(async (): Promise<Result> => {
    const supabase = getSupabaseClient();
    if (!supabase) return NOT_CONNECTED;
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) return { ok: false, error: "We couldn't delete your account just now. Please email us and we'll do it for you." };
    await supabase.auth.signOut();
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        configured: isSupabaseConfigured,
        recovering,
        googleEnabled: process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "true",
        signUp,
        signInWithPassword,
        sendSignInLink,
        sendPasswordReset,
        updatePassword,
        signInWithGoogle,
        updateProfile,
        deleteAccount,
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

/** First name for greetings, falling back to the part of the email before the @. */
export function displayName(user: User | null, profile: Profile | null): string {
  const full = profile?.full_name?.trim() || (user?.user_metadata?.full_name as string | undefined)?.trim();
  if (full) return full;
  return user?.email?.split("@")[0] ?? "";
}

export function initials(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0] ?? ""])
    .map((p) => p[0] ?? "")
    .join("");
  return (letters || "?").toUpperCase();
}
