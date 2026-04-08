"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminProductRecord } from "@/lib/server/products";

import { ProductForm, type ProductFormData } from "./ProductForm";

type Product = AdminProductRecord;

function replaceProduct(products: Product[], nextProduct: Product) {
  return products.map((item) =>
    item.id === nextProduct.id ? nextProduct : item,
  );
}

function formatPrice(priceMinor: number, currency: string) {
  const amount = priceMinor / 100;
  return `${amount.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function ProductPricingCell({ product }: { product: Product }) {
  const t = useTranslations("admin.products");

  if (product.pricingType === "on_request")
    return (
      <div className="text-right">
        <Badge variant="outline">{t("pricingType.onRequest")}</Badge>
      </div>
    );

  return (
    <div className="space-y-1 text-right">
      <div>
        <Badge variant="secondary">{t("pricingType.fixed")}</Badge>
      </div>
      <p className="font-mono text-sm">
        {product.priceUahMinor === null
          ? "-"
          : formatPrice(product.priceUahMinor, "UAH")}
      </p>
      <p className="font-mono text-sm text-muted-foreground">
        {product.priceUsdMinor === null
          ? "-"
          : formatPrice(product.priceUsdMinor, "USD")}
      </p>
    </div>
  );
}

export function ProductsManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const t = useTranslations("admin.products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(data: ProductFormData) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        product?: Product;
        error?: string;
      };

      if (!response.ok) throw new Error(result.error ?? t("errors.create"));

      if (!result.product) throw new Error(t("errors.create"));
      const nextProduct = result.product;

      setProducts((current) => [nextProduct, ...current]);
      toast.success(t("success.created"));
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("errors.createProduct"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(data: ProductFormData) {
    if (!editingProduct) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products?id=${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        product?: Product;
        error?: string;
      };

      if (!response.ok) throw new Error(result.error ?? t("errors.update"));

      if (!result.product) throw new Error(t("errors.update"));
      const nextProduct = result.product;

      setProducts((current) => replaceProduct(current, nextProduct));
      toast.success(t("success.updated"));
      setEditingProduct(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("errors.updateProduct"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/products?id=${deleteTarget.id}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok) throw new Error(result.error ?? t("errors.delete"));

      setProducts((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      toast.success(t("success.deleted"));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("errors.deleteProduct"),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleActive(product: Product) {
    try {
      const response = await fetch(`/api/products?id=${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });

      const result = (await response.json()) as {
        product?: Product;
        error?: string;
      };

      if (!response.ok) throw new Error(result.error ?? t("errors.update"));

      if (!result.product) throw new Error(result.error ?? t("errors.update"));
      const nextProduct = result.product;

      setProducts((current) => replaceProduct(current, nextProduct));
      toast.success(
        product.active ? t("success.hidden") : t("success.visible"),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.toggle"));
    }
  }

  return (
    <>
      <Card className="shadow-xs">
        <CardHeader className="border-b px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
            <Button className="h-9 gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
              {t("addProduct")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-3 sm:pl-6">
                    {t("columns.name")}
                  </TableHead>
                  <TableHead>{t("columns.slug")}</TableHead>
                  <TableHead className="text-right">
                    {t("columns.price")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("columns.order")}
                  </TableHead>
                  <TableHead className="pr-3 text-right sm:pr-6">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="pl-3 sm:pl-6">
                      <div>
                        <p className="font-medium">{product.nameEn}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.nameUk}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{product.slug}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductPricingCell product={product} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(product)}
                      >
                        {product.active
                          ? t("status.active")
                          : t("status.hidden")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {product.sortOrder}
                    </TableCell>
                    <TableCell className="pr-3 text-right sm:pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("dialogs.create.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.create.description")}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
            submitLabel={t("dialogs.create.submit")}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("dialogs.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.edit.description")}
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
              submitLabel={t("dialogs.edit.submit")}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("dialogs.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.delete.description", {
                name: deleteTarget?.nameEn ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("dialogs.delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting
                ? t("dialogs.delete.deleting")
                : t("dialogs.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
