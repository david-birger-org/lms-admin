import { ShoppingBag } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  CabinetPage,
  CabinetSection,
} from "@/components/cabinet/cabinet-page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { requireAuthPageAccess } from "@/lib/auth/auth-server";
import { getDashboardAccount } from "@/lib/dashboard-account";

export default async function UserDashboardPage() {
  const t = await getTranslations("dashboardHome");
  const access = await requireAuthPageAccess();
  const account = getDashboardAccount(access.authenticatedUser);

  return (
    <CabinetPage route="/dashboard">
      <CabinetSection>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="size-4" />
                {t("purchasesTitle")}
              </CardTitle>
              <CardDescription>{t("purchasesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/purchases">{t("viewPurchases")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("accountTitle")}</CardTitle>
              <CardDescription>
                {t("signedInAs", {
                  email: access.authenticatedUser.email ?? account.email,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {account.fullName}
              </p>
            </CardContent>
          </Card>
        </div>
      </CabinetSection>
    </CabinetPage>
  );
}
