import { UsersManager } from "@/components/admin/UsersManager";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { listAdminUsers } from "@/lib/server/admin-users";

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <DashboardPage route="/admin/users">
      <DashboardSection>
        <UsersManager initialUsers={users} />
      </DashboardSection>
    </DashboardPage>
  );
}
