import { ProductsManager } from "@/components/admin/ProductsManager";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";

export default function AdminProductsPage() {
  return (
    <DashboardPage route="/admin/products">
      <DashboardSection>
        <ProductsManager />
      </DashboardSection>
    </DashboardPage>
  );
}
