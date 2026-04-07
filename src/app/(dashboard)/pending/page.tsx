import { redirect } from "next/navigation";

export default function PendingInvoicesRedirectPage() {
  redirect("/admin/pending");
}
