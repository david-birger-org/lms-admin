"use client";
"use no memo";

import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { StatementItem } from "@/lib/monobank";

export function MonobankPaymentsTablePagination({
  table,
}: {
  table: Table<StatementItem>;
}) {
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const visibleSelectedRowCount =
    table.getFilteredSelectedRowModel().rows.length;
  const selectedRowCount = table.getSelectedRowModel().rows.length;
  const selectionLabel =
    visibleSelectedRowCount === selectedRowCount
      ? `${selectedRowCount} of ${filteredRowCount} row(s) selected.`
      : `${visibleSelectedRowCount} of ${filteredRowCount} visible row(s) selected (${selectedRowCount} total).`;

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex-1 text-xs text-muted-foreground sm:text-sm">
        {selectionLabel}
      </div>
      <div className="flex gap-2 self-end">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
