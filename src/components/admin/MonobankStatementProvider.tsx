"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { StatementItem } from "@/components/admin/monobank-types";

const STATEMENT_CACHE_TTL_MS = 60_000;

interface StatementResponse {
  list?: StatementItem[];
  error?: string;
}

interface CachedStatement {
  rows: StatementItem[];
  fetchedAt: number;
}

interface MonobankStatementContextValue {
  state: {
    rows: StatementItem[];
    error: string | null;
    status: "loading" | "ready" | "error";
    isLoading: boolean;
  };
  actions: {
    refresh: () => Promise<void>;
  };
  meta: {
    days: number;
    lastFetchedAt: number | null;
  };
}

const statementCache = new Map<number, CachedStatement>();
const statementRequests = new Map<number, Promise<CachedStatement>>();

const MonobankStatementContext =
  createContext<MonobankStatementContextValue | null>(null);

function normalizeStatementRows(list: StatementItem[]) {
  return [...list].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    return bTime - aTime;
  });
}

async function fetchStatement(days: number, forceRefresh = false) {
  const now = Date.now();
  const cached = statementCache.get(days);

  if (
    !forceRefresh &&
    cached &&
    now - cached.fetchedAt < STATEMENT_CACHE_TTL_MS
  ) {
    return cached;
  }

  const inflightRequest = statementRequests.get(days);
  if (!forceRefresh && inflightRequest) {
    return inflightRequest;
  }

  const request = (async () => {
    const response = await fetch(`/api/monobank/statement?days=${days}`, {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as StatementResponse;

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to load payment history");
    }

    const rows = normalizeStatementRows(
      Array.isArray(payload.list) ? payload.list : [],
    );

    const nextCache: CachedStatement = {
      rows,
      fetchedAt: Date.now(),
    };

    statementCache.set(days, nextCache);

    return nextCache;
  })();

  statementRequests.set(days, request);

  try {
    return await request;
  } finally {
    statementRequests.delete(days);
  }
}

export function MonobankStatementProvider({
  children,
  days = 90,
}: {
  children: ReactNode;
  days?: number;
}) {
  const cachedStatement = statementCache.get(days);
  const [rows, setRows] = useState<StatementItem[]>(
    cachedStatement?.rows ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    cachedStatement ? "ready" : "loading",
  );
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(
    cachedStatement?.fetchedAt ?? null,
  );

  const loadStatement = useCallback(
    async (forceRefresh = false) => {
      setStatus("loading");
      setError(null);

      try {
        const nextStatement = await fetchStatement(days, forceRefresh);
        setRows(nextStatement.rows);
        setLastFetchedAt(nextStatement.fetchedAt);
        setStatus("ready");
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unexpected error";
        setError(message);
        setStatus("error");
      }
    },
    [days],
  );

  useEffect(() => {
    void loadStatement();
  }, [loadStatement]);

  const refresh = useCallback(async () => {
    await loadStatement(true);
  }, [loadStatement]);

  const value = useMemo<MonobankStatementContextValue>(
    () => ({
      state: {
        rows,
        error,
        status,
        isLoading: status === "loading",
      },
      actions: {
        refresh,
      },
      meta: {
        days,
        lastFetchedAt,
      },
    }),
    [days, error, lastFetchedAt, refresh, rows, status],
  );

  return (
    <MonobankStatementContext.Provider value={value}>
      {children}
    </MonobankStatementContext.Provider>
  );
}

export function useMonobankStatement() {
  const context = useContext(MonobankStatementContext);

  if (!context) {
    throw new Error(
      "useMonobankStatement must be used within a MonobankStatementProvider.",
    );
  }

  return context;
}
