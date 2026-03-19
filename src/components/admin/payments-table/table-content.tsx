"use client";

import { flexRender, type Table } from "@tanstack/react-table";

import {
  Table as DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatementItem } from "@/lib/monobank";

export function MonobankPaymentsTableContent({
  table,
  onRowOpen,
}: {
  table: Table<StatementItem>;
  onRowOpen: (payment: StatementItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <DataTable className="text-xs sm:text-sm">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-9 px-1.5 sm:px-2">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer"
                onClick={() => onRowOpen(row.original)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowOpen(row.original);
                  }
                }}
                tabIndex={0}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-1.5 py-2 sm:px-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTable>
    </div>
  );
}
