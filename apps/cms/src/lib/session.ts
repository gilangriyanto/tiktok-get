import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { can, type AdminUser, type Permission } from "@tiktok-get/shared";
import { getMe } from "./api";
import { ApiError, apiError } from "./api-error";

export const SESSION_COOKIE = "cms_session";
/** Sesi timeout 60 menit (FR-CMS-01). */
export const SESSION_MAX_AGE = 60 * 60;

export type Session = { token: string; user: AdminUser };

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Sesi untuk halaman: alihkan ke /login jika tidak ada/kedaluwarsa.
 * Panggil di dalam <Suspense> (membaca cookie = data request).
 */
export async function requireSession(): Promise<Session> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  try {
    return { token, user: await getMe(token) };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login?expired=1");
    throw e;
  }
}

/** Sesi untuk server action: lempar ApiError (bukan redirect) + cek izin. */
export async function sessionFor(permission?: Permission): Promise<Session> {
  const token = await getSessionToken();
  if (!token) throw apiError("UNAUTHORIZED", "Sesi berakhir, silakan login ulang");
  const user = await getMe(token);
  if (permission && !can(user.role, permission)) throw apiError("FORBIDDEN", "Anda tidak punya akses untuk aksi ini");
  return { token, user };
}
