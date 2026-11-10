"use client";

import { useEffect } from "react";

/** Token sementara selama Turnstile belum diintegrasikan. */
export const TURNSTILE_PLACEHOLDER_TOKEN = "turnstile-placeholder";

/**
 * Placeholder Cloudflare Turnstile.
 *
 * TODO(turnstile): muat https://challenges.cloudflare.com/turnstile/v0/api.js,
 * render widget dengan NEXT_PUBLIC_TURNSTILE_SITE_KEY, panggil onToken(token) saat
 * berhasil dan onToken(null) saat kedaluwarsa/gagal. Verifikasi token di apps/api.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  useEffect(() => {
    onToken(TURNSTILE_PLACEHOLDER_TOKEN);
  }, [onToken]);

  return <div data-turnstile-placeholder aria-hidden className="min-h-0" />;
}
