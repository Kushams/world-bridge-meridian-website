"use client";

import { useEffect, useState } from "react";
import { loadEmblem, loadPdfFonts } from "@/lib/invoicePdf";
import { buildTravelAuthPdf } from "@/lib/travelAuthPdf";
import { staffTitle, travelAuthFromRequest, type Destination } from "@/lib/travelAuthData";
import { loadMe, notifyClient, uploadFile, type Request, type StaffMember } from "@/lib/staff";
import { inputClass } from "./RequestsPanel";

const DOCS = "client-documents";
const NAME = "Travel authorisation form";

/** One-click: sends the World Bridge Meridian Travel Authorisation Form, already filled in from what we know about the client. */
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
  const [destination, setDestination] = useState<Destination>("uk");
  const [place, setPlace] = useState("London, United Kingdom");
  const [coveredBy, setCoveredBy] = useState("Pace Gallery");
  const [signing, setSigning] = useState<"sign" | "return">("sign");
  const [me, setMe] = useState<StaffMember | null>(null);
  const [busy, setBusy] = useState<"preview" | "send" | null>(null);

  useEffect(() => {
    let live = true;
    loadMe().then((m) => live && setMe(m));
    return () => {
      live = false;
    };
  }, []);

  // The client's latest exhibition travel request holds their passport, dates and emergency contact.
  const request = requests.find((r) => r.form_type === "travel-details") ?? null;

  async function build(): Promise<Blob> {
    const [emblem, fonts] = await Promise.all([loadEmblem(), loadPdfFonts()]);
    const data = travelAuthFromRequest({
      clientName,
      clientPhone,
      payload: request?.payload ?? null,
      destination,
      destinationText: place,
      coveredBy,
      signer: me ? { name: me.name || me.email, title: staffTitle(me) } : { name: "", title: "" },
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

  async function send() {
    setBusy("send");
    try {
      const blob = await build();
      const prefix = signing === "sign" ? "SIGN - " : "RETURN - ";
      let name = NAME;
      let err: string | null = null;
      // A second form for the same client gets "(2)", "(3)" … instead of overwriting the first.
      for (let n = 1; n <= 6; n++) {
        name = n === 1 ? NAME : `${NAME} (${n})`;
        err = await uploadFile(DOCS, `${email}/${prefix}${name}.pdf`, new File([blob], `${name}.pdf`, { type: "application/pdf" }));
        if (!err || !err.toLowerCase().includes("exists")) break;
      }
      if (err) return onDone(`Not sent: ${err}`);
      const emailed = await notifyClient(email, signing, name);
      onDone(`Sent. ${email} can now see "${name}" in their account${emailed ? " and has been emailed." : ", but the email to them didn't send."}`);
    } finally {
      setBusy(null);
    }
  }

  const segment = (active: boolean) => `rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${active ? "border-gold bg-gold/10 text-ivory" : "border-line text-stone hover:border-gold/60"}`;

  return (
    <div className="mt-6 rounded-card border hairline p-4">
      <p className="text-sm font-semibold text-ivory">Ready-made form: Travel authorisation</p>
      <p className="mt-1 text-xs text-stone">
        Filled in from the client&apos;s profile and their exhibition travel request{request ? "" : " (they haven't sent one yet, so those lines stay blank)"}. The World Bridge Meridian signature line is filled with your name.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={segment(destination === "uk")}
          onClick={() => {
            setDestination("uk");
            setPlace("London, United Kingdom");
          }}
        >
          United Kingdom
        </button>
        <button
          type="button"
          className={segment(destination === "other")}
          onClick={() => {
            setDestination("other");
            setPlace("");
          }}
        >
          Other destination
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-stone">
          Destination
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="City, country" className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-xs text-stone">
          Costs covered by
          <input value={coveredBy} onChange={(e) => setCoveredBy(e.target.value)} placeholder="e.g. Pace Gallery" className={`${inputClass} mt-1`} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={segment(signing === "sign")} onClick={() => setSigning("sign")}>
          Client signs on screen
        </button>
        <button type="button" className={segment(signing === "return")} onClick={() => setSigning("return")}>
          Print, sign &amp; send back
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={busy !== null} onClick={preview} className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ivory disabled:opacity-40">
          {busy === "preview" ? "Preparing…" : "Preview"}
        </button>
        <button type="button" disabled={busy !== null || !place.trim()} onClick={send} className="rounded-full bg-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-40">
          {busy === "send" ? "Sending…" : "Send to client"}
        </button>
      </div>
    </div>
  );
}
