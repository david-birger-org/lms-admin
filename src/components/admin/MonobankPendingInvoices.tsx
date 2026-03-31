"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { MonobankPaymentsDataTable } from "@/components/admin/MonobankPaymentsDataTable";
import {
  mapPendingInvoiceToStatementItem,
  type PendingInvoiceItem,
} from "@/lib/monobank";

interface PendingInvoicesResponse {
  error?: string;
  list?: PendingInvoiceItem[];
}

export function MonobankPendingInvoices() {
  const [items, setItems] = useState<PendingInvoiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);

  const loadPendingInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/monobank/invoices/pending", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as PendingInvoicesResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load pending invoices");
      }

      setItems(Array.isArray(payload.list) ? payload.list : []);
      setLastLoadedAt(Date.now());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load pending invoices",
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPendingInvoices();
  }, [loadPendingInvoices]);

  useEffect(() => {
    function refreshOnFocus() {
      void loadPendingInvoices();
    }

    function refreshOnVisible() {
      if (document.visibilityState === "visible") {
        void loadPendingInvoices();
      }
    }

    const intervalId = window.setInterval(() => {
      void loadPendingInvoices();
    }, 30_000);

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [loadPendingInvoices]);

  const rows = useMemo(
    () => items.map(mapPendingInvoiceToStatementItem),
    [items],
  );
  const latestInvoiceId = items[0]?.invoiceId;
  const title =
    isLoading && items.length === 0
      ? "Pending invoices"
      : `Pending invoices (${items.length})`;
  const description = latestInvoiceId
    ? `Tracking ${items.length} active invoice link(s). Latest invoice: ${latestInvoiceId}.${lastLoadedAt ? ` Refreshed at ${new Date(lastLoadedAt).toLocaleTimeString()}.` : ""}`
    : "Review active invoice links, inspect their current state, and cancel unpaid invoices before they expire.";

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-destructive border-destructive/40 bg-destructive/5 rounded-2xl border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      <MonobankPaymentsDataTable
        data={rows}
        emptyMessage="No pending invoices right now. Create a new invoice or refresh to check for webhook updates."
        isLoading={isLoading}
        onRefresh={() => void loadPendingInvoices()}
        onInvoiceChanged={() => void loadPendingInvoices()}
        showStats={false}
        title={title}
        description={description}
      />
    </div>
  );
}
