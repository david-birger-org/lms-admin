import { Suspense } from "react";

import { MonobankStatementProvider } from "@/components/admin/PaymentsDataProvider";
import { PaymentsHistoryTable } from "@/components/admin/PaymentsHistoryTable";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitialMonobankStatementState } from "@/lib/server/monobank";

async function StatementAuditContent() {
  const statement = await getInitialMonobankStatementState();

  return (
    <MonobankStatementProvider {...statement}>
      <DashboardSection>
        <PaymentsHistoryTable source="provider" />
      </DashboardSection>
    </MonobankStatementProvider>
  );
}

export default function AdminStatementAuditPage() {
  return (
    <DashboardPage route="/admin/statement-audit">
      <Suspense
        fallback={
          <DashboardSection>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </DashboardSection>
        }
      >
        <StatementAuditContent />
      </Suspense>
    </DashboardPage>
  );
}
