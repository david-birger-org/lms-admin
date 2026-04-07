"use client";

import { Loader2, PackageOpen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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

interface Purchase {
  id: string;
  status: string;
  amountMinor: number;
  finalAmountMinor: number | null;
  currency: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  productId: string | null;
  productSlug: string | null;
  productNameUk: string | null;
  productNameEn: string | null;
  productImageUrl: string | null;
}

function formatPrice(priceMinor: number, currency: string) {
  const amount = priceMinor / 100;
  return `${amount.toLocaleString("uk-UA", { minimumFractionDigits: 0 })} ${currency}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  processing: "secondary",
  invoice_created: "outline",
  failed: "destructive",
  expired: "destructive",
  cancelled: "destructive",
  reversed: "destructive",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  creating_invoice: "Creating...",
  creation_failed: "Failed",
  invoice_created: "Awaiting payment",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
  cancelled: "Cancelled",
  reversed: "Reversed",
};

export function UserPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    try {
      const response = await fetch("/api/user/purchases");
      const data = (await response.json()) as {
        purchases?: Purchase[];
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? "Failed to fetch");

      setPurchases(data.purchases ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load purchases",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <Card className="shadow-xs">
      <CardHeader className="border-b px-3 sm:px-6">
        <CardTitle>Purchase History</CardTitle>
        <CardDescription>
          All your purchases and their current status.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <PackageOpen className="size-8 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium">No purchases yet</p>
              <p className="text-xs text-muted-foreground">
                Your purchased products will appear here.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-3 sm:pl-6">Product</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="pr-3 text-right sm:pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="pl-3 sm:pl-6">
                    <div>
                      <p className="font-medium">
                        {purchase.productNameEn ?? purchase.description}
                      </p>
                      {purchase.productNameUk && (
                        <p className="text-xs text-muted-foreground">
                          {purchase.productNameUk}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(
                      purchase.finalAmountMinor ?? purchase.amountMinor,
                      purchase.currency,
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={statusVariants[purchase.status] ?? "secondary"}
                    >
                      {statusLabels[purchase.status] ?? purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-3 text-right text-sm text-muted-foreground sm:pr-6">
                    {formatDate(purchase.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
