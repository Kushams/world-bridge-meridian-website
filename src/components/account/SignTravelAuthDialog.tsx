"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { notifyTeam, sha256Hex } from "@/lib/clientDocs";
import { loadEmblem, loadPdfFonts } from "@/lib/invoicePdf";
import { buildTravelAuthPdf } from "@/lib/travelAuthPdf";
import { signTravelAuth, TRAVEL_AUTH_TITLE, type TravelAuthRequest } from "@/lib/travelAuth";
import { ddmmyyyy, EMPTY_VALUES, missingValues, profilePatch, travelAuthPdfData, type TravelAuthFixed, type TravelAuthValues } from "@/lib/travelAuthData";
import { SignaturePad, type SignaturePadHandle } from "@/components/ui/SignaturePad";

const input = "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block text-xs uppercase tracking-wide text-stone ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <div className="mt-1.5 normal-case tracking-normal">{children}</div>
    </label>
  );
}

/** What the client sees: the form already filled in from what we know. They correct or complete it, then sign. */
export function SignTravelAuthDialog({ request, email, onClose, onSigned }: { request: TravelAuthRequest; email: string; onClose: () => void; onSigned: () => void }) {
  const { profile, updateProfile } = useAuth();
  const [v, setV] = useState<TravelAuthValues>(() => ({
    ...EMPTY_VALUES,
    ...request.prefill,
    // Anything staff couldn't prefill falls back to the client's own profile.
    name: request.prefill.name || profile?.full_name || "",
    phone: request.prefill.phone || profile?.phone || "",
    nationality: request.prefill.nationality || profile?.nationality || "",
  }));
  const [typed, setTyped] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState<"preview" | "sign" | null>(null);
  const [error, setError] = useState("");
  const pad = useRef<SignaturePadHandle>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const set = <K extends keyof TravelAuthValues>(k: K, val: TravelAuthValues[K]) => setV((p) => ({ ...p, [k]: val }));
  const text = (k: keyof TravelAuthValues, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input value={v[k]} onChange={(e) => set(k, e.target.value as never)} className={input} {...props} />
  );

  const fixed: TravelAuthFixed = {
    destination: request.destination,
    coveredBy: request.covered_by,
    purpose: request.purpose,
    entryPermit: request.destination_kind === "uk" ? "UK ETA" : undefined,
    authorisedBy: request.signer_name,
    authorisedTitle: request.signer_title,
    authorisedSignature: request.signer_signature ?? undefined,
  };

  async function make(signedBlock?: { typedName: string; drawn: string | null; on: string; note: string }) {
    const [emblem, fonts] = await Promise.all([loadEmblem(), loadPdfFonts()]);
    return buildTravelAuthPdf(
      travelAuthPdfData(v, fixed, signedBlock ? { typedName: signedBlock.typedName, drawn: signedBlock.drawn ?? undefined, on: signedBlock.on, note: signedBlock.note } : undefined),
      emblem,
      fonts,
    );
  }

  async function preview() {
    setBusy("preview");
    setError("");
    try {
      window.open(URL.createObjectURL(await make()), "_blank", "noopener");
    } catch {
      setError("We couldn't prepare the preview. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase || busy) return;
    const missing = missingValues(v);
    if (missing.length) return setError(`Please fill in: ${missing.join(", ")}.`);
    if (typed.trim().length < 3) return setError("Please type your full name to sign.");
    if (!agree) return setError("Please tick the box to confirm.");
    setBusy("sign");
    setError("");

    const drawn = pad.current?.toDataUrl() ?? null;
    const now = new Date();
    const on = ddmmyyyy(now.toISOString().slice(0, 10));
    const note = `Signed electronically by ${typed.trim()} on ${now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Form reference ${request.id.slice(0, 8).toUpperCase()}.`;
    let path = "";
    try {
      const blob = await make({ typedName: typed.trim(), drawn, on, note });
      const sha = await sha256Hex(await blob.arrayBuffer());
      path = `${email}/returned/Travel_authorisation_form_signed_${request.id.slice(0, 8)}.pdf`;
      const up = await supabase.storage.from("client-uploads").upload(path, blob, { contentType: "application/pdf", upsert: false });
      if (up.error && !/exists/i.test(up.error.message)) throw new Error("upload");
      const err = await signTravelAuth({ id: request.id, values: v, documentPath: path, sha256: sha, signerName: typed.trim(), drawn });
      if (err) {
        await supabase.storage.from("client-uploads").remove([path]);
        setError(/already been signed/i.test(err) ? "This form has already been signed." : "We couldn't save your signature. Please try again.");
        setBusy(null);
        return;
      }
    } catch {
      setError("We couldn't save your signed form. Please check your connection and try again.");
      setBusy(null);
      return;
    }
    // The profile already changed on the server; refresh what this page shows. Best effort.
    updateProfile(profilePatch(v)).catch(() => undefined);
    notifyTeam("signed", TRAVEL_AUTH_TITLE, undefined, path);
    setBusy(null);
    onSigned();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Fill in and sign: ${TRAVEL_AUTH_TITLE}`}>
      <form onSubmit={submit} className="max-h-[94vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-t-card border hairline bg-ink p-6 sm:rounded-card sm:p-8">
        <div>
          <p className="eyebrow mb-1">Fill in &amp; sign on screen</p>
          <h3 className="font-display text-2xl text-ivory">{TRAVEL_AUTH_TITLE}</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone">
            We&apos;ve filled in what we already know. Please check every line, correct anything that&apos;s wrong, and complete anything that&apos;s blank. Any corrections to your name, phone or nationality are also saved to your profile.
          </p>
        </div>

        <section aria-label="Set by World Bridge Meridian" className="rounded-card border hairline bg-white/5 p-4 text-sm">
          <p className="mb-2 text-xs uppercase tracking-wide text-gold">Set by World Bridge Meridian</p>
          <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[170px_1fr]">
            <dt className="text-stone-dim">Trip</dt>
            <dd className="text-ivory">{request.purpose || request.exhibition || "—"}</dd>
            <dt className="text-stone-dim">Destination</dt>
            <dd className="text-ivory">{request.destination}</dd>
            <dt className="text-stone-dim">Travel costs covered by</dt>
            <dd className="text-ivory">{request.covered_by || "—"}</dd>
            <dt className="text-stone-dim">Signed for us by</dt>
            <dd className="text-ivory">
              {request.signer_name}, {request.signer_title}
            </dd>
          </dl>
        </section>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs uppercase tracking-wide text-gold">1. You</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name (as on passport)" wide>{text("name", { autoComplete: "name" })}</Field>
            <Field label="Date of birth">{text("dateOfBirth", { type: "date", autoComplete: "bday" })}</Field>
            <Field label="Nationality">{text("nationality", { autoComplete: "country-name" })}</Field>
            <Field label="Passport number">{text("passportNumber", { autoComplete: "off" })}</Field>
            <Field label="Passport expiry date">{text("passportExpiry", { type: "date" })}</Field>
            <Field label="Contact phone" wide>{text("phone", { type: "tel", autoComplete: "tel" })}</Field>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs uppercase tracking-wide text-gold">2. Your trip</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Departing from" wide>{text("departingFrom")}</Field>
            <Field label="Travel dates: from">{text("travelFrom", { type: "date" })}</Field>
            <Field label="to">{text("travelTo", { type: "date" })}</Field>
            <Field label="Travelling with (names, if anyone)" wide>{text("companions")}</Field>
          </div>
        </fieldset>

        {request.destination_kind === "uk" ? (
          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs uppercase tracking-wide text-gold">3. UK entry permission (UK ETA)</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ivory">
              {(
                [
                  ["not_applied", "Not yet applied"],
                  ["applied", "Applied, awaiting a decision"],
                  ["approved", "Approved"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="radio" name="eta" checked={v.entryStatus === key} onChange={() => set("entryStatus", key)} className="h-4 w-4 accent-[#a8863b]" />
                  {label}
                </label>
              ))}
            </div>
            <Field label="Any previous visa or entry refusals? Please give details">{text("refusals")}</Field>
          </fieldset>
        ) : null}

        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs uppercase tracking-wide text-gold">{request.destination_kind === "uk" ? "4" : "3"}. Emergency contact</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">{text("emergencyName")}</Field>
            <Field label="Relationship">{text("emergencyRelationship")}</Field>
            <Field label="Contact phone">{text("emergencyPhone", { type: "tel" })}</Field>
            <Field label="Contact email">{text("emergencyEmail", { type: "email" })}</Field>
          </div>
        </fieldset>

        <section className="space-y-4">
          <p className="text-xs uppercase tracking-wide text-gold">{request.destination_kind === "uk" ? "5" : "4"}. Declaration and signature</p>
          <p className="text-sm leading-relaxed text-stone">
            I confirm that the information on this form is accurate and complete. By signing, I authorise World Bridge Meridian to arrange travel and related services on my behalf, and to use these details, including my passport details, only to make and manage my travel arrangements.
          </p>
          <button
            type="button"
            onClick={preview}
            disabled={busy !== null}
            className="rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
          >
            {busy === "preview" ? "Preparing…" : "Preview the form (PDF)"}
          </button>
          <div>
            <label htmlFor="ta-typed" className="mb-2 block text-xs uppercase tracking-wide text-stone">
              Type your full name to sign
            </label>
            <input id="ta-typed" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="name" className="w-full rounded-control border border-line bg-transparent px-4 py-3 font-display text-lg italic text-ivory outline-none focus:border-gold" />
          </div>
          <SignaturePad ref={pad} label="Draw your signature (optional)" />
          <label className="flex gap-3 text-sm leading-relaxed text-stone">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#a8863b]" />
            <span>I have checked the details above and agree to the declaration. I understand that typing my name here is my electronic signature.</span>
          </label>
        </section>

        {error ? (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy !== null} className="rounded-full bg-ivory px-7 py-3 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50">
            {busy === "sign" ? "Signing…" : "Sign form"}
          </button>
          <button type="button" onClick={onClose} disabled={busy !== null} className="text-xs text-stone-dim underline hover:text-ivory">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
