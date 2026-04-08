import "server-only";

import { headers as getRequestHeaders } from "next/headers";

import { requireAdminPageAccess } from "@/lib/auth/admin-server";
import {
  createTrustedAdminHeaders,
  forwardLmsSlsRequest,
  getForwardedSessionHeaders,
  mergeHeaders,
} from "@/lib/server/lms-sls";

export interface AdminProductRecord {
  active: boolean;
  createdAt: string;
  descriptionEn: string | null;
  descriptionUk: string | null;
  id: string;
  imageUrl: string | null;
  nameEn: string;
  nameUk: string;
  priceUahMinor: number | null;
  priceUsdMinor: number | null;
  pricingType: "fixed" | "on_request";
  slug: string;
  sortOrder: number;
  updatedAt: string;
}

interface ProductsResponse {
  error?: string;
  products?: AdminProductRecord[];
}

const PRODUCTS_ERROR_MESSAGE = "Failed to fetch products.";

export async function listAdminProducts(): Promise<AdminProductRecord[]> {
  const access = await requireAdminPageAccess();
  const requestHeaders = await getRequestHeaders();
  const response = await forwardLmsSlsRequest({
    headers: mergeHeaders(
      createTrustedAdminHeaders(access.admin),
      getForwardedSessionHeaders(requestHeaders),
    ),
    method: "GET",
    path: "/api/products/admin",
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ProductsResponse | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? PRODUCTS_ERROR_MESSAGE);
  }

  return Array.isArray(payload?.products) ? payload.products : [];
}
