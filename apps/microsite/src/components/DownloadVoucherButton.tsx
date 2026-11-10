"use client";

import { useState } from "react";
import { Button } from "./Button";

/**
 * TODO(api): unduh PNG voucher dari endpoint API, mis. GET /vouchers/:token/image,
 * lalu simpan lewat <a download>. Untuk sekarang hanya menampilkan pesan.
 */
export function DownloadVoucherButton({ token }: { token: string }) {
  const [notice, setNotice] = useState("");

  return (
    <div className="text-center">
      <Button
        size="lg"
        className="w-full max-w-md"
        data-token={token}
        onClick={() => setNotice("Fitur download voucher segera hadir. Untuk sekarang, salin kodenya ya!")}
      >
        Download Voucher
      </Button>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-white/85">
        {notice}
      </p>
    </div>
  );
}
