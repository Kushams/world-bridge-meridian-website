import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans text-sm font-semibold tracking-wide uppercase transition-colors duration-300 focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  primary: "bg-ivory text-ink hover:bg-white",
  outline: "border border-line-strong text-ivory hover:bg-ivory hover:text-ink",
  ghost: "text-ivory hover:text-gold",
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
  onClick?: never;
  type?: never;
};

type ButtonAsButton = CommonProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { children, variant = "primary", size = "md", className = "" } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
