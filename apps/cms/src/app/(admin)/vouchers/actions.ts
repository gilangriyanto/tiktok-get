"use server";

import {
  RetailerSchema,
  type VoidVoucherRequest,
  type VoucherDetail,
  type VoucherUploadRequest,
  type VoucherUploadResult,
} from "@tiktok-get/shared";
import { runAction, type ActionResult } from "@/lib/action";
import * as api from "@/lib/api";
import { apiError } from "@/lib/api-error";
import { sessionFor } from "@/lib/session";
import { parseVoucherFile } from "@/lib/voucher-file";

export type UploadPreview = {
  request: VoucherUploadRequest;
  result: VoucherUploadResult;
  skippedEmpty: number;
};

/** Parse file di server CMS lalu minta preview validasi (duplikat dll.) ke API. */
export async function previewUploadAction(formData: FormData): Promise<ActionResult<UploadPreview>> {
  return runAction(async () => {
    const { token } = await sessionFor("voucher:upload");
    const file = formData.get("file");
    const productSlug = String(formData.get("productSlug") ?? "");
    const retailer = RetailerSchema.safeParse(formData.get("retailer"));
    if (!productSlug) throw apiError("VALIDATION", "Pilih produk", { productSlug: ["Pilih produk"] });
    if (!retailer.success) throw apiError("VALIDATION", "Pilih retailer", { retailer: ["Pilih retailer"] });
    if (!(file instanceof File) || file.size === 0) throw apiError("VALIDATION", "Pilih file CSV/XLSX", { file: ["Pilih file CSV/XLSX"] });

    const parsed = await parseVoucherFile(file);
    if (!parsed.ok) throw apiError("VALIDATION", parsed.message, { file: [parsed.message] });

    const request: VoucherUploadRequest = { productSlug, retailer: retailer.data, rows: parsed.rows };
    const result = await api.previewVoucherUpload(token, request);
    return { request, result, skippedEmpty: parsed.skippedEmpty };
  }, { refresh: false });
}

export async function commitUploadAction(request: VoucherUploadRequest): Promise<ActionResult<VoucherUploadResult>> {
  return runAction(async () => api.commitVoucherUpload((await sessionFor("voucher:upload")).token, request));
}

export async function voidVoucherAction(id: string, input: VoidVoucherRequest): Promise<ActionResult<VoucherDetail>> {
  return runAction(async () => api.voidVoucher((await sessionFor("voucher:void")).token, id, input));
}
