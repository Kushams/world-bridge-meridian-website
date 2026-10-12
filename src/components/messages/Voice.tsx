"use client";

import { useEffect, useRef, useState } from "react";
import { voiceUrl } from "@/lib/messages";

const MAX_SECONDS = 300;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Plays a voice note from the private bucket (signed URL fetched on demand). */
export function VoicePlayer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    voiceUrl(path).then((u) => {
      if (!alive) return;
      if (u) setUrl(u);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [path]);

  if (failed) return <p className="text-xs opacity-70">Voice note unavailable</p>;
  if (!url) return <p className="text-xs opacity-70">Loading voice note…</p>;
  return <audio controls preload="metadata" src={url} className="h-10 w-60 max-w-full" />;
}

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((t) => MediaRecorder.isTypeSupported(t));
}

/**
 * Tap the mic to start recording, tap again to send; × discards.
 * Stops on its own after five minutes and sends what was recorded.
 */
export function VoiceRecorder({
  onSend,
  onError,
  disabled,
}: {
  onSend: (blob: Blob, seconds: number) => Promise<void>;
  onError: (message: string) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const keep = useRef(false);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      keep.current = false;
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
      if (ticker.current) clearInterval(ticker.current);
    },
    [],
  );

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      return onError("Voice notes aren't supported in this browser. Please type your message instead.");
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 48000, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      return onError("Please allow microphone access to record a voice note.");
    }
    const mime = pickMime();
    const rec = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 128000 });
    chunks.current = [];
    keep.current = false;
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      if (ticker.current) clearInterval(ticker.current);
      setRecording(false);
      const length = (Date.now() - started.current) / 1000;
      if (!keep.current || !chunks.current.length) return;
      setSending(true);
      await onSend(new Blob(chunks.current, { type: rec.mimeType || mime || "audio/webm" }), length);
      setSending(false);
    };
    recorder.current = rec;
    started.current = Date.now();
    setSeconds(0);
    rec.start(1000);
    setRecording(true);
    ticker.current = setInterval(() => {
      const s = (Date.now() - started.current) / 1000;
      setSeconds(s);
      if (s >= MAX_SECONDS) stop(true);
    }, 250);
  }

  function stop(send: boolean) {
    keep.current = send;
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  if (recording) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => stop(false)}
          aria-label="Discard voice note"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-stone hover:text-ivory"
        >
          ×
        </button>
        <span className="flex items-center gap-1.5 text-xs tabular-nums text-ivory" aria-live="polite">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden />
          {clock(seconds)}
        </span>
        <button
          type="button"
          onClick={() => stop(true)}
          aria-label="Send voice note"
          className="rounded-full bg-ivory px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink"
        >
          Send
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled || sending}
      title="Record a voice note"
      aria-label="Record a voice note"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ivory hover:border-gold disabled:opacity-40"
    >
      {sending ? (
        <span className="text-[0.65rem]">…</span>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
