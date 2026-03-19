"use client";

import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { StatementItem } from "@/lib/monobank";

export function MonobankPaymentsTablePagination({
  table,
}: {
  table: Table<StatementItem>;
}) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex-1 text-xs text-muted-foreground sm:text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
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
