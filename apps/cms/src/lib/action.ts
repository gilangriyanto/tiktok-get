import "server-only";
import { refresh } from "next/cache";
import type { AdminError } from "@tiktok-get/shared";
import { ApiError } from "./api-error";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: AdminError };

/**
 * Bungkus isi server action: ubah ApiError menjadi nilai (untuk ditampilkan di form)
 * dan refresh router setelah mutasi berhasil.
 */
export async function runAction<T>(fn: () => Promise<T>, opts: { refresh?: boolean } = {}): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    if (opts.refresh !== false) refresh();
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.body };
    console.error(e);
    return { ok: false, error: { code: "VALIDATION", message: "Terjadi kesalahan tak terduga" } };
  }
}
