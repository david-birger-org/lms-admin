import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin-server";

export function getLmsSlsConfig() {
  const rawBaseUrl = process.env.LMS_SLS_BASE_URL?.trim();
  const apiKey = process.env.LMS_SLS_API_KEY?.trim();

  if (!rawBaseUrl) {
    throw new Error("LMS_SLS_BASE_URL is missing in environment variables.");
  }

  if (!apiKey) {
    throw new Error("LMS_SLS_API_KEY is missing in environment variables.");
  }

  const normalizedBaseUrl = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(rawBaseUrl)
    ? rawBaseUrl
    : `http://${rawBaseUrl}`;

  return {
    apiKey,
    baseUrl: normalizedBaseUrl.endsWith("/")
      ? normalizedBaseUrl
      : `${normalizedBaseUrl}/`,
  };
}

interface ForwardLmsSlsRequestOptions {
  body?: string;
  contentType?: string | null;
  headers?: HeadersInit;
  method: string;
  path: string;
  search?: string;
}

export async function forwardLmsSlsRequest({
  body,
  contentType,
  headers: additionalHeaders,
  method,
  path,
  search = "",
}: ForwardLmsSlsRequestOptions) {
  const { apiKey, baseUrl } = getLmsSlsConfig();
  const targetUrl = new URL(path.replace(/^\//, ""), baseUrl);
  targetUrl.search = search;

  const headers = new Headers({
    "x-internal-api-key": apiKey,
  });

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (additionalHeaders) {
    for (const [key, value] of new Headers(additionalHeaders).entries()) {
      headers.set(key, value);
    }
  }

  const response = await fetch(targetUrl, {
    method,
    headers,
    body: body && body.length > 0 ? body : undefined,
    cache: "no-store",
  });

  const responseBody = await response.text();
  const responseHeaders = new Headers();
  const responseContentType = response.headers.get("content-type");

  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  return new Response(responseBody, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function proxyLmsSlsRequest(request: Request, path: string) {
  const access = await requireAdminApiAccess();

  if (!access.ok) {
    return access.response;
  }

  try {
    const incomingUrl = new URL(request.url);
    const method = request.method.toUpperCase();
    const contentType = request.headers.get("content-type");
    const body =
      method === "GET" || method === "HEAD" ? undefined : await request.text();

    return await forwardLmsSlsRequest({
      body,
      contentType,
      method,
      path,
      search: incomingUrl.search,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      { error: `Failed to reach lms-sls service: ${message}` },
      { status: 500 },
    );
  }
}
