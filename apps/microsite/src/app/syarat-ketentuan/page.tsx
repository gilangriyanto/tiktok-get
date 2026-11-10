import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Syarat & Ketentuan — #TikTokGet" };

export default function TermsPage() {
  return <LegalPage title="Syarat & Ketentuan" />;
}
