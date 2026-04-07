import {
  CabinetPage,
  CabinetSection,
} from "@/components/cabinet/cabinet-page-shell";
import { UserPurchases } from "@/components/cabinet/UserPurchases";

export default function DashboardPurchasesPage() {
  return (
    <CabinetPage route="/dashboard/purchases">
      <CabinetSection>
        <UserPurchases />
      </CabinetSection>
    </CabinetPage>
  );
}
