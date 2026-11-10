import type { Source } from "@tiktok-get/shared";

const STORAGE_KEY = "tiktokget:src";

function toSource(value: string | null): Source | null {
  if (value === null) return null;
  return value.trim().toLowerCase() === "tiktok" ? "tiktok" : "reguler";
}

/** Simpan `?src=` dari URL saat ini ke sessionStorage (hanya jika ada di URL). */
export function captureSourceFromUrl(search: string): void {
  const source = toSource(new URLSearchParams(search).get("src"));
  if (source === null) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, source);
  } catch {
    // sessionStorage bisa tidak tersedia (private mode, diblokir) — abaikan.
  }
}

/** Sumber traffic untuk dikirim saat klaim; default "reguler". */
export function getStoredSource(): Source {
  try {
    return toSource(window.sessionStorage.getItem(STORAGE_KEY)) ?? "reguler";
  } catch {
    return "reguler";
  }
}
