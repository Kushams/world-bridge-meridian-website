# How to give a client their itinerary or tickets

Clients see their files under **My World Bridge → Itineraries & Documents** after they sign in. Files are private:
a client can only see the folder that matches **their own confirmed email address**.

## Upload a document (about 1 minute)

1. Open the Supabase dashboard → your project → **Storage** → bucket **client-documents**.
2. Click **Create folder** and name it with the client's email address, **all lower case**, exactly as they signed up
   with. Example: `jane.doe@gmail.com`. If the folder already exists, open it.
3. Open the folder and click **Upload file**. Choose the PDF (JPG/PNG also work, max 25 MB).
4. Done. The client sees it next time they open their account. Nothing else to do.

## Tips

- **File name = what the client sees.** `Paris_itinerary-v2.pdf` shows as "Paris itinerary v2". Use clear names such as
  `Flight tickets.pdf` or `Hotel vouchers - Rome.pdf`.
- **Check the email.** Open the client's request in the `form_submissions` table (Table Editor) and copy the `email`
  value. If they signed up to the website with a different email, use that one: the folder must match the email on
  their account. Capital letters in the folder name will hide the files, so keep it lower case.
- **Replace a file:** upload the new one with a new name, then delete the old one (select it → Delete).
- **Remove access:** delete the file (or the whole folder).
- **A good order:** confirm the journey → change the request's status to *Confirmed* (the client is emailed) → upload
  the documents → tell them they're in their account.

## Not working?

- Client sees "No documents yet": the folder name doesn't match their account email (check spelling and lower case).
- Client sees an error: they may not have confirmed their email yet. Ask them to click the confirmation link.
