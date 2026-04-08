"use client";

import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ProductFormData {
  slug: string;
  nameUk: string;
  nameEn: string;
  descriptionUk: string;
  descriptionEn: string;
  priceUahMinor: number | null;
  priceUsdMinor: number | null;
  pricingType: "fixed" | "on_request";
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
}

interface ProductFormInitialData {
  active?: boolean;
  descriptionEn?: string | null;
  descriptionUk?: string | null;
  imageUrl?: string | null;
  nameEn?: string;
  nameUk?: string;
  priceUahMinor?: number | null;
  priceUsdMinor?: number | null;
  pricingType?: "fixed" | "on_request";
  slug?: string;
  sortOrder?: number;
}

interface ProductFormProps {
  initialData?: ProductFormInitialData;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ProductFormProps) {
  const t = useTranslations("admin.products.form");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? "");
  const [nameUk, setNameUk] = useState(initialData?.nameUk ?? "");
  const [descriptionEn, setDescriptionEn] = useState(
    initialData?.descriptionEn ?? "",
  );
  const [descriptionUk, setDescriptionUk] = useState(
    initialData?.descriptionUk ?? "",
  );
  const [pricingType, setPricingType] = useState<"fixed" | "on_request">(
    initialData?.pricingType ?? "fixed",
  );
  const [priceUahDisplay, setPriceUahDisplay] = useState(
    initialData?.priceUahMinor ? String(initialData.priceUahMinor / 100) : "",
  );
  const [priceUsdDisplay, setPriceUsdDisplay] = useState(
    initialData?.priceUsdMinor ? String(initialData.priceUsdMinor / 100) : "",
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [sortOrder, setSortOrder] = useState(
    String(initialData?.sortOrder ?? 0),
  );
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);

  function handleNameEnChange(value: string) {
    setNameEn(value);
    if (autoSlug) setSlug(slugify(value));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const parsedPriceUah = Number(priceUahDisplay);
    const parsedPriceUsd = Number(priceUsdDisplay);

    if (pricingType === "fixed") {
      if (!Number.isFinite(parsedPriceUah) || parsedPriceUah <= 0) return;
      if (!Number.isFinite(parsedPriceUsd) || parsedPriceUsd <= 0) return;
    }

    onSubmit({
      slug: slug.trim(),
      nameEn: nameEn.trim(),
      nameUk: nameUk.trim(),
      descriptionEn: descriptionEn.trim(),
      descriptionUk: descriptionUk.trim(),
      priceUahMinor:
        pricingType === "fixed" ? Math.round(parsedPriceUah * 100) : null,
      priceUsdMinor:
        pricingType === "fixed" ? Math.round(parsedPriceUsd * 100) : null,
      pricingType,
      imageUrl: imageUrl.trim() || null,
      active,
      sortOrder: Number(sortOrder) || 0,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nameEn">{t("nameEn")}</Label>
          <Input
            className="h-9"
            id="nameEn"
            value={nameEn}
            onChange={(e) => handleNameEnChange(e.target.value)}
            placeholder={t("nameEnPlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameUk">{t("nameUk")}</Label>
          <Input
            className="h-9"
            id="nameUk"
            value={nameUk}
            onChange={(e) => setNameUk(e.target.value)}
            placeholder="Онлайн коучинг"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">{t("slug")}</Label>
        <Input
          className="h-9"
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setAutoSlug(false);
          }}
          placeholder="online-coaching"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="descriptionEn">{t("descriptionEn")}</Label>
          <Textarea
            id="descriptionEn"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            className="min-h-40"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionUk">{t("descriptionUk")}</Label>
          <Textarea
            id="descriptionUk"
            value={descriptionUk}
            onChange={(e) => setDescriptionUk(e.target.value)}
            className="min-h-40"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="pricingType">{t("pricingType")}</Label>
          <div className="relative">
            <select
              id="pricingType"
              value={pricingType}
              onChange={(event) =>
                setPricingType(event.target.value as "fixed" | "on_request")
              }
              className={cn(
                "flex h-9 w-full appearance-none items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 py-2 pr-9 text-sm whitespace-nowrap transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <option value="fixed">{t("pricingTypeFixed")}</option>
              <option value="on_request">{t("pricingTypeOnRequest")}</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">{t("sortOrder")}</Label>
          <Input
            className="h-9"
            id="sortOrder"
            type="number"
            inputMode="numeric"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      {pricingType === "fixed" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priceUah">{t("priceUah")}</Label>
            <Input
              className="h-9"
              id="priceUah"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={priceUahDisplay}
              onChange={(e) => setPriceUahDisplay(e.target.value)}
              placeholder="5000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceUsd">{t("priceUsd")}</Label>
            <Input
              className="h-9"
              id="priceUsd"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={priceUsdDisplay}
              onChange={(e) => setPriceUsdDisplay(e.target.value)}
              placeholder="100"
              required
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="imageUrl">
          {t("imageUrl")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("optional")}
          </span>
        </Label>
        <Input
          className="h-9"
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div className="space-y-0.5">
          <Label htmlFor="activeToggle">{t("active")}</Label>
          <p className="text-xs text-muted-foreground">{t("activeHint")}</p>
        </div>
        <Switch
          id="activeToggle"
          checked={active}
          onCheckedChange={setActive}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting} className="h-9 min-w-28">
          {isSubmitting ? t("saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
