"use server";

import type { SmsTemplate, SmsTemplateInput, SmsTemplateType } from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { sessionFor } from "@/lib/session";

export async function updateSmsTemplateAction(type: SmsTemplateType, values: SmsTemplateInput): Promise<ActionResult<SmsTemplate>> {
  return runAction(async () => api.updateSmsTemplate((await sessionFor("sms:write")).token, type, values));
}
