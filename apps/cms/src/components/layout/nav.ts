import {
  Ban,
  BookOpenCheck,
  ChartColumn,
  FileClock,
  HelpCircle,
  LayoutDashboard,
  type LucideIcon,
  MessageSquareText,
  Package,
  Settings2,
  ShieldCheck,
  Store,
  Ticket,
  Users,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; soon?: boolean };

export const NAV_MAIN: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaign", label: "Campaign", icon: Settings2 },
  { href: "/brands", label: "Brand", icon: Store },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/vouchers", label: "Voucher", icon: Ticket },
  { href: "/claims", label: "Peserta & Klaim", icon: Users },
  { href: "/faqs", label: "FAQ", icon: HelpCircle },
  { href: "/sms-templates", label: "Template SMS", icon: MessageSquareText },
  { href: "/blocklist", label: "Blokir", icon: Ban },
  { href: "/admins", label: "Admin", icon: ShieldCheck },
];

export const NAV_SOON: NavItem[] = [
  { href: "/reconciliation", label: "Rekonsiliasi", icon: BookOpenCheck, soon: true },
  { href: "/reports", label: "Report", icon: ChartColumn, soon: true },
  { href: "/audit-log", label: "Audit log", icon: FileClock, soon: true },
];
