import {
  CabinetPage,
  CabinetSection,
} from "@/components/cabinet/cabinet-page-shell";
import { UserPurchases } from "@/components/cabinet/UserPurchases";
import { listUserPurchases } from "@/lib/server/user-purchases";

export default async function DashboardPurchasesPage() {
  const purchases = await listUserPurchases();

  return (
    <CabinetPage route="/dashboard/purchases">
      <CabinetSection>
        <UserPurchases initialPurchases={purchases} />
      </CabinetSection>
    </CabinetPage>
  );
}
