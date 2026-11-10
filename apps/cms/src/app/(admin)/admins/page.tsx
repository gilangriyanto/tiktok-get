import type { Metadata } from "next";
import { Suspense } from "react";
import { ROLE_LABELS, can } from "@tiktok-get/shared";
import { AccessDenied } from "@/components/layout/notice";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as api from "@/lib/api";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };

export default function AdminsPage() {
  return (
    <Suspense fallback={<PageSkeleton rows={3} />}>
      <Admins />
    </Suspense>
  );
}

async function Admins() {
  const { token, user } = await requireSession();
  if (!can(user.role, "admin:manage")) return <AccessDenied />;
  const admins = await api.listAdmins(token);
  return (
    <>
      <PageHeader title="Admin" description="Daftar user CMS. Tambah/ubah admin & batasan brand untuk Viewer: segera hadir (FR-CMS-15)." />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Akses brand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ROLE_LABELS[a.role]}</Badge>
                </TableCell>
                <TableCell>{a.allowedBrandSlugs.length ? a.allowedBrandSlugs.join(", ") : "Semua brand"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
