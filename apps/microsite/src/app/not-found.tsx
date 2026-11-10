import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import { StatusPage } from "@/components/StatusPage";

export const metadata: Metadata = { title: "Halaman tidak ditemukan — #TikTokGet" };

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404"
      title="Halaman tidak ditemukan"
      action={
        <ButtonLink href="/" variant="cta" className="rounded-lg">
          Kembali ke beranda
        </ButtonLink>
      }
    >
      <p>Link yang kamu buka mungkin salah atau sudah tidak tersedia.</p>
    </StatusPage>
  );
}
