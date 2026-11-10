import type { VoucherView } from "@tiktok-get/shared";

/** Panggil hanya setelah `connection()` (waktu sekarang = data request). */
export function isVoucherExpired(voucher: Pick<VoucherView, "expiresAt">): boolean {
  return Date.parse(voucher.expiresAt) < Date.now();
}
