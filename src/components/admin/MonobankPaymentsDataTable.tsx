"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { MonobankPaymentDetailsPopover } from "@/components/admin/MonobankPaymentDetailsPopover";
import { monobankPaymentsColumns } from "@/components/admin/payments-table/columns";
import { MonobankPaymentsTablePagination } from "@/components/admin/payments-table/pagination";
import { MonobankPaymentsTableStats } from "@/components/admin/payments-table/stats";
import { MonobankPaymentsTableContent } from "@/components/admin/payments-table/table-content";
import { MonobankPaymentsTableToolbar } from "@/components/admin/payments-table/toolbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatementItem } from "@/lib/monobank";
import {
  isSuccessfulPaymentStatus,
  type PaymentDetailsSource,
} from "@/lib/payments";

const defaultColumnVisibility: VisibilityState = {
  search: false,
  profitAmount: false,
  invoiceId: false,
};

export function MonobankPaymentsDataTable({
  data,
  emptyMessage,
  isLoading,
  onRefresh,
  onInvoiceChanged,
  showStats = true,
  title = "Payments history",
  description = "Search the statement feed, filter rows, and inspect invoice-level payment details.",
  detailsSource = "database",
}: {
  data: StatementItem[];
  emptyMessage?: string;
  isLoading: boolean;
  onRefresh: () => void;
  onInvoiceChanged?: () => void;
  showStats?: boolean;
  title?: string;
  description?: string;
  detailsSource?: PaymentDetailsSource;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [activePayment, setActivePayment] =
    React.useState<StatementItem | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleOpenPaymentDetails = React.useCallback(
    (payment: StatementItem) => {
      setActivePayment(payment);
      setDetailsOpen(true);
    },
    [],
  );

  const filteredData = React.useMemo(() => {
    if (selectedStatuses.length === 0) {
      return data;
    }

    return data.filter(
      (row) => row.status && selectedStatuses.includes(row.status),
    );
  }, [data, selectedStatuses]);

  const pageResetKey = React.useMemo(
    () =>
      [
        String(filteredData.length),
        ...sorting.map(({ id, desc }) => `${id}:${desc ? "desc" : "asc"}`),
        ...columnFilters.map(({ id, value }) => `${id}:${String(value)}`),
      ].join("|"),
    [columnFilters, filteredData.length, sorting],
  );

  const table = useReactTable({
    data: filteredData,
    columns: monobankPaymentsColumns,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    if (pageResetKey && table.getState().pagination.pageIndex === 0) {
      return;
    }

    table.setPageIndex(0);
  }, [pageResetKey, table]);

  const statusOptions = React.useMemo(
    () =>
      [
        ...new Set(data.map((item) => item.status).filter(Boolean)),
      ].sort() as string[],
    [data],
  );

  const searchValue =
    (table.getColumn("search")?.getFilterValue() as string | undefined) ?? "";
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const hasCustomColumnVisibility = Object.entries(columnVisibility).some(
    ([columnId, isVisible]) => defaultColumnVisibility[columnId] !== isVisible,
  );

  const hasActiveState =
    selectedStatuses.length > 0 ||
    searchValue.length > 0 ||
    sorting.length > 0 ||
    selectedRowCount > 0 ||
    hasCustomColumnVisibility;

  const selectedInvoiceIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.invoiceId)
    .filter((value): value is string => Boolean(value));

  const successfulCount = React.useMemo(
    () => data.filter((item) => isSuccessfulPaymentStatus(item.status)).length,
    [data],
  );

  const handleStatusToggle = React.useCallback(
    (status: string, checked: boolean) => {
      setSelectedStatuses((current) => {
        if (checked) {
          return [...new Set([...current, status])];
        }

        return current.filter((item) => item !== status);
      });
    },
    [],
  );

  const resetTable = React.useCallback(() => {
    setSorting([]);
    setColumnFilters([]);
    setSelectedStatuses([]);
    setRowSelection({});
    setColumnVisibility(defaultColumnVisibility);
    table.getColumn("search")?.setFilterValue("");
  }, [table]);

  const resolvedEmptyMessage = React.useMemo(() => {
    if (isLoading && data.length === 0) {
      return "Loading results...";
    }

    if (hasActiveState && filteredData.length === 0) {
      return "No visible results. Reset filters or clear the search to see every row.";
    }

    return emptyMessage ?? "No results.";
  }, [
    data.length,
    emptyMessage,
    filteredData.length,
    hasActiveState,
    isLoading,
  ]);

  const emptyActionLabel =
    hasActiveState && filteredData.length === 0 ? "Reset table" : undefined;

  return (
    <Card className="shadow-xs">
      <CardHeader className="border-b px-3 sm:px-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-4 sm:px-6 sm:pb-6">
        <div className="w-full">
          <MonobankPaymentsTableToolbar
            table={table}
            isLoading={isLoading}
            onRefresh={onRefresh}
            selectedStatuses={selectedStatuses}
            statusOptions={statusOptions}
            selectedInvoiceIds={selectedInvoiceIds}
            hasActiveState={hasActiveState}
            onStatusToggle={handleStatusToggle}
            onReset={resetTable}
            onClearSelection={() => setRowSelection({})}
          />

          {showStats ? (
            <MonobankPaymentsTableStats
              totalCount={data.length}
              successfulCount={successfulCount}
            />
          ) : null}

          <MonobankPaymentsTableContent
            table={table}
            onRowOpen={handleOpenPaymentDetails}
            emptyActionLabel={emptyActionLabel}
            emptyMessage={resolvedEmptyMessage}
            onEmptyAction={emptyActionLabel ? resetTable : undefined}
          />

          <MonobankPaymentDetailsPopover
            invoiceId={activePayment?.invoiceId}
            payment={activePayment ?? undefined}
            detailsSource={detailsSource}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            onInvoiceChanged={onInvoiceChanged}
            hideTrigger
          />

          <MonobankPaymentsTablePagination table={table} />
        </div>
      </CardContent>
    </Card>
  );
}
