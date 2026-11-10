import { SiteHeader } from "./SiteHeader";

/** Kerangka halaman teks legal. TODO(konten): isi final dari klien/legal. */
export function LegalPage({ title }: { title: string }) {
  return (
    <>
      <SiteHeader bordered />
      <main className="container-site flex-1 py-12">
        <article className="mx-auto max-w-2xl">
          <h1 className="font-heading text-mint-gradient text-3xl">{title}</h1>
          <p className="mt-6 text-white/80">Konten {title.toLowerCase()} akan segera tersedia.</p>
        </article>
      </main>
    </>
  );
}
