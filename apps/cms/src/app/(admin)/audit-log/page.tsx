import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/notice";

export const metadata: Metadata = { title: "Audit log" };

export default function Page() {
  return <ComingSoon title="Audit log">Riwayat aksi penting admin: ubah kuota/anti-abuse, upload/void voucher, import rekonsiliasi, export data peserta, blokir, login (FR-CMS-16).</ComingSoon>;
}
