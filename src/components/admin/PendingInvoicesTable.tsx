"use client";

import { Loader2, RefreshCw, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { usePaymentsFeed } from "@/components/admin/PaymentsDataProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatMonobankDate,
  formatMonobankMoney,
  type StatementItem,
} from "@/lib/monobank";
import type { PaymentDetailsSource } from "@/lib/payments";

const PENDING_STATUSES = new Set([
  "created",
  "processing",
  "hold",
  "invoice_created",
]);

function isPendingInvoice(item: StatementItem) {
  return item.invoiceId && item.status && PENDING_STATUSES.has(item.status);
}

function hasInvoiceId(
  item: StatementItem,
): item is StatementItem & { invoiceId: string } {
  return typeof item.invoiceId === "string" && item.invoiceId.length > 0;
}

export function PendingInvoicesTable({
  source,
}: {
  source: PaymentDetailsSource;
}) {
  const { state, actions } = usePaymentsFeed(source);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const pendingInvoices = useMemo(
    () =>
      state.rows.filter(
        (item) =>
          isPendingInvoice(item) &&
          hasInvoiceId(item) &&
          !cancelledIds.has(item.invoiceId),
      ),
    [state.rows, cancelledIds],
  );

  const handleCancel = useCallback(async (invoiceId: string) => {
    setCancellingId(invoiceId);
    setError(null);

    try {
      const response = await fetch("/api/monobank/invoice/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Cancel failed");
      }

      setCancelledIds((prev) => new Set([...prev, invoiceId]));
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Failed to cancel invoice",
      );
    } finally {
      setCancellingId(null);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setCancelledIds(new Set());
    void actions.refresh();
  }, [actions]);

  return (
    <Card className="shadow-xs">
      <CardHeader className="border-b px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Pending invoices</CardTitle>
            <CardDescription>
              Invoices awaiting payment from the Monobank statement. Cancel
              invoices that are no longer needed.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={state.isLoading}
          >
            <RefreshCw
              className={`size-4 ${state.isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-4 sm:px-6 sm:pb-6">
        {(error || state.error) && (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error ?? state.error}
          </p>
        )}

        {state.isLoading && state.rows.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading statement...
          </div>
        ) : pendingInvoices.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No pending invoices.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvoices.map((item, index) => (
                  <TableRow key={item.invoiceId ?? index}>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs">
                      {item.invoiceId}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {item.destination ?? "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMonobankMoney(item.amount, item.ccy)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatMonobankDate(item.date)}
                    </TableCell>
                    <TableCell>
                      {hasInvoiceId(item) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleCancel(item.invoiceId)}
                          disabled={cancellingId === item.invoiceId}
                          className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          {cancellingId === item.invoiceId ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <X className="size-3.5" />
                          )}
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
