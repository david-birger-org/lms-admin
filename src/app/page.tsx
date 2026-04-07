import { redirect } from "next/navigation";

import { requireAuthPageAccess } from "@/lib/auth/auth-server";

export default async function RootPage() {
  const access = await requireAuthPageAccess();

  if (access.role === "admin") redirect("/admin");

  redirect("/dashboard");
}
