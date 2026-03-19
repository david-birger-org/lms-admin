import { MonobankInvoiceForm } from "@/components/admin/MonobankInvoiceForm";

export default function InvoicePage() {
  return (
    <div className="@container/main mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <section className="px-4 lg:px-6">
        <MonobankInvoiceForm />
      </section>
    </div>
  );
}
