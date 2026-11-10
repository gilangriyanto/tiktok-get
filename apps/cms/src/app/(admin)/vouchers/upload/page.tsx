import type { Metadata } from "next";
import { Suspense } from "react";
import { can } from "@tiktok-get/shared";
import { AccessDenied } from "@/components/layout/notice";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import * as api from "@/lib/api";
import { requireSession } from "@/lib/session";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Upload kode voucher" };

export default function UploadPage({ searchParams }: PageProps<"/vouchers/upload">) {
  return (
    <>
      <PageHeader title="Upload kode voucher" description="Import CSV/XLSX per produk & retailer (FR-CMS-07)." />
      <Suspense fallback={<PageSkeleton rows={4} />}>
        {searchParams.then((sp) => (
          <Upload productSlug={typeof sp.productSlug === "string" ? sp.productSlug : ""} />
        ))}
      </Suspense>
    </>
  );
}

async function Upload({ productSlug }: { productSlug: string }) {
  const { token, user } = await requireSession();
  if (!can(user.role, "voucher:upload")) return <AccessDenied>Role Anda tidak bisa mengunggah kode voucher.</AccessDenied>;
  const { products } = await api.getOptions(token);
  return <UploadForm products={products} initialProduct={products.some((p) => p.slug === productSlug) ? productSlug : ""} />;
}
