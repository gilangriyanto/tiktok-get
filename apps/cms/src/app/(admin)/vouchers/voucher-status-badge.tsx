import { VOUCHER_STATUS_LABELS, type VoucherStatus } from "@tiktok-get/shared";
import { Badge } from "@/components/ui/badge";

const VARIANT: Record<VoucherStatus, "default" | "secondary" | "outline" | "destructive"> = {
  available: "outline",
  redeemed: "secondary",
  used: "default",
  void: "destructive",
};

export function VoucherStatusBadge({ status, needsReconciliation = false }: { status: VoucherStatus; needsReconciliation?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Badge variant={VARIANT[status]}>{VOUCHER_STATUS_LABELS[status]}</Badge>
      {needsReconciliation && (
        <Badge variant="outline" className="border-amber-500 text-amber-700">
          Kedaluwarsa — perlu rekonsiliasi
        </Badge>
      )}
    </span>
  );
}
