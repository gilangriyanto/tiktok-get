"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NAV_MAIN, NAV_SOON, type NavItem } from "./nav";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Pathname = data URL pada route dinamis → dibaca di dalam Suspense; fallback tanpa penanda aktif. */
function NavList({ items }: { items: NavItem[] }) {
  return (
    <Suspense fallback={<NavItems items={items} pathname={null} />}>
      <NavListActive items={items} />
    </Suspense>
  );
}

function NavListActive({ items }: { items: NavItem[] }) {
  return <NavItems items={items} pathname={usePathname()} />;
}

function NavItems({ items, pathname }: { items: NavItem[]; pathname: string | null }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname !== null && isActive(pathname, item.href)} tooltip={item.label}>
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
              {item.soon && (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Segera
                </Badge>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex h-10 items-center gap-2 px-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
            TG
          </span>
          <span className="truncate group-data-[collapsible=icon]:hidden">CMS #TikTokGet</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Kelola</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={NAV_MAIN} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Segera hadir</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={NAV_SOON} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
