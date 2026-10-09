"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { notifyTeam, sha256Hex } from "@/lib/clientDocs";

interface Props {
  title: string;
  /** Storage path inside client-documents: "<email>/<file>". */
  path: string;
  email: string;
  defaultName: string;
  onClose: () => void;
  onSigned: () => void;
}

/** Read the document, type your name (optionally draw it too), agree, sign. */
export function SignDocumentDialog({ title, path, email, defaultName, onClose, onSigned }: Props) {
  const [name, setName] = useState(defaultName);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function signedUrl(): Promise<string | null> {
    const supabase = getSupabaseClient();
    const { data } = await supabase!.storage.from("client-documents").createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  }

  async function openDocument() {
    const url = await signedUrl();
    if (url) {
      window.open(url, "_blank", "noopener");
      setOpened(true);
    } else setError("We couldn't open the document. Please try again.");
  }

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height };
  }
  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext("2d")!;
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1c1a17";
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    inked.current = true;
  }
  function clearInk() {
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    inked.current = false;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase || busy) return;
    if (name.trim().length < 3) return setError("Please type your full name.");
    if (!agree) return setError("Please tick the box to confirm.");
    setBusy(true);
    setError("");

    let sha: string | null = null;
    try {
      const url = await signedUrl();
      if (url) sha = await sha256Hex(await (await fetch(url)).arrayBuffer());
    } catch {
      /* the fingerprint is a bonus; signing still proceeds */
    }

    const { error: err } = await supabase.from("document_signatures").insert({
      client_email: email.toLowerCase(),
      document_path: path,
      document_title: title,
      document_sha256: sha,
      signer_name: name.trim(),
      drawn_signature: inked.current ? canvasRef.current!.toDataURL("image/png") : null,
      user_agent: navigator.userAgent.slice(0, 300),
    });
    setBusy(false);
    if (err) {
      setError(err.code === "23505" ? "This document has already been signed." : "We couldn't save your signature. Please try again.");
      return;
    }
    notifyTeam("signed", title);
    onSigned();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Sign ${title}`}>
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-t-card bg-ink p-6 sm:rounded-card sm:p-8 border hairline">
        <div>
          <p className="eyebrow mb-1">Sign on screen</p>
          <h3 className="font-display text-2xl text-ivory">{title}</h3>
        </div>

        <div>
          <button type="button" onClick={openDocument} className="rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:border-gold hover:text-gold">
            1. Read the document
          </button>
          {opened ? <span className="ml-3 text-xs text-gold">Opened in a new tab ✓</span> : null}
        </div>

        <div>
          <label htmlFor="sig-name" className="mb-2 block text-xs uppercase tracking-wide text-stone">2. Type your full name</label>
          <input id="sig-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="w-full rounded-control border border-line bg-transparent px-4 py-3 font-display text-lg italic text-ivory outline-none focus:border-gold" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-stone">
            <span>Draw your signature (optional)</span>
            <button type="button" onClick={clearInk} className="underline">Clear</button>
          </div>
          <canvas ref={canvasRef} width={600} height={180} onPointerDown={start} onPointerMove={move} onPointerUp={() => (drawing.current = false)} className="h-36 w-full touch-none rounded-control border border-line bg-white" />
        </div>

        <label className="flex gap-3 text-sm text-stone leading-relaxed">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#a8863b]" />
          <span>3. I have read this document and agree to it. I understand that typing my name here is my electronic signature.</span>
        </label>

        {error ? <p role="alert" className="text-xs text-red-500">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="rounded-full bg-ivory px-7 py-3 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50">
            {busy ? "Signing…" : "Sign document"}
          </button>
          <button type="button" onClick={onClose} disabled={busy} className="text-xs text-stone-dim underline hover:text-ivory">Cancel</button>
        </div>
      </form>
    </div>
  );
}
