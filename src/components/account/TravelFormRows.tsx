"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPendingTravelAuth, TRAVEL_AUTH_TITLE, type TravelAuthRequest } from "@/lib/travelAuth";
import { SignTravelAuthDialog } from "./SignTravelAuthDialog";

/** Travel Authorisation Forms staff have sent that this client still has to fill in and sign. */
export function usePendingTravelForms(enabled: boolean) {
  const [forms, setForms] = useState<TravelAuthRequest[]>([]);
  const reload = useCallback(async () => {
    if (enabled) setForms(await loadPendingTravelAuth());
  }, [enabled]);
  useEffect(() => {
    const t = setTimeout(reload, 0);
    return () => clearTimeout(t);
  }, [reload]);
  return { forms, reload };
}

/** List rows for pending forms, plus the dialog they open. Render inside a <ul>. */
export function TravelFormRows({ forms, email, onSigned, className = "py-3", buttonClass }: { forms: TravelAuthRequest[]; email: string; onSigned: () => void; className?: string; buttonClass: string }) {
  const [open, setOpen] = useState<TravelAuthRequest | null>(null);
  return (
    <>
      {forms.map((f) => (
        <li key={f.id} className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
          <div className="min-w-0">
            <p className="truncate text-sm text-ivory">{TRAVEL_AUTH_TITLE}</p>
            <p className="truncate text-xs text-stone-dim">{f.exhibition ? `${f.exhibition} · ` : ""}Check your details and sign on screen</p>
          </div>
          <button type="button" onClick={() => setOpen(f)} className={buttonClass}>
            Fill in &amp; sign
          </button>
        </li>
      ))}
      {open ? (
        <SignTravelAuthDialog
          request={open}
          email={email}
          onClose={() => setOpen(null)}
          onSigned={() => {
            setOpen(null);
            onSigned();
          }}
        />
      ) : null}
    </>
  );
}
