import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "photo" | "photo-outline";
type Size = "md" | "lg";

const base =
  "tap-shrink inline-flex items-center justify-center gap-2 rounded-full font-sans text-sm font-semibold tracking-wide uppercase transition-colors duration-300 focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  primary: "bg-ivory text-ink hover:opacity-90",
  outline: "border border-line-strong text-ivory hover:bg-ivory hover:text-ink",
  ghost: "text-ivory hover:text-gold",
  photo: "bg-on-photo text-scrim hover:bg-gold-bright hover:text-scrim",
  "photo-outline":
    "border border-on-photo-line text-on-photo hover:bg-on-photo hover:text-scrim",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3",
  lg: "px-8 py-4 text-[0.8rem]",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  onClick?: () => void;
  type?: never;
  disabled?: never;
};

type ButtonAsButton = CommonProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { children, variant = "primary", size = "md", className = "" } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:pointer-events-none`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} onClick={props.onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
