import { redirect } from "next/navigation";

export default function InvoiceRedirectPage() {
  redirect("/admin/invoice");
}
