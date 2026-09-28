"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

export type FormType = "contact" | "newsletter" | "journey-request";

export interface FormSubmissionInput {
  formType: FormType;
  email: string;
  name?: string;
  subject?: string;
  message?: string;
  /** Everything else the form collected; stored as jsonb and emailed. */
  payload?: Record<string, string | string[] | null>;
}

export type FormFailure = "throttled" | "unavailable";

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
