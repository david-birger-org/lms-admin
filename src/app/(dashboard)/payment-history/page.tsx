import { AppPaymentsHistory } from "@/components/admin/AppPaymentsHistory";
import { PaymentsHistoryProvider } from "@/components/admin/PaymentsHistoryProvider";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { getInitialPaymentsHistoryState } from "@/lib/server/payments";

export default async function PaymentHistoryPage() {
  const paymentHistory = await getInitialPaymentsHistoryState();

  return (
    <PaymentsHistoryProvider {...paymentHistory}>
      <DashboardPage route="/payment-history">
        <DashboardSection>
          <AppPaymentsHistory />
        </DashboardSection>
      </DashboardPage>
    </PaymentsHistoryProvider>
  );
}
