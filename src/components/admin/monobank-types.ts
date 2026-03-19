export type MonobankCurrency = number | string;

export interface StatementItem {
  invoiceId?: string;
  status?: string;
  maskedPan?: string;
  date?: string;
  amount?: number;
  profitAmount?: number;
  ccy?: MonobankCurrency;
  reference?: string;
  destination?: string;
}

export function getMonobankCurrencyLabel(ccy?: MonobankCurrency) {
  if (typeof ccy === "string") {
    const normalized = ccy.trim().toUpperCase();

    return normalized || "-";
  }

  if (ccy === 980) {
    return "UAH";
  }

  if (ccy === 840) {
    return "USD";
  }

  return ccy ? String(ccy) : "-";
}

export function formatMonobankMoney(
  minorUnits?: number,
  ccy?: MonobankCurrency,
) {
  if (typeof minorUnits !== "number") {
    return "-";
  }

  return `${(minorUnits / 100).toFixed(2)} ${getMonobankCurrencyLabel(ccy)}`;
}

export function formatMonobankDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function formatMonobankShortDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}
