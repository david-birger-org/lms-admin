import { MonobankInvoiceForm } from "@/components/admin/MonobankInvoiceForm";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";

export default function AdminInvoicePage() {
  return (
    <DashboardPage route="/admin/invoice">
      <DashboardSection>
        <MonobankInvoiceForm />
      </DashboardSection>
    </DashboardPage>
  );
}
