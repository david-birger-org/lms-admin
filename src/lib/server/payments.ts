import "server-only";

import { headers as getRequestHeaders } from "next/headers";

import { requireAdminPageAccess } from "@/lib/auth/admin-server";
import type { StatementItem } from "@/lib/monobank";
import {
  DEFAULT_PAYMENT_HISTORY_DAYS,
  normalizePaymentHistoryRows,
  type PaymentHistorySnapshot,
} from "@/lib/payments";
import {
  createTrustedAdminHeaders,
  forwardLmsSlsRequest,
  getForwardedSessionHeaders,
  mergeHeaders,
} from "@/lib/server/lms-sls";

interface PaymentHistoryResponse {
  list?: StatementItem[];
  error?: string;
}

const PAYMENT_HISTORY_ERROR_MESSAGE = "Failed to load payment history.";

export async function getPaymentsHistory(
  days = DEFAULT_PAYMENT_HISTORY_DAYS,
): Promise<PaymentHistorySnapshot> {
  const access = await requireAdminPageAccess();
  const requestHeaders = await getRequestHeaders();
  const searchParams = new URLSearchParams({ days: String(days) });
  const response = await forwardLmsSlsRequest({
    headers: mergeHeaders(
      createTrustedAdminHeaders(access.admin),
      getForwardedSessionHeaders(requestHeaders),
    ),
    method: "GET",
    path: "/api/payments/history",
    search: `?${searchParams.toString()}`,
  });

  const payload = (await response
    .json()
    .catch(() => null)) as PaymentHistoryResponse | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? PAYMENT_HISTORY_ERROR_MESSAGE);
  }

  return {
    rows: normalizePaymentHistoryRows(
      Array.isArray(payload?.list) ? payload.list : [],
    ),
    fetchedAt: Date.now(),
  };
}

export async function getInitialPaymentsHistoryState(
  days = DEFAULT_PAYMENT_HISTORY_DAYS,
) {
  try {
    return {
      initialData: await getPaymentsHistory(days),
      initialError: null,
    };
  } catch (error) {
    return {
      initialData: null,
      initialError:
        error instanceof Error ? error.message : PAYMENT_HISTORY_ERROR_MESSAGE,
    };
  }
}
