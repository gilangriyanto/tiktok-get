import "server-only";
import { notFound } from "next/navigation";
import { ApiError } from "./api-error";

/** Ubah ApiError 404 dari API menjadi halaman not-found Next.js. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
