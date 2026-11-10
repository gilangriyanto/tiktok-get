"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { parseVideoUrl } from "@tiktok-get/shared";
import { Button } from "@/components/ui/button";

/**
 * Pratinjau embed resmi YouTube/TikTok. Iframe baru dimuat setelah diklik
 * agar halaman edit tetap ringan (player pihak ketiga berat & terus melakukan request).
 */
export function VideoPreview({ url, title }: { url: string; title: string }) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const parsed = parseVideoUrl(url);
  const box = "flex aspect-9/16 w-40 items-center justify-center rounded-md border bg-muted p-2 text-center text-xs text-muted-foreground";

  if (!parsed) return <div className={box}>URL belum dikenali</div>;
  if (loadedUrl !== url) {
    return (
      <div className={box}>
        <Button type="button" variant="outline" size="sm" onClick={() => setLoadedUrl(url)}>
          <Play /> Pratinjau {parsed.provider === "youtube" ? "YouTube" : "TikTok"}
        </Button>
      </div>
    );
  }
  const src =
    parsed.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(parsed.videoId)}`
      : `https://www.tiktok.com/embed/v2/${encodeURIComponent(parsed.videoId)}`;
  return (
    <iframe
      src={src}
      title={`Pratinjau: ${title || parsed.provider}`}
      loading="lazy"
      allow="encrypted-media; picture-in-picture"
      className="aspect-9/16 w-40 rounded-md border"
    />
  );
}
