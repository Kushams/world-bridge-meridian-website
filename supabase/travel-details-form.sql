-- Allow the "travel-details" form type (the Travel Detail & Itinerary Form
-- at /travel-details-form). Run once in the Supabase SQL editor, then
-- redeploy the submit-form and notify-form-submission edge functions.
alter table public.form_submissions
  drop constraint if exists form_submissions_form_type_check;
alter table public.form_submissions
  add constraint form_submissions_form_type_check
  check (form_type in ('contact', 'newsletter', 'journey-request', 'travel-details'));
