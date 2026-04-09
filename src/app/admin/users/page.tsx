import { Suspense } from "react";

import { UsersManager } from "@/components/admin/UsersManager";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminUsers } from "@/lib/server/admin-users";

async function UsersContent() {
  const users = await listAdminUsers();

  return (
    <DashboardSection>
      <UsersManager initialUsers={users} />
    </DashboardSection>
  );
}

export default function AdminUsersPage() {
  return (
    <DashboardPage route="/admin/users">
      <Suspense
        fallback={
          <DashboardSection>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </DashboardSection>
        }
      >
        <UsersContent />
      </Suspense>
    </DashboardPage>
  );
}
