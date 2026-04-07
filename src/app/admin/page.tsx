import { PaymentsHistoryProvider } from "@/components/admin/PaymentsDataProvider";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { PaymentsChart } from "@/components/dashboard/payments-chart";
import { getRuntimeChecks } from "@/lib/runtime-checks";
import { getInitialPaymentsHistoryState } from "@/lib/server/payments";

export default async function AdminOverviewPage() {
  const runtimeChecks = getRuntimeChecks();
  const readyCount = runtimeChecks.filter((item) => item.ready).length;
  const paymentHistory = await getInitialPaymentsHistoryState();

  return (
    <DashboardPage route="/admin">
      <OverviewCards
        readyCount={readyCount}
        totalChecks={runtimeChecks.length}
      />

      <PaymentsHistoryProvider {...paymentHistory}>
        <DashboardSection>
          <PaymentsChart />
        </DashboardSection>
      </PaymentsHistoryProvider>
    </DashboardPage>
  );
}
