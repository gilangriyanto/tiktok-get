"use client";

import { useEffect } from "react";
import { captureSourceFromUrl } from "@/lib/source";

/**
 * Menangkap `?src=tiktok` di halaman mana pun user masuk.
 * Membaca window.location di effect (bukan useSearchParams) agar shell tetap statis.
 */
export function SourceTracker() {
  useEffect(() => {
    captureSourceFromUrl(window.location.search);
  }, []);
  return null;
}
