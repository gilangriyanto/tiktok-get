"use server";

import type { AdminFaq, FaqInput } from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { sessionFor } from "@/lib/session";

export async function saveFaqAction(id: string | null, values: FaqInput): Promise<ActionResult<AdminFaq>> {
  return runAction(async () => {
    const { token } = await sessionFor("content:write");
    return id ? api.updateFaq(token, id, values) : api.createFaq(token, values);
  });
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await api.deleteFaq((await sessionFor("content:write")).token, id);
    return null;
  });
}
