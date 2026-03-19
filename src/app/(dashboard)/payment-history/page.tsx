import { MonobankPaymentsHistory } from "@/components/admin/MonobankPaymentsHistory";
import { MonobankStatementProvider } from "@/components/admin/MonobankStatementProvider";

export default function PaymentHistoryPage() {
  return (
    <MonobankStatementProvider>
      <div className="@container/main mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <section className="px-4 lg:px-6">
          <MonobankPaymentsHistory />
        </section>
      </div>
    </MonobankStatementProvider>
  );
}
