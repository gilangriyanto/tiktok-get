"use server";

import type { AdminProduct, ProductInput } from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { sessionFor } from "@/lib/session";

export async function createProductAction(values: ProductInput): Promise<ActionResult<AdminProduct>> {
  return runAction(async () => api.createProduct((await sessionFor("content:write")).token, values));
}

export async function updateProductAction(id: string, values: ProductInput): Promise<ActionResult<AdminProduct>> {
  return runAction(async () => api.updateProduct((await sessionFor("content:write")).token, id, values));
}
