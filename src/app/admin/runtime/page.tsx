import { OperationsStatusCard } from "@/components/dashboard/operations-status-card";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { getRuntimeChecks } from "@/lib/runtime-checks";

export default function AdminRuntimePage() {
  const runtimeChecks = getRuntimeChecks();

  return (
    <DashboardPage route="/admin/runtime">
      <DashboardSection>
        <OperationsStatusCard checks={runtimeChecks} />
      </DashboardSection>
    </DashboardPage>
  );
}
