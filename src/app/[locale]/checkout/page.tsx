import { resolveLocale } from "@/i18n/locale";
import { CheckoutPageContent } from "@/app/checkout/page";

export default async function LocalizedCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; c?: string }>;
}) {
  const { locale } = await params;

  return (
    <CheckoutPageContent
      locale={resolveLocale(locale)}
      searchParams={searchParams}
    />
  );
}
