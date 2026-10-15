"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { artListings, type ArtListing } from "@/data/exhibitions";
import { loadEmblem, loadPdfFonts } from "@/lib/invoicePdf";
import { buildTravelAuthPdf } from "@/lib/travelAuthPdf";
import { destinationFor, matchListing, staffTitle, travelAuthFromRequest, travelAuthPrefill, venueName, type Destination } from "@/lib/travelAuthData";
import { createTravelAuth, loadMySignature, loadTravelAuthFor, saveMySignature, voidTravelAuth, type TravelAuthRequest } from "@/lib/travelAuth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { loadMe, notifyClient, uploadFile, type Request, type StaffMember } from "@/lib/staff";
import { SignaturePad, type SignaturePadHandle } from "@/components/ui/SignaturePad";
import { inputClass } from "./RequestsPanel";

const DOCS = "client-documents";
const NAME = "Travel authorisation form";
const OTHER = "__other";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * Sends the World Bridge Meridian Travel Authorisation Form to a client.
 * The client opens it on their account, checks and completes their own details, and signs on screen.
 * Staff choose the exhibition (which sets the destination), who covers the costs, and the form is signed for us with their saved signature.
 */
export function TravelAuthSender({
  email,
  clientName,
  clientPhone,
  requests,
  onDone,
}: {
  email: string;
  clientName: string | null;
  clientPhone: string | null;
  requests: Request[];
  onDone: (msg: string) => void;
}) {
  const request = requests.find((r) => r.form_type === "travel-details") ?? null;
  const asked = typeof request?.payload?.exhibition_or_event === "string" ? (request.payload.exhibition_or_event as string) : "";
  const listings = useMemo(() => [...artListings].sort((a, b) => a.title.localeCompare(b.title)), []);
  const matched = useMemo(() => matchListing(asked, listings), [asked, listings]);

  const [pick, setPick] = useState<string>(matched?.slug ?? "");
  const [exhibition, setExhibition] = useState(matched ? `${matched.title}, ${matched.venue}` : asked);
  const [place, setPlace] = useState(matched ? destinationFor(matched).text : "London, United Kingdom");
  const [kind, setKind] = useState<Destination>(matched ? destinationFor(matched).kind : "uk");
  const [coveredBy, setCoveredBy] = useState("Pace Gallery");
  const [mode, setMode] = useState<"screen" | "print">("screen");
  const [me, setMe] = useState<StaffMember | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [sent, setSent] = useState<TravelAuthRequest[]>([]);
  const [busy, setBusy] = useState<"preview" | "send" | "sig" | null>(null);
  const pad = useRef<SignaturePadHandle>(null);

  const reloadSent = useCallback(async () => setSent(await loadTravelAuthFor(email)), [email]);
  useEffect(() => {
    let live = true;
    loadMe().then(async (m) => {
      if (!live) return;
      setMe(m);
      if (m) setSignature(await loadMySignature(m.email));
    });
    const t = setTimeout(reloadSent, 0);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [reloadSent]);

  const venues = useMemo(() => [...new Set(listings.filter((l) => l.category === "gallery").map((l) => venueName(l.venue)))].sort(), [listings]);

  function choose(slug: string) {
    setPick(slug);
    const l = listings.find((x) => x.slug === slug);
    if (!l) return;
    const d = destinationFor(l);
    setExhibition(`${l.title}, ${l.venue}`);
    setPlace(d.text);
    setKind(d.kind);
    if (l.category === "gallery") setCoveredBy(venueName(l.venue));
  }

  const signerName = me ? me.name || me.email : "";
  const signerTitle = me ? staffTitle(me) : "";
  const purpose = exhibition ? `Exhibition travel: ${exhibition}` : "";

  async function build(): Promise<Blob> {
    const [emblem, fonts] = await Promise.all([loadEmblem(), loadPdfFonts()]);
    const data = travelAuthFromRequest({
      clientName,
      clientPhone,
      payload: request?.payload ?? null,
      destination: kind,
      destinationText: place,
      coveredBy,
      signer: { name: signerName, title: signerTitle, signature: signature ?? undefined },
      purpose,
    });
    return buildTravelAuthPdf(data, emblem, fonts);
  }

  async function preview() {
    setBusy("preview");
    try {
      window.open(URL.createObjectURL(await build()), "_blank", "noopener");
    } finally {
      setBusy(null);
    }
  }

  async function saveSignature() {
    const png = pad.current?.toDataUrl();
    if (!png || !me) return onDone("Draw your signature first, then save it.");
    setBusy("sig");
    const err = await saveMySignature(me.email, png);
    setBusy(null);
    if (err) return onDone(`Signature not saved: ${err}`);
    setSignature(png);
    setDrawing(false);
    onDone("Your signature is saved. It will be placed on every travel form you send.");
  }

  async function send() {
    setBusy("send");
    try {
      if (mode === "print") {
        // Printable version: a finished PDF the client downloads, signs by hand and sends back.
        const blob = await build();
        let name = NAME;
        let err: string | null = null;
        for (let n = 1; n <= 6; n++) {
          name = n === 1 ? NAME : `${NAME} (${n})`;
          err = await uploadFile(DOCS, `${email}/RETURN - ${name}.pdf`, new File([blob], `${name}.pdf`, { type: "application/pdf" }));
          if (!err || !err.toLowerCase().includes("exists")) break;
        }
        if (err) return onDone(`Not sent: ${err}`);
        const emailed = await notifyClient(email, "return", name);
        return onDone(`Sent. ${email} can download "${name}" in their account${emailed ? " and has been emailed." : ", but the email to them didn't send."}`);
      }
      if (!me) return onDone("Not sent: we couldn't confirm who you are. Refresh and try again.");
      const prefill = travelAuthPrefill({ profile: { full_name: clientName, phone: clientPhone }, payload: request?.payload ?? null });
      const { id, error } = await createTravelAuth({
        email,
        exhibition,
        kind,
        destination: place,
        coveredBy,
        purpose,
        signerName,
        signerTitle,
        prefill,
      });
      if (error || !id) return onDone(`Not sent: ${error ?? "unknown error"}`);
      const emailed = await notifyClient(email, "sign", NAME);
      await reloadSent();
      onDone(`Sent. ${email} will see "${NAME}" under Waiting on you and can fill it in and sign on screen${emailed ? ". They've been emailed." : ", but the email to them didn't send."}`);
    } finally {
      setBusy(null);
    }
  }

  async function cancel(id: string) {
    const err = await voidTravelAuth(id);
    await reloadSent();
    onDone(err ? `Not cancelled: ${err}` : "Cancelled. The client can no longer sign that form.");
  }

  async function openSigned(path: string) {
    const { data } = await getSupabaseClient()!.storage.from("client-uploads").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    else onDone("We couldn't open that file.");
  }

  const segment = (active: boolean) => `rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${active ? "border-gold bg-gold/10 text-ivory" : "border-line text-stone hover:border-gold/60"}`;
  const group = (c: ArtListing["category"], label: string) => (
    <optgroup label={label}>
      {listings
        .filter((l) => l.category === c)
        .map((l) => (
          <option key={l.slug} value={l.slug}>
            {l.title} · {l.venue}
          </option>
        ))}
    </optgroup>
  );

  return (
    <div className="mt-6 rounded-card border hairline p-4">
      <p className="text-sm font-semibold text-ivory">Ready-made form: Travel authorisation</p>
      <p className="mt-1 text-xs text-stone">
        The client gets it under &ldquo;Waiting on you&rdquo;, already filled in from their profile and exhibition travel request{request ? "" : " (they haven't sent a travel request yet, so most lines will be blank for them to complete)"}. They check and correct their details, then sign on screen. Corrections also update their profile.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-stone sm:col-span-2">
          <span className="block">Exhibition{matched ? " (matched from the client's travel request)" : ""}</span>
          <select value={pick} onChange={(e) => (e.target.value === OTHER || e.target.value === "" ? setPick(e.target.value) : choose(e.target.value))} className={`${inputClass} mt-1 w-full min-w-0`}>
            <option value="">Choose an exhibition…</option>
            {group("gallery", "Gallery exhibitions")}
            {group("museum", "Museum exhibitions")}
            {group("fair", "Art fairs")}
            <option value={OTHER}>Other (type it below)</option>
          </select>
        </label>
        {pick === OTHER || (!pick && exhibition) ? (
          <label className="block text-xs text-stone sm:col-span-2">
            <span className="block">Exhibition or event name</span>
            <input value={exhibition} onChange={(e) => setExhibition(e.target.value)} className={`${inputClass} mt-1 w-full`} />
          </label>
        ) : null}
        <label className="block text-xs text-stone">
          <span className="block">Destination (from the exhibition; edit if needed)</span>
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="City, country" className={`${inputClass} mt-1 w-full`} />
        </label>
        <label className="block text-xs text-stone">
          <span className="block">Costs covered by</span>
          <input value={coveredBy} onChange={(e) => setCoveredBy(e.target.value)} list="ta-venues" placeholder="e.g. Pace Gallery" className={`${inputClass} mt-1 w-full`} />
          <datalist id="ta-venues">
            {venues.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-stone">Form version:</span>
        <button type="button" className={segment(kind === "uk")} onClick={() => setKind("uk")}>
          United Kingdom
        </button>
        <button type="button" className={segment(kind === "other")} onClick={() => setKind("other")}>
          Other destination
        </button>
      </div>

      <div className="mt-4 rounded-control border border-line p-3">
        <p className="text-xs text-stone">
          Signed for World Bridge Meridian by <span className="text-ivory">{signerName || "…"}</span>
          {signerTitle ? `, ${signerTitle}` : ""}
        </p>
        {signature && !drawing ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signature} alt="Your saved signature" className="h-12 rounded bg-white px-2" />
            <button type="button" onClick={() => setDrawing(true)} className="text-xs text-stone underline hover:text-ivory">
              Draw it again
            </button>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-stone">{signature ? "Draw your new signature." : "No signature saved yet. Draw yours once and it is used on every form you send."}</p>
            <SignaturePad ref={pad} label="Your signature" className="h-28" />
            <div className="flex gap-3">
              <button type="button" disabled={busy !== null} onClick={saveSignature} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ivory disabled:opacity-40">
                {busy === "sig" ? "Saving…" : "Save my signature"}
              </button>
              {signature ? (
                <button type="button" onClick={() => setDrawing(false)} className="text-xs text-stone underline">
                  Keep the old one
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={segment(mode === "screen")} onClick={() => setMode("screen")}>
          Client fills in &amp; signs on screen
        </button>
        <button type="button" className={segment(mode === "print")} onClick={() => setMode("print")}>
          Printable: sign by hand &amp; send back
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={busy !== null} onClick={preview} className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ivory disabled:opacity-40">
          {busy === "preview" ? "Preparing…" : "Preview"}
        </button>
        <button type="button" disabled={busy !== null || !place.trim() || !exhibition.trim()} onClick={send} className="rounded-full bg-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-40">
          {busy === "send" ? "Sending…" : "Send to client"}
        </button>
      </div>

      {sent.length ? (
        <div className="mt-5 border-t border-line pt-3">
          <p className="text-xs uppercase tracking-wide text-gold">Travel forms sent to this client</p>
          <ul className="mt-1 divide-y divide-line text-sm">
            {sent.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0 text-ivory">
                  {f.exhibition || "Travel authorisation"} <span className="text-stone-dim">· sent {fmt(f.created_at)}</span>
                </span>
                <span className="flex items-center gap-3 text-xs">
                  {f.status === "signed" && f.signed_at ? <span className="text-gold">Signed {fmt(f.signed_at)} ✓</span> : f.status === "void" ? <span className="text-stone-dim">Cancelled</span> : <span className="text-gold">Waiting for client</span>}
                  {f.status === "signed" && f.document_path ? (
                    <button type="button" onClick={() => openSigned(f.document_path!)} className="underline hover:text-ivory">
                      Open signed PDF
                    </button>
                  ) : null}
                  {f.status === "pending" ? (
                    <button type="button" onClick={() => cancel(f.id)} className="underline hover:text-ivory">
                      Cancel
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
