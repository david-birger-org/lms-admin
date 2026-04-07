import { MonobankStatementProvider } from "@/components/admin/PaymentsDataProvider";
import { PendingInvoicesTable } from "@/components/admin/PendingInvoicesTable";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { getInitialMonobankStatementState } from "@/lib/server/monobank";

export default async function AdminPendingInvoicesPage() {
  const statement = await getInitialMonobankStatementState();

  return (
    <MonobankStatementProvider {...statement}>
      <DashboardPage route="/admin/pending">
        <DashboardSection>
          <PendingInvoicesTable source="provider" />
        </DashboardSection>
      </DashboardPage>
    </MonobankStatementProvider>
  );
}
