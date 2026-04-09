import { PendingInvoicesTable } from "@/components/admin/PendingInvoicesTable";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";

export default function AdminPendingInvoicesPage() {
  return (
    <DashboardPage route="/admin/pending">
      <DashboardSection>
        <PendingInvoicesTable />
      </DashboardSection>
    </DashboardPage>
  );
}
