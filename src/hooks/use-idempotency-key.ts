"use client";

import { useEffect, useRef, useState } from "react";

function createIdempotencyKey() {
  return crypto.randomUUID();
}

export function useIdempotencyKey(scope: string) {
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    createIdempotencyKey(),
  );
  const previousScope = useRef(scope);

  useEffect(() => {
    if (previousScope.current === scope) {
      return;
    }

    previousScope.current = scope;
    setIdempotencyKey(createIdempotencyKey());
  }, [scope]);

  return {
    idempotencyKey,
    renewIdempotencyKey: () => setIdempotencyKey(createIdempotencyKey()),
  };
}
