"use client";

import type { StatementItem } from "@/lib/monobank";

const statementItemExportColumns = [
  "invoiceId",
  "status",
  "maskedPan",
  "date",
  "amount",
  "profitAmount",
  "ccy",
  "reference",
  "destination",
  "customerName",
  "error",
  "expiresAt",
  "pageUrl",
] as const satisfies readonly (keyof StatementItem)[];

function toExportValue(value: StatementItem[keyof StatementItem]) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function escapeCsvValue(value: string) {
  if (value.includes('"')) {
    value = value.replaceAll('"', '""');
  }

  return /[",\n\r]/.test(value) ? `"${value}"` : value;
}

export function formatStatementItemsAsCsv(items: StatementItem[]) {
  const header = statementItemExportColumns.join(",");
  const rows = items.map((item) =>
    statementItemExportColumns
      .map((column) => escapeCsvValue(toExportValue(item[column])))
      .join(","),
  );

  return [header, ...rows].join("\n");
}

export function formatStatementItemsAsRawData(items: StatementItem[]) {
  return JSON.stringify(items, null, 2);
}

export function downloadTextFile({
  content,
  fileName,
  mimeType,
}: {
  content: string;
  fileName: string;
  mimeType: string;
}) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}
