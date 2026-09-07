/**
 * Netlify only registers a form's fields by scanning static HTML at deploy
 * time. The real Journey Wizard never has all its fields in the DOM at
 * once (only the current step renders), so Netlify would only ever see
 * step 1's fields. This static, permanently-hidden duplicate exists purely
 * so Netlify's crawler can see every field name the wizard actually
 * submits (via netlifyForms.ts) — it is never shown or submitted itself.
 *
 * Field names here must stay in sync with flattenForNetlify() in
 * src/lib/leads.ts.
 */
const fieldNames = [
  "leadId",
  "name",
  "email",
  "phone",
  "originCity",
  "destination",
  "destinationMode",
  "travelDates",
  "dateFlexibility",
  "travelerCount",
  "travelerType",
  "journeyTypes",
  "interests",
  "investmentRange",
  "travelPace",
  "accommodationPreference",
  "specialRequirements",
  "organize",
  "hearAboutUs",
  "notes",
  "source",
  "campaign",
  "landingPage",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "submissionDate",
];

export function NetlifyFormShadow() {
  return (
    <form name="journey-request" data-netlify="true" netlify-honeypot="website" hidden>
      <input type="hidden" name="form-name" value="journey-request" />
      <input name="website" />
      {fieldNames.map((field) => (
        <input key={field} name={field} />
      ))}
    </form>
  );
}
