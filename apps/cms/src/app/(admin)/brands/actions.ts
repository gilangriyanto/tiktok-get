"use server";

import type { AdminBrand, BrandInput } from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { sessionFor } from "@/lib/session";

export async function createBrandAction(values: BrandInput): Promise<ActionResult<AdminBrand>> {
  return runAction(async () => api.createBrand((await sessionFor("content:write")).token, values));
}

export async function updateBrandAction(id: string, values: BrandInput): Promise<ActionResult<AdminBrand>> {
  return runAction(async () => api.updateBrand((await sessionFor("content:write")).token, id, values));
}

export async function deleteBrandAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await api.deleteBrand((await sessionFor("content:write")).token, id);
    return null;
  });
}
