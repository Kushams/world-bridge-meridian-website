"use client";

/**
 * Netlify Forms — the site's default, zero-signup form backend, since the
 * site is hosted on Netlify. It works by POSTing url-encoded data with a
 * form-name field; Netlify only accepts submissions for forms it detected
 * in static HTML at deploy time.
 *
 * Modern Next.js (via @netlify/plugin-nextjs v5 / the OpenNext adapter)
 * doesn't write each app route to a static HTML file, so a form rendered
 * inside a React component is invisible to Netlify's deploy-time scanner —
 * submitting to "/" fails the build outright ("Failed assembling static
 * pages for upload"). The fix is public/__forms.html: a plain static file
 * outside the Next.js app that Netlify can actually scan, containing every
 * form name and field. Submissions POST there instead of to the current
 * page. See https://opennext.js.org/netlify/forms.
 *
 * This only succeeds when actually served by Netlify — it silently fails
 * everywhere else (local dev, a non-Netlify preview), so every caller must
 * catch a `false` return and fall back (currently: mailto).
 */
export async function submitToNetlifyForms(
  formName: string,
  fields: Record<string, string>,
): Promise<boolean> {
  try {
    const body = new URLSearchParams({ "form-name": formName, ...fields }).toString();
    const res = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}
