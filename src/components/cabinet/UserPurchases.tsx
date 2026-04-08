"use client";

import { PackageOpen } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserPurchaseRecord } from "@/lib/server/user-purchases";

type Purchase = UserPurchaseRecord;

function formatPrice(priceMinor: number, currency: string) {
  const amount = priceMinor / 100;
  return `${amount.toLocaleString("uk-UA", { minimumFractionDigits: 0 })} ${currency}`;
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "ua" ? "uk-UA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  processing: "secondary",
  invoice_created: "outline",
  failed: "destructive",
  expired: "destructive",
  cancelled: "destructive",
  reversed: "destructive",
};

export function UserPurchases({
  initialPurchases,
}: {
  initialPurchases: Purchase[];
}) {
  const [purchases] = useState<Purchase[]>(initialPurchases);
  const locale = useLocale();
  const t = useTranslations("purchases");

  return (
    <Card className="shadow-xs">
      <CardHeader className="border-b px-3 sm:px-6">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <PackageOpen className="size-8 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium">{t("emptyTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {t("emptyDescription")}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-3 sm:pl-6">
                  {t("columns.product")}
                </TableHead>
                <TableHead className="text-right">
                  {t("columns.amount")}
                </TableHead>
                <TableHead className="text-center">
                  {t("columns.status")}
                </TableHead>
                <TableHead className="pr-3 text-right sm:pr-6">
                  {t("columns.date")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="pl-3 sm:pl-6">
                    <div>
                      <p className="font-medium">
                        {locale === "ua"
                          ? (purchase.productNameUk ?? purchase.description)
                          : (purchase.productNameEn ?? purchase.description)}
                      </p>
                      {(
                        locale === "ua"
                          ? purchase.productNameEn
                          : purchase.productNameUk
                      ) ? (
                        <p className="text-xs text-muted-foreground">
                          {locale === "ua"
                            ? purchase.productNameEn
                            : purchase.productNameUk}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(purchase.amountMinor, purchase.currency)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={statusVariants[purchase.status] ?? "secondary"}
                    >
                      {t(`statuses.${purchase.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-3 text-right text-sm text-muted-foreground sm:pr-6">
                    {formatDate(purchase.createdAt, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
