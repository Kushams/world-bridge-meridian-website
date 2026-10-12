"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { loadHandler, postAsClient, type Handler, type ThreadMessage } from "@/lib/messages";
import { Thread } from "@/components/messages/Thread";
import { Avatar } from "./Avatar";

/** Who is looking after the client, then their conversation with us. */
export function MessagesPanel() {
  const { user } = useAuth();
  const [handler, setHandler] = useState<Handler | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadHandler().then((h) => alive && setHandler(h));
    return () => {
      alive = false;
    };
  }, []);

  function open(m: ThreadMessage) {
    if (!m.link) return;
    window.history.pushState(null, "", `${window.location.pathname}${m.link}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  if (!user?.email) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-card border hairline p-5">
        {handler ? (
          <>
            <Avatar url={handler.avatar_url} name={handler.name} className="h-16 w-16 text-lg" />
            <div className="min-w-0">
              <p className="eyebrow">Looking after you</p>
              <p className="font-display text-xl text-ivory">{handler.name}</p>
              <p className="text-sm text-stone">{handler.title}</p>
              <a href={`mailto:${handler.email}`} className="text-sm text-gold underline-offset-4 hover:underline">
                {handler.email}
              </a>
            </div>
          </>
        ) : handler === null ? (
          <p className="text-sm text-stone leading-relaxed">
            Your personal travel coordinator will appear here once they&apos;re assigned. Until then, message us below
            and our team will reply.
          </p>
        ) : (
          <p className="text-sm text-stone">Loading…</p>
        )}
      </div>

      <Thread
        clientEmail={user.email}
        viewer="client"
        onSend={postAsClient}
        onOpen={open}
        placeholder={handler ? `Message ${handler.name.split(" ")[0]}…` : "Write a message…"}
      />
    </div>
  );
}
