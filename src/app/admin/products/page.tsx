import { Suspense } from "react";

import { ProductsManager } from "@/components/admin/ProductsManager";
import {
  DashboardPage,
  DashboardSection,
} from "@/components/dashboard/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminProducts } from "@/lib/server/products";

async function ProductsContent() {
  const products = await listAdminProducts();

  return (
    <DashboardSection>
      <ProductsManager initialProducts={products} />
    </DashboardSection>
  );
}

export default function AdminProductsPage() {
  return (
    <DashboardPage route="/admin/products">
      <Suspense
        fallback={
          <DashboardSection>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </DashboardSection>
        }
      >
        <ProductsContent />
      </Suspense>
    </DashboardPage>
  );
}
