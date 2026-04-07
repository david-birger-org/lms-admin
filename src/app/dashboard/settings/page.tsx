import { Settings2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AccountSettingsPanel } from "@/components/auth/account-settings-panel";
import {
  CabinetPage,
  CabinetSection,
} from "@/components/cabinet/cabinet-page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolveUserRole } from "@/lib/auth/admin";
import { requireAuthPageAccess } from "@/lib/auth/auth-server";
import { getDashboardAccount } from "@/lib/dashboard-account";

export default async function DashboardSettingsPage() {
  const t = await getTranslations("settings");
  const access = await requireAuthPageAccess();
  const account = getDashboardAccount(access.user);

  return (
    <CabinetPage route="/dashboard/settings">
      <CabinetSection>
        <Card className="shadow-xs">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Settings2 className="size-4" />
              {t("title")}
            </CardTitle>
            <CardDescription>{t("descriptionUser")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 xl:pt-6">
            <AccountSettingsPanel
              email={access.user.email}
              fullName={account.fullName}
              role={resolveUserRole(access.user) ?? "user"}
            />
          </CardContent>
        </Card>
      </CabinetSection>
    </CabinetPage>
  );
}
