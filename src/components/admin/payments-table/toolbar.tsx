"use client";
"use no memo";

import type { Table } from "@tanstack/react-table";
import { CheckCheck, ChevronDown, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import {
  downloadTextFile,
  formatStatementItemsAsCsv,
  formatStatementItemsAsRawData,
} from "@/components/admin/payments-table/export-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copyToClipboard } from "@/lib/clipboard";
import type { StatementItem } from "@/lib/monobank";

const pageSizeOptions = [10, 20, 50, 100] as const;

function getColumnLabel(columnId: string) {
  if (columnId === "profitAmount") {
    return "profit";
  }

  if (columnId === "maskedPan") {
    return "card";
  }

  if (columnId === "invoiceId") {
    return "invoice id";
  }

  return columnId;
}

export function MonobankPaymentsTableToolbar({
  table,
  exportFilePrefix,
  isLoading,
  onRefresh,
  onSearchChange,
  selectedStatuses,
  selectedRows,
  searchValue,
  statusOptions,
  selectedPaymentIdentifiers,
  hasActiveState,
  onStatusToggle,
  onReset,
  onClearSelection,
}: {
  table: Table<StatementItem>;
  exportFilePrefix: string;
  isLoading: boolean;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  selectedStatuses: string[];
  selectedRows: StatementItem[];
  searchValue: string;
  statusOptions: string[];
  selectedPaymentIdentifiers: string[];
  hasActiveState: boolean;
  onStatusToggle: (status: string, checked: boolean) => void;
  onReset: () => void;
  onClearSelection: () => void;
}) {
  const selectedRowCount = table.getSelectedRowModel().rows.length;
  const normalizedExportFilePrefix =
    exportFilePrefix
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "") || "payments";

  async function handleCopySelectedIds() {
    const copied = await copyToClipboard(selectedPaymentIdentifiers.join("\n"));

    if (!copied) {
      toast.error("Failed to copy selected IDs.");
      return;
    }

    toast.success("Selected IDs copied.");
  }

  async function handleCopySelectedRawData() {
    const copied = await copyToClipboard(
      formatStatementItemsAsRawData(selectedRows),
    );

    if (!copied) {
      toast.error("Failed to copy selected raw data.");
      return;
    }

    toast.success("Selected raw data copied.");
  }

  function handleExportSelectedCsv() {
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");

    downloadTextFile({
      content: formatStatementItemsAsCsv(selectedRows),
      fileName: `${normalizedExportFilePrefix}-selected-${timestamp}.csv`,
      mimeType: "text/csv;charset=utf-8",
    });
    toast.success("Selected rows exported as CSV.");
  }

  return (
    <div className="flex flex-col gap-2 py-3 md:flex-row md:items-center">
      <Input
        placeholder="Search any payment field..."
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-9 md:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-1.5 md:ml-auto">
        {selectedRowCount > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3">
                <CheckCheck />
                Actions
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {selectedRowCount} selected
                </DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={selectedRows.length === 0}
                  onClick={() => handleExportSelectedCsv()}
                >
                  Export selected CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={selectedRows.length === 0}
                  onClick={() => void handleCopySelectedRawData()}
                >
                  Copy selected raw data
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={selectedPaymentIdentifiers.length === 0}
                  onClick={() => void handleCopySelectedIds()}
                >
                  Copy selected IDs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClearSelection}>
                  Clear selection
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3">
              Status
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter status</DropdownMenuLabel>
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="capitalize"
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(value) =>
                    onStatusToggle(status, Boolean(value))
                  }
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3">
              Columns
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(Boolean(value))
                    }
                  >
                    {getColumnLabel(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-9 w-20">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={String(pageSize)}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "animate-spin" : undefined} />
          Refresh
        </Button>

        {hasActiveState ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3"
            onClick={onReset}
          >
            <X />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
