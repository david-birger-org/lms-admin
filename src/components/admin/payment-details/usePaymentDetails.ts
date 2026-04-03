"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PaymentDetails } from "@/components/admin/payment-details/types";
import {
  getCancelErrorMessage,
  getPaymentDetailsErrorMessage,
  isCancelableInvoiceStatus,
  mergePaymentDetails,
  mergeUpdatedDetails,
  shouldAutoRefreshInvoiceStatus,
  shouldLoadDetails,
} from "@/components/admin/payment-details/utils";
import type { StatementItem } from "@/lib/monobank";
import type { PaymentDetailsSource } from "@/lib/payments";

export function usePaymentDetails({
  invoiceId,
  payment,
  detailsSource,
  controlledOpen,
  onOpenChange,
  onInvoiceChanged,
  hideTrigger,
}: {
  invoiceId?: string;
  payment?: StatementItem;
  detailsSource: PaymentDetailsSource;
  controlledOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onInvoiceChanged?: () => void;
  hideTrigger: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationError, setCancellationError] = useState<string | null>(
    null,
  );
  const effectiveInvoiceId = invoiceId ?? payment?.invoiceId;
  const open = controlledOpen ?? uncontrolledOpen;
  const previousInvoiceId = useRef(effectiveInvoiceId);
  const previousSummaryStatus = useRef(payment?.status);
  const lastKnownStatus = useRef<string | undefined>(payment?.status);
  const lastKnownModifiedDate = useRef<string | undefined>(undefined);

  const loadDetails = useCallback(async () => {
    if (!effectiveInvoiceId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const detailsEndpoint =
        detailsSource === "provider"
          ? "/api/monobank/invoice/status"
          : "/api/payments/details";
      const response = await fetch(
        `${detailsEndpoint}?invoiceId=${encodeURIComponent(effectiveInvoiceId)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );
      const payload = (await response.json()) as PaymentDetails;

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load payment details");
      }

      const hasChanged =
        payload.status !== lastKnownStatus.current ||
        payload.modifiedDate !== lastKnownModifiedDate.current;

      setDetails(payload);
      lastKnownStatus.current = payload.status;
      lastKnownModifiedDate.current = payload.modifiedDate;

      if (hasChanged) {
        onInvoiceChanged?.();
      }
    } catch (loadError) {
      const message = getPaymentDetailsErrorMessage(loadError);

      console.error("Failed to load extended payment details", loadError);
      setDetails(null);

      if (payment) {
        setWarning(message);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [detailsSource, effectiveInvoiceId, onInvoiceChanged, payment]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);

      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      if (nextOpen && !details && !isLoading && effectiveInvoiceId) {
        void loadDetails();
      }
    },
    [
      controlledOpen,
      details,
      effectiveInvoiceId,
      isLoading,
      loadDetails,
      onOpenChange,
    ],
  );

  useEffect(() => {
    if (previousInvoiceId.current !== effectiveInvoiceId) {
      previousInvoiceId.current = effectiveInvoiceId;
      previousSummaryStatus.current = payment?.status;
      lastKnownStatus.current = payment?.status;
      lastKnownModifiedDate.current = undefined;
      setCancellationError(null);
      setDetails(null);
      setError(null);
      setWarning(null);
    }
  }, [effectiveInvoiceId, payment?.status]);

  useEffect(() => {
    if (!details) {
      lastKnownStatus.current = payment?.status;
      lastKnownModifiedDate.current = undefined;
    }
  }, [details, payment?.status]);

  const displayDetails = mergePaymentDetails(payment, details);
  const canCancelInvoice =
    Boolean(effectiveInvoiceId) &&
    isCancelableInvoiceStatus(displayDetails?.status);

  const handleCancelInvoice = useCallback(async () => {
    if (!effectiveInvoiceId || !canCancelInvoice || isCancelling) {
      return;
    }

    if (
      !window.confirm(
        "Cancel this unpaid invoice? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsCancelling(true);
    setCancellationError(null);

    try {
      const response = await fetch("/api/monobank/invoice/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId: effectiveInvoiceId }),
      });
      const payload = (await response.json()) as PaymentDetails;

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to cancel invoice");
      }

      setDetails((current) => {
        const nextDetails = mergeUpdatedDetails({
          current,
          payload,
          payment,
          invoiceId: effectiveInvoiceId,
        });

        lastKnownStatus.current = nextDetails.status;
        lastKnownModifiedDate.current = nextDetails.modifiedDate;

        return nextDetails;
      });
      onInvoiceChanged?.();
    } catch (cancelError) {
      setCancellationError(getCancelErrorMessage(cancelError));
    } finally {
      setIsCancelling(false);
    }
  }, [
    canCancelInvoice,
    effectiveInvoiceId,
    isCancelling,
    onInvoiceChanged,
    payment,
  ]);

  useEffect(() => {
    if (
      shouldLoadDetails({
        details,
        effectiveInvoiceId,
        error,
        hideTrigger,
        isLoading,
        open,
        warning,
      })
    ) {
      void loadDetails();
    }
  }, [
    details,
    effectiveInvoiceId,
    error,
    hideTrigger,
    isLoading,
    loadDetails,
    open,
    warning,
  ]);

  useEffect(() => {
    if (
      !open ||
      !effectiveInvoiceId ||
      !shouldAutoRefreshInvoiceStatus(displayDetails?.status)
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadDetails();
    }, 15_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [displayDetails?.status, effectiveInvoiceId, loadDetails, open]);

  useEffect(() => {
    if (!open || !details || !payment?.status || isLoading) {
      previousSummaryStatus.current = payment?.status;
      return;
    }

    if (previousSummaryStatus.current === payment.status) {
      return;
    }

    previousSummaryStatus.current = payment.status;

    if (payment.status !== details.status) {
      void loadDetails();
    }
  }, [details, isLoading, loadDetails, open, payment?.status]);

  return {
    canCancelInvoice,
    cancellationError,
    details,
    effectiveInvoiceId,
    error,
    handleCancelInvoice,
    handleOpenChange,
    isCancelling,
    isLoading,
    open,
    warning,
  };
}
