"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginRequestSchema } from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { validationError } from "@/lib/api-error";
import { SESSION_COOKIE, SESSION_MAX_AGE, getSessionToken } from "@/lib/session";

export async function loginAction(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = LoginRequestSchema.safeParse(input);
    if (!parsed.success) throw validationError(parsed.error);
    const { token } = await api.login({ ...parsed.data, email: parsed.data.email.toLowerCase() });
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return null;
  }, { refresh: false });
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) await api.logout(token).catch(() => undefined);
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
