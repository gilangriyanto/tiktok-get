"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, FileWarning } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { AdminOptions, Retailer, UploadRowStatus } from "@tiktok-get/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RETAILER_LABELS } from "@/lib/labels";
import { commitUploadAction, previewUploadAction, type UploadPreview } from "../actions";

const STATUS_LABEL: Record<UploadRowStatus, string> = {
  ok: "OK",
  invalid: "Tidak valid",
  duplicate_in_file: "Duplikat di file",
  duplicate_existing: "Sudah ada",
};

const PREVIEW_LIMIT = 200;

export function UploadForm({ products, initialProduct }: { products: AdminOptions["products"]; initialProduct: string }) {
  const router = useRouter();
  const [productSlug, setProductSlug] = useState(initialProduct);
  const product = products.find((p) => p.slug === productSlug);
  const [retailer, setRetailer] = useState<Retailer | "">(product?.retailers.length === 1 ? product.retailers[0] : "");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [showFailedOnly, setShowFailedOnly] = useState(true);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    const all = preview?.result.rows ?? [];
    return (showFailedOnly ? all.filter((r) => r.status !== "ok") : all).slice(0, PREVIEW_LIMIT);
  }, [preview, showFailedOnly]);

  function chooseProduct(slug: string) {
    setProductSlug(slug);
    const p = products.find((x) => x.slug === slug);
    setRetailer(p?.retailers.length === 1 ? p.retailers[0] : "");
    setPreview(null);
  }

  function runPreview() {
    const fd = new FormData();
    fd.set("productSlug", productSlug);
    fd.set("retailer", retailer);
    if (file) fd.set("file", file);
    setErrors({});
    startTransition(async () => {
      const res = await previewUploadAction(fd);
      if (res.ok) {
        setPreview(res.data);
        setShowFailedOnly(res.data.result.failedCount > 0);
      } else {
        setPreview(null);
        setErrors(Object.fromEntries(Object.entries(res.error.fieldErrors ?? {}).map(([k, v]) => [k, v[0]])));
        toast.error(res.error.message ?? "Gagal membaca file");
      }
    });
  }

  function commit() {
    if (!preview) return;
    startTransition(async () => {
      const res = await commitUploadAction(preview.request);
      if (res.ok) {
        toast.success(`${res.data.inserted ?? 0} kode voucher disimpan`);
        router.push(`/vouchers?productSlug=${preview.request.productSlug}&status=available`);
      } else {
        toast.error(res.error.message ?? "Gagal menyimpan");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Pilih produk, retailer & file</CardTitle>
          <CardDescription>
            Kolom wajib <code>kode_voucher</code>, opsional <code>batch</code>. Format .csv atau .xlsx (sheet pertama).{" "}
            <a href="/templates/kode-voucher.csv" download className="inline-flex items-center gap-1 font-medium underline">
              <Download className="size-3.5" /> Unduh template CSV
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-3">
          <Field data-invalid={Boolean(errors.productSlug)}>
            <FieldLabel htmlFor="u-product">Produk</FieldLabel>
            <Select value={productSlug} onValueChange={chooseProduct}>
              <SelectTrigger id="u-product" className="w-full" aria-invalid={Boolean(errors.productSlug)}>
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>
                    {p.name} {p.variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.productSlug}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.retailer)}>
            <FieldLabel htmlFor="u-retailer">Retailer</FieldLabel>
            <Select
              value={retailer}
              onValueChange={(v) => {
                setRetailer(v === "indomaret" || v === "alfamart" ? v : "");
                setPreview(null);
              }}
              disabled={!product}
            >
              <SelectTrigger id="u-retailer" className="w-full" aria-invalid={Boolean(errors.retailer)}>
                <SelectValue placeholder="Pilih retailer" />
              </SelectTrigger>
              <SelectContent>
                {(product?.retailers ?? []).map((r) => (
                  <SelectItem key={r} value={r}>
                    {RETAILER_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Kode unik per retailer.</FieldDescription>
            <FieldError>{errors.retailer}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.file)}>
            <FieldLabel htmlFor="u-file">File</FieldLabel>
            <Input
              id="u-file"
              type="file"
              accept=".csv,.xlsx"
              aria-invalid={Boolean(errors.file)}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPreview(null);
              }}
            />
            <FieldError>{errors.file}</FieldError>
          </Field>
          <div className="md:col-span-3">
            <Button type="button" onClick={runPreview} disabled={pending || !file}>
              {pending && !preview ? "Memeriksa…" : "Preview"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>2. Preview & validasi</CardTitle>
            <CardDescription>
              Duplikat dicek di dalam file dan terhadap kode yang sudah ada (per retailer). Baris gagal tidak akan disimpan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="outline">{preview.result.total} baris</Badge>
              <Badge className="bg-emerald-600">
                <CheckCircle2 /> {preview.result.okCount} siap disimpan
              </Badge>
              <Badge variant={preview.result.failedCount ? "destructive" : "outline"}>
                <FileWarning /> {preview.result.failedCount} gagal
              </Badge>
              {preview.skippedEmpty > 0 && <Badge variant="secondary">{preview.skippedEmpty} baris kosong dilewati</Badge>}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showFailedOnly} onChange={(e) => setShowFailedOnly(e.target.checked)} />
              Tampilkan baris gagal saja
            </label>
            <div className="max-h-96 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Baris</TableHead>
                    <TableHead>kode_voucher</TableHead>
                    <TableHead>batch</TableHead>
                    <TableHead>Hasil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                        Tidak ada baris gagal.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.line}>
                        <TableCell>{r.line}</TableCell>
                        <TableCell className="font-mono text-xs">{r.code}</TableCell>
                        <TableCell>{r.batch ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "ok" ? "outline" : "destructive"}>{STATUS_LABEL[r.status]}</Badge>
                          {r.message && <span className="ml-2 text-xs text-muted-foreground">{r.message}</span>}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {rows.length === PREVIEW_LIMIT && <p className="text-xs text-muted-foreground">Menampilkan {PREVIEW_LIMIT} baris pertama.</p>}
            <div className="flex gap-2">
              <Button type="button" onClick={commit} disabled={pending || preview.result.okCount === 0}>
                {pending ? "Menyimpan…" : `Simpan ${preview.result.okCount} kode`}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/vouchers">Batal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
