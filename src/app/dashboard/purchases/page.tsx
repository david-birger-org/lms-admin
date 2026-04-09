import { Suspense } from "react";

import {
  CabinetPage,
  CabinetSection,
} from "@/components/cabinet/cabinet-page-shell";
import { UserPurchases } from "@/components/cabinet/UserPurchases";
import { Skeleton } from "@/components/ui/skeleton";
import { listUserPurchases } from "@/lib/server/user-purchases";

async function PurchasesContent() {
  const purchases = await listUserPurchases();

  return (
    <CabinetSection>
      <UserPurchases initialPurchases={purchases} />
    </CabinetSection>
  );
}

export default function DashboardPurchasesPage() {
  return (
    <CabinetPage route="/dashboard/purchases">
      <Suspense
        fallback={
          <CabinetSection>
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </CabinetSection>
        }
      >
        <PurchasesContent />
      </Suspense>
    </CabinetPage>
  );
}
