import { Suspense } from "react";

import { PaymentsHistoryProvider } from "@/components/admin/PaymentsDataProvider";
import { PaymentsHistoryTable } from "@/components/admin/PaymentsHistoryTable";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitialPaymentsHistoryState } from "@/lib/server/payments";

async function PaymentsHistoryContent() {
  const paymentHistory = await getInitialPaymentsHistoryState();

  return (
    <PaymentsHistoryProvider {...paymentHistory}>
      <DashboardSection>
        <PaymentsHistoryTable source="database" />
      </DashboardSection>
    </PaymentsHistoryProvider>
  );
}

export default function AdminPaymentHistoryPage() {
  return (
    <DashboardPage route="/admin/payment-history">
      <Suspense
        fallback={
          <DashboardSection>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </DashboardSection>
        }
      >
        <PaymentsHistoryContent />
      </Suspense>
    </DashboardPage>
  );
}
