"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/routing";
import { cabinetRoutes } from "@/lib/cabinet-routes";

function useActiveFeatures() {
  const [features, setFeatures] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/user/purchases")
      .then((r) => r.json() as Promise<{ features?: { feature: string }[] }>)
      .then((data) =>
        setFeatures(new Set((data.features ?? []).map((f) => f.feature))),
      )
      .catch(() => {});
  }, []);

  return features;
}

export function CabinetNavigation({ label }: { label: string }) {
  const t = useTranslations("navigation.cabinet");
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const activeFeatures = useActiveFeatures();

  const visibleRoutes = cabinetRoutes.filter((route) => {
    const feature =
      "requiredFeature" in route ? route.requiredFeature : undefined;
    return !feature || activeFeatures.has(feature);
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleRoutes.map((item) => {
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <item.icon />
                    <span>{t(`routes.${item.key}.title`)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
