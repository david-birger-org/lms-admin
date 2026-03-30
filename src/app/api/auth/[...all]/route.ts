import { withAuthRetry } from "@/lib/auth/better-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return withAuthRetry((auth) => auth.handler(request));
}

export async function POST(request: Request) {
  return withAuthRetry((auth) => auth.handler(request));
}

export async function OPTIONS(request: Request) {
  return withAuthRetry((auth) => auth.handler(request));
}
