"use client";

/**
 * Netlify Forms — the site's default, zero-signup form backend, since the
 * site is hosted on Netlify. It works by POSTing url-encoded data with a
 * form-name field to any path; Netlify only accepts submissions for forms
 * it detected in the static HTML at deploy time, so every form using this
 * must have a matching <form data-netlify="true" name="...">, with every
 * field name present somewhere in that static markup (see the hidden
 * shadow form on the Plan Your Journey page for the multi-step wizard,
 * whose real fields never all exist in the DOM at once).
 *
 * This only succeeds when actually served by Netlify — it silently fails
 * everywhere else (local dev, the GitHub Pages mirror), so every caller
 * must catch a `false` return and fall back (currently: mailto).
 */
export async function submitToNetlifyForms(
  formName: string,
  fields: Record<string, string>,
): Promise<boolean> {
  try {
    const body = new URLSearchParams({ "form-name": formName, ...fields }).toString();
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}
