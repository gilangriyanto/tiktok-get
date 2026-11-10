"use server";

import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { apiError } from "@/lib/api-error";
import { sessionFor } from "@/lib/session";

/** Unggah gambar (FR-CMS-17). Mock: data URL; API asli: R2 + WebP. */
export async function uploadMediaAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const { token } = await sessionFor("content:write");
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw apiError("VALIDATION", "Pilih file gambar");
    return api.uploadMedia(token, file);
  }, { refresh: false });
}
