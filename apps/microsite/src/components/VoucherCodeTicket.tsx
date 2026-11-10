"use client";

import { useState } from "react";

type Props = { code: string; productLabel: string };

const CLIPBOARD_TIMEOUT_MS = 1000;

async function copyText(text: string): Promise<boolean> {
  try {
    // Beberapa webview (mis. in-app browser) tidak pernah me-resolve promise ini → beri batas waktu.
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), CLIPBOARD_TIMEOUT_MS)),
    ]);
    return true;
  } catch {
    // Fallback untuk browser/webview tanpa Clipboard API (mis. in-app browser lama).
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/** Kotak pink bergerigi berisi kode voucher + tombol salin. Tanpa barcode/QR (sudah diputuskan). */
export function VoucherCodeTicket({ code, productLabel }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    setStatus((await copyText(code)) ? "copied" : "failed");
    window.setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="ticket-serrated bg-pink-gradient px-4 py-6 text-center text-black">
        <p className="text-xl">Kode Voucher</p>
        <p className="mt-1 text-[clamp(1.5rem,8vw,2.25rem)] leading-tight font-bold tabular-nums break-all">
          {code}
        </p>
        <p className="mt-1 text-lg font-bold">{productLabel}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-black px-6 text-base font-medium text-white transition hover:bg-black/80"
        >
          {status === "copied" ? "Kode tersalin ✓" : "Salin kode"}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {status === "copied" ? "Kode voucher tersalin" : status === "failed" ? "Gagal menyalin kode" : ""}
      </p>
      {status === "failed" && (
        <p className="mt-2 text-center text-sm text-pink">Gagal menyalin, salin kode secara manual.</p>
      )}
    </div>
  );
}
