import { ProductsManager } from "@/components/admin/ProductsManager";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { listAdminProducts } from "@/lib/server/products";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <DashboardPage route="/admin/products">
      <DashboardSection>
        <ProductsManager initialProducts={products} />
      </DashboardSection>
    </DashboardPage>
  );
}
