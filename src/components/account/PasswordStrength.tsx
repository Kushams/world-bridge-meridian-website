"use client";

/** Four-step strength meter shown under a new password. Idea from Arc's password strength (MIT), see docs/THIRD_PARTY.md. */
function score(pw: string): { level: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { level: 0, label: "" };
  if (pw.length < 8) return { level: 1, label: "Too short" };
  let s = 1;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 16) s++;
  const level = Math.min(s, 4) as 1 | 2 | 3 | 4;
  return { level, label: ["", "Weak", "Fair", "Good", "Strong"][level] };
}

const TONE = ["", "bg-red-500/70", "bg-amber-500/70", "bg-gold", "bg-emerald-600/80"];

export function PasswordStrength({ password }: { password: string }) {
  const { level, label } = score(password);
  if (!password) return null;
  return (
    <div className="-mt-1" aria-live="polite">
      <div className="flex gap-1.5" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={level} aria-valuetext={label}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= level ? TONE[level] : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-1.5 text-left text-xs text-stone-dim">{label}{level >= 3 ? "" : " · use 12+ characters with upper and lower case and a number"}</p>
    </div>
  );
}
