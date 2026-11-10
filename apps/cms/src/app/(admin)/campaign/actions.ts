"use server";

import type { CampaignSettings } from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { sessionFor } from "@/lib/session";

export async function updateCampaignAction(values: CampaignSettings): Promise<ActionResult<CampaignSettings>> {
  return runAction(async () => {
    const { token } = await sessionFor("content:write");
    return api.updateCampaignSettings(token, values);
  });
}
