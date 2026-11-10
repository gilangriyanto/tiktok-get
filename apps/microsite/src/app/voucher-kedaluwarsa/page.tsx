import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import { StatusPage } from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "Voucher kedaluwarsa — #TikTokGet",
  robots: { index: false },
};

export default function VoucherExpiredPage() {
  return (
    <StatusPage
      title="Voucher sudah kedaluwarsa"
      action={
        <ButtonLink href="/" variant="cta" className="rounded-lg">
          Cari voucher lain
        </ButtonLink>
      }
    >
      <p>Maaf, masa berlaku voucher ini sudah habis sehingga tidak bisa ditukarkan lagi.</p>
    </StatusPage>
  );
}
