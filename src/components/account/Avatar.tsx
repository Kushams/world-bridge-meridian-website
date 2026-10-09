import { initials } from "@/lib/supabase/AuthProvider";

/** A round profile photo, or the person's initials when there is no photo. */
export function Avatar({ url, name, className = "h-11 w-11 text-sm" }: { url: string | null; name: string; className?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" aria-hidden className={`shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full border border-gold/60 font-display text-gold ${className}`}>
      {initials(name)}
    </span>
  );
}
