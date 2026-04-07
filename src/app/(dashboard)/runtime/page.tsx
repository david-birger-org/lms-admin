import { redirect } from "next/navigation";

export default function RuntimeRedirectPage() {
  redirect("/admin/runtime");
}
