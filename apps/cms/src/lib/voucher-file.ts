import "server-only";
import { Readable } from "node:stream";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import type { VoucherUploadRow } from "@tiktok-get/shared";

export type ParsedVoucherFile =
  | { ok: true; rows: VoucherUploadRow[]; skippedEmpty: number }
  | { ok: false; message: string };

const MAX_ROWS = 50_000;

/** Cari indeks kolom kode_voucher (wajib) & batch (opsional) dari baris header. */
function headerIndex(header: string[]) {
  const norm = header.map((h) => h.trim().toLowerCase());
  return { code: norm.indexOf("kode_voucher"), batch: norm.indexOf("batch") };
}

function toRows(table: string[][]): ParsedVoucherFile {
  if (table.length === 0) return { ok: false, message: "File kosong." };
  const idx = headerIndex(table[0]);
  if (idx.code < 0) return { ok: false, message: "Kolom wajib `kode_voucher` tidak ditemukan di baris header." };
  const rows: VoucherUploadRow[] = [];
  let skippedEmpty = 0;
  for (let i = 1; i < table.length; i++) {
    const code = (table[i][idx.code] ?? "").trim();
    const batch = idx.batch >= 0 ? (table[i][idx.batch] ?? "").trim() : "";
    if (!code) {
      skippedEmpty += 1;
      continue;
    }
    rows.push({ line: i + 1, code, ...(batch ? { batch } : {}) });
  }
  if (rows.length === 0) return { ok: false, message: "Tidak ada baris berisi kode_voucher." };
  if (rows.length > MAX_ROWS) return { ok: false, message: `Maksimal ${MAX_ROWS.toLocaleString("id-ID")} baris per upload.` };
  return { ok: true, rows, skippedEmpty };
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value && value.result !== undefined) return String(value.result);
    if ("richText" in value) return value.richText.map((r) => r.text).join("");
    if (value instanceof Date) return value.toISOString();
  }
  return String(value);
}

/** Parse CSV / XLSX (sheet pertama) berkolom kode_voucher, batch. */
export async function parseVoucherFile(file: File): Promise<ParsedVoucherFile> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const result = Papa.parse<string[]>(await file.text(), { skipEmptyLines: "greedy" });
    if (result.errors.length > 0 && result.data.length === 0) return { ok: false, message: `CSV tidak valid: ${result.errors[0].message}` };
    return toRows(result.data);
  }
  if (name.endsWith(".xlsx")) {
    const wb = new ExcelJS.Workbook();
    try {
      // xlsx.read(stream): tipe Buffer milik exceljs bentrok dengan Buffer Node, jadi pakai stream.
      await wb.xlsx.read(Readable.from(Buffer.from(await file.arrayBuffer())));
    } catch {
      return { ok: false, message: "File XLSX tidak bisa dibaca." };
    }
    const sheet = wb.worksheets[0];
    if (!sheet) return { ok: false, message: "Workbook tidak punya sheet." };
    const table: string[][] = [];
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const values: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        values[col - 1] = cellText(cell.value).trim();
      });
      table[rowNumber - 1] = values;
    });
    return toRows(Array.from(table, (r) => r ?? []));
  }
  return { ok: false, message: "Format file harus .csv atau .xlsx" };
}
