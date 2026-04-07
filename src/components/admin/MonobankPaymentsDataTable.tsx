"use client";

import {
  type ColumnFiltersState,
  type FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowData,
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
import {
  formatMonobankDate,
  formatMonobankMoney,
  formatMonobankShortDate,
  getMonobankCurrencyLabel,
  type StatementItem,
} from "@/lib/monobank";
import {
  isSuccessfulPaymentStatus,
  type PaymentDetailsSource,
} from "@/lib/payments";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onOpenPaymentDetails?: (payment: StatementItem) => void;
  }
}

const defaultColumnVisibility: VisibilityState = {
  profitAmount: false,
  invoiceId: false,
};

const paymentSearchFilter: FilterFn<StatementItem> = (
  row,
  _columnId,
  filterValue,
) => {
  if (typeof filterValue !== "string") {
    return true;
  }

  const query = filterValue.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return getPaymentSearchValue(row.original).includes(query);
};

function getPaymentRowId(payment: StatementItem, index: number) {
  return (
    payment.invoiceId ??
    payment.reference ??
    `${payment.date ?? "unknown-date"}-${payment.amount ?? 0}-${index}`
  );
}

function getDefaultColumnVisibility(columnId: string) {
  return defaultColumnVisibility[columnId] ?? true;
}

function getPaymentSearchValue(payment: StatementItem) {
  const searchTerms = Object.values(payment)
    .filter(
      (value): value is number | string =>
        typeof value === "number" || typeof value === "string",
    )
    .map((value) => String(value));

  if (payment.date) {
    searchTerms.push(formatMonobankDate(payment.date));
    searchTerms.push(formatMonobankShortDate(payment.date));
  }

  if (payment.ccy !== undefined) {
    searchTerms.push(getMonobankCurrencyLabel(payment.ccy));
  }

  if (typeof payment.amount === "number") {
    const normalizedAmount = (payment.amount / 100).toFixed(2);

    searchTerms.push(formatMonobankMoney(payment.amount, payment.ccy));
    searchTerms.push(normalizedAmount);
    searchTerms.push(normalizedAmount.replace(/\.00$/, ""));
  }

  if (typeof payment.profitAmount === "number") {
    const normalizedProfit = (payment.profitAmount / 100).toFixed(2);

    searchTerms.push(formatMonobankMoney(payment.profitAmount, payment.ccy));
    searchTerms.push(normalizedProfit);
    searchTerms.push(normalizedProfit.replace(/\.00$/, ""));
  }

  return searchTerms.map((value) => value.toLowerCase()).join(" ");
}

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
  const [searchValue, setSearchValue] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
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

  const table = useReactTable({
    data,
    columns: monobankPaymentsColumns,
    enableRowSelection: true,
    getRowId: getPaymentRowId,
    globalFilterFn: paymentSearchFilter,
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
    meta: {
      onOpenPaymentDetails: handleOpenPaymentDetails,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearchValue,
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
      globalFilter: searchValue,
      rowSelection,
    },
  });

  const statusOptions = React.useMemo(
    () =>
      [
        ...new Set(data.map((item) => item.status).filter(Boolean)),
      ].sort() as string[],
    [data],
  );

  const selectedStatuses = React.useMemo(() => {
    const value = columnFilters.find((filter) => filter.id === "status")?.value;

    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  }, [columnFilters]);

  const selectedRowsModel = table.getSelectedRowModel();
  const selectedRowCount = selectedRowsModel.rows.length;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const statusColumn = table.getColumn("status");
  const hasCustomColumnVisibility = table
    .getAllLeafColumns()
    .some(
      (column) =>
        column.getCanHide() &&
        column.getIsVisible() !== getDefaultColumnVisibility(column.id),
    );

  const hasActiveState =
    selectedStatuses.length > 0 ||
    searchValue.trim().length > 0 ||
    sorting.length > 0 ||
    selectedRowCount > 0 ||
    hasCustomColumnVisibility;

  const selectedPaymentIdentifiers = selectedRowsModel.rows
    .map((row) => row.original.invoiceId ?? row.original.reference)
    .filter((value): value is string => Boolean(value));
  const selectedRows = selectedRowsModel.rows.map((row) => row.original);

  const successfulCount = React.useMemo(
    () => data.filter((item) => isSuccessfulPaymentStatus(item.status)).length,
    [data],
  );

  const handleStatusToggle = React.useCallback(
    (status: string, checked: boolean) => {
      statusColumn?.setFilterValue((currentStatuses: unknown) => {
        const nextStatuses = Array.isArray(currentStatuses)
          ? currentStatuses.filter(
              (item): item is string => typeof item === "string",
            )
          : [];
        const updatedStatuses = checked
          ? [...new Set([...nextStatuses, status])]
          : nextStatuses.filter((item) => item !== status);

        return updatedStatuses.length > 0 ? updatedStatuses : undefined;
      });
    },
    [statusColumn],
  );

  const resetTable = React.useCallback(() => {
    table.resetSorting(true);
    table.resetColumnFilters(true);
    table.setGlobalFilter("");
    table.resetRowSelection(true);
    setColumnVisibility(defaultColumnVisibility);
    table.setPageIndex(0);
  }, [table]);

  const resolvedEmptyMessage = React.useMemo(() => {
    if (isLoading && data.length === 0) {
      return "Loading results...";
    }

    if (hasActiveState && filteredRowCount === 0) {
      return "No visible results. Reset filters or clear the search to see every row.";
    }

    return emptyMessage ?? "No results.";
  }, [data.length, emptyMessage, filteredRowCount, hasActiveState, isLoading]);

  const emptyActionLabel =
    hasActiveState && filteredRowCount === 0 ? "Reset table" : undefined;

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
            exportFilePrefix={
              detailsSource === "provider" ? "statement" : "payment-history"
            }
            isLoading={isLoading}
            onRefresh={onRefresh}
            onSearchChange={table.setGlobalFilter}
            selectedStatuses={selectedStatuses}
            selectedRows={selectedRows}
            searchValue={searchValue}
            statusOptions={statusOptions}
            selectedPaymentIdentifiers={selectedPaymentIdentifiers}
            hasActiveState={hasActiveState}
            onStatusToggle={handleStatusToggle}
            onReset={resetTable}
            onClearSelection={() => table.resetRowSelection(true)}
          />

          {showStats ? (
            <MonobankPaymentsTableStats
              totalCount={data.length}
              successfulCount={successfulCount}
            />
          ) : null}

          <MonobankPaymentsTableContent
            table={table}
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
