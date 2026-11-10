import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/notice";

export const metadata: Metadata = { title: "Report" };

export default function Page() {
  return <ComingSoon title="Report">Dashboard stok & performa, komparasi brand, sumber TikTok vs Reguler, dan export (PRD Bab 14). Target: 14 Des 2026.</ComingSoon>;
}
