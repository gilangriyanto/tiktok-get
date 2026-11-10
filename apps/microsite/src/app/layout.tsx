import type { Metadata, Viewport } from "next";
import { SourceTracker } from "@/components/SourceTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "#TikTokGet — Belanja lebih hemat di Indomaret",
  description: "Temukan voucher diskon untuk belanja produk favoritmu.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col">
        <SourceTracker />
        {children}
      </body>
    </html>
  );
}
