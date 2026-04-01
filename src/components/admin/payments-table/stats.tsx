export function MonobankPaymentsTableStats({
  totalCount,
  successfulCount,
}: {
  totalCount: number;
  successfulCount: number;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground sm:text-sm">
      <div className="rounded-full border bg-muted/30 px-2.5 py-1">
        Total: {totalCount}
      </div>
      <div className="rounded-full border bg-muted/30 px-2.5 py-1">
        Settled: {successfulCount}
      </div>
    </div>
  );
}
