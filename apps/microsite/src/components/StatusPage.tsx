import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

type Props = {
  /** Teks kecil di atas judul, mis. "404". */
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

/** Kerangka halaman status: belum mulai, berakhir, kedaluwarsa, 404. */
export function StatusPage({ eyebrow, title, children, action }: Props) {
  return (
    <>
      <SiteHeader bordered />
      <main className="container-site flex flex-1 flex-col items-center justify-center bg-[radial-gradient(ellipse_at_bottom,rgb(37_194_201/0.35),transparent_65%)] py-20 text-center">
        <div className="max-w-md rounded-card border-2 border-pink/80 bg-black px-6 py-10 shadow-glow-pink">
          {eyebrow && <p className="font-heading text-mint-gradient text-5xl">{eyebrow}</p>}
          <h1 className="font-heading mt-2 text-3xl text-white">{title}</h1>
          {children && <div className="mt-3 text-white/85">{children}</div>}
          {action && <div className="mt-8">{action}</div>}
        </div>
      </main>
    </>
  );
}
