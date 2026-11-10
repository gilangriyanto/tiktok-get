import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Kebijakan Privasi — #TikTokGet" };

export default function PrivacyPage() {
  return <LegalPage title="Kebijakan Privasi" />;
}
