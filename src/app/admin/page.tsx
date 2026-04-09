import { Suspense } from "react";

import { PaymentsHistoryProvider } from "@/components/admin/PaymentsDataProvider";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { PaymentsChart } from "@/components/dashboard/payments-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { getRuntimeChecks } from "@/lib/runtime-checks";
import { getInitialPaymentsHistoryState } from "@/lib/server/payments";

async function PaymentsChartSection() {
  const paymentHistory = await getInitialPaymentsHistoryState();

  return (
    <PaymentsHistoryProvider {...paymentHistory}>
      <DashboardSection>
        <PaymentsChart />
      </DashboardSection>
    </PaymentsHistoryProvider>
  );
}

export default function AdminOverviewPage() {
  const runtimeChecks = getRuntimeChecks();
  const readyCount = runtimeChecks.filter((item) => item.ready).length;

  return (
    <DashboardPage route="/admin">
      <OverviewCards
        readyCount={readyCount}
        totalChecks={runtimeChecks.length}
      />

      <Suspense
        fallback={
          <DashboardSection>
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </DashboardSection>
        }
      >
        <PaymentsChartSection />
      </Suspense>
    </DashboardPage>
  );
}
