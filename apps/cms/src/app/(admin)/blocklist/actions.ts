"use server";

import type { BlocklistEntry, BlocklistInput } from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { sessionFor } from "@/lib/session";

export async function createBlockAction(values: BlocklistInput): Promise<ActionResult<BlocklistEntry>> {
  return runAction(async () => api.createBlock((await sessionFor("blocklist:write")).token, values));
}

export async function deleteBlockAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await api.deleteBlock((await sessionFor("blocklist:write")).token, id);
    return null;
  });
}
