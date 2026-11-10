import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "cta" | "light";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  /** Pink gradasi besar: Daftar, Download Voucher. */
  primary: "bg-pink-gradient text-white shadow-btn border border-white/25 hover:brightness-110",
  /** Merah tua berbingkai pink: Redeem Voucher Sekarang, Lihat Promo Lainnya. */
  cta: "bg-linear-to-b from-[#c8173f] to-[#8e0d2c] text-white border border-pink/80 hover:brightness-110",
  /** Pill putih: Klaim di sini. */
  light: "bg-white text-black hover:bg-white/90 rounded-full",
};

const SIZES: Record<Size, string> = {
  md: "min-h-11 px-5 text-base",
  lg: "min-h-14 px-8 text-2xl desktop:text-3xl",
};

export function buttonStyles(variant: Variant = "primary", size: Size = "md"): string {
  return [
    "inline-flex items-center justify-center rounded-btn font-medium transition",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
  ].join(" ");
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${buttonStyles(variant, size)} ${className}`} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${buttonStyles(variant, size)} ${className}`} {...props} />;
}
