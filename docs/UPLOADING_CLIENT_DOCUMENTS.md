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

---

## Documents the client must sign or send back

You decide, per document, how the client returns it, **just by how you name the file** you upload into the client's
folder in the **client-documents** bucket:

| File name starts with | What the client sees | Use it for |
|---|---|---|
| *(anything else)* | **View** only | Itineraries, tickets, vouchers |
| `SIGN - ` | **View** and **Review & sign** (types their name, optionally draws it, ticks "I agree") | Your booking terms, confirmations, consent forms |
| `RETURN - ` | **View** and **Upload signed copy** | Visa forms, airline/cruise/hotel forms, anything needing a handwritten or certified signature |

Example: `SIGN - Booking terms.pdf` shows as "Booking terms — Needs your signature". After signing it shows
"Signed 9 Oct 2026 ✓". If you ever change a document the client already signed, give the new one a **new file name**
(e.g. `SIGN - Booking terms v2.pdf`) so they sign the new version.

### Where to find what clients send you

You also get an email at `info@worldbridgemeridian.group` for every upload, signature or returned file.

- **Passports, visas and other uploads:** Supabase → Storage → **client-uploads** → the client's email folder →
  `passport`, `visa` or `other`. Click a file to open or download it.
- **Signed copies they upload back (RETURN documents):** same bucket, in the client's `returned` folder, named like the
  original with `__returned` added.
- **On-screen signatures:** Supabase → Table Editor → **document_signatures**. Each row has the signer's name, the exact
  time, the document, a fingerprint (`document_sha256`) of the exact file they saw, and their drawn signature if they
  drew one. Rows cannot be edited or deleted by clients.

### Privacy habits

- Passport scans are sensitive. Open them only when you need them, and **delete a client's passport files after their
  trip** (select the file → Delete). The client's page tells them you do this.
- Clients can delete their own uploads from their account at any time.
- An on-screen signature is a simple electronic signature. For anything that must be handwritten or certified, use `RETURN - `.
