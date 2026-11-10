import type { Metadata } from "next";
import { Suspense } from "react";
import { can } from "@tiktok-get/shared";
import { AccessDenied } from "@/components/layout/notice";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { requireSession } from "@/lib/session";
import { BrandForm } from "../brand-form";
import { EMPTY_BRAND } from "../brand-input";

export const metadata: Metadata = { title: "Tambah brand" };

export default function NewBrandPage() {
  return (
    <>
      <PageHeader title="Tambah brand" />
      <Suspense fallback={<PageSkeleton />}>
        <NewBrand />
      </Suspense>
    </>
  );
}

async function NewBrand() {
  const { user } = await requireSession();
  if (!can(user.role, "content:write")) return <AccessDenied>Role Anda tidak bisa menambah brand.</AccessDenied>;
  return <BrandForm initial={EMPTY_BRAND} readOnly={false} />;
}
