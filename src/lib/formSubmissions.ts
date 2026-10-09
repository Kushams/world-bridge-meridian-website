"use client";

import { FunctionsHttpError } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

export type FormType = "contact" | "newsletter" | "journey-request" | "travel-details" | "gift-card" | "travel-credits";

export interface FormSubmissionInput {
  formType: FormType;
  email: string;
  name?: string;
  subject?: string;
  message?: string;
  /** Everything else the form collected; stored as jsonb and emailed. */
  payload?: Record<string, string | string[] | null>;
  /** Required once NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. */
  turnstileToken?: string | null;
}

export type FormFailure = "throttled" | "verification" | "unavailable";

/**
 * The site's form backend: a row in public.form_submissions, which fires
 * the notify-form-submission edge function (Resend) to email the team and
 * acknowledge the sender. Unlike Netlify Forms this works on any host, so
 * it survives the move off Netlify — see supabase/forms.sql.
 */
export async function submitForm(
  input: FormSubmissionInput,
): Promise<{ ok: true } | { ok: false; kind: FormFailure; error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, kind: "unavailable", error: "Form submission isn't configured." };
  }

  const row = {
    formType: input.formType,
    name: input.name || null,
    email: input.email,
    subject: input.subject || null,
    message: input.message || null,
    payload: input.payload ?? {},
  };

  // With Turnstile on, rows can only be added by the submit-form edge
  // function after it verifies the token (supabase/turnstile.sql).
  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    if (!input.turnstileToken) {
      return {
        ok: false,
        kind: "verification",
        error: "Please wait for the security check to finish, then try again.",
      };
    }
    const { error } = await supabase.functions.invoke("submit-form", {
      body: { ...row, token: input.turnstileToken },
    });
    if (!error) return { ok: true };
    const status = error instanceof FunctionsHttpError ? error.context.status : 0;
    const message = await functionErrorMessage(error);
    if (status === 429) return { ok: false, kind: "throttled", error: message };
    if (status === 403) return { ok: false, kind: "verification", error: message };
    return { ok: false, kind: "unavailable", error: message };
  }

  const { error } = await supabase.from("form_submissions").insert({
    form_type: input.formType,
    name: input.name || null,
    email: input.email,
    subject: input.subject || null,
    message: input.message || null,
    payload: input.payload ?? {},
  });

  if (error) {
    // 53400 is the submission rate limit in supabase/forms.sql; its
    // message is written for the visitor to read.
    if (error.code === "53400") {
      return { ok: false, kind: "throttled", error: error.message };
    }
    return { ok: false, kind: "unavailable", error: error.message };
  }
  return { ok: true };
}

async function functionErrorMessage(error: Error): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body: { error?: string } = await error.context.json();
      if (body.error) return body.error;
    } catch {
      // Non-JSON error body; fall through to the generic message.
    }
  }
  return error.message;
}
