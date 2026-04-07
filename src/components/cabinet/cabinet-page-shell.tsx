import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import {
  type CabinetRouteHref,
  getCabinetRouteByHref,
} from "@/lib/cabinet-routes";
import { cn } from "@/lib/utils";

export async function CabinetPage({
  children,
  route,
}: {
  children: ReactNode;
  route?: CabinetRouteHref;
}) {
  const page = route ? getCabinetRouteByHref(route) : null;
  const t = await getTranslations("navigation.cabinet.routes");

  return (
    <div className="@container/main mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      {page ? (
        <CabinetSection>
          <div className="flex flex-col gap-1 rounded-2xl border bg-background/80 px-4 py-4 shadow-xs lg:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
                <page.icon className="size-4" />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {t(`${page.key}.title`)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t(`${page.key}.description`)}
                </p>
              </div>
            </div>
          </div>
        </CabinetSection>
      ) : null}
      {children}
    </div>
  );
}

export function CabinetSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-4 lg:px-6", className)}>{children}</section>
  );
}
