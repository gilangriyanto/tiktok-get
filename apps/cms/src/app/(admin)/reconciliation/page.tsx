import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/notice";

export const metadata: Metadata = { title: "Rekonsiliasi" };

export default function Page() {
  return <ComingSoon title="Rekonsiliasi">Export daftar voucher ke merchant, import hasil USED/NOT_USED, dan kembalikan voucher ke pool (PRD Bab 13). Target: export/import dasar 10 Des 2026.</ComingSoon>;
}
