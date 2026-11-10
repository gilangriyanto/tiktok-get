import type { AdminError, AdminErrorCode } from "@tiktok-get/shared";
import type { z } from "zod";

/** Error dari API admin (asli maupun mock), membawa body AdminError. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: AdminError,
  ) {
    super(body.message ?? body.code);
  }
}

const STATUS: Record<AdminErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
};

export function apiError(
  code: AdminErrorCode,
  message?: string,
  fieldErrors?: Record<string, string[]>,
): ApiError {
  return new ApiError(STATUS[code], { code, message, fieldErrors });
}

/** Ubah error Zod menjadi ApiError VALIDATION dengan fieldErrors per path. */
export function validationError(error: z.ZodError): ApiError {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return apiError("VALIDATION", "Data tidak valid", fieldErrors);
}
